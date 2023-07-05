'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_portal_meta_tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      company_portal_id: {
        type: Sequelize.BIGINT
      },
      tag_name: {
        type: Sequelize.STRING
      },
      tag_content: {
        type: Sequelize.STRING
      },
      created_by: {
        type: Sequelize.BIGINT,
      },
      updated_by: {
        type: Sequelize.BIGINT,
      },
      deleted_by: {
        type: Sequelize.BIGINT,
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
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('company_portal_meta_tags');
  }
};