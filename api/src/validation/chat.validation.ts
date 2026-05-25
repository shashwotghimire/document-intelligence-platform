import z from "zod";

const paginationQuerySchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/, "Page must be a positive integer")
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/, "Limit must be a positive integer")
    .optional(),
  search: z.string().trim().optional(),
});

const chatParamsSchema = z.object({
  chatId: z.uuid("Invalid chat id"),
});

export const getAllChatsSchema = z.object({
  query: paginationQuerySchema,
});

export const getChatByIdSchema = z.object({
  params: chatParamsSchema,
});

export const createChatSchema = z.object({
  body: z.object({}).optional(),
});

export const updateChatSchema = z.object({
  params: chatParamsSchema,
  body: z.object({
    title: z.string().trim().min(1, "Title is required"),
  }),
});

export const deleteChatSchema = z.object({
  params: chatParamsSchema,
});

export type GetAllChatsInput = z.infer<typeof getAllChatsSchema>["query"];
export type GetChatByIdInput = z.infer<typeof getChatByIdSchema>["params"];
export type UpdateChatInput = z.infer<typeof updateChatSchema>["body"];
export type DeleteChatInput = z.infer<typeof deleteChatSchema>["params"];
