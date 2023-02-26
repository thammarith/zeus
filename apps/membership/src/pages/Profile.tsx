import React, { useContext } from 'react';
import { UserContext, UserDataContext } from '../App';
import Loading from '../components/Loading';

const Profile = () => {
    const { user } = useContext(UserContext);
    const { userData } = useContext(UserDataContext);

    if (userData === undefined)
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <Loading />
            </div>
        );

    if (userData === null) return <h1>NO DATA!</h1>;

    return (
        <main className="w-screen h-screen">
            <section className="flex items-center justify-center">
                <h1>
                    Hi, {userData.firstName} {userData.lastName}
                </h1>
            </section>
        </main>
    );
};

export default Profile;
