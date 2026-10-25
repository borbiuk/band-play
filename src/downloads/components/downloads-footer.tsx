import { Button, GithubIcon } from '@shared/components/ui';
import { DONATE_URL, getRateUrl, GITHUB_URL } from '@shared/constants/links';
import { Coffee, Star } from 'lucide-react';
import React from 'react';

/**
 * Footer: version, author and the links (GitHub, donate, rate).
 *
 * @returns JSX element of the footer.
 */
export const DownloadsFooter = () => {
	const open = (url: string) => () => window.open(url, '_blank');
	const rateUrl = getRateUrl();

	return (
		<footer className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-1 px-5 pb-7 pt-3 text-xs text-ink-500">
			<span>
				Band Play v{chrome.runtime.getManifest().version} · by borbiuk
			</span>
			<span className="flex-1" />
			<Button small variant="ghost" onClick={open(GITHUB_URL)}>
				<GithubIcon />
				GitHub
			</Button>
			<Button small variant="ghost" onClick={open(DONATE_URL)}>
				<Coffee size={15} aria-hidden="true" />
				Buy me a coffee
			</Button>
			{rateUrl && (
				<Button small variant="ghost" onClick={open(rateUrl)}>
					<Star size={15} aria-hidden="true" />
					Rate
				</Button>
			)}
		</footer>
	);
};
