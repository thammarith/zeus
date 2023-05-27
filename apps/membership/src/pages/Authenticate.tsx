/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import cx from 'classnames';

import Logo from '../assets/images/tas-logo.png';
import { useAuth } from '../contexts/AuthContext';
import { Logger } from '../utils/logger';
import Loading from '../components/Loading';
import { UserCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { PROFILE_PATH, WELCOME_PATH } from '../routes';

enum AuthState {
    NONE,
    NO_PHONE_NUMBER,

    RECAPTCHA_INITIATED,
    RECAPTCHA_FAILED,
    RECAPTCHA_VERIFIED,

    OTP_INITIATED,
    OTP_SENT_FAILED,
    OTP_SENT_FAILED_INVALID_NUMBER,
    OTP_SENT_FAILED_MISSING_NUMBER,
    OTP_SENT_FAILED_TOO_MANY_REQUESTS,
    OTP_SENT_FAILED_QUOTA_EXCEEDED,
    OTP_SENT_FAILED_OP_NOT_ALLOWED,
    OTP_SENT_SUCCESS,

    VERIFYING_OTP,
    OTP_FAILED,
    OTP_MISSING,
    OTP_INCORRECT,
    OTP_EXPIRED,
    OTP_USER_DISABLED,
    OTP_VERIFIED,

    CANNOT_FIND_USER,
    CANNOT_UPDATE_USER_DATA,
    SIGNED_IN,
    REGISTERED,
}

const Authenticate = () => {
    const RECAPTCHA_CONTAINER_ID = 'sign-in-button';

    const [mobileNumber, setMobileNumber] = useState('');
    const [otpCode, setOptCode] = useState('');

    const [authState, setAuthState] = useState(AuthState.NONE);
    const [error, setError] = useState<{ text: string; hint: string }>();

    const auth = useAuth();
    const navigate = useNavigate();

    const shouldForceReload = false;

    const ß = Logger.build('Authenticate');

    useEffect(() => {
        if (auth?.isLoggedIn) {
            Logger.log(ß('User is already logged in, redirecting to profile page'));
            navigate(PROFILE_PATH);
        }
    }, [auth?.isLoggedIn, navigate, ß]);

    const getErrorMessage = (authState: AuthState) => {
        // prettier-ignore
        switch (authState) {
            case AuthState.OTP_SENT_FAILED_INVALID_NUMBER:
                return ['หมายเลขโทรศัพท์ไม่ถูกต้อง', `หมายเลข ${mobileNumber} ไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง`];
            case AuthState.NO_PHONE_NUMBER:
            case AuthState.OTP_SENT_FAILED_MISSING_NUMBER:
                return ['โปรดกรอกหมายเลขโทรศัพท์', 'คุณยังไม่ได้กรอกหมายเลขโทรศัพท์ โปรดกรอกหมายเลขโทรศัพท์ของคุณ'];
            case AuthState.OTP_SENT_FAILED_TOO_MANY_REQUESTS:
                return ['เกิดข้อผิดพลาด', 'คุณทำรายการถี่เกินไป โปรดรอสักพักก่อนลองใหม่อีกครั้ง'];
            case AuthState.OTP_USER_DISABLED:
                return ['เกิดข้อผิดพลาด', 'ผู้ใช้นี้ถูกระงับการใช้งาน'];

            case AuthState.OTP_INCORRECT:
                return ['รหัส OTP ไม่ถูกต้อง', 'ลองตรวจสอบรหัส OTP ที่ได้รับทาง SMS อีกครั้ง รหัสนี้มี 6 หลักและเป็นตัวเลขเท่านั้น'];
            case AuthState.OTP_MISSING:
                return ['โปรดกรอกรหัส OTP', 'ลองตรวจสอบรหัส OTP ที่ได้รับทาง SMS อีกครั้ง รหัสนี้มี 6 หลักและเป็นตัวเลขเท่านั้น'];
            case AuthState.OTP_EXPIRED:
                return ['รหัส OTP หมดอายุแล้ว', 'กรุณาเริ่มใหม่อีกครั้ง'];

            case AuthState.CANNOT_UPDATE_USER_DATA:
                return ['เกิดข้อผิดพลาด', 'เราไม่สามารถสร้างบัญชีให้ท่านได้ โปรดติดต่อสมาคมดาราศาสตร์ไทย 02 381 7409 หรือที่เพจสมาคมดาราศาสตร์ไทย'];

            case AuthState.RECAPTCHA_FAILED:
            case AuthState.OTP_FAILED:
            case AuthState.OTP_SENT_FAILED:
            case AuthState.OTP_SENT_FAILED_QUOTA_EXCEEDED:
            case AuthState.OTP_SENT_FAILED_OP_NOT_ALLOWED:
            case AuthState.CANNOT_FIND_USER:
            default:
                return ['เกิดข้อผิดพลาด', 'มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง'];
        }
    };

    const handleError = (authState: AuthState) => {
        setAuthState(authState);
        const [text, hint] = getErrorMessage(authState);
        setError({ text, hint });
    };

    const sendOtp = () => {
        setAuthState(AuthState.OTP_INITIATED);
        setError(undefined);

        auth?.sendOtp(mobileNumber, window.recaptchaVerifier)
            .then(() => {
                setAuthState(AuthState.OTP_SENT_SUCCESS);
            })
            .catch((err: string) => {
                console.warn(err);
                if (err === 'auth/captcha-check-failed') handleError(AuthState.OTP_SENT_FAILED);
                else if (err === 'auth/invalid-phone-number') handleError(AuthState.OTP_SENT_FAILED_INVALID_NUMBER);
                else if (err === 'auth/missing-phone-number') handleError(AuthState.OTP_SENT_FAILED_MISSING_NUMBER);
                else if (err === 'auth/quota-exceeded') handleError(AuthState.OTP_SENT_FAILED_QUOTA_EXCEEDED);
                else if (err === 'auth/operation-not-allowed') handleError(AuthState.OTP_SENT_FAILED_OP_NOT_ALLOWED);
                else if (err === 'auth/too-many-requests') handleError(AuthState.OTP_SENT_FAILED_TOO_MANY_REQUESTS);
                else handleError(AuthState.OTP_SENT_FAILED);
            });
    };

    const onUserLoggedIn = (userCredential: UserCredential) => {
        const additionalUserInfo = auth?.getAdditionalUserInfo(userCredential);
        if (!additionalUserInfo) return;

        auth?.insertUserData(userCredential.user, additionalUserInfo)
            .then((res) => {
                if (res) {
                    setAuthState(AuthState.REGISTERED);
                    navigate(WELCOME_PATH);
                } else if (res === false) {
                    setAuthState(AuthState.SIGNED_IN);
                    navigate(PROFILE_PATH);
                } else if (res === undefined || res === null) {
                    const [text, hint] = getErrorMessage(AuthState.CANNOT_FIND_USER);
                    setError({ text, hint });
                }
            })
            .catch(() => {
                handleError(AuthState.CANNOT_UPDATE_USER_DATA);
            });
    };

    const verifyOtp = () => {
        setAuthState(AuthState.VERIFYING_OTP);
        setError(undefined);

        auth?.verifyOtp(otpCode)
            .then((res) => {
                setAuthState(AuthState.OTP_VERIFIED);
                onUserLoggedIn(res);
            })
            .catch((err: string) => {
                if (err === 'auth/invalid-verification-code') handleError(AuthState.OTP_INCORRECT);
                else if (err === 'auth/missing-verification-code') handleError(AuthState.OTP_MISSING);
                else if (err === 'auth/code-expired') handleError(AuthState.OTP_EXPIRED);
                else if (err === 'auth/user-disabled') handleError(AuthState.OTP_USER_DISABLED);
                else handleError(AuthState.OTP_FAILED);
            });
    };

    const onSendOtpButtonClick = () => {
        auth?.clearNewUser();
        setAuthState(AuthState.RECAPTCHA_INITIATED);
        setError(undefined);

        if (!mobileNumber) return handleError(AuthState.NO_PHONE_NUMBER);

        auth?.verifyRecaptcha(RECAPTCHA_CONTAINER_ID)
            .then(() => {
                Logger.log(ß('recaptcha verified'));
                setAuthState(AuthState.RECAPTCHA_VERIFIED);
            })
            .then(sendOtp)
            .catch((err) => {
                handleError(AuthState.RECAPTCHA_FAILED);
            });
    };

    const getButtonContent = () => {
        if (authState === AuthState.NONE) return 'รับรหัสผ่าน';
        if (authState === AuthState.RECAPTCHA_INITIATED) return 'กำลังตรวจสอบ…';
        return 'WHATTT!?';
    };

    const onMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // prettier-ignore
        setMobileNumber(() =>
            e.target.value.length >= 3 && !e.target.value.includes('+')
                ? `+66${e.target.value}`
                : e.target.value
        );
    };

    const Header = (
        <section>
            <img
                alt="สมาคมดาราศาสตร์ไทย"
                src={Logo}
                className="w-16"
                style={{ filter: 'contrast(0) brightness(0) invert()' }}
            />
            {/* <h1 className="tas-heading-l font-semibold mt-4">
                สมาชิกออนไลน์
                <br />
                สมาคมดาราศาสตร์ไทย
            </h1> */}
        </section>
    );

    const Form = !shouldForceReload && (
        <section className="mt-8">
            {error && (
                <div className={cx('my-8 bg-red-300 text-red-700 rounded-md p-4 min-w-[6rem] font-heading')}>
                    <h3 className="tas-body-large font-semibold">
                        {error?.text} ({authState})
                    </h3>
                    {error?.hint && <div className="tas-body-small mt-2">{error?.hint}</div>}
                    {shouldForceReload && (
                        <button
                            // onClick={reloadWindow}
                            className="mt-4 px-4 py-2 bg-tas-700 hover:bg-tas-500 text-white rounded-md"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    )}
                </div>
            )}

            <label>
                <span className="font-heading tas-body">หมายเลขโทรศัพท์</span>
                <input
                    className="mt-3 border w-full h-10 p-2 text-black"
                    placeholder="0801234567"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={onMobileNumberChange}
                    disabled={authState >= AuthState.OTP_SENT_SUCCESS}
                />
            </label>

            {authState < AuthState.OTP_SENT_SUCCESS && (
                <button
                    className={cx('bg-blue-700 px-3 py-2 mt-6', 'tas-body text-white font-heading font-medium')}
                    onClick={onSendOtpButtonClick}
                >
                    {getButtonContent()}
                </button>
            )}

            {authState >= AuthState.OTP_SENT_SUCCESS && (
                <>
                    <label className="mt-6 block">
                        <span className="font-heading tas-body">รหัสผ่านที่ได้รับ</span>
                        <input
                            className="mt-3 border w-full h-10 p-2 text-black"
                            type="text"
                            placeholder="123456"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onChange={(e) => setOptCode(e.target.value)}
                        />
                    </label>
                    <button
                        className={cx('bg-blue-700 px-3 py-2 mt-6', 'tas-body text-white font-heading font-medium')}
                        onClick={verifyOtp}
                    >
                        ตรวจสอบ OTP
                    </button>
                </>
            )}
        </section>
    );

    return (
        <>
            {Header}
            {Form}
            <div aria-hidden={true} id={RECAPTCHA_CONTAINER_ID} />
        </>
    );
};

export default Authenticate;
