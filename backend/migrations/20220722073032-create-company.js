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
      },
      logo: {
        type: Sequelize.STRING,
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
        type: 'TIMESTAMP',
        allowNull: false
      },
      updated_at: {
        type: 'TIMESTAMP',
      },
      deleted_at: {
        type: 'TIMESTAMP',
      }
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('companies')
  },
}
