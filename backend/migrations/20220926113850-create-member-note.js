"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("member_notes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      member_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      previous_status: {
        type: Sequelize.TINYINT,
        comment: "1=open,2=pending,0=closed"
      },
      current_status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "1=open,2=pending,0=closed"
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: "TIMESTAMP",
        allowNull: false,
      },
      updated_at: {
        type: "TIMESTAMP",
      },
      deleted_at: {
        type: "TIMESTAMP",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("member_notes");
  },
};
