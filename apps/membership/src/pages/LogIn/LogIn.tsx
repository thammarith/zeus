import React from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { cx } from 'tools';
import { GenericLayout, TextField } from 'ui';

import './LogIn.scss';

interface Values {
    logIn: string;
    password: string;
}

const LogIn: React.FC = () => {
    const validateRequired = (field: string) => (value: string) => !value && `โปรดกรอก${field}`;

    const validateLogIn = (value: string) => {
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
        <GenericLayout id="LogIn">
            <section className="font-display flex flex-col justify-center">
                <h1 className="text-4xl font-semibold">
                    เข้าสู่ระบบสมาชิก
                    <br />
                    สมาคมดาราศาสตร์ไทย
                </h1>

                <Formik
                    initialValues={{
                        logIn: '',
                        password: '',
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
                                label="อีเมลหรือหมายเลขโทรศัพท์"
                                name="logIn"
                                isError={!!(touched.logIn && errors.logIn)}
                                placeholder="ekkapob@astermail.com หรือ 0800000000"
                                validate={validateLogIn}
                            />

                            <TextField
                                label="รหัสผ่าน"
                                name="password"
                                hintComponent={<>อย่างน้อย 8 ตัวอักษร</>}
                                type="password"
                                isError={!!(touched.password && errors.password)}
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
                                {isSubmitting ? 'กำลังส่งข้อมูลไปยังยานแม่…' : 'เข้าสู่ระบบ'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </section>
        </GenericLayout>
    );
};

export default LogIn;
