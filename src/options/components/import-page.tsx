import { Button, Card, Note } from '@shared/components/ui';
import { Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { importSettingsFile } from '../utils/settings-file.utils';

/**
 * Import page for browsers whose popup closes when a file dialog opens (Firefox): the popup opens
 * `options.html#import` in a tab, where the file dialog works.
 *
 * @returns JSX element of the import page.
 */
export const ImportPage = () => {
	const fileInput = useRef<HTMLInputElement>(null);
	const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
		null
	);

	// The popup styles fix the width and hide the scrollbars; a tab needs neither
	useEffect(() => {
		document.documentElement.classList.add('bp-tab');
		return () => document.documentElement.classList.remove('bp-tab');
	}, []);

	return (
		<main className="mx-auto mt-16 flex max-w-[420px] flex-col gap-4 px-4 font-ui text-[13px] text-ink-900">
			<h1 className="m-0 text-2xl font-bold tracking-[-0.02em]">
				Import settings
			</h1>
			<Card className="flex flex-col gap-3 p-[18px]">
				<p className="m-0 text-ink-500">
					Choose a settings file exported from Band Play. It replaces
					your current settings and shortcuts. Visited history and
					downloads stay.
				</p>
				<input
					ref={fileInput}
					type="file"
					accept="application/json,.json"
					aria-label="Settings file"
					className="sr-only"
					onChange={(event) => {
						const file = event.target.files?.[0];
						if (!file) {
							return;
						}

						importSettingsFile(file)
							.then(() =>
								setResult({
									ok: true,
									text: 'Settings imported.',
								})
							)
							.catch((error: unknown) =>
								setResult({
									ok: false,
									text:
										error instanceof Error
											? error.message
											: 'Something went wrong. Try again.',
								})
							);
						event.target.value = '';
					}}
				/>
				<Button
					variant="primary"
					className="self-start"
					onClick={() => fileInput.current?.click()}
				>
					<Upload size={15} aria-hidden="true" />
					Choose settings file
				</Button>
				<div role={result?.ok === false ? 'alert' : 'status'}>
					{result && (
						<Note tone={result.ok ? 'info' : 'warn'}>
							{result.text}
						</Note>
					)}
				</div>
			</Card>
		</main>
	);
};
