import {
  Model,
  DataTypes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import type { InferAttributes } from "sequelize";
import sequelize from "../db";

export type UserRole = "user" | "admin";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare password: null | string;
  declare gravatarUrl: CreationOptional<string | null>;
  declare role: CreationOptional<UserRole>;
  declare isBlocked: CreationOptional<boolean>;
  declare isEmailVerified: CreationOptional<boolean>;
  declare emailVerificationToken: CreationOptional<string | null>;
  declare githubId: CreationOptional<string | null>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gravatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
      allowNull: false,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    githubId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    underscored: true,
  },
);
