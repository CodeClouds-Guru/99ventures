/**
 * Authorization Roles
 */
const authRoles = {
  superAdmin: ['super-admin'],
  admin: ['admin'],
  staff: ['admin', 'staff'],
  user: ['admin', 'staff', 'user'],
  onlyGuest: [],
};

export default authRoles;
