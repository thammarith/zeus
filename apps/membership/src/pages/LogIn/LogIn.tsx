import React from 'react';
import { cx } from 'tools';

import './LogIn.scss';

const LogIn: React.FC = () => (
    <main id="LogIn" className="py-8">
        <section className="flex flex-col items-center justify-center">
            <h1 className="font-display text-xl">Log In</h1>

            <label>
                Email or telephone number
                <input placeholder="your@email.com or 0801234567" />
            </label>
        </section>
    </main>
);

export default LogIn;
