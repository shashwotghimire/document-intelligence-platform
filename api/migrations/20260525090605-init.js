"use strict";

/** @type {import("sequelize-cli").Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const uuidPk = {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      primaryKey: true,
      allowNull: false,
    };

    const timestamps = {
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    };

    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`,
    );
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "vector";`,
    );

    await queryInterface.createTable("users", {
      id: uuidPk,
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      gravatar_url: { type: Sequelize.STRING, allowNull: true },
      role: {
        type: Sequelize.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      email_verification_token: { type: Sequelize.STRING, allowNull: true },
      ...timestamps,
    });

    await queryInterface.createTable("documents", {
      id: uuidPk,
      filename: { type: Sequelize.STRING, allowNull: false },
      file_type: {
        type: Sequelize.ENUM("pdf", "docx", "txt", "csv"),
        allowNull: false,
      },
      file_path: { type: Sequelize.STRING, allowNull: false },
      file_size: { type: Sequelize.INTEGER, allowNull: false },
      file_processing_status: {
        type: Sequelize.ENUM("Processing", "Processed", "Failed"),
        allowNull: true,
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      ...timestamps,
    });

    await queryInterface.createTable("chats", {
      id: uuidPk,
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "New chat",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      ...timestamps,
    });

    await queryInterface.createTable("document_chunks", {
      id: uuidPk,
      document_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "documents", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      chunk_text: { type: Sequelize.TEXT, allowNull: false },
      chunk_index: { type: Sequelize.INTEGER, allowNull: false },
      ...timestamps,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "document_chunks"
      ADD COLUMN "vector_embedding" vector(3072);
    `);

    await queryInterface.createTable("chat_messages", {
      id: uuidPk,
      chat_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "chats", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      content: { type: Sequelize.TEXT, allowNull: false },
      message_role: {
        type: Sequelize.ENUM("user", "ai"),
        allowNull: false,
      },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("chat_messages");
    await queryInterface.dropTable("document_chunks");
    await queryInterface.dropTable("chats");
    await queryInterface.dropTable("documents");
    await queryInterface.dropTable("users");

    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_chat_messages_message_role";`,
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_documents_file_type";`,
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_documents_file_processing_status";`,
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_users_role";`,
    );
  },
};
