import { User } from 'firebase/auth';
import { doc, getDoc, getDocFromServer, setDoc } from 'firebase/firestore';
import { firestore } from '../libs/firebase';
import MemberData from '../types/UserData';
import { Logger } from '../utils/logger';

const ß = Logger.build('userData');

export const getMemberData = (user: User): Promise<MemberData> => {
    Logger.log(ß('getting the user data'));
    const docRef = doc(firestore, 'users', user.uid);

    return getDoc(docRef)
        .then((docData) => {
            Logger.log(ß('received the data'));
            return docData.data() as MemberData;
        })
        .catch((err) => {
            Logger.error(ß('getUserData cannot get the data'), err);
            return err;
        });
};

export const upsertUser = (user: User, userData: MemberData) => {
    const userRef = doc(firestore, 'users', user.uid);

    const upsertingData = {
        ...userData,
    };

    return setDoc(userRef, upsertingData, { merge: true })
        .then(() => {
            Logger.log(ß('user data has been upserted'));
        })
        .catch((err) => {
            Logger.error(ß('upsertUser cannot get the data'), err);
            return err;
        });
};
