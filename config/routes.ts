import { defineConfig } from 'umi'

export default defineConfig({
  routes: [
    {
      path: '/',
      wrappers: ['@/pages/Wrappers/ui-request'],
      routes: [
        {
          path: '/',
          redirect: '/home',
        },
        {
          name: 'Home',
          path: '/home',
          component: './Home',
        },
        {
          name: 'Create',
          path: '/create',
          component: './Create',
        },
        {
          name: 'Send',
          path: '/send',
          component: './Send',
        },
        {
          name: 'Access',
          path: '/access',
          component: './Access',
        },
        {
          name: ' CRUD Example',
          path: '/table',
          component: './Table',
        },
        {
          path: 'ui-request/:reqId',
          component: '@/pages/UIRequest',
        },
      ],
    },
  ],
}).routes
