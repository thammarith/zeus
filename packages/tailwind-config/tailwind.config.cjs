/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				brandblue: colors.blue[500],
				brandred: colors.red[500],
			},
		},
	},
	plugins: [],
}
