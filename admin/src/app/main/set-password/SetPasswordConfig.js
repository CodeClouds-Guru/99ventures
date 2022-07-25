import SetPasswordPage from './SetPasswordPage';
import authRoles from '../../auth/authRoles';

const SetPasswordConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: false,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  auth: authRoles.onlyGuest,
  routes: [
    {
      path: 'set-password',
      element: <SetPasswordPage />,
    },
  ],
};

export default SetPasswordConfig;
