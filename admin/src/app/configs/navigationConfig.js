const navigationConfig = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    translate: 'Dashboard',
    type: 'item',
    icon: 'heroicons-outline:home',
    url: 'dashboard',
  },
  {
    id: 'users',
    title: 'Users',
    translate: 'Users',
    type: 'item',
    icon: 'heroicons-outline:user-circle',
    url: 'app/users',
  },
  {
    id: 'roles',
    title: 'Roles',
    translate: 'Roles',
    type: 'item',
    icon: 'heroicons-outline:users',
    url: 'app/roles',
  },
  {
    id: 'groups',
    title: 'Groups',
    translate: 'Groups',
    type: 'item',
    icon: 'heroicons-outline:user-group',
    url: 'app/groups',
  },
  // {
  //   id: 'permissions',
  //   title: 'Permissions',
  //   translate: 'Permissions',
  //   type: 'item',
  //   icon: 'heroicons-outline:shield-check',
  //   url: 'app/permissions',
  // },
];

export default navigationConfig;
