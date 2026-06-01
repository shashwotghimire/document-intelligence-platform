import z from "zod";

export const getLogsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^[1-9]\d*$/, "Page must be a positive integer")
      .optional(),
    limit: z
      .string()
      .regex(/^[1-9]\d*$/, "Limit must be a positive integer")
      .optional(),
  }),
});

export type GetLogsInput = z.infer<typeof getLogsSchema>["query"];
