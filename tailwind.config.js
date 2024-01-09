/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				themeGrey: '#556270',
				themeBlue: '#4ecdc4',
				themeGreen: '#c7f464',
				themeRed: '#ff6b6b',
				themeDarkRed: '#c44d58',
				themeBlueContrast: '#6B78FF',
			},
			flexGrow: {
				2: '2',
			},
		},
	},
	plugins: [],
};
