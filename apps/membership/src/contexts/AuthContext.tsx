import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import {
    AdditionalUserInfo,
    ApplicationVerifier,
    ConfirmationResult,
    RecaptchaVerifier,
    User,
    UserCredential,
    getAdditionalUserInfo as _getAdditionalUserInfo,
    onAuthStateChanged,
    signInWithPhoneNumber,
} from 'firebase/auth';

import { auth } from '../libs/firebase';
import { Logger } from '../utils/logger';
import { upsertUser } from '../helpers/userData';
import UserData from '../types/UserData';
import { removeSessionItem, setSessionItem } from '../helpers/sessionStorage';
import { IS_NEW_USER } from '../constants/sessionStorage';

interface IAuthContext {
    isLoggedIn: boolean;
    clearNewUser: () => void;
    getAdditionalUserInfo: (userCredential: UserCredential) => AdditionalUserInfo | null;
    insertUserData: (user: User, additionalUserInfo: AdditionalUserInfo | null) => Promise<boolean | undefined | null>;
    sendOtp: (mobileNumber: string, recaptchaVerifier: ApplicationVerifier) => Promise<ConfirmationResult>;
    setAsNewUser: () => void;
    verifyOtp: (otpCode: string) => Promise<UserCredential>;
    verifyRecaptcha: (signInButtonId: string) => Promise<string>;
    user: User | undefined | null;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const ß = Logger.build('AuthProvider');

    const [user, setUser] = useState<User | null>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Logger.info(ß('auth state changed'), user);
            setUser(user);
            setIsLoading(false);
        });

        return unsubscribe;
    }, [ß]);

    const isLoggedIn = !!user;

    const setAsNewUser = () => {
        setSessionItem(IS_NEW_USER, 'true');
    };

    const clearNewUser = () => {
        removeSessionItem(IS_NEW_USER);
    };

    const getAdditionalUserInfo = (userCredential: UserCredential) => {
        Logger.log(ß('getting additional user info'));

        const additionalUserInfo = _getAdditionalUserInfo(userCredential);

        Logger.info(ß(`this user is a ${additionalUserInfo?.isNewUser ? 'new' : 'returning'} user`));

        return additionalUserInfo;
    };

    const insertUserData = (u: User, additionalUserInfo: AdditionalUserInfo | null): Promise<boolean | undefined | null> => {
        Logger.log(ß(`inserting user data, defined: ${!!user} (u: ${!!u}), new: ${additionalUserInfo?.isNewUser}`));

        if (!user && !u) return new Promise(() => user); // return undefined
        if (!additionalUserInfo?.isNewUser) return new Promise(() => false);

        const newUserData: UserData = {
            userId: u.uid,
            phoneNumber: u.phoneNumber || '',
            points: [],
        };

        return upsertUser(u, newUserData)
            .then(() => {
                Logger.log(ß('user data has been inserted'));
                setAsNewUser();
                return true;
            })
            .catch((err) => {
                Logger.error(ß('cannot insert user data'), err.code, err);
                Logger.error(JSON.stringify(err));

                throw err.code as string;
            });
    };

    const sendOtp = (mobileNumber: string, recaptchaVerifier: ApplicationVerifier) => {
        Logger.log(ß('sending OTP '));

        return signInWithPhoneNumber(auth, mobileNumber, recaptchaVerifier)
            .then((confirmationResult) => {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                Logger.log(ß('OTP has been sucessfully sent'));
                window.confirmationResult = confirmationResult;
                return confirmationResult;
            })
            .catch((err) => {
                Logger.error(ß('OTP was not sent'), err.code, err);
                Logger.error(JSON.stringify(err));

                throw err.code as string;
            });
    };

    const verifyOtp = (otpCode: string) => {
        Logger.log(ß('verifying OTP '));

        return window.confirmationResult
            .confirm(otpCode)
            .then((result) => {
                Logger.log(ß('OTP has been verified'));
                setUser(result.user);
                return result;
            })
            .catch((err) => {
                // User couldn't sign in (bad verification code?)
                Logger.error(ß('OTP verification failed'), err.code, err);
                Logger.error(JSON.stringify(err));

                throw err.code as string;
            });
    };

    const verifyRecaptcha = (signInButtonId: string) => {
        Logger.log(ß('verifying recaptcha'));

        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                signInButtonId,
                {
                    size: 'invisible',
                    callback: (response: any) => {},
                    'error-callback': (error: any) => {
                        Logger.error(ß('Error from verifyRecaptcha: '), error);
                    },
                },
                auth
            );
        }

        return window.recaptchaVerifier
            .verify()
            .then((token) => {
                // TODO: this could cause an issue
                Logger.log(ß('recaptcha has been verified'));
                return token;
            })
            .catch((err) => {
                Logger.error(ß('recaptcha failed to verify'), err.code, err);
                Logger.error(JSON.stringify(err));
                throw err.code;
            });
    };

    const value = {
        isLoggedIn,
        clearNewUser,
        getAdditionalUserInfo,
        insertUserData,
        sendOtp,
        setAsNewUser,
        verifyOtp,
        verifyRecaptcha,
        user,
    };

    // prettier-ignore
    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
