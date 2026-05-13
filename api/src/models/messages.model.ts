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
export class Messages extends Model<
  InferAttributes<Messages>,
  InferCreationAttributes<Messages>
> {
  declare id: CreationOptional<string>;
  declare chatId: ForeignKey<Chat["id"]>;
  declare content: string;
  declare messageRole: MessageRole;
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
  },
  {
    sequelize,
    tableName: "chat_messages",
    underscored: true,
  },
);
