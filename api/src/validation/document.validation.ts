import z from "zod";

export const uploadDocumentSchema = z.object({
  body: z.object({}).optional(),
});

export const getDocumentsTableSchema = z.object({
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

export const deleteDocumentSchema = z.object({
  params: z.object({
    documentId: z.uuid("Invalid document id"),
  }),
});

export type DeleteDocumentInput = z.infer<
  typeof deleteDocumentSchema
>["params"];

export type GetDocumentsTableInput = z.infer<
  typeof getDocumentsTableSchema
>["query"];
