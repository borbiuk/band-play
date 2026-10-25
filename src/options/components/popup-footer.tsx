import { Button, ConfirmDialog, glass } from '@shared/components/ui';
import configService from '@shared/services/config-service';
import { Download, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import {
	exportSettingsFile,
	importSettingsFile,
} from '../utils/settings-file.utils';

/** A short result message shown in the footer. */
interface Message {
	tone: 'ok' | 'error';
	text: string;
}

/** Firefox closes an extension popup when a file dialog opens, so Import runs in a tab there. */
const isFirefox = navigator.userAgent.includes('Firefox');

/**
 * Glass bar at the bottom of the popup: version, import, export and reset of all settings.
 *
 * @returns JSX element of the footer.
 */
export const PopupFooter = () => {
	const [message, setMessage] = useState<Message | null>(null);
	const [isResetOpen, setIsResetOpen] = useState(false);
	const fileInput = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (message === null) {
			return;
		}

		const timer = window.setTimeout(() => setMessage(null), 4000);
		return () => window.clearTimeout(timer);
	}, [message]);

	const fail = (error: unknown) =>
		setMessage({
			tone: 'error',
			text:
				error instanceof Error
					? error.message
					: 'Something went wrong. Try again.',
		});

	const startImport = () => {
		if (isFirefox) {
			chrome.tabs
				.create({ url: chrome.runtime.getURL('options.html#import') })
				.catch(fail);
			return;
		}

		fileInput.current?.click();
	};

	const importFile = (file: File | undefined) => {
		if (!file) {
			return;
		}

		importSettingsFile(file)
			.then(() => setMessage({ tone: 'ok', text: 'Settings imported' }))
			.catch(fail);
	};

	const exportFile = () => {
		exportSettingsFile()
			.then(() => setMessage({ tone: 'ok', text: 'Settings exported' }))
			.catch(fail);
	};

	const resetAll = () => {
		configService
			.resetSettings()
			.then(() => setMessage({ tone: 'ok', text: 'Settings reset' }))
			.catch(fail);
	};

	return (
		<footer
			className={`absolute inset-x-0 bottom-0 z-[2] flex items-center gap-1.5 border-t border-black/[.08] px-3.5 py-2.5 ${glass}`}
		>
			<span
				role={message?.tone === 'error' ? 'alert' : 'status'}
				className={`min-w-0 flex-1 truncate pr-1 text-[11px] ${
					message?.tone === 'error' ? 'text-danger' : 'text-ink-500'
				}`}
			>
				{message?.text ?? `v${chrome.runtime.getManifest().version}`}
			</span>
			<input
				ref={fileInput}
				type="file"
				accept="application/json,.json"
				aria-label="Settings file"
				className="sr-only"
				tabIndex={-1}
				onChange={(event) => {
					importFile(event.target.files?.[0]);
					// The same file can be chosen again
					event.target.value = '';
				}}
			/>
			<Button small variant="ghost" onClick={startImport}>
				<Upload size={15} aria-hidden="true" />
				Import
			</Button>
			<Button small variant="ghost" onClick={exportFile}>
				<Download size={15} aria-hidden="true" />
				Export
			</Button>
			<Button small variant="ghost" onClick={() => setIsResetOpen(true)}>
				Reset all
			</Button>

			<ConfirmDialog
				open={isResetOpen}
				onClose={() => setIsResetOpen(false)}
				title="Reset all settings?"
				confirmLabel="Reset all"
				onConfirm={resetAll}
			>
				Settings and shortcuts return to their defaults. Visited history
				and downloads stay.
			</ConfirmDialog>
		</footer>
	);
};
