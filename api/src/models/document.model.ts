import {
  Model,
  DataTypes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import type { ForeignKey, InferAttributes } from "sequelize";
import sequelize from "../db";
import { User } from "./user.model";

export type DocumentFileType = "pdf" | "docx" | "txt" | "csv";
export type fileProcessedType = "Processing" | "Processed" | "Failed";

export class Document extends Model<
  InferAttributes<Document>,
  InferCreationAttributes<Document>
> {
  declare id: CreationOptional<string>;
  declare filename: string;
  declare fileType: DocumentFileType;
  declare filePath: string;
  declare fileSize: number;
  declare fileProcessingStatus: fileProcessedType;
  declare uploadedBy: ForeignKey<User["id"]>;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.ENUM("pdf", "docx", "txt", "csv"),
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fileProcessingStatus: {
      type: DataTypes.ENUM("Processing", "Processed", "Failed"),
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
  },
  {
    sequelize,
    tableName: "documents",
    underscored: true,
  },
);
