import React, { useContext, useEffect, useState } from 'react';
import cx from 'classnames';
import { useNavigate } from 'react-router-dom';

import { UserContext, UserDataContext } from '../App';

import UserData, { MemberData } from '../types/UserData';

import Loading from '../components/Loading';
import Input from '../components/Input';
import { getUserData, upsertUser } from '../helpers/userData';
import { PROFILE_PATH } from '../routes';
import { getSessionItem } from '../helpers/sessionStorage';
import { IS_NEW_USER } from '../constants/sessionStorage';

const ProfileEdit = () => {
    const { user } = useContext(UserContext);
    const { userData, setUserData } = useContext(UserDataContext);

    const [formData, setFormData] = useState<MemberData>();

    const isNewUser = getSessionItem(IS_NEW_USER) === 'true';

    const navigate = useNavigate();

    useEffect(() => {
        if (!userData) return;

        setFormData({
            firstName: userData.firstName ?? '',
            lastName: userData.lastName ?? '',
            email: userData.email ?? '',
            membershipId: userData.membershipId ?? '',
        });
    }, [userData]);

    if (userData === undefined)
        return (
            <div className="w-screen min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );

    if (!user || userData === null) return <h1>NO DATA!</h1>;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const newState = { ...formData, [name]: value } as Pick<MemberData, keyof MemberData>;
        setFormData(newState);
    };

    const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const newMemberData = { ...formData } as UserData;

        upsertUser(user, newMemberData, async () => {
            await getUserData(user, setUserData);
            navigate(PROFILE_PATH, { replace: true });
        });
    };

    return (
        <main className="min-h-screen w-screen bg-tas-800 text-white">
            <div className="w-full max-w-lg mx-auto py-16 px-8">
                <section className="">
                    <h1 className="tas-heading-l font-semibold">
                        <div className="tas-caption-l">แก้ไข</div>
                        ข้อมูลส่วนตัว
                    </h1>

                    {isNewUser && (
                        <div className={cx("mt-8 bg-blue-50 text-black rounded-md p-4 min-w-[6rem] font-heading")}>
                            <h3 className="tas-body-large font-semibold">
                                คุณใกล้จะเป็นสมาชิกแล้ว!
                            </h3>
                            <div className="tas-body-small mt-2">
                                อีกขั้นตอนเดียวเท่านั้น! เพื่อให้ท่านได้รับการบริการที่ครบถ้วนและเพิ่มความปลอดภัย กรุณากรอกข้อมูลส่วนตัวของท่าน
                            </div>
                        </div>
                    )}

                    <form onSubmit={onFormSubmit}>
                        <fieldset className="mt-8">
                            {/* <legend className="tas-heading-m font-semibold">ข้อมูลส่วนตัว</legend> */}
                            <Input
                                classNames="w-full"
                                label="ชื่อ"
                                labelClasses="font-heading"
                                inputClasses="border-white w-full text-black"
                                inputProps={{
                                    type: 'text',
                                    name: 'firstName',
                                    defaultValue: formData?.firstName,
                                    required: true,
                                    onChange: handleInputChange,
                                }}
                            />

                            <Input
                                classNames="mt-6 w-full"
                                label="นามสกุล"
                                labelClasses="font-heading"
                                inputClasses="border-white w-full text-black"
                                inputProps={{
                                    type: 'text',
                                    name: 'lastName',
                                    defaultValue: formData?.lastName,
                                    required: true,
                                    onChange: handleInputChange,
                                }}
                            />
                            <Input
                                classNames="mt-6 w-full"
                                label="อีเมล (ไม่บังคับ)"
                                labelClasses="font-heading"
                                inputClasses="border-white w-full text-black"
                                inputProps={{
                                    type: 'email',
                                    name: 'email',
                                    defaultValue: formData?.email,
                                    onChange: handleInputChange,
                                }}
                            />
                        </fieldset>

                        <button
                            className={cx('bg-tas-100 px-3 py-2 mt-6', 'tas-body text-white font-heading font-medium')}
                            type="submit"
                        >
                            บันทึกข้อมูล
                        </button>
                    </form>
                </section>
                <section className="mt-16 text-sm text-white text-opacity-50 font-heading">
                    <p className="">
                        สมาคมดาราศาสตร์ไทยจะใช้ข้อมูลนี้เป็นการภายใน
                        และไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอกหากไม่ได้รับความยินยอมของท่านโดยเด็ดขาด
                    </p>
                    <p className="mt-4">
                        สำหรับรายละเอียดวัตถุประสงค์และการใช้ข้อมูลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                        ท่านสามารถศึกษาได้จากหน้านโยบายความเป็นส่วนตัว
                    </p>
                </section>
            </div>
        </main>
    );
};

export default ProfileEdit;
