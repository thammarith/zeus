import { Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import { cx } from 'tools';
import { GenericLayout, TextField } from 'ui';

import './Register.scss';

interface Values {
    firstName: string;
    lastName: string;
    contact: string;
}

const Register: React.FC = () => {
    const validateRequired = (field: string) => (value: string) => !value && `โปรดกรอก${field}`;

    const validateFirstName = validateRequired('ชื่อจริง');
    const validateLastName = validateRequired('นามสกุล');

    const validateContact = (value: string) => {
        const isContactEntered = !!value;
        const isValidEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
        const isValidPhone = /^0(6|8|9)\d{8}$/.test(value);

        if (!isContactEntered) return validateRequired('อีเมลหรือเบอร์โทร')(value);
        if (/^\d+$/.test(value) && !isValidPhone) return 'เบอร์โทรไม่ถูกต้อง';
        if (!isValidPhone && !isValidEmail) return 'อีเมลไม่ถูกต้อง';
    };

    const validatePassword = (value: string) => {
        if (!value) return validateRequired('รหัสผ่าน')(value);
        if (value.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    };

    const hasErrors = (errors: Object) => Object.keys(errors).length > 0;

    return (
        <GenericLayout id="Register">
            <section className="font-display flex flex-col justify-center">
                <h1 className="text-4xl font-semibold">
                    สมัครสมาชิก
                    <br />
                    สมาคมดาราศาสตร์ไทย
                </h1>

                <Formik
                    initialValues={{
                        firstName: '',
                        lastName: '',
                        contact: '',
                    }}
                    onSubmit={(values: Values, { setSubmitting }: FormikHelpers<Values>) => {
                        console.log('clicked');
                        setTimeout(() => {
                            alert(JSON.stringify(values, null, 2));
                            setSubmitting(false);
                        }, 2000);
                    }}
                >
                    {({ errors, touched, isSubmitting }) => (
                        <Form>
                            <TextField
                                label="ชื่อจริง"
                                name="firstName"
                                isError={!!(touched.firstName && errors.firstName)}
                                placeholder="เอกภพ"
                                validate={validateFirstName}
                                // hintComponent={<>หากคุณต้องการใส่คำนำหน้าชื่อด้วย <span onClick={() => alert(555)}>คลิกที่นี่</span></>}
                            />

                            <TextField
                                label="นามสกุล"
                                name="lastName"
                                isError={!!(touched.lastName && errors.lastName)}
                                placeholder="ดารกวงศ์"
                                validate={validateLastName}
                            />
                            {/* 
                            <TextField
                                label="อีเมลหรือหมายเลขโทรศัพท์"
                                name="contact"
                                isError={!!(touched.contact && errors.contact)}
                                placeholder="ekkapob@astermail.com หรือ 0800000000"
                                validate={validateContact}
                            /> */}

                            <TextField
                                label="รหัสผ่าน"
                                name="contact"
                                hintComponent={<>อย่างน้อย 8 ตัวอักษร</>}
                                type="password"
                                isError={!!(touched.contact && errors.contact)}
                                placeholder="รหัสผ่าน"
                                validate={validatePassword}
                            />

                            <button
                                className={cx(
                                    'bg-tas-500 hover:bg-tas-600 border-b-tas-700 border-b-4 px-4 py-2 text-white',
                                    'disabled:bg-grey-700 disabled:border-b-tas-900',
                                    isSubmitting && 'disabled:cursor-wait',
                                    hasErrors(errors) && 'disabled:cursor-not-allowed'
                                )}
                                type="submit"
                                disabled={isSubmitting || hasErrors(errors)}
                            >
                                {isSubmitting ? 'กำลังส่งข้อมูลไปยังยานแม่…' : 'สมัครสมาชิก'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </section>
        </GenericLayout>
    );
};

export default Register;
