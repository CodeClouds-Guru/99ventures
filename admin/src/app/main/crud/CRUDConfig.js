import i18next from 'i18next';


import List from './list/List';
import CreateEdit from './create-edit/CreateEdit';



const CRUDConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
        path: 'app/:module/:moduleId',
        element: <CreateEdit />,
    },
    {
      path: 'app/:module',
      element: <List />,
    },
    
  ],
};

export default CRUDConfig;

/**
 * Lazy load Example
 */
/*
import React from 'react';

const Example = lazy(() => import('./Example'));

const ExampleConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: 'example',
      element: <Example />,
    },
  ],
};

export default ExampleConfig;
*/
