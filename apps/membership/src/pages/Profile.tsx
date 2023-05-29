/* eslint-disable @next/next/no-img-element */
import React, { useContext, useEffect, useReducer, useState } from 'react';
import cx from 'classnames';
import QrCode from 'qrcode';
import ReactCardFlip from 'react-card-flip';
import { Navigate } from 'react-router-dom';

import { ERROR_PATH } from '../routes';
import { Logger } from '../utils/logger';
import { getSessionItem, removeSessionItem } from '../helpers/sessionStorage';
import { IS_NEW_USER } from '../constants/sessionStorage';
import { useAuth } from '../contexts/AuthContext';

import Logo from '../assets/images/tas-logo.png';

const Profile = () => {
    const auth = useAuth();

    const [qrCode, setQrCode] = useState<string | undefined>(undefined);
    const [isCardFlipped, setIsCardFlipped] = useState<boolean>();

    const [, forceUpdate] = useReducer((_) => _ + 1, 0);

    const isNewUser = getSessionItem(IS_NEW_USER) === 'true';
    const ß = Logger.build('Profile');

    useEffect(() => {
        if (!auth?.user?.uid) return;

        QrCode.toDataURL(auth?.user?.uid, {
            errorCorrectionLevel: 'H',
            margin: 0,
            width: 144,
            color: {
                dark: '#001980',
                light: '#0000',
            },
        })
            .then(setQrCode)
            .catch((err) => {
                Logger.error(ß('cannot generate QR code'), err);
            });
    }, [auth?.user?.uid, ß]);

    if (!auth?.isLoggedIn) return <Navigate to={ERROR_PATH} />;

    const memberData = auth.memberData;
    const points = auth?.memberData?.points?.reduce((p, c) => p + c.points, 0) ?? 0;

    const MyQrCode = () => <img src={qrCode} alt={memberData?.userId} title={memberData?.userId} />;

    const Card = ({ title, content, className }: { title: string; content: number | string; className?: string }) => (
        <div className={cx('shadow-md rounded-md p-4 min-w-[6rem]', className)}>
            <h3 className="tas-body-small">{title}</h3>
            <div className="tas-body-large font-semibold">{content}</div>
        </div>
    );

    const closeWelcomeBanner = () => {
        removeSessionItem(IS_NEW_USER);
        forceUpdate();
    };

    const NewUserWelcomeBanner = () => (
        <div className={cx('relative mt-6 bg-tas-500 text-white rounded-md p-4 min-w-[6rem] font-heading')}>
            <div onClick={closeWelcomeBanner} className="absolute top-4 right-4 text-gray-100 hover:cursor-pointer">
                ✕
            </div>
            <h3 className="tas-body-large font-semibold">ยินดีต้อนรับ</h3>
            <div className="tas-body-small mt-2">
                คุณได้เป็นสมาชิกเรียบร้อยแล้ว คุณสามารถดูแต้ม และบัตรสมาชิกได้ที่หน้านี้
            </div>
            <div className="tas-body-small mt-2">
                แสดงหน้านี้เพื่อสะสมแต้มจากการเข้าร่วมกิจกรรม การซื้อสินค้าต่าง ๆ จากสมาคมดาราศาสตร์ไทย
            </div>
        </div>
    );

    const getMemberCardTier = (points: number = 0) => {
        if (points >= 100) return 'black';
        if (points >= 50) return 'blue';
        if (points >= 20) return 'red';
        return 'white';
    }


    const flipCardSize = 'aspect-[1.616/1] w-full flex items-center justify-center shadow-md';
    const FlipCard = (
        <div className={cx('aspect-[1.616/1] mt-6')} onClick={() => setIsCardFlipped((p) => !p)}>
            <ReactCardFlip isFlipped={isCardFlipped}>
                <div
                    className={cx(
                        flipCardSize,
                        'bg-tas-ci bg-gradient-to-bl from-tas-300 to-tas-900',
                        'rounded-md flex-col'
                    )}
                >
                    {isCardFlipped === undefined && (
                        <div
                            className={cx(
                                'absolute top-4 right-4',
                                'w-4 h-4 rounded-full bg-neutral-100 bg-opacity-80',
                                'animate-ping'
                            )}
                        />
                    )}
                    <img src={Logo} className="h-16" />
                    <h3 className="mt-4 font-heading font-medium text-md text-white">สมาชิกสมาคมดาราศาสตร์ไทย</h3>
                </div>
                <div className={cx(flipCardSize, 'bg-neutral-100 rounded-md border-2 border-tas-500')}>
                    <MyQrCode />
                </div>
            </ReactCardFlip>
        </div>
    );

    return (
        <>
            <section className="">
                <h1 className="tas-heading-l font-semibold">
                    <div className="tas-caption-l">สวัสดี</div>
                    {memberData?.firstName}&#32;{memberData?.lastName}
                </h1>
            </section>
            {isNewUser && <NewUserWelcomeBanner />}
            <section className="mt-6 font-heading flex gap-4">
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
                    }).format(new Date(auth?.user?.metadata.creationTime!))}
                />
            </section>
            <section className="mt-8">
                <h2 className="tas-heading-m font-semibold">บัตรสมาชิกของฉัน</h2>
                {/* TODO: Make a nice card front and tap to show the QR Code */}
                {/* <div className="mt-4 p-8 bg-tas-500 text-black rounded-md flex justify-center">
                    <MyQrCode />
                </div> */}
                {FlipCard}
            </section>
        </>
    );
};

export default Profile;
