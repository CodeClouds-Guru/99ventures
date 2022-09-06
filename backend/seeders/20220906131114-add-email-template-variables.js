"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      "email_template_variables",
      [
        {
          id: "1",
          name: "User First Name",
          code: "{users.first_name}",
          module:"User"
        },
        {
            id: "2",
            name: "User Last Name",
            code: "{users.last_name}",
            module:"User"
        },
        {
            id: "3",
            name: "User Email",
            code: "{users.email}",
            module:"User"
        },
        {
            id: "4",
            name: "Company Name",
            code: "{companies.name}",
            module:"Company"
        },
        {
            id: "5",
            name: "Site Name",
            code: "{company_portals.name}",
            module:"CompanyPortal"
        },
        {
            id: "6",
            name: "Reset Password Link",
            code: "{reset_password_link}",
            module:""
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
