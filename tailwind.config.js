/* Generated by https://github.com/borbiuk/generate-palette */
const band = {
	'100': '#e3edf3',
	'200': '#c6dde8',
	'300': '#a5cadd',
	'400': '#7ab6d0',
	'500': '#35a0c3',
	'600': '#3091b1',
	'700': '#2b809d',
	'800': '#246d85',
	'900': '#1d5669',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				band: band
			},
			scale: {
				'115': '1.15'
			}
		},
	},
	plugins: [],
};
