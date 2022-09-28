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
          name: "First Name",
          code: "{members.first_name}",
          module:"Member"
        },
        {
            id: "2",
            name: "Last Name",
            code: "{members.last_name}",
            module:"Member"
        },
        {
            id: "3",
            name: "Registration Email",
            code: "{members.email}",
            module:"Member"
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
        },
        {
          id: "7",
          name: "Username",
          code: "{members.username}",
          module:"Member"
        },
        {
          id: "8",
          name: "Join Date",
          code: "{members.username}",
          module:"Member"
        },
        {
          id: "9",
          name: "Referral Username ",
          code: "{members.username}",
          module:"Member"
        },
        {
          id:"10",
          name: "Member Total Earnings",
          code: "{member_earnings.total}",
          module: "MemberEarning"
        },
        {
          id:"11",
          name: "Member Current Balance (cash & points)",
          code: "{member_current_balance}",
          module: ""
        },
        {
          id:"12",
          name: "Account Status",
          code: "{members.status}",
          module: "Member"
        },
        {
          id:"13",
          name: "Offer/Survey Name & Value",
          code: "{offers.name} - {offers.amount}",
          module: "Offer"
        },
        {
          id:"14",
          name: "Withdraw Amount & Date",
          code: "{withdraw_requests.amount} on {withdraw_requests.date}",
          module: "WithdrawRequest"
        },
        {
          id:"15",
          name: "Contest Start and End Date",
          code: "{offers.start_date} to {offers.end_date}",
          module: "Offer"
        },
        {
          id:"15",
          name: "Contest Start and End Date",
          code: "{offers.start_date} to {offers.end_date}",
          module: "Offer"
        },
        {
          id:"16",
          name: "Support Ticket ID ",
          code: "{tickets.id}",
          module: "Ticket"
        },
        {
          id:"17",
          name: "Email confirmation link",
          code: "{email_confirmation_link}",
          module: ""
        },
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
