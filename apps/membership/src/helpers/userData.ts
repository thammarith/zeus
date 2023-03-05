import { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../libs/firebase";
import UserData from "../types/UserData";
import { mapToUserData } from "./userDataMapper";

export const getUserData = async (user: User, then?: (_: UserData) => any) => {
    const docRef = doc(firestore, "users", user.uid);
    return await getDoc(docRef)
        .then((docData) => {
            const mappedData = mapToUserData(docData.data());
            then?.(mappedData);
        })
        .catch((err) => err);
};

export const upsertUser = async (user: User, userData: UserData, then?: () => any) => {
    const userRef = doc(firestore, "users", user.uid);

    const upsertingData = {
        ...userData,
        lastModifiedAt: new Date(),
    };

    return await setDoc(userRef, upsertingData, { merge: true })
        .then(() => {
            then?.();
            return true;
        })
        .catch((err) => {
            console.error(err);
            return false;
        });
};
