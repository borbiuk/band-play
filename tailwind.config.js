/** Redesign tokens: they match design/tokens.css (see design/style-guide). */
const aqua = {
	50: '#f1fafc',
	100: '#e3f5f9',
	200: '#c4e8f1',
	300: '#92d4e5',
	400: '#52bad6',
	500: '#1da0c3',
	600: '#168aa9',
	700: '#0f6f8a',
	800: '#0b566c',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				aqua: aqua,
				coral: {
					100: '#ffe9e2',
					500: '#ff7a59',
					600: '#e85f3e',
				},
				pink: {
					100: '#fde8f0',
					500: '#e8508a',
					700: '#be2f6a',
				},
				ink: {
					900: '#12262e',
					700: '#2f4650',
					500: '#5b7078',
					400: '#8197a0',
				},
				line: {
					DEFAULT: '#dceaef',
					strong: '#c9dce3',
				},
				danger: {
					DEFAULT: '#c2410c',
					bg: '#ffe9e2',
				},
				warn: {
					DEFAULT: '#9a3f14',
					bg: '#fff0e8',
				},
				success: {
					DEFAULT: '#1a7a44',
					bg: '#e6f6ec',
				},
			},
			borderRadius: {
				ctl: '10px',
				menu: '12px',
				card: '16px',
				dialog: '18px',
			},
			boxShadow: {
				card: '0 1px 2px rgba(18, 38, 46, 0.06), 0 1px 1px rgba(18, 38, 46, 0.04)',
				pop: '0 10px 28px -8px rgba(18, 38, 46, 0.18), 0 2px 6px rgba(18, 38, 46, 0.06)',
			},
			fontFamily: {
				ui: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
			},
			scale: {
				101: '1.01',
				102: '1.02',
				103: '1.03',
				104: '1.04',
				115: '1.15',
			},
			margin: {
				7.5: '30px',
			},
			spacing: {
				46: '11.5rem',
			},
		},
	},
	plugins: [],
};
