import { User } from 'firebase/auth';
import { collection, doc, getDoc, getDocFromServer, getDocs, setDoc } from 'firebase/firestore';
import { firestore } from '../libs/firebase';
import MemberData from '../types/UserData';
import { Logger } from '../utils/logger';

const ß = Logger.build('userData');

export const getAllMemberDatas = (): Promise<MemberData[]> => {
    Logger.log(ß('getting all the member datas'));

    return getDocs(collection(firestore, 'users'))
        .then((docData) => {
            Logger.log(ß('received the data'));
            return docData.docs.map((doc) => doc.data());
        })
        .catch((err) => {
            Logger.error(ß('getAllMemberDatas cannot get the data'), err);
            return err;
        });
};

export const getMemberData = (uid: string): Promise<MemberData> => {
    Logger.log(ß('getting the user data'));
    const docRef = doc(firestore, 'users', uid);

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

export const upsertUser = (uid: string, userData: MemberData) => {
    const userRef = doc(firestore, 'users', uid);

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
