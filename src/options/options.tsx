import { useConfig } from '@shared/hooks/use-config';
import { renderErrorOptions } from '@shared/utils/render-error.utils';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import './options.scss';
import { ImportPage } from './components/import-page';
import { DownloadsTab } from './components/panels/downloads-tab';
import { PageTab } from './components/panels/page-tab';
import { PlaybackTab } from './components/panels/playback-tab';
import { ShortcutsTab } from './components/panels/shortcuts-tab';
import { PopupFooter } from './components/popup-footer';
import { PopupHeader } from './components/popup-header';
import { panelId, tabId, Tabs, TabItem } from './components/tabs';
import { useDownloadSummary } from './hooks/use-download-summary';

type TabName = 'playback' | 'page' | 'downloads' | 'shortcuts';

/**
 * The toolbar popup (400 x 560 px): glass header with the tabs, the settings of the selected tab,
 * and a glass footer for import, export and reset. The popup never saves anything by itself:
 * a setting is written only when the user changes it.
 *
 * @returns JSX element containing the complete settings interface
 */
const Options = () => {
	const { config, update } = useConfig();
	const summary = useDownloadSummary();
	const [tab, setTab] = useState<TabName>('playback');

	const tabs: TabItem<TabName>[] = [
		{
			id: 'playback',
			label: 'Playback',
		},
		{
			id: 'page',
			label: 'Page',
		},
		{
			id: 'downloads',
			label: 'Downloads',
			dot: (summary?.active ?? 0) > 0,
			dotLabel: 'Downloads are running',
		},
		{
			id: 'shortcuts',
			label: 'Shortcuts',
		},
	];

	return (
		<div className="bp-popup relative h-[560px] w-[400px] overflow-hidden font-ui text-[13px] text-ink-900">
			<PopupHeader>
				<Tabs<TabName>
					ariaLabel="Settings"
					items={tabs}
					selected={tab}
					onSelect={setTab}
				/>
			</PopupHeader>

			<main
				role="tabpanel"
				id={panelId(tab)}
				aria-labelledby={tabId(tab)}
				className={`absolute inset-0 px-3.5 pb-[62px] pt-[118px] ${
					tab === 'downloads' || tab === 'shortcuts'
						? 'overflow-hidden'
						: 'overflow-y-auto'
				}`}
			>
				{config === null && <p className="m-0 text-ink-500">...</p>}
				{config !== null && tab === 'playback' && (
					<PlaybackTab config={config} update={update} />
				)}
				{config !== null && tab === 'page' && (
					<PageTab config={config} update={update} />
				)}
				{config !== null && tab === 'downloads' && (
					<DownloadsTab config={config} update={update} />
				)}
				{config !== null && tab === 'shortcuts' && (
					<ShortcutsTab config={config} update={update} />
				)}
			</main>

			<PopupFooter />
		</div>
	);
};

/** Root element for React rendering */
const container = document.getElementById('root');
const root = createRoot(container, renderErrorOptions(container, 'settings'));

/** Render the popup in React StrictMode, or the import page when it was opened in a tab */
root.render(
	<React.StrictMode>
		{window.location.hash === '#import' ? <ImportPage /> : <Options />}
	</React.StrictMode>
);
