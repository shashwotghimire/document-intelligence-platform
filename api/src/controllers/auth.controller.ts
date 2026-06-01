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
  UpdateProfileInput,
} from "../validation/auth.validation";
import crypto from "crypto";
import { sendEmail } from "../utils/sendMail";
import { Op } from "sequelize";
import { generateGravatarUrl } from "../services/gravatar.service";

const ensureGravatarUrl = async (user: User) => {
  if (user.gravatarUrl) return user.gravatarUrl;

  user.gravatarUrl = generateGravatarUrl(user.email);
  await user.save();

  return user.gravatarUrl;
};

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
    const gravatarUrl = generateGravatarUrl(email);
    const user = await User.create({
      name,
      email,
      gravatarUrl,
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
    res
      .status(201)
      .json(
        new ApiResponse(
          true,
          "User registered. Verification code has been sent to your registered email, please verify your account",
          null,
        ),
      );
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
    const gravatarUrl = await ensureGravatarUrl(user);

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
          gravatarUrl,
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
    const gravatarUrl = await ensureGravatarUrl(user);

    res.status(200).json(
      new ApiResponse(true, "User fetched successfully", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        isEmailVerified: user.isEmailVerified,
        gravatarUrl,
      }),
    );
  },
);

export const updateProfile = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { currentPassword, name, newPassword } =
      req.body as UpdateProfileInput;
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError(404, "User not found", "Invalid user");
    }

    user.name = name;

    if (currentPassword && newPassword) {
      const isPasswordValid = await verifyPassword(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new ApiError(
          400,
          "Invalid password",
          "Current password is incorrect",
        );
      }

      user.password = await hashPassword(newPassword);
    }

    await user.save();
    const gravatarUrl = await ensureGravatarUrl(user);

    return res.status(200).json(
      new ApiResponse(true, "Profile updated successfully", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        isEmailVerified: user.isEmailVerified,
        gravatarUrl,
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

export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = req.query.search;
    const offset = (page - 1) * limit;
    let whereClause: any = {};
    if (searchQuery) {
      whereClause = {
        ...whereClause,
        [Op.or]: {
          name: { [Op.iLike]: `%${searchQuery}%` },
        },
      };
    }
    const { rows, count } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
    });
    return res.status(200).json(
      new ApiResponse(true, "Fetched all users", {
        users: rows,
        pagination: {
          page,
          limit,
          totalItems: count,
          totalPages: Math.ceil(count / limit),
        },
      }),
    );
  },
);

export const blockUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    if (!userId || Array.isArray(userId))
      throw new ApiError(404, "User not found", "User not found");
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, "User not found", "User not found");
    user.isBlocked = true;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(true, "User blocked successfully", null));
  },
);

export const unblockUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    if (!userId || Array.isArray(userId))
      throw new ApiError(404, "User not found", "User not found");
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, "User not found", "User not found");
    user.isBlocked = false;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(true, "User unblocked successfully", null));
  },
);
