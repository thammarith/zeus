import React, { useEffect, useState } from 'react';
import cx from 'classnames';

import { useAuth } from '../contexts/AuthContext';
import { MemberData, ProfileData } from '../types/UserData';
import { upsertUser } from '../helpers/userData';
import Input from '../components/Input';
import { getSessionItem, removeSessionItem } from '../helpers/sessionStorage';
import { IS_NEW_USER } from '../constants/sessionStorage';
import { Navigate, useNavigate } from 'react-router-dom';
import { PROFILE_PATH } from '../routes';

const ProfileEdit = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<ProfileData>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isNewUser = getSessionItem(IS_NEW_USER) === 'true';

    useEffect(() => {
        if (!auth?.user || !auth?.memberData) return;

        const { firstName = '', lastName = '', email = '', membershipId = '' } = auth.memberData;
        setFormData({ firstName, lastName, email, membershipId });
    }, [auth]);

    if (!auth?.user || !auth?.memberData) return <h1>NO DATA!</h1>;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        setFormData({ ...formData, [name]: value });
    };

    const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const user = auth?.user;

        if (!user) return;

        event.preventDefault();
        setIsSubmitting(true);

        const newMemberData = { ...formData } as MemberData;

        upsertUser(user, newMemberData)
            .then(() => auth?.updateMemberData(user))
            .then(() => removeSessionItem(IS_NEW_USER))
            .then(() => navigate(PROFILE_PATH));
    };

    const NewUserBanner = () => (
        <div className={cx('mt-8 bg-blue-700 text-white rounded-md p-4 min-w-[6rem] font-heading')}>
            <h3 className="tas-body-large font-semibold">เหลือแค่ขั้นตอนเดียวเท่านั้น!</h3>
            <div className="tas-body-small mt-2">
                เพื่อให้ท่านได้รับการบริการที่ครบถ้วนและเพิ่มความปลอดภัย กรุณากรอกข้อมูลส่วนตัวของท่าน
            </div>
        </div>
    );

    const PrivacyDisclaimer = () => (
        <section className="mt-8 text-sm text-neutral-500 text-opacity-50 font-heading">
            <p className="">
                สมาคมดาราศาสตร์ไทยจะใช้ข้อมูลนี้เป็นการภายใน
                และไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอกหากไม่ได้รับความยินยอมของท่านโดยเด็ดขาด
            </p>
            <p className="mt-4">
                สำหรับรายละเอียดวัตถุประสงค์ และการใช้ข้อมูลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                ท่านสามารถศึกษาได้จากหน้านโยบายความเป็นส่วนตัว
            </p>
        </section>
    );

    return (
        <>
            <section className="">
                <h1 className="tas-heading-l font-semibold">
                    <div className="tas-caption-l">แก้ไข</div>
                    ข้อมูลส่วนตัว
                </h1>

                {isNewUser && <NewUserBanner />}

                <form onSubmit={onFormSubmit}>
                    <fieldset className="mt-8">
                        {/* <legend className="tas-heading-m font-semibold">ข้อมูลส่วนตัว</legend> */}
                        <Input
                            classNames="w-full"
                            label="ชื่อ"
                            labelClasses="font-heading"
                            inputClasses="border-neutral-700 w-full text-black"
                            inputProps={{
                                type: 'text',
                                name: 'firstName',
                                defaultValue: formData?.firstName,
                                placeholder: 'เอกภพ',
                                required: true,
                                onChange: handleInputChange,
                            }}
                        />

                        <Input
                            classNames="mt-6 w-full"
                            label="นามสกุล"
                            labelClasses="font-heading"
                            inputClasses="border-neutral-500 w-full text-black"
                            inputProps={{
                                type: 'text',
                                name: 'lastName',
                                defaultValue: formData?.lastName,
                                placeholder: 'ดาราวงศ์',
                                required: true,
                                onChange: handleInputChange,
                            }}
                        />
                        <Input
                            classNames="mt-6 w-full"
                            label="อีเมล (ไม่บังคับ)"
                            labelClasses="font-heading"
                            inputClasses="border-neutral-500 w-full text-black"
                            inputProps={{
                                type: 'email',
                                name: 'email',
                                placeholder: 'ekkaphop.dara@astro.mail',
                                defaultValue: formData?.email,
                                onChange: handleInputChange,
                            }}
                        />
                    </fieldset>

                    <div className="mt-6 flex gap-2 font-heading tas-body">
                        <button
                            className={cx(
                                isSubmitting ? 'bg-blue-300' : 'bg-tas-100 hover:bg-tas-300',
                                'px-3 py-2',
                                'text-white font-medium'
                            )}
                            type={isSubmitting ? 'button' : 'submit'}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'กำลังบันทึก' : 'บันทึกข้อมูล'}
                        </button>
                        {!isSubmitting && (
                            <button
                                className={cx('px-3 py-2', 'hover:bg-red-200', 'text-red-500 hover:text-red-700')}
                                onClick={() => navigate(PROFILE_PATH)}
                            >
                                ยกเลิก
                            </button>
                        )}
                    </div>
                </form>
            </section>
            <PrivacyDisclaimer />
        </>
    );
};

export default ProfileEdit;
