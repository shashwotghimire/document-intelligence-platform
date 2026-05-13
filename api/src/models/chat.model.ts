import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { User } from "./user.model";
import sequelize from "../db";
export class Chat extends Model<
  InferAttributes<Chat>,
  InferCreationAttributes<Chat>
> {
  declare id: CreationOptional<string>;
  declare title: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
}

Chat.init(
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      defaultValue: "Untitled",
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "chats",
    underscored: true,
  },
);
