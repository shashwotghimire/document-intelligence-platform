import { User } from "./user.model";
import { Document } from "./document.model";

User.hasMany(Document, {
  foreignKey: "uploadedBy",
  as: "documents",
});

Document.belongsTo(User, {
  foreignKey: "uploadedBy",
  as: "uploader",
});
