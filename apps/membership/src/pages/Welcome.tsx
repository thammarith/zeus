import React from 'react';

import Logo from '../assets/images/tas-logo.png';

const Welcome = () => {
    return (
        <section className="">
            {/* <img src={Logo} className="w-12" /> */}
            <h1 className="mt-8 tas-heading-l font-semibold">
                <div className="tas-caption-l">ยินดีต้อนรับ</div>
                คุณใกล้จะเป็นสมาชิกแล้ว
            </h1>

            <p className="mt-4 tas-body-m font-heading">
                เพื่อให้ท่านได้รับการบริการที่ครบถ้วน และเพิ่มความปลอดภัย สมาคมดาราศาสตร์ไทยอยากรู้จักท่านให้มากขึ้น
            </p>
            <button className="bg-white px-3 py-2 mt-8 tas-body text-black font-heading font-medium">
                กรอกข้อมูลส่วนตัว
            </button>
            <p className="mt-16 text-sm text-white text-opacity-50 font-heading">
                สมาคมดาราศาสตร์ไทยจะใช้ข้อมูลนี้เป็นการภายใน
                และไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอกหากไม่ได้รับความยินยอมของท่านโดยเด็ดขาด
            </p>
            <p className="mt-4 text-sm text-white text-opacity-50 font-heading">
                สำหรับรายละเอียดวัตถุประสงค์และการใช้ข้อมูลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                ท่านสามารถศึกษาได้จากหน้านโยบายความเป็นส่วนตัว
            </p>
        </section>
    );
};

export default Welcome;
