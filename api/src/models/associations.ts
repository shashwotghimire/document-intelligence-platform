import { User } from "./user.model";
import { Document } from "./document.model";
import { DocumentChunk } from "./documentChunk.model";
import { Chat } from "./chat.model";
import { Messages } from "./messages.model";

User.hasMany(Document, {
  foreignKey: "uploadedBy",
  as: "documents",
});

User.hasMany(Chat, {
  foreignKey: "userId",
  as: "chats",
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

Chat.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Chat.hasMany(Messages, {
  foreignKey: "chatId",
  as: "messages",
});

Messages.belongsTo(Chat, {
  foreignKey: "chatId",
  as: "chat",
});
