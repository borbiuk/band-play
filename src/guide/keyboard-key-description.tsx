import React from 'react';
import { KeyboardKey } from './keyboard-key';

export const KeyboardKeyDescription = ({ fileName, title, description }) => {
	return (
		<div className="flex flex-row items-center gap-x-4 max-w-100">
			<KeyboardKey fileName={fileName}/>
			<div className="flex flex-col">
				<span className="text-sm font-medium text-gray-800">
					{title}
				</span>
				<span className="text-xs font-normal text-gray-600">
					{description}
				</span>
			</div>
		</div>
	);
}
