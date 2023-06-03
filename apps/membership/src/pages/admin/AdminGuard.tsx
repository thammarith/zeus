import React, { useContext, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import crypto from 'crypto';

import { AUTHENTICATE_PATH } from '../../routes';
import { useAuth } from '../../contexts/AuthContext';
import { Logger } from '../../utils/logger';

const AdminGuard = () => {
    const location = useLocation();
    const auth = useAuth();

    const ß = Logger.build('AdminGuard');

    // prettier-ignore
    Logger.log(ß(`checking the user\'s priviledge; isLoggedIn: ${auth?.isLoggedIn}, isAdmin: ${auth?.memberData?.isAdmin}`));
    // prettier-ignore
    if (!auth?.isLoggedIn || !auth?.memberData?.isAdmin) return <Navigate to={AUTHENTICATE_PATH} state={{ from: location }} replace />;

    return <Outlet />;
};

export default AdminGuard;
