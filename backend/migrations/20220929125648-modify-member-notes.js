"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("member_notes", "previous_status", {
      type: Sequelize.STRING,
      defaultValue: 1,
      comment: "member, suspended, validating, deleted, not_verified",
    });
    await queryInterface.changeColumn("member_notes", "current_status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 1,
      comment: "member, suspended, validating, deleted, not_verified",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("member_notes");
  },
};
