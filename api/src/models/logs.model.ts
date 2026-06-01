import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ForeignKey,
  DataTypes,
} from "sequelize";
import { User } from "./user.model";
import sequelize from "../db";
export class Logs extends Model<
  InferAttributes<Logs>,
  InferCreationAttributes<Logs>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare action: string;
  declare data: string;
}

Logs.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "logs",
    underscored: true,
  },
);
