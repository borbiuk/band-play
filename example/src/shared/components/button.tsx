import React from 'react';

type ButtonProps = {
	label: string;
	onClick: () => void;
	disabled?: boolean;
};

const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
	return (
		<button
			className="ext-inline-flex ext-items-center ext-justify-center ext-rounded-md ext-bg-slate-900 ext-px-3 ext-py-2 ext-text-sm ext-font-semibold ext-text-white hover:ext-bg-slate-800 disabled:ext-cursor-not-allowed disabled:ext-opacity-60"
			disabled={disabled}
			onClick={onClick}
			type="button"
		>
			{label}
		</button>
	);
};

export default Button;
