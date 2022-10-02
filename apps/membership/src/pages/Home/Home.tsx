import React, { useState } from 'react';
import Account from '../Account/Account';
import LogIn from '../LogIn/LogIn';
import Register from '../Register/Register';

const Home: React.FC = () => {
    const [state, setState] = useState('Account');

    switch (state) {
        case 'LogIn':
            return <LogIn />;
        case 'Register':
            return <Register />;
        case 'Account':
            return <Account />;
        default:
            return (
                <main>
                    <h1>Welcome</h1>
                </main>
            );
    }
};

export default Home;
