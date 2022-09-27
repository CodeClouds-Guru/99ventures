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
    id: 'configuration',
    title: 'Configuration',
    translate: 'Configuration',
    type: 'item',
    icon: 'heroicons-outline:cog',
    url: 'configuration',
  },
  {
    id: 'scripts',
    title: 'Scripts',
    translate: 'Scripts',
    type: 'item',
    icon: 'heroicons-outline:code',
    url: 'app/scripts',
  },
  {
    id: 'administration',
    title: 'Administration',
    translate: 'Administration',
    type: 'collapse',
    icon: 'heroicons-outline:user-circle',
    children: [
      {
        id: 'users',
        title: 'Users',
        translate: 'Users',
        type: 'item',
        icon: 'heroicons-outline:user-circle',
        url: 'app/users',
        end: true,
      },
      {
        id: 'roles',
        title: 'Roles',
        translate: 'Roles',
        type: 'item',
        icon: 'heroicons-outline:users',
        url: 'app/roles',
        end: true,
      },
      {
        id: 'groups',
        title: 'Groups',
        translate: 'Groups',
        type: 'item',
        icon: 'heroicons-outline:user-group',
        url: 'app/groups',
        end: true,
      },
      {
        id: 'emailtemplates',
        title: 'Email Templates',
        type: 'item',
        icon: 'heroicons-outline:mail',
        url: 'app/email-templates',
        end: true,
      },
      // {
      //   id: 'permissions',
      //   title: 'Permissions',
      //   translate: 'Permissions',
      //   type: 'item',
      //   icon: 'heroicons-outline:shield-check',
      //   url: 'app/permissions',
      // },
    ]
  },

];

export default navigationConfig;
