import { useContext, useEffect, useRef, useState } from 'react';
import {
    AdditionalUserInfo,
    getAdditionalUserInfo,
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    User,
} from 'firebase/auth';
import cx from 'classnames';
import { Navigate, useNavigate } from 'react-router-dom';

import app from '../libs/firebase';
import { Logger } from '../utils/logger';
import { UserContext, UserDataContext } from '../App';
import UserData from '../types/UserData';
import { PROFILE_EDIT_PATH, PROFILE_PATH } from '../routes';

import Logo from '../assets/images/tas-logo.png';
import { upsertUser } from '../helpers/userData';
import Loading from '../components/Loading';
import { IS_NEW_USER } from '../constants/sessionStorage';
import { setSessionItem } from '../helpers/sessionStorage';

enum AuthState {
    NONE, // = 'NONE',
    NO_PHONE_NUMBER, // = 'No phone number',
    VERIFYING_RECAPTCHA, // = 'Verifying reCAPTCHA',
    RECAPTCHA_VERIFIED, // = 'Your reCAPTCHA has been verified',
    RECAPTCHA_FAILED, // = 'Your reCAPTCHA has been failed to verify',
    OTP_SENT_FAILED, // = 'Your OTP code could not be sent',
    OTP_SENT_SUCCESS, // = 'Your OTP code has been sent',
    VERIFYING_OTP, // = 'Verifying OTP',
    OTP_VERIFIED, // = 'Your OTP code has been verified',
    OTP_FAILED, // = 'Authentication failed',
    SIGNED_IN, // = 'You have been signed in',
    REGISTERED, // = 'You have been registed',
}

