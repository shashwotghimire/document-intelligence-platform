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
import { frontendOrigin } from "../config/frontend";
import { backendOrigin } from "../config/backend";

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
    const verificationUrl = `${frontendOrigin}/verify-email?token=${encodeURIComponent(emailVerificationToken)}`;
    const gravatarUrl = generateGravatarUrl(email);
    const user = await User.create({
      name,
      email,
      gravatarUrl,
      password: hashedPassword,
      role: userCount === 0 ? "admin" : "user",
      emailVerificationToken,
    });
    sendEmail(
      user.email,
      "Verify your email",
      `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Verify your email</title>
        </head>
        <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;border:1px solid #e4e9f2;box-shadow:0 18px 45px rgba(23,32,51,0.10);">
                  <tr>
                    <td style="padding:34px 32px 10px;">
                      <p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#344054;">Hi ${user.name},</p>
                      <p style="margin:0;font-size:16px;line-height:1.65;color:#344054;">Please confirm this email. Then you can sign in and use documentGPT.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:26px 32px 30px;">
                      <a href="${verificationUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:15px 26px;border-radius:10px;">Verify email</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 32px 30px;">
                      <div style="background:#f8fafc;border:1px solid #e4e9f2;border-radius:12px;padding:16px;">
                        <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#667085;">Button not working? Paste this link into your browser.</p>
                        <a href="${verificationUrl}" style="font-size:13px;line-height:1.6;color:#2563eb;word-break:break-all;">${verificationUrl}</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:22px 32px;background:#fbfcfe;border-top:1px solid #e4e9f2;">
                      <p style="margin:0;font-size:12px;line-height:1.6;color:#667085;">Did not make a documentGPT account? No action needed.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
       `,
    ).catch((err) => console.error("Failed to send verification email:", err));
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
    if (!user.password) {
      throw new ApiError(401, "GitHub login only", "GitHub login only");
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
          canChangePassword: Boolean(user.password),
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
    if (user.isBlocked) {
      throw new ApiError(403, "Account blocked", "User account is blocked");
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
        canChangePassword: Boolean(user.password),
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
    if (!user.password && (currentPassword || newPassword)) {
      throw new ApiError(401, "GitHub login only", "GitHub login only");
    }
    user.name = name;

    if (currentPassword && newPassword) {
      const existingPassword = user.password;

      if (!existingPassword) {
        throw new ApiError(401, "GitHub login only", "GitHub login only");
      }

      const isPasswordValid = await verifyPassword(
        currentPassword,
        existingPassword,
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
        canChangePassword: Boolean(user.password),
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

// github
export const githubLogin = (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${backendOrigin}/api/auth/github/callback`,
    scope: "read:user user:email",
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

export const githubCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      throw new ApiError(400, "Bad Request", "Invalid code");
    }
    const respose = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: `${backendOrigin}/api/auth/github/callback`,
      }),
    });
    const data = await respose.json();
    if (!data.access_token) {
      throw new ApiError(400, "Bad Request", "Invalid code");
    }
    const githubUser = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.access_token}`,
      },
    });
    const githubUserData = await githubUser.json();

    const githubEmailResponse = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
        },
      },
    );

    const githubEmails = await githubEmailResponse.json();
    const primaryEmail = githubEmails.find(
      (email: { email: string; primary: boolean; verified: boolean }) =>
        email.primary && email.verified,
    )?.email;
    if (!primaryEmail) {
      throw new ApiError(
        400,
        "No verified email found from GitHub",
        "Bad request",
      );
    }
    let user = await User.findOne({ where: { email: primaryEmail } });
    if (user) {
      if (user.isBlocked) {
        return res.redirect(`${frontendOrigin}/login?error=Account blocked`);
      }
      if (!user.githubId) {
        user.githubId = githubUserData.id;
      }
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      if (githubUserData.avatar_url) {
        user.gravatarUrl = githubUserData.avatar_url;
      }
      await user.save();
    } else {
      user = await User.create({
        name: githubUserData.name || githubUserData.login,
        email: primaryEmail,
        password: null,
        gravatarUrl: githubUserData.avatar_url,
        role: "user",
        isEmailVerified: true,
        emailVerificationToken: null,
        githubId: githubUserData.id,
      });
    }
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isEmailVerified: user.isEmailVerified,
    });
    return res.redirect(`${frontendOrigin}/auth/callback?token=${token}`);
  },
);
