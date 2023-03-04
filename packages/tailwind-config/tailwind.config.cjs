const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                brandblue: '#001980',
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
                }
            },
            fontFamily: {
                heading: ['Anuphan', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [],
};
