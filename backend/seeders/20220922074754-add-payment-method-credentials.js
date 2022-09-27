"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    //  Add seed commands here.

    await queryInterface.bulkInsert(
      "payment_method_credentials",
      [
        {
          id: 1,
          payment_method_id: 1,
          company_portal_id: 1,
          slug: "client_id",
          name: "Client Id",
          value: null,
          created_at: new Date(),
        },
        {
          id: 2,
          payment_method_id: 1,
          company_portal_id: 1,
          slug: "secret",
          name: "Client Secret",
          value: null,
          created_at: new Date(),
        },
        {
          id: 3,
          payment_method_id: 2,
          company_portal_id: 1,
          slug: "secret_key",
          name: "Secret Key",
          value: null,
          created_at: new Date(),
        },
        {
          id: 4,
          payment_method_id: 2,
          company_portal_id: 1,
          slug: "password",
          name: "Password",
          value: null,
          created_at: new Date(),
        },
        {
          id: 5,
          payment_method_id: 3,
          company_portal_id: 1,
          slug: "api_token",
          name: "Api Token",
          value: null,
          created_at: new Date(),
        },
        {
          id: 6,
          payment_method_id: 4,
          company_portal_id: 1,
          slug: "api_token",
          name: "Api Token",
          value: null,
          created_at: new Date(),
        },
        {
          id: 8,
          payment_method_id: 1,
          company_portal_id: 2,
          slug: "client_id",
          name: "Client Id",
          value: null,
          created_at: new Date(),
        },
        {
          id: 9,
          payment_method_id: 1,
          company_portal_id: 2,
          slug: "secret",
          name: "Client Secret",
          value: null,
          created_at: new Date(),
        },
        {
          id: 10,
          payment_method_id: 2,
          company_portal_id: 2,
          slug: "secret_key",
          name: "Secret Key",
          value: null,
          created_at: new Date(),
        },
        {
          id: 11,
          payment_method_id: 2,
          company_portal_id: 2,
          slug: "password",
          name: "Password",
          value: null,
          created_at: new Date(),
        },
        {
          id: 12,
          payment_method_id: 3,
          company_portal_id: 2,
          slug: "api_token",
          name: "Api Token",
          value: null,
          created_at: new Date(),
        },
        {
          id: 13,
          payment_method_id: 4,
          company_portal_id: 2,
          slug: "api_token",
          name: "Api Token",
          value: null,
          created_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    //  Add commands to revert seed here.

    await queryInterface.bulkDelete("payment_method_credentials", null, {});
  },
};
