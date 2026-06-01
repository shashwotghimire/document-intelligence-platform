"use strict";

/** @type {import("sequelize-cli").Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("logs", ["user_id", "created_at"], {
      name: "logs_user_id_created_at_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("logs");
  },
};
