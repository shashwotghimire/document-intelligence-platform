import z from "zod";

export const uploadDocumentSchema = z.object({
  body: z.object({}).optional(),
});

export const deleteDocumentSchema = z.object({
  params: z.object({
    documentId: z.uuid("Invalid document id"),
  }),
});

export type DeleteDocumentInput = z.infer<
  typeof deleteDocumentSchema
>["params"];
