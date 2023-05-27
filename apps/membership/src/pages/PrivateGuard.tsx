import React, { useContext, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { AUTHENTICATE_PATH, INDEX_PATH } from '../routes';
import { useAuth } from '../contexts/AuthContext';

const PrivateGuard = () => {
    const location = useLocation();
    const auth = useAuth();

    console.log(auth)

    if (false) return <Navigate to="/login" state={{ from: location }} replace />;

    return <Outlet />;
};

export default PrivateGuard;
