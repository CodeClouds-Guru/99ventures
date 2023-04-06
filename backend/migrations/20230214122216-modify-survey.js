"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.renameColumn('surveys', 'ioi', 'loi');
    await queryInterface.renameColumn('surveys', 'convertion_rate', 'cpi');
    await queryInterface.renameColumn('surveys', 'type', 'name');

    await queryInterface.removeColumn('surveys', 'payout');
    await queryInterface.removeColumn('surveys', 'score');
    await queryInterface.removeColumn('surveys', 'statistic_rating_count');
    await queryInterface.removeColumn('surveys', 'statistic_rating_avg');
    await queryInterface.removeColumn('surveys', 'payout_publisher_usd');
    await queryInterface.removeColumn('surveys', 'href');

    await queryInterface.addColumn("surveys", "created_at", {
      type: "TIMESTAMP"
    });
    await queryInterface.addColumn("surveys", "updated_at", {
      type: "TIMESTAMP"
    });
    await queryInterface.addColumn("surveys", "deleted_at", {
      type: "TIMESTAMP"
    });
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("surveys");
  },
};
