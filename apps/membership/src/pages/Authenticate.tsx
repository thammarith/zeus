import { useContext, useState } from "react";
import {
    AdditionalUserInfo,
    getAdditionalUserInfo,
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    User,
} from "firebase/auth";
import cx from "classnames";
import { useNavigate } from "react-router-dom";

import app, { firestore } from "../libs/firebase";
import { Logger } from "../utils/logger";
import { doc, setDoc } from "firebase/firestore";
import { UserContext } from "../App";
import UserData, { AccessData } from "../types/UserData";
import { PROFILE_EDIT_PATH, PROFILE_PATH } from "../routes";

import Logo from "../assets/images/tas-logo.png";
import { upsertUser } from "../helpers/userData";

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
    const SIGN_IN_BUTTON_ID = "sign-in-button";

    const [authState, setAuthState] = useState(AuthState.NONE);
    const [mobileNumber, setMobileNumber] = useState("");
    const [otpCode, setOptCode] = useState("");

    const { user } = useContext(UserContext);

    const navigate = useNavigate();

    const auth = getAuth(app);
    auth.useDeviceLanguage();

    const onSendOtpButtonClick = async () => {
        Logger.log("beginning authentication ceremony");

        if (!auth) {
            Logger.error("auth is not defined");
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
        Logger.log("verifying recaptcha");
        setAuthState(AuthState.VERIFYING_RECAPTCHA);

        window.recaptchaVerifier = new RecaptchaVerifier(
            SIGN_IN_BUTTON_ID,
            {
                size: "invisible",
                callback: (response: any) => {},
                "error-callback": (error: any) => {
                    console.error("error-callback");
                    console.error(error);
                },
            },
            auth
        );

        return await window.recaptchaVerifier
            .verify()
            .then(() => {
                Logger.log("recaptcha verified");
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
        Logger.log("signing the user in");

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
        Logger.log("verifying otp");
        setAuthState(AuthState.VERIFYING_OTP);

        window.confirmationResult
            .confirm(otpCode)
            .then((result) => {
                Logger.log("otp verified");
                setAuthState(AuthState.OTP_VERIFIED);

                Logger.info(auth.currentUser);
                // we can get isNewUser from this
                const additionalUserInfo = getAdditionalUserInfo(result);
                // Logger.info(foo);

                updateUserOnFirestore(result.user, additionalUserInfo);
            })
            .catch((error) => {
                Logger.error(error);
                setAuthState(AuthState.AUTH_FAILED);
                return false;
                // User couldn't sign in (bad verification code?)
                // ...
            });
    };

    const updateUserOnFirestore = async (u: User, additionalUserInfo: AdditionalUserInfo | null) => {
        const baseData = {
            lastAccessAt: new Date(),
        } as UserData;

        const newUserData: UserData = {
            ...baseData,
            userId: u.uid,
            phoneNumber: u.phoneNumber || "",
            createdAt: new Date(),
            lastModifiedAt: new Date(),
            points: [],
        };

        const data = additionalUserInfo?.isNewUser ? newUserData : baseData;

        await upsertUser(u, data, () => {
            navigate(PROFILE_EDIT_PATH, { replace: true });
        });
    };

    return (
        <main className="h-screen w-screen bg-tas-800 text-white">
            <div className="w-full max-w-lg mx-auto py-16 px-8">
                <section>
                    <img src={Logo} className="w-16" />
                    <h1 className="tas-heading-l font-semibold mt-4">
                        สมาชิกออนไลน์
                        <br />
                        สมาคมดาราศาสตร์ไทย
                    </h1>
                </section>

                <section className="mt-8">
                    <label>
                        <span className="font-heading tas-body">หมายเลขโทรศัพท์</span>
                        <input
                            className="mt-3 border border-white w-full h-10 p-2 text-black"
                            type="text"
                            onChange={(e) =>
                                setMobileNumber(() => {
                                    if (e.target.value.length >= 3 && !e.target.value.includes("+")) {
                                        return `+66${e.target.value}`;
                                    }

                                    return e.target.value;
                                })
                            }
                            disabled={authState >= AuthState.OTP_SENT}
                        />
                    </label>
                    {
                        <button
                            className={cx(
                                authState >= AuthState.OTP_SENT && "hidden",
                                "bg-white px-3 py-2 mt-6",
                                "tas-body text-black font-heading font-medium"
                            )}
                            id={SIGN_IN_BUTTON_ID}
                            onClick={onSendOtpButtonClick}
                        >
                            รับรหัสผ่าน
                        </button>
                    }
                    {authState >= AuthState.OTP_SENT && (
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
                                    "bg-white px-3 py-2 mt-6",
                                    "tas-body text-black font-heading font-medium"
                                )}
                                onClick={verifyOtp}
                            >
                                ตรวจสอบ
                            </button>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
};

export default Authenticate;
