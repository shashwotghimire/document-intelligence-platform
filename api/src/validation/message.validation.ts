import z from "zod";

const chatParamsSchema = z.object({
  chatId: z.uuid("Invalid chat id"),
});

const paginationQuerySchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/, "Page must be a positive integer")
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/, "Limit must be a positive integer")
    .optional(),
});

export const sendMessageSchema = z.object({
  params: chatParamsSchema,
  body: z.object({
    content: z.string().trim().min(1, "Message content is required"),
  }),
});

export const getMessagesSchema = z.object({
  params: chatParamsSchema,
  query: paginationQuerySchema,
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];
export type GetMessagesParamsInput = z.infer<
  typeof getMessagesSchema
>["params"];
export type GetMessagesQueryInput = z.infer<typeof getMessagesSchema>["query"];
