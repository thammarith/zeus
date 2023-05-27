import React, { createContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { createBrowserRouter, RouterProvider, RouteObject, createHashRouter } from "react-router-dom";

import app from "./libs/firebase";

import { getUserData } from "./helpers/userData";
import { Logger } from "./utils/logger";

import UserData from "./types/UserData";

import Loading from "./components/Loading";

import { PROFILE_EDIT_PATH, ERROR_PATH, INDEX_PATH, PROFILE_PATH, WELCOME_PATH } from "./routes";
import Authenticate from "./pages/Authenticate";
import Error from "./pages/Error";
import ProfileEdit from "./pages/ProfileEdit";
import Profile from "./pages/Profile";
import PrivateGuard from "./pages/PrivateGuard";
import Welcome from "./pages/Welcome";

const routes: RouteObject[] = [
    {
        path: INDEX_PATH,
        // path: AUTHENTICATE_PATH,
        element: <Authenticate />,
    },
    {
        path: ERROR_PATH,
        // path: AUTHENTICATE_PATH,
        element: <Error />,
    },
    {
        element: <PrivateGuard />,
        children: [
            {
                path: WELCOME_PATH,
                element: <Welcome />,
            },
            {
                path: PROFILE_PATH,
                element: <Profile />,
            },
            {
                path: PROFILE_EDIT_PATH,
                element: <ProfileEdit />,
            },
        ],
    },
];

const router = createHashRouter(routes);

type IUserContext = {
    user: User | null | undefined;
    setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
};

type IUserDataContext = {
    userData: UserData | null | undefined;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null | undefined>>;
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
    const [user, setUser] = useState<User | null>();
    const [userData, setUserData] = useState<UserData | null>();

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(
            auth,
            async (_user) => {
                Logger.log("User state changed");
                setUser(_user);

                if (_user) getUserData(_user, setUserData);
            },
            (err) => {
                Logger.error(err);
            }
        );

        return unsubscribe;
    }, []);

    if (user === undefined)
        return (
            <div className="w-screen min-h-screen flex items-center justify-center">
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
