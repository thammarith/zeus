import React from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

import { firestore } from './libs/firebase';
import Authenticate from './pages/Authenticate';

const App: React.FC = () => {
    return <Authenticate />;

    const upsertUser = async (user: User) => {
        const userRef = doc(firestore, 'users', user.uid);
        const res = await setDoc(
            userRef,
            {
                userId: user.uid,
                phoneNumber: user.phoneNumber,
                lastUpdated: Timestamp.now(),
            },
            { merge: true }
        );

        console.log(res);
    };
};

export default App;
