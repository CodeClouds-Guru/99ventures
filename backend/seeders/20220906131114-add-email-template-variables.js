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
          name: "First Name",
          code: "{members.first_name}",
          module: "Member",
        },
        {
          name: "Last Name",
          code: "{members.last_name}",
          module: "Member",
        },
        {
          name: "Registration Email",
          code: "{members.email}",
          module: "Member",
        },
        {
          name: "Company Name",
          code: "{companies.name}",
          module: "Company",
        },
        {
          name: "Site Name",
          code: "{company_portals.name}",
          module: "CompanyPortal",
        },
        {
          name: "Reset Password Link",
          code: "{reset_password_link}",
          module: "",
        },
        {
          name: "Username",
          code: "{members.username}",
          module: "Member",
        },
        {
          name: "Join Date",
          code: "{members.username}",
          module: "Member",
        },
        {
          name: "Referral Username ",
          code: "{members.username}",
          module: "Member",
        },
        {
          name: "Member Total Earnings",
          code: "{member_earnings.total}",
          module: "MemberEarning",
        },
        {
          name: "Member Current Balance (cash & points)",
          code: "{member_current_balance}",
          module: "",
        },
        {
          name: "Account Status",
          code: "{members.status}",
          module: "Member",
        },
        {
          name: "Offer/Survey Name & Value",
          code: "{offers.name} - {offers.amount}",
          module: "Offer",
        },
        {
          name: "Withdraw Amount & Date",
          code: "{withdraw_requests.amount} on {withdraw_requests.date}",
          module: "WithdrawRequest",
        },
        {
          name: "Contest Start and End Date",
          code: "{offers.start_date} to {offers.end_date}",
          module: "Offer",
        },
        {
          name: "Contest Start and End Date",
          code: "{offers.start_date} to {offers.end_date}",
          module: "Offer",
        },
        {
          name: "Support Ticket ID ",
          code: "{tickets.id}",
          module: "Ticket",
        },
        {
          name: "Email confirmation link",
          code: "{email_confirmation_link}",
          module: "",
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
