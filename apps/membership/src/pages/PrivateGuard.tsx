import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { UserContext } from '../App';
import { AUTHENTICATE_PATH, INDEX_PATH } from '../routes';

const Private = () => {
    const { user } = useContext(UserContext);

    if (user === null) return <Navigate to={INDEX_PATH} />;

    return <Outlet />;
};

export default Private;
