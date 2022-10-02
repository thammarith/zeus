import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Route } from 'react-router-dom';

import App from './App';
import Account from './pages/Account/Account';
import LogIn from './pages/LogIn/LogIn';
import Register from './pages/Register/Register';

import './styles/global.scss';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
        path: '/account',
        element: <Account />,
    },
    {
        path: '/login',
        element: <LogIn />,
    },
    {
        path: '/register',
        element: <Register />,
    },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
        {/* <App /> */}
    </React.StrictMode>
);
