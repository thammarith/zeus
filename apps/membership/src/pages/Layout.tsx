import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => (
    <main className="min-h-screen w-screen">
        <div className="w-full max-w-lg mx-auto py-16 px-8">
            <Outlet />
        </div>
    </main>
);

export default Layout;
