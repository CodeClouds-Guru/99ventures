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
    id: 'filemanager',
    title: 'File Manager',
    // translate: 'File Manager',
    type: 'item',
    icon: 'heroicons-outline:folder',
    url: 'app/filemanager',
  },
  {
    id: 'tickets',
    title: 'Tickets',
    translate: 'Tickets',
    type: 'item',
    icon: 'heroicons-outline:ticket',
    url: 'app/tickets',
    badge: {
      title: 0,
      classes: 'px-8 bg-pink-600 text-white rounded-full',
    },
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
        id: 'email-templates',
        title: 'Email Templates',
        type: 'item',
        icon: 'heroicons-outline:mail',
        url: 'app/email-templates',
        end: true,
      },
      {
        id: 'settings',
        title: 'Settings',
        type: 'item',
        icon: 'material-outline:settings',
        url: 'app/settings',
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
  {
    id: 'pagesAndLayouts',
    title: 'Pages & Layouts',
    type: 'collapse',
    icon: 'material-outline:auto_awesome_mosaic',
    children: [
      {
        id: 'components',
        title: 'Components',
        type: 'item',
        icon: 'material-outline:view_agenda',
        url: 'app/components',
        end: true,
      },
      {
        id: 'layouts',
        title: 'Layouts',
        type: 'item',
        icon: 'material-outline:view_quilt',
        url: 'app/layouts',
        end: true,
      },
      {
        id: 'pages',
        title: 'Pages',
        type: 'item',
        icon: 'material-outline:description',
        url: 'app/pages',
        end: true,
      },
    ]
  }
];

export default navigationConfig;
