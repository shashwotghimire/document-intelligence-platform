"use strict";

/** @type {import("sequelize-cli").Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'document_chunks'
            AND column_name = 'documentId'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'document_chunks'
            AND column_name = 'document_id'
        ) THEN
          ALTER TABLE "document_chunks"
          RENAME COLUMN "documentId" TO "document_id";
        END IF;
      END $$;
    `);

    const table = await queryInterface.describeTable("document_chunks");

    if (!table.document_id) {
      await queryInterface.addColumn("document_chunks", "document_id", {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "documents",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("document_chunks");

    if (table.document_id && !table.documentId) {
      await queryInterface.renameColumn(
        "document_chunks",
        "document_id",
        "documentId",
      );
    }
  },
};
