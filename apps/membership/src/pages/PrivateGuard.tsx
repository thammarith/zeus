import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { UserContext } from '../App';
import { AUTHENTICATE_PATH } from '../routes';

const Private = () => {
    const { user } = useContext(UserContext);

    console.log('attempting to render private route');

    if (user === null) return <Navigate to={AUTHENTICATE_PATH} />;
    return <Outlet />;
};

export default Private;