const Authenticate = () => {
    const SIGN_IN_BUTTON_ID = 'sign-in-button';

    const [authState, setAuthState] = useState(AuthState.NONE);
    const [mobileNumber, setMobileNumber] = useState('');
    const [otpCode, setOptCode] = useState('');
    const [error, setError] = useState<{ text: string; hint: string }>();

    const { user } = useContext(UserContext);
    const { userData, setUserData } = useContext(UserDataContext);

    const navigate = useNavigate();

    const reloadWindow = () => window.location.reload();

    useEffect(() => {
        switch (authState) {
            case AuthState.NO_PHONE_NUMBER:
                setError({
                    text: 'โปรดใส่หมายเลขโทรศัพท์',
                    hint: '',
                });
                break;
            case AuthState.OTP_SENT_FAILED:
                setError({
                    text: 'ไม่สามารถส่ง OTP ได้',
                    hint: `โปรดตรวจสอบหมายเลขโทรศัพท์ของคุณ (${mobileNumber.replace('+66', '')}) และลองใหม่อีกครั้ง`,
                });
                break;
                case AuthState.OTP_FAILED:
                setError({
                    text: 'ไม่สามารถยืนยัน OTP ได้',
                    hint: `หมายเลข OTP ที่คุณกรอกอาจผิด หรือเกิดปัญหาที่ไม่คาดคิดขึ้น โปรดลองอีกครั้ง`,
                });
                break;
            default:
                setError(undefined);
        }
    }, [authState, setError, mobileNumber]);

    const auth = getAuth(app);
    auth.useDeviceLanguage();

    if (user === undefined) {
        return (
            <div className="w-screen min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (userData) {
        return <Navigate to={PROFILE_PATH} />;
    }

    const shouldForceReload = [AuthState.RECAPTCHA_FAILED, AuthState.OTP_SENT_FAILED].includes(authState);

    const onSendOtpButtonClick = async () => {
        Logger.log('beginning authentication ceremony');

        if (!mobileNumber) {
            setAuthState(AuthState.NO_PHONE_NUMBER);
            return;
        }

        if (!auth) {
            Logger.error('auth is not defined');
            return;
        }

        const isReCaptchaSuccessful = await verifyRecaptcha();

        if (!isReCaptchaSuccessful) {
            // reloadWindow();
            return;
        }

        const isOtpSent = await sendOtp();

        if (!isOtpSent) {
            // reloadWindow();
            return;
        }
    };

    const verifyRecaptcha = async () => {
        Logger.log('verifying recaptcha');
        setAuthState(AuthState.VERIFYING_RECAPTCHA);

        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                SIGN_IN_BUTTON_ID,
                {
                    size: 'invisible',
                    callback: (response: any) => {},
                    'error-callback': (error: any) => {
                        Logger.error('Error from verifyRecaptcha: ', error);
                    },
                },
                auth
            );
        }

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

        return await signInWithPhoneNumber(auth, mobileNumber, window.recaptchaVerifier)
            .then((confirmationResult) => {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                window.confirmationResult = confirmationResult;
                setAuthState(AuthState.OTP_SENT_SUCCESS);
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

                Logger.log(auth.currentUser);
                // we can get isNewUser from this
                const additionalUserInfo = getAdditionalUserInfo(result);
                // Logger.log(foo);

                updateUserOnFirestore(result.user, additionalUserInfo);
            })
            .catch((error) => {
                Logger.error(error);
                setAuthState(AuthState.OTP_FAILED);
                return false;
                // User couldn't sign in (bad verification code?)
            });
    };

    const updateUserOnFirestore = async (u: User, additionalUserInfo: AdditionalUserInfo | null) => {
        if (!additionalUserInfo?.isNewUser) {
            navigate(PROFILE_PATH, { replace: true });
            return;
        }

        const newUserData: UserData = {
            userId: u.uid,
            phoneNumber: u.phoneNumber || '',
            points: [],
        };

        await upsertUser(u, newUserData, async () => {
            setSessionItem(IS_NEW_USER, 'true');
            navigate(PROFILE_EDIT_PATH, { replace: true });
            return;
        });
    };

    return (
        <main className="min-h-screen w-screen text-white">
            <div className="w-full max-w-lg mx-auto py-16 px-8">
                <section>
                    <img src={Logo} className="w-16" style={{ filter: 'contrast(0) brightness(0) invert()' }} />
                    <h1 className="tas-heading-l font-semibold mt-4">
                        สมาชิกออนไลน์
                        <br />
                        สมาคมดาราศาสตร์ไทย
                    </h1>
                </section>

                {error && (
                    <div className={cx('mt-8 bg-red-300 text-red-700 rounded-md p-4 min-w-[6rem] font-heading')}>
                        <h3 className="tas-body-large font-semibold">{error?.text}</h3>
                        {error?.hint && <div className="tas-body-small mt-2">{error?.hint}</div>}
                        {shouldForceReload && (
                            <button
                                onClick={reloadWindow}
                                className="mt-4 px-4 py-2 bg-tas-700 hover:bg-tas-500 text-white rounded-md"
                            >
                                ลองใหม่อีกครั้ง
                            </button>
                        )}
                    </div>
                )}

                {!shouldForceReload && (
                    <section className="mt-8">
                        <label>
                            <span className="font-heading tas-body">หมายเลขโทรศัพท์</span>
                            <input
                                className="mt-3 border border-white w-full h-10 p-2 text-black"
                                type="text"
                                onChange={(e) =>
                                    setMobileNumber(() => {
                                        if (e.target.value.length >= 3 && !e.target.value.includes('+')) {
                                            return `+66${e.target.value}`;
                                        }

                                        return e.target.value;
                                    })
                                }
                                disabled={authState >= AuthState.OTP_SENT_SUCCESS}
                            />
                        </label>
                        <button
                            className={cx(
                                authState >= AuthState.OTP_SENT_SUCCESS && 'hidden',
                                'bg-white px-3 py-2 mt-6',
                                'tas-body text-black font-heading font-medium'
                            )}
                            id={SIGN_IN_BUTTON_ID}
                            onClick={onSendOtpButtonClick}
                        >
                            รับรหัสผ่าน
                        </button>
                        {authState >= AuthState.OTP_SENT_SUCCESS && (
                            <>
                                <label className="mt-6 block">
                                    <span className="font-heading tas-body">รหัสผ่านที่ได้รับ</span>
                                    <input
                                        className="mt-3 border border-white w-full h-10 p-2 text-black"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        onChange={(e) => setOptCode(e.target.value)}
                                    />
                                </label>
                                <button
                                    className={cx(
                                        'bg-white px-3 py-2 mt-6',
                                        'tas-body text-black font-heading font-medium'
                                    )}
                                    onClick={verifyOtp}
                                >
                                    ตรวจสอบ
                                </button>
                            </>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
};

export default Authenticate;
