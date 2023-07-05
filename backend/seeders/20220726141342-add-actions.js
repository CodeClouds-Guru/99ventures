"use strict";
const actions = [
  {
    slug: "add",
    name: "Add",
    parent_action: "update",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "save",
    name: "Save",
    parent_action: "update",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "list",
    name: "List",
    parent_action: "view",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "edit",
    name: "Edit",
    parent_action: "update",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "update",
    name: "Update",
    parent_action: "update",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "view",
    name: "View",
    parent_action: "view",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "delete",
    name: "Soft Delete",
    parent_action: "delete",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "destroy",
    name: "Delete",
    parent_action: "delete",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "export",
    name: "Export",
    parent_action: "view",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "import",
    name: "Import",
    parent_action: "update",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: "navigation",
    name: "Navigation",
    parent_action: "view",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
];
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   slug : 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("actions", actions);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("actions", null, {});
  },
};
// 20220726141342 - add - actions.js
