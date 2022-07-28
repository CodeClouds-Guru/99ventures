import i18next from 'i18next';


import List from './list/List';
import Create from './Create';
import View from './View';



const CRUDConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
        path: 'app/:module/create',
        element: <Create />,
    },
    {
        path: 'app/:module/view/:id',
        element: <View />,
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
