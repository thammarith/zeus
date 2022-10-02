import React, { HTMLInputTypeAttribute } from 'react';
import { ErrorMessage, Field } from 'formik';
import { ComponentWithChildren } from 'tools/index';

import { cx } from 'tools';

interface TextFieldProps {
    className?: string;
    label: string;
    name: string;
    placeholder?: string;
    isError?: boolean;
    props?: Object;
    type?: HTMLInputTypeAttribute;
    validate?: (value: string) => string | boolean | undefined;
    hintComponent?: React.ReactNode;
}

export const TextField: React.FC<TextFieldProps> = (props: TextFieldProps) => {
    const className = cx(
        'TextField__input',
        'w-full p-2',
        'border-2 outline outline-2 outline-transparent',
        'focus:border-2 focus:border-tas-500 focus:outline focus:outline-2 focus:outline-tas-500',
        props.isError ? 'border-red-500' : 'border-grey-500',
        props.className
    );

    const ErrorText = (props: any) => (
        <div className={cx('TextField__ErrorText', 'mt-2 font-medium text-red-600')}>{props.children}</div>
    );
    const Hint = (props: ComponentWithChildren) => (
        <div className={cx('TextField__Hint', 'mt-2 text-grey-500')}>{props.children}</div>
    );

    return (
        <>
            <label className="TextField__label">
                {props.label}
                {props.hintComponent && <Hint>{props.hintComponent}</Hint>}
                <Field
                    {...props.props}
                    type={props.type}
                    className={className}
                    name={props.name}
                    placeholder={props.placeholder}
                    validate={props.validate}
                />
            </label>
            <ErrorMessage name={props.name} component={ErrorText} />
        </>
    );
};
