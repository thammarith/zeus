import React from 'react';

import { ComponentWithChildren, cx } from 'tools';

interface GenericLayoutProps extends ComponentWithChildren {
    id: string;
    className?: string;
}

export const GenericLayout: React.FC<GenericLayoutProps> = (props: GenericLayoutProps) => (
    <main id={props.id} className={cx('px-4 pt-24', props.className)}>{props.children}</main>
);
