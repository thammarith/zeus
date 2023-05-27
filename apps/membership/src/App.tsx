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

// const routes: RouteObject[] = [
//     {
//         path: INDEX_PATH,
//         // path: AUTHENTICATE_PATH,
//         element: <Authenticate />,
//     },
//     {
//         path: ERROR_PATH,
//         // path: AUTHENTICATE_PATH,
//         element: <Error />,
//     },
//     {
//         element: <PrivateGuard />,
//         children: [
//             {
//                 path: WELCOME_PATH,
//                 element: <Welcome />,
//             },
//             {
//                 path: PROFILE_PATH,
//                 element: <Profile />,
//             },
//             {
//                 path: PROFILE_EDIT_PATH,
//                 element: <ProfileEdit />,
//             },
//         ],
//     },
// ];

const App: React.FC = () => {
    return (
        <AuthContextProvider>
            <HashRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path={INDEX_PATH} element={<></>} />
                        <Route path={AUTHENTICATE_PATH} element={<Authenticate />} />
                        <Route element={<PrivateGuard />}>
                            <Route path={WELCOME_PATH} element={<div>welceom</div>} />
                            <Route path="inside" element={<div>inside</div>} />
                        </Route>
                    </Route>
                </Routes>
            </HashRouter>
        </AuthContextProvider>
    );
};

export default App;

// function AuthStatus() {
//     let auth = useAuth();
//     let navigate = useNavigate();

//     if (!auth.user) {
//         return <p>You are not logged in.</p>;
//     }

//     return (
//         <p>
//             Welcome {auth.user}!{' '}
//             <button
//                 onClick={() => {
//                     auth.signout(() => navigate('/'));
//                 }}
//             >
//                 Sign out
//             </button>
//         </p>
//     );
// }
