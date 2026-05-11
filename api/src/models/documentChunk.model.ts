import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../db";
import { Document } from "./document.model";

export class DocumentChunk extends Model<
  InferAttributes<DocumentChunk>,
  InferCreationAttributes<DocumentChunk>
> {
  declare id: CreationOptional<string>;
  declare documentId: ForeignKey<Document["id"]>;
  declare chunkText: string;
  declare chunkIndex: number;
  declare vectorEmbedding: CreationOptional<number[] | null>;
}

DocumentChunk.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    documentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Document,
        key: "id",
      },
      onDelete: "CASCADE",
    },

    chunkText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    chunkIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vectorEmbedding: {
      type: (DataTypes as any).VECTOR(3072),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "DocumentChunk",
    tableName: "document_chunks",
  },
);
