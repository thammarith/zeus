import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const Account: React.FC = () => {
    const [qrUri, setQrUri] = useState('');
    const [userId, setUserId] = useState('dQw4w9WgXcQ');

    useEffect(() => {
        QRCode.toDataURL(
            userId,
            {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                margin: 0,
                // color: {
                // dark: '#001980',
                // light: '#FFBF60FF',
                // },
                width: 2048,
            },
            (err, url) => {
                if (err) throw err;
                setQrUri(url);
            }
        );
    }, [userId]);

    return (
        <main id="Account" className="p-4 pt-16">
            <section className="font-display flex flex-col justify-center">
                <h1 className="text-4xl font-semibold">
                    {/* <div className='font-normal text-grey-500 text-2xl'>ยินดีต้อนรับ</div> */}
                    <div className="text-grey-500 text-2xl font-normal">สมาชิกสามัญ</div>
                    เอกภพ ดารกวงศ์
                </h1>

                <div className="mt-16 flex justify-center">{qrUri && <img className="w-64" src={qrUri} />}</div>

                <div>
                    <h2 className="mt-16 text-2xl font-semibold">ข้อมูลของฉัน</h2>

                    <div className="mt-4">
                        <div className="text-gray-500">ชื่อ นามสกุล</div>
                        <div className="font-medium">เอกภพ ดารกวงศ์</div>
                    </div>

                    <div className="mt-4">
                        <div className="text-gray-500">หมายเลขโทรศัพท์</div>
                        <div className="font-medium">080 000 0000</div>
                    </div>

                    <div className="mt-4">
                        <div className="text-gray-500">รหัสผู้ใช้</div>
                        <div className="font-medium">
                            {userId}
                            &nbsp;
                            <span className="font-normal">(286 190 151)</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Account;
