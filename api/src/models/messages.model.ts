import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { Chat } from "./chat.model";
import sequelize from "../db";

export type MessageRole = "user" | "ai";
export type ReferencedDocument = {
  documentId: string;
  documentTitle: string;
  documentType: "pdf" | "txt" | "csv" | "docx";
};
export class Messages extends Model<
  InferAttributes<Messages>,
  InferCreationAttributes<Messages>
> {
  declare id: CreationOptional<string>;
  declare chatId: ForeignKey<Chat["id"]>;
  declare content: string;
  declare messageRole: MessageRole;
  declare referencedDocuments: CreationOptional<ReferencedDocument[] | null>;
  declare followUpQuestions: CreationOptional<string[] | null>;
}

Messages.init(
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "chats",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageRole: {
      type: DataTypes.ENUM("user", "ai"),
      allowNull: false,
    },
    referencedDocuments: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    followUpQuestions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "chat_messages",
    underscored: true,
  },
);
