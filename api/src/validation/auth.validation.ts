import z from "zod";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const profilePasswordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`,
  )
  .refine((password) => password.trim() === password, {
    message: "Password cannot start or end with a space",
  })
  .refine((password) => /[A-Za-z]/.test(password) && /\d/.test(password), {
    message: "Password must include at least one letter and one number",
  });

export const registerUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, "Name must be at least 2 characters"),
      currentPassword: z
        .string()
        .min(1, "Current password is required")
        .optional(),
      newPassword: profilePasswordSchema.optional(),
    })
    .refine(
      (data) =>
        (!data.currentPassword && !data.newPassword) ||
        (Boolean(data.currentPassword) && Boolean(data.newPassword)),
      {
        message: "Current password and new password are required together",
        path: ["newPassword"],
      },
    )
    .refine(
      (data) =>
        !data.currentPassword ||
        !data.newPassword ||
        data.currentPassword !== data.newPassword,
      {
        message: "New password must be different from current password",
        path: ["newPassword"],
      },
    ),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>["body"];
export type LoginUserInput = z.infer<typeof loginUserSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
