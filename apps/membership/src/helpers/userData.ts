import { User } from "firebase/auth";
import { doc, getDoc, getDocFromServer, setDoc } from "firebase/firestore";
import { firestore } from "../libs/firebase";
import UserData from "../types/UserData";
import { Logger } from "../utils/logger";

export const getUserData = async (user: User, then?: (_: UserData) => any) => {
    const docRef = doc(firestore, "users", user.uid);

    return await getDoc(docRef)
        .then((docData) => {
            const data = docData.data() as UserData;

            if (!data) return false;

            then?.(data);
            return true;
        })
        .catch((err) => {
            Logger.error(err);
            return err;
        });
};

export const upsertUser = async (user: User, userData: UserData, then?: () => any) => {
    const userRef = doc(firestore, "users", user.uid);

    const upsertingData = {
        ...userData,
    };

    return await setDoc(userRef, upsertingData, { merge: true })
        .then(() => {
            then?.();
            return true;
        })
        .catch((err) => {
            Logger.error(err);
            return false;
        });
};
