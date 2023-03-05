import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import QrCode from "qrcode";

import { UserContext, UserDataContext } from "../App";
import Loading from "../components/Loading";
import { Navigate } from "react-router-dom";
import { ERROR_PATH } from "../routes";
import { Logger } from "../utils/logger";

const Profile = () => {
    const { user } = useContext(UserContext);
    const { userData } = useContext(UserDataContext);

    const [qrCode, setQrCode] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!userData?.userId) return;

        QrCode.toDataURL(userData.userId, {
            errorCorrectionLevel: "H",
            margin: 0,
            width: 192,
            color: {
                dark: "#000", // Blue dots
                light: "#0000", // Transparent background
            },
        })
            .then((url) => {
                setQrCode(url);
            })
            .catch((err) => {
                Logger.error(err);
            });
    }, [userData?.userId]);

    if (userData === undefined) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (userData === null) return <Navigate to={ERROR_PATH} />;

    const points = userData.points?.reduce((p, c) => p + c.points, 0);

    const MyQrCode = () => <img src={qrCode} alt={userData.userId} title={userData.userId} />;

    const Card = ({ title, content, className }: { title: string; content: number | string; className?: string }) => (
        <div className={cx("bg-blue-50 text-black rounded-md p-4 min-w-[6rem]", className)}>
            <h3 className="tas-body-small">{title}</h3>
            <div className="tas-body-large font-semibold">{content}</div>
        </div>
    );

    return (
        <main className="h-screen w-screen bg-tas-800 text-white">
            <div className="w-full max-w-lg mx-auto py-16 px-8">
                <section className="">
                    <h1 className="tas-heading-l font-semibold">
                        <div className="tas-caption-l">สวัสดี</div>
                        {userData.firstName}&#32;{userData.lastName}
                    </h1>
                </section>
                <section className="mt-8 font-heading flex gap-4">
                    {/* <div>
                        สมาชิกระดับ: <strong>ดาวฤกษ์</strong>
                    </div> */}
                    <Card title="แต้ม" content={points} />
                    <Card
                        title="สมาชิกตั้งแต่"
                        content={new Intl.DateTimeFormat("th-th", {
                            day: "numeric",
                            month: "narrow",
                            year: "2-digit",
                        }).format(new Date(user?.metadata.creationTime!))}
                    />
                </section>
                <section className="mt-8">
                    <h2 className="tas-heading-m font-semibold">บัตรสมาชิกของฉัน</h2>
                    {/* TODO: Make a nice card front and tap to show the QR Code */}
                    <div className="mt-4 p-8 bg-blue-50 text-black rounded-md flex justify-center">
                        <MyQrCode />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Profile;
