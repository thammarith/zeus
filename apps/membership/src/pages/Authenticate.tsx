import React, { useContext, useMemo, useState } from 'react';
import {
    AdditionalUserInfo,
    getAdditionalUserInfo,
    getAuth,
    onAuthStateChanged,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    User,
} from 'firebase/auth';
import cx from 'classnames';
import { useNavigate } from 'react-router-dom';

import app, { firestore } from '../libs/firebase';
import { Logger } from '../utils/logger';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { UserContext } from '../App';
import { AccessData, CreationData, MemberData } from '../types/UserData';
import { PROFILE_PATH } from '../routes';

enum AuthState {
    NONE, // = 'NONE',
    VERIFYING_RECAPTCHA, // = 'Verifying reCAPTCHA',
    RECAPTCHA_VERIFIED, // = 'Your reCAPTCHA has been verified',
    RECAPTCHA_FAILED, // = 'Your reCAPTCHA has been failed to verify',
    OTP_SENT, // = 'Your OTP code has been sent',
    OTP_SENT_FAILED, // = 'Your OTP code could not be sent',
    VERIFYING_OTP, // = 'Verifying OTP',
    OTP_VERIFIED, // = 'Your OTP code has been verified',
    SIGNED_IN, // = 'You have been signed in',
    REGISTERED, // = 'You have been registed',
    AUTH_FAILED, // = 'Authentication failed',
}

const Authenticate = () => {
    const SIGN_IN_BUTTON_ID = 'sign-in-button';

    const [authState, setAuthState] = useState(AuthState.NONE);
    const [mobileNumber, setMobileNumber] = useState('');
    const [otpCode, setOptCode] = useState('');

    const { user } = useContext(UserContext);

    const navigate = useNavigate();

    const auth = getAuth(app);
    auth.useDeviceLanguage();

    const onSendOtpButtonClick = async () => {
        Logger.log('beginning authentication ceremony');

        if (!auth) {
            Logger.error('auth is not defined');
            return;
        }

        const isReCaptchaSuccessful = await verifyRecaptcha();

        if (!isReCaptchaSuccessful) {
            window.location.reload();
            return;
        }

        const isOtpSent = await sendOtp();

        if (!isOtpSent) {
            window.location.reload();
            return;
        }
    };

    const verifyRecaptcha = async () => {
        Logger.log('verifying recaptcha');
        setAuthState(AuthState.VERIFYING_RECAPTCHA);

        window.recaptchaVerifier = new RecaptchaVerifier(
            SIGN_IN_BUTTON_ID,
            {
                size: 'invisible',
                callback: (response: any) => {},
                'error-callback': (error: any) => {
                    console.error('error-callback');
                    console.error(error);
                },
            },
            auth
        );

        return await window.recaptchaVerifier
            .verify()
            .then(() => {
                Logger.log('recaptcha verified');
                setAuthState(AuthState.RECAPTCHA_VERIFIED);
                return true;
            })
            .catch((err) => {
                Logger.error(err);
                setAuthState(AuthState.RECAPTCHA_FAILED);
                return false;
            });
    };

    const sendOtp = async () => {
        Logger.log('signing the user in');

        const appVerifier = window.recaptchaVerifier;

        return await signInWithPhoneNumber(auth, mobileNumber, appVerifier)
            .then((confirmationResult) => {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                window.confirmationResult = confirmationResult;
                setAuthState(AuthState.OTP_SENT);
                return true;
            })
            .catch((err) => {
                Logger.error(err);
                setAuthState(AuthState.OTP_SENT_FAILED);
                return false;
            });
    };

    const verifyOtp = () => {
        Logger.log('verifying otp');
        setAuthState(AuthState.VERIFYING_OTP);

        window.confirmationResult
            .confirm(otpCode)
            .then((result) => {
                Logger.log('otp verified');
                setAuthState(AuthState.OTP_VERIFIED);

                Logger.info(auth.currentUser);
                // we can get isNewUser from this
                const additionalUserInfo = getAdditionalUserInfo(result);
                // Logger.info(foo);

                upsertUser(result.user, additionalUserInfo);
            })
            .catch((error) => {
                Logger.error(error);
                setAuthState(AuthState.AUTH_FAILED);
                return false;
                // User couldn't sign in (bad verification code?)
                // ...
            });
    };

    const upsertUser = async (u: User, additionalUserInfo: AdditionalUserInfo | null) => {
        console.log('upserting user', u.uid);
        const userRef = doc(firestore, 'users', u.uid);

        const baseData: Pick<AccessData, 'lastAccessAt'> = {
            lastAccessAt: new Date(),
        };

        const newUserData: AccessData & CreationData & MemberData = {
            ...baseData,
            userId: u.uid,
            phoneNumber: u.phoneNumber || '',
            createdAt: new Date(),
            firstName: 'เอกภพ',
            lastName: 'ดาราวงศ์',
            lastModifiedAt: new Date(),
        };

        const data = additionalUserInfo?.isNewUser ? newUserData : baseData;
        await setDoc(userRef, data, { merge: true })
            .then((res) => {
                console.log(res);
                navigate(PROFILE_PATH, { replace: true });
                return true;
            })
            .catch((err) => {
                console.error(err);
                return false;
            });
    };

    return (
        <div className="w-screen h-screen pt-16 flex justify-center">
            <div className="w-64">
                <h1>
                    Welcome {mobileNumber} ({authState}) ({JSON.stringify(user)})
                </h1>

                <div id="recaptcha-container" />

                <input
                    key="1234"
                    className="my-8 border-black border"
                    type="text"
                    onChange={(e) =>
                        setMobileNumber(() => {
                            if (e.target.value.length >= 3 && !e.target.value.includes('+')) {
                                return `+66${e.target.value}`;
                            }

                            return e.target.value;
                        })
                    }
                    disabled={authState >= AuthState.OTP_SENT}
                />
                {
                    <button
                        className={cx(authState >= AuthState.OTP_SENT && 'hidden')}
                        id={SIGN_IN_BUTTON_ID}
                        onClick={onSendOtpButtonClick}
                    >
                        Send OTP
                    </button>
                }

                {authState >= AuthState.OTP_SENT && (
                    <>
                        <input
                            className="my-8 border-black border"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onChange={(e) => setOptCode(e.target.value)}
                        />
                        <button onClick={verifyOtp}>Verify OTP</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Authenticate;
