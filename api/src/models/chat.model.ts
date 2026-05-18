import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
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
  declare count: CreationOptional<number>;
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
      defaultValue: "Another øne",
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
    count: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: "chats",
    underscored: true,
  },
);
