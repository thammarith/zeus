import React, { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';

import app, { firestore } from './libs/firebase';
import Authenticate from './pages/Authenticate';
import Profile from './pages/Profile';
import Loading from './components/Loading';
import { AUTHENTICATE_PATH, PROFILE_PATH } from './routes';
import PrivateGuard from './pages/PrivateGuard';
import UserData from './types/UserData';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { mapToUserData } from './helpers/userDataMapper';

const routes = [
    {
        path: AUTHENTICATE_PATH,
        element: <Authenticate />,
    },
    {
        element: <PrivateGuard />,
        children: [
            {
                path: PROFILE_PATH,
                element: <Profile />,
            },
        ],
    },
];

const router = createBrowserRouter(routes);

type IUserContext = {
    user: User | null | undefined;
    setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
};

type IUserDataContext = {
    userData: UserData | null | undefined;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
};

export const UserContext = createContext<IUserContext>({
    user: undefined,
    setUser: () => {},
});

export const UserDataContext = createContext<IUserDataContext>({
    userData: undefined,
    setUserData: () => {},
});

const App: React.FC = () => {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [userData, setUserData] = useState<UserData | null | undefined>(undefined);

    useEffect(() => {
        console.log('>>>>>>>>> useEffect is called');
        if (!user?.uid) return;

        const docRef = doc(firestore, 'users', user.uid);
        getDoc(docRef)
            .then((docData) => {
                const mappedData = mapToUserData(docData.data());
                console.log(mappedData);
                setUserData(mappedData);
            })
            .catch((err) => err);
    }, [user?.uid]);

    const auth = getAuth(app);
    onAuthStateChanged(
        auth,
        async (_user) => {
            console.log('User state changed');
            setUser(_user);
        },
        (err) => {
            console.error(err);
        }
    );

    console.log('App is re-rendered');

    if (user === undefined)
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <Loading />
            </div>
        );

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <UserDataContext.Provider value={{ userData, setUserData }}>
                <RouterProvider router={router} />
            </UserDataContext.Provider>
        </UserContext.Provider>
    );
};

export default App;
