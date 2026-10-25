import { Card } from '@shared/components/ui';
import React from 'react';

/**
 * Shown while the list is empty: what to do on Bandcamp to start a batch.
 *
 * @returns JSX element of the empty state.
 */
export const EmptyState = () => {
	const steps = [
		'Open your collection or purchases on Bandcamp',
		'Tick the releases you want',
		'Press Download. They will appear here',
	];

	return (
		<Card className="flex flex-col items-center gap-4 px-5 pb-11 pt-12 text-center">
			<svg viewBox="0 0 160 96" className="w-[190px]" aria-hidden="true">
				<rect
					x="14"
					y="22"
					width="52"
					height="52"
					rx="12"
					fill="#c4e8f1"
					transform="rotate(-8 40 48)"
				/>
				<rect
					x="54"
					y="14"
					width="52"
					height="52"
					rx="12"
					fill="#92d4e5"
					transform="rotate(5 80 40)"
				/>
				<rect
					x="92"
					y="26"
					width="52"
					height="52"
					rx="12"
					fill="#1da0c3"
					transform="rotate(-3 118 52)"
				/>
				<path
					d="M118 40v22m-9-9 9 9 9-9"
					stroke="#fff"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</svg>
			<h1 className="m-0 text-xl font-bold tracking-[-0.01em]">
				Nothing to download yet
			</h1>
			<ol className="m-0 flex list-none flex-col gap-2.5 p-0 text-left text-ink-700">
				{steps.map((text, index) => (
					<li key={text} className="flex items-center gap-2.5">
						<span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-aqua-100 text-xs font-bold text-aqua-800">
							{index + 1}
						</span>
						{text}
					</li>
				))}
			</ol>
			<a
				href="https://bandcamp.com/"
				target="_blank"
				rel="noreferrer"
				className="inline-flex h-8 items-center rounded-ctl border border-aqua-700 bg-aqua-700 px-3 text-[13px] font-semibold text-white no-underline hover:border-aqua-800 hover:bg-aqua-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2"
			>
				Open Bandcamp
			</a>
		</Card>
	);
};
