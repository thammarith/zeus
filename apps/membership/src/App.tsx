import React, { createContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Routes, Route, Link, useNavigate, useLocation, Navigate, Outlet, HashRouter } from 'react-router-dom';

import { PROFILE_EDIT_PATH, ERROR_PATH, INDEX_PATH, AUTHENTICATE_PATH, PROFILE_PATH, WELCOME_PATH } from './routes';
import Authenticate from './pages/Authenticate';
import Error from './pages/Error';
import ProfileEdit from './pages/ProfileEdit';
import Profile from './pages/Profile';
import PrivateGuard from './pages/PrivateGuard';
import Welcome from './pages/Welcome';
import AuthContextProvider from './contexts/AuthContext';
import Layout from './pages/Layout';

const App: React.FC = () => {
    return (
        <AuthContextProvider>
            <HashRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path={INDEX_PATH} element={<Authenticate />} />
                        <Route path={AUTHENTICATE_PATH} element={<Authenticate />} />
                        <Route element={<PrivateGuard />}>
                            <Route path={WELCOME_PATH} element={<Welcome />} />
                            <Route path={PROFILE_EDIT_PATH} element={<ProfileEdit />} />
                            <Route path={PROFILE_PATH} element={<Profile />} />
                            <Route path="inside" element={<div>inside</div>} />
                        </Route>
                    </Route>
                </Routes>
            </HashRouter>
        </AuthContextProvider>
    );
};

export default App;
