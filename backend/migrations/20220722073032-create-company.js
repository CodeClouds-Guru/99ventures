'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      company_type_id: {
        type: Sequelize.BIGINT,
        allowNull:false,        
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull:true,
      },
      logo: {
        type: Sequelize.STRING,
        allowNull:true,
      },
      status: {
        type: Sequelize.TINYINT,
        defaultValue:1
      },
      created_by: {
        type: Sequelize.BIGINT
      },
      updated_by: {
        type: Sequelize.BIGINT
      },
      deleted_by: {
        type: Sequelize.BIGINT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.TIME
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.TIME
      },
      deleted_at: {
        type: Sequelize.TIME
      }
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('companies')
  },
}
