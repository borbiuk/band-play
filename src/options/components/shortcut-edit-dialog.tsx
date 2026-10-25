import { Button, Dialog, Note } from '@shared/components/ui';
import { ShortcutType } from '@shared/enums';
import { UpdateConfig } from '@shared/hooks/use-config';
import { ConfigModel } from '@shared/models/config-model';
import configService from '@shared/services/config-service';
import { TriangleAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
	findConflict,
	hasMainKey,
	isReservedByBrowser,
	toCombination,
	toHumanString,
} from '../utils/shortcut-recorder.utils';

export interface ShortcutEditDialogProps {
	// The shortcut being changed, or null when the dialog is closed.
	type: ShortcutType | null;

	// The settings (stored combinations and disabled shortcuts).
	config: ConfigModel;

	// Saves one setting.
	update: UpdateConfig;

	// Called when the dialog closes.
	onClose: () => void;
}

/**
 * Dialog that records a new key combination for a shortcut. It shows an error at once for a combination the
 * browser uses or another shortcut already has, and Save stays off until the combination is valid.
 *
 * @param {ShortcutEditDialogProps} props - The props of component.
 */
export const ShortcutEditDialog = ({
	type,
	config,
	update,
	onClose,
}: ShortcutEditDialogProps) => {
	/** Recorded combination; null while nothing new was recorded */
	const [recordedKeys, setRecordedKeys] = useState<string[] | null>(null);

	/** Modifiers held while recording, shown before the main key is pressed */
	const [heldKeys, setHeldKeys] = useState<string[]>([]);

	/** Result of "Use default" */
	const [resetError, setResetError] = useState('');

	// A new shortcut starts with a clean recorder
	useEffect(() => {
		setRecordedKeys(null);
		setHeldKeys([]);
		setResetError('');
	}, [type]);

	const savedKeys =
		type === null ? [] : (JSON.parse(config.shortcuts[type]) as string[]);

	let conflictMessage = '';
	if (type !== null && recordedKeys !== null) {
		const conflict = findConflict(
			config.shortcuts,
			config.disabledShortcuts,
			type,
			recordedKeys
		);
		if (isReservedByBrowser(recordedKeys)) {
			conflictMessage =
				'The browser uses this combination. Pick another key.';
		} else if (conflict !== undefined) {
			conflictMessage = `Already used by "${conflict}". Pick another key.`;
		}
	}

	const error = conflictMessage || resetError;
	const shown = heldKeys.length > 0 ? heldKeys : (recordedKeys ?? savedKeys);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		// Tab moves the focus on; it is never recorded
		if (event.code === 'Tab') {
			return;
		}

		// Escape closes the dialog, as it does everywhere
		if (event.code === 'Escape') {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		setResetError('');

		// Some input methods and virtual keyboards send no physical key
		if (!event.code) {
			return;
		}

		const keys = toCombination(event);
		if (!hasMainKey(keys)) {
			setHeldKeys(keys);
			return;
		}

		setHeldKeys([]);
		setRecordedKeys(keys);
	};

	const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
		// Releasing a modifier before the main key cancels the live preview
		setHeldKeys((keys) => (keys.length > 0 ? toCombination(event) : keys));
	};

	const save = () => {
		if (type === null || recordedKeys === null || error !== '') {
			return;
		}

		update('shortcuts', {
			...config.shortcuts,
			[type]: JSON.stringify(recordedKeys),
		});
		onClose();
	};

	// An empty combination is stored as "use the default"
	const useDefault = () => {
		if (type === null) {
			return;
		}

		const defaultKeys = JSON.parse(
			configService.defaultShortcuts()[type]
		) as string[];
		const conflict = findConflict(
			config.shortcuts,
			config.disabledShortcuts,
			type,
			defaultKeys
		);
		if (conflict !== undefined) {
			setResetError(
				`"${conflict}" uses the default key now. Change it first.`
			);
			return;
		}

		update('shortcuts', {
			...config.shortcuts,
			[type]: JSON.stringify([]),
		});
		onClose();
	};

	const isDefault =
		type !== null &&
		config.shortcuts[type] === configService.defaultShortcuts()[type];

	return (
		<Dialog
			open={type !== null}
			onClose={onClose}
			title="Change shortcut"
			actions={
				<>
					<Button
						variant="ghost"
						className="mr-auto"
						disabled={isDefault}
						onClick={useDefault}
					>
						Use default
					</Button>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						variant="primary"
						disabled={recordedKeys === null || error !== ''}
						onClick={save}
					>
						Save
					</Button>
				</>
			}
		>
			<p className="m-0 mb-2.5 font-medium text-ink-700">{type}</p>
			<input
				readOnly
				type="text"
				aria-label="Key combination"
				placeholder="Press the new keys"
				value={toHumanString(shown)}
				className={`h-11 w-full rounded-ctl border-[1.5px] border-dashed px-2.5 text-center text-[15px] font-semibold outline-none placeholder:text-ink-500 focus-visible:ring-[3px] focus-visible:ring-aqua-500/25 ${
					error === ''
						? 'border-aqua-500 bg-aqua-50 text-ink-900'
						: 'border-coral-500 bg-warn-bg text-warn'
				}`}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				onBlur={() => setHeldKeys([])}
			/>
			<div className="mt-2.5 min-h-[34px]" role="alert">
				{error !== '' && (
					<Note icon={<TriangleAlert aria-hidden="true" />}>
						{error}
					</Note>
				)}
			</div>
		</Dialog>
	);
};
