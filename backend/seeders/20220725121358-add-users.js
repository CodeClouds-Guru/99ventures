const bcrypt = require('bcryptjs')
  ; ('use strict')
let users = [
  {
    id: 1,
    first_name: 'Sourabh',
    last_name: 'Das',
    username: 'sourabh_cc',
    email: 'sourabh.das@codeclouds.in',
    avatar: '',
    password: '12345678',
    phone_no: '1234567890',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 2,
    first_name: 'Arindam',
    last_name: 'Samanta',
    username: 'arindam_cc',
    email: 'arindam.samanta@codeclouds.com',
    avatar: '',
    password: '12345678',
    phone_no: '1234567890',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 3,
    first_name: 'Mritunjay',
    last_name: 'Patra',
    username: 'mritunjay_cc',
    email: 'mritunjay.patra@codeclouds.in',
    avatar: '',
    password: '12345678',
    phone_no: '1234567890',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 4,
    first_name: 'Sourav',
    last_name: 'Tapadar',
    username: 'tapa_cc',
    email: 'sourav.tapadar@codeclouds.in',
    avatar: '',
    password: '12345678',
    phone_no: '1234567890',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 5,
    first_name: 'Nandita',
    last_name: 'Bardhan',
    username: 'nandita_cc',
    email: 'nandita.bardhan@codeclouds.co.in',
    avatar: '',
    password: '12345678',
    phone_no: '1234567890',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 6,
    first_name: 'Ashley',
    last_name: 'Samuel',
    username: 'ashley_samuel',
    email: 'ashley@99ventures.com',
    avatar: '',
    password: '123456',
    phone_no: '',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 7,
    first_name: 'Alan',
    last_name: 'Stabels',
    username: 'alan_stabels',
    email: 'alan@99ventures.com',
    avatar: '',
    password: '123456',
    phone_no: '',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 8,
    first_name: 'Debosmita',
    last_name: 'Dey',
    username: 'Debosmita_CC',
    email: 'debosmita.dey@codeclouds.co.in',
    avatar: '',
    password: '123456',
    phone_no: '',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  
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
    const salt = await bcrypt.genSalt(10)
    users = users.map(async (user) => {
      const password = await bcrypt.hash(user.password, salt)
      user.password = password
      return user
    })
    users = await Promise.all(users)
    await queryInterface.bulkInsert('users', users)
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('users', null, {})
  },
}
