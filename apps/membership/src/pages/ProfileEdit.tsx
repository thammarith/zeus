import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { useNavigate } from "react-router-dom";

import { UserContext, UserDataContext } from "../App";

import UserData, { MemberData } from "../types/UserData";

import Loading from "../components/Loading";
import Input from "../components/Input";
import { getUserData, upsertUser } from "../helpers/userData";
import { PROFILE_PATH } from "../routes";

const ProfileEdit = () => {
    const { user } = useContext(UserContext);
    const { userData, setUserData } = useContext(UserDataContext);

    const [formData, setFormData] = useState<MemberData>();

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
            <div className="w-screen h-screen flex items-center justify-center">
                <Loading />
            </div>
        );

    if (!user || userData === null) return <h1>NO DATA!</h1>;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        const newState = { ...formData, [name]: value } as Pick<MemberData, keyof MemberData>;
        setFormData(newState);
    };

    const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const newMemberData = {
            // firstName: 'เอกภพ',
            // lastName: 'ดาราวงศ์',
            ...formData,
            lastModifiedAt: new Date(),
        } as UserData;

        upsertUser(user, newMemberData, async () => {
            await getUserData(user, setUserData);
            navigate(PROFILE_PATH, { replace: true });
        });
    };

    return (
        <main className="h-screen w-screen bg-tas-800 text-white">
            <div className="w-full max-w-lg mx-auto py-16 px-8">
                <section className="">
                    <h1 className="tas-heading-l font-semibold">แก้ไขข้อมูล</h1>

                    <form onSubmit={onFormSubmit}>
                        <fieldset className="mt-8">
                            <legend className="tas-heading-m font-semibold">ข้อมูลส่วนตัว</legend>

                            <Input
                                classNames="mt-6 w-full"
                                label="ชื่อ"
                                labelClasses="font-heading"
                                inputClasses="border-white w-full text-black"
                                inputProps={{
                                    type: "text",
                                    name: "firstName",
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
                                    type: "text",
                                    name: "lastName",
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
                                    type: "email",
                                    name: "email",
                                    defaultValue: formData?.email,
                                    onChange: handleInputChange,
                                }}
                            />
                        </fieldset>

                        <button
                            className={cx("bg-tas-100 px-3 py-2 mt-6", "tas-body text-white font-heading font-medium")}
                            type="submit"
                        >
                            บันทึกข้อมูล
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
};

export default ProfileEdit;
