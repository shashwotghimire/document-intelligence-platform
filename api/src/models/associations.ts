import { User } from "./user.model";
import { Document } from "./document.model";
import { DocumentChunk } from "./documentChunk.model";

User.hasMany(Document, {
  foreignKey: "uploadedBy",
  as: "documents",
});

Document.belongsTo(User, {
  foreignKey: "uploadedBy",
  as: "uploader",
});

Document.hasMany(DocumentChunk, {
  foreignKey: "documentId",
  as: "chunks",
});

DocumentChunk.belongsTo(Document, {
  foreignKey: "documentId",
  as: "document",
});
