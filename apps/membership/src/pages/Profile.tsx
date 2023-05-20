import React, { useContext, useEffect, useReducer, useState } from 'react';
import cx from 'classnames';
import QrCode from 'qrcode';

import { UserContext, UserDataContext } from '../App';
import Loading from '../components/Loading';
import { Navigate } from 'react-router-dom';
import { ERROR_PATH } from '../routes';
import { Logger } from '../utils/logger';
import { getSessionItem, removeSessionItem } from '../helpers/sessionStorage';
import { IS_NEW_USER } from '../constants/sessionStorage';

const Profile = () => {
    const { user } = useContext(UserContext);
    const { userData } = useContext(UserDataContext);

    const [qrCode, setQrCode] = useState<string | undefined>(undefined);

    const [, forceUpdate] = useReducer((_) => _ + 1, 0);

    const isNewUser = getSessionItem(IS_NEW_USER) === 'true';

    useEffect(() => {
        if (!userData?.userId) return;

        QrCode.toDataURL(userData.userId, {
            errorCorrectionLevel: 'H',
            margin: 0,
            width: 192,
            color: {
                dark: '#000', // Blue dots
                light: '#0000', // Transparent background
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
            <div className="w-screen min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (userData === null) return <Navigate to={ERROR_PATH} />;

    const points = userData.points?.reduce((p, c) => p + c.points, 0);

    const MyQrCode = () => <img src={qrCode} alt={userData.userId} title={userData.userId} />;

    const Card = ({ title, content, className }: { title: string; content: number | string; className?: string }) => (
        <div className={cx('bg-blue-50 text-black rounded-md p-4 min-w-[6rem]', className)}>
            <h3 className="tas-body-small">{title}</h3>
            <div className="tas-body-large font-semibold">{content}</div>
        </div>
    );

    const onNewUserWelcomeClose = () => {
        removeSessionItem(IS_NEW_USER);
        forceUpdate();
    }

    const NewUserWelcome = () => (
        <div className={cx('relative mt-8 bg-blue-50 text-black rounded-md p-4 min-w-[6rem] font-heading')}>
            <div onClick={onNewUserWelcomeClose} className="absolute top-4 right-4 text-gray-500 hover:cursor-pointer">
                ✕
            </div>
            <h3 className="tas-body-large font-semibold">ยินดีต้อนรับ</h3>
            <div className="tas-body-small mt-2">
                คุณได้เป็นสมาชิกเรียบร้อยแล้ว คุณสามารถดูแต้ม และบัตรสมาชิกได้ที่หน้านี้
            </div>
            <div className="tas-body-small mt-2">
                คุณสามารถสะสมแต้มได้จากการเข้าร่วมกิจกรรม การซื้อสินค้าจากสมาคมดาราศาสตร์ไทย
            </div>
        </div>
    );

    return (
        <main className="min-h-screen w-screen bg-tas-800 text-white">
            <div className="w-full max-w-lg mx-auto py-16 px-8">
                <section className="">
                    <h1 className="tas-heading-l font-semibold">
                        <div className="tas-caption-l">สวัสดี</div>
                        {userData.firstName}&#32;{userData.lastName}
                    </h1>
                </section>
                {isNewUser && <NewUserWelcome />}
                <section className="mt-8 font-heading flex gap-4">
                    {/* <div>
                        สมาชิกระดับ: <strong>ดาวฤกษ์</strong>
                    </div> */}
                    <Card title="แต้ม" content={points} />
                    <Card
                        title="สมาชิกตั้งแต่"
                        content={new Intl.DateTimeFormat('th-th', {
                            day: 'numeric',
                            month: 'narrow',
                            year: '2-digit',
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
