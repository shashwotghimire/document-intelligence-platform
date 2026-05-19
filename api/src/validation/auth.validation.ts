import z from "zod";

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
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
    })
    .refine(
      (data) =>
        (!data.currentPassword && !data.newPassword) ||
        (Boolean(data.currentPassword) && Boolean(data.newPassword)),
      {
        message: "Current password and new password are required together",
        path: ["newPassword"],
      },
    ),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>["body"];
export type LoginUserInput = z.infer<typeof loginUserSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
