import { Request, Response } from "express";
import { User } from "../models/user.model";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { hashPassword, verifyPassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import type {
  LoginUserInput,
  RegisterUserInput,
} from "../validation/auth.validation";
import crypto from "crypto";
import { sendEmail } from "../utils/sendMail";

export const registerUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, email, password } = req.body as RegisterUserInput;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, "User already exists", "Duplicate email");
    }
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const userCount = await User.count();
    const hashedPassword = await hashPassword(password);
    const verificationUrl = `http://localhost:5173/verify-email?token=${emailVerificationToken}`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userCount === 0 ? "admin" : "user",
      emailVerificationToken,
    });
    await sendEmail(
      user.email,
      "Verify your email",
      `
       <h2>Email Verification</h2>
      <p>Click below to verify your account:</p>
      <a href="${verificationUrl}">Verify Email</a>
       `,
    );
    res.status(201).json({
      success: true,
      message:
        "User registered. Verification code has been sent to your registered email, please verify your account",
    });
  },
);

export const loginUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body as LoginUserInput;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(
        401,
        "Invalid credentials",
        "Invalid email or password",
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(
        401,
        "Invalid credentials",
        "Invalid email or password",
      );
    }

    if (user.isBlocked) {
      throw new ApiError(403, "Account blocked", "User account is blocked");
    }
    if (!user.isEmailVerified) {
      throw new ApiError(403, "Forbidden", "Please verify your email first");
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isEmailVerified: user.isEmailVerified,
    });

    res.status(200).json(
      new ApiResponse(true, "User logged in successfully", {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      }),
    );
  },
);

export const getUser = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError(404, "User not found", "Invalid user");
    }

    res.status(200).json(
      new ApiResponse(true, "User fetched successfully", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        isEmailVerified: user.isEmailVerified,
      }),
    );
  },
);

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Bad Request", "Invalid verification token");
  }

  const user = await User.findOne({
    where: {
      emailVerificationToken: token,
    },
  });

  if (!user) {
    throw new ApiError(
      400,
      "Bad Request",
      "Invalid or already used verification token",
    );
  }

  if (user.isEmailVerified) {
    return res.status(200).json(
      new ApiResponse(true, "Email already verified", {
        email: user.email,
        isEmailVerified: true,
      }),
    );
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  return res.status(200).json(
    new ApiResponse(true, "Email verified successfully", {
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    }),
  );
});
