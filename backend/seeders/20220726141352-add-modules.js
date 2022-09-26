'use strict'
const modules = [
  {
    slug: 'users',
    name: 'Users',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'roles',
    name: 'Roles',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'modules',
    name: 'Modules',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'actions',
    name: 'Actions',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'permissions',
    name: 'Permissions',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'groups',
    name: 'Groups',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'companies',
    name: 'Companies',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'portals',
    name: 'Portals',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'emailconfigurations',
    name: 'Email Configurations',
    parent_module: 'Configurations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'ipconfigurations',
    name: 'Ip Configurations',
    parent_module: 'Configurations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'generalconfigurations',
    name: 'General Configurations',
    parent_module: 'Configurations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'paymentconfigurations',
    name: 'Payment Configurations',
    parent_module: 'Configurations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'downtime',
    name: 'Downtime',
    parent_module: 'Configurations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'emailtemplates',
    name: 'Email Templates',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'metatagconfigurations',
    name: 'Meta Tag Configurations',
    parent_module: 'Configurations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'scripts',
    name: 'Scripts',
    parent_module: 'Configurations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'filemanager',
    name: 'File Manager',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    slug: 'supportticket',
    name: 'Support Ticket',
    parent_module: 'Administrations',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  }
]
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('modules', modules)
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('modules', null, {})
  },
}
