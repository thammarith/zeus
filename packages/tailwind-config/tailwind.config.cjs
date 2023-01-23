const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
    // content: ['./**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', '../**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

    content: {
        files: [
            './**/*.{json,md}'
            // './**/*.{js,ts,jsx,tsx}',
            // '../**/*.{js,ts,jsx,tsx}',
            // './packages/ui/**/*.{js,ts,jsx,tsx}',
            // 'apps/**/*.{js,ts,jsx,tsx,astro}',
            // './*.{js,ts,jsx,tsx}',
            // 'src/**/*.{js,ts,jsx,tsx}',
            // '*/**/components/**/*.{js,ts,jsx,tsx}',
        ],
        extract: (content) => {
            console.log(content)
            return [content]
        }
    },
    theme: {
        fontFamily: {
            display: [
                'Anuphan',
                '"IBM Plex Sans Thai"',
                '"Noto Sans Thai UI"',
                '"Noto Sans Thai"',
                '"Noto Sans"',
                'Helvetica',
                'Arial',
                'sans-serif',
            ],
        },
        extend: {
            colors: {
                grey: {
                    100: '#e5e5e6',
                    200: '#cccccc',
                    300: '#b2b2b3',
                    400: '#999999',
                    500: '#7f7f80',
                    600: '#666666',
                    700: '#4c4c4d',
                    800: '#333333',
                    900: '#19191a',
                },
                slate: {
                    100: '#cfd3e6',
                    200: '#a3abcc',
                    300: '#7d87b3',
                    400: '#5c6899',
                    500: '#404c80',
                    600: '#293566',
                    700: '#17214d',
                    800: '#0a1233',
                    900: '#03071a',
                },
                blue: {
                    100: '#c6d4f8',
                    200: '#91aaf2',
                    300: '#5675d8',
                    400: '#2c49b2',
                    500: '#001980',
                    600: '#00136e',
                    700: '#000e5c',
                    800: '#00094a',
                    900: '#00073d',
                },
                tas: {
                    100: '#0032ff',
                    200: '#002ce3',
                    300: '#0027c6',
                    400: '#0021aa',
                    500: '#001c8e',
                    ci: '#001980',
                    600: '#001671',
                    700: '#001155',
                    800: '#000b39',
                    900: '#00061c',
                },
                // yellow: {
                // 	100: '#ffec70',
                // 	300: '#f4dc43',
                // 	500: '#e8cc11',
                // 	700: '#b69f07',
                // 	900: '#8f7c00',
                // },
                // red: {
                // 	100: '#ea442e',
                // 	300: '#e93c25',
                // 	500: '#cc331e',
                // 	700: '#a22616',
                // 	900: '#7b1d0e',
                // },
            },
        },
    },
    plugins: [],
};
