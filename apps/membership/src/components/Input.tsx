import React from "react";
import cx from "classnames";

type Props = {
    labelProps?: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

    label: string;
    hint?: string;

    classNames?: string;
    labelClasses?: string;
    hintClasses?: string;
    inputClasses?: string;
};

// TODO: Handle error cases

const Input: React.FC<Props> = (props: Props) => {
    return (
        <label {...props.labelProps} className={cx("block", props.classNames)}>
            <span className={cx("tas-body", props.labelClasses)}>{props.label}</span>
            {props.hint && (
                <div className={cx("mt-3 tas-body text-tas-secondary", props.hintClasses)}>{props.hint}</div>
            )}
            <input {...props.inputProps} className={cx("h-10 mt-3 border-2 p-2 tas-body", props.inputClasses)} />
        </label>
    );
};

export default Input;
