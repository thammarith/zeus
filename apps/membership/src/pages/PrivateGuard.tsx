import React, { useContext, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { AUTHENTICATE_PATH } from '../routes';
import { useAuth } from '../contexts/AuthContext';

const PrivateGuard = () => {
    const location = useLocation();
    const auth = useAuth();

    if (!auth?.isLoggedIn) return <Navigate to={AUTHENTICATE_PATH} state={{ from: location }} replace />;

    return <Outlet />;
};

export default PrivateGuard;
