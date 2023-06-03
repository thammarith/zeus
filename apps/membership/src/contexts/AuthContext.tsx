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
import { getMemberData, upsertUser } from '../helpers/userData';
import MemberData from '../types/UserData';
import { removeSessionItem, setSessionItem } from '../helpers/sessionStorage';
import { IS_NEW_USER } from '../constants/sessionStorage';
import Loading from '../components/Loading';

interface IAuthContext {
    isLoggedIn: boolean;
    memberData: MemberData | undefined | null;
    user: User | undefined | null;
    clearNewUser: () => void;
    getAdditionalUserInfo: (userCredential: UserCredential) => AdditionalUserInfo | null;
    insertUserData: (user: User, additionalUserInfo: AdditionalUserInfo | null) => Promise<boolean | undefined | null>;
    sendOtp: (mobileNumber: string, recaptchaVerifier: ApplicationVerifier) => Promise<ConfirmationResult>;
    setAsNewUser: () => void;
    updateMemberData: (user: User) => Promise<MemberData>;
    verifyOtp: (otpCode: string) => Promise<UserCredential>;
    verifyRecaptcha: (signInButtonId: string) => Promise<string>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const ß = Logger.build('AuthProvider');

    const [user, setUser] = useState<User | null>();
    const [memberData, setMemberData] = useState<MemberData | null>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return Logger.info(ß('auth state changed to no user'));

            // Logger.info(ß('auth state changed'), user);
            Logger.info(ß('auth state changed'));
            setUser(user);
        });

        return unsubscribe;
    }, [ß]);

    useEffect(() => {
        if (!user) return;
        updateMemberData(user).then(() => setIsLoading(false));
    }, [user]);

    if (isLoading) {
        return (
            <main className="h-screen w-full flex items-center justify-center">
                <Loading />
            </main>
        );
    }

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

    const insertUserData = (
        u: User,
        additionalUserInfo: AdditionalUserInfo | null
    ): Promise<boolean | undefined | null> => {
        Logger.log(ß(`inserting user data, defined: ${!!user} (u: ${!!u}), new: ${additionalUserInfo?.isNewUser}`));

        if (!user && !u) return new Promise(() => user); // return undefined
        if (!additionalUserInfo?.isNewUser) return new Promise(() => false);

        const newUserData: MemberData = {
            userId: u.uid,
            phoneNumber: u.phoneNumber || '',
            points: [],
        };

        return upsertUser(u.uid, newUserData)
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

    // has to be function to hoist
    function updateMemberData(user: User) {
        return getMemberData(user.uid).then((data) => {
            setMemberData(data);
            return data;
        });
    }

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
        memberData,
        user,
        clearNewUser,
        getAdditionalUserInfo,
        insertUserData,
        sendOtp,
        setAsNewUser,
        updateMemberData,
        verifyOtp,
        verifyRecaptcha,
    };

    // prettier-ignore
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
