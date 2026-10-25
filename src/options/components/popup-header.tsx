import { Button, GithubIcon } from '@shared/components/ui';
import { glass } from '@shared/components/ui';
import { DONATE_URL, getRateUrl, GITHUB_URL } from '@shared/constants/links';
import { Coffee, Star } from 'lucide-react';
import React, { ReactNode } from 'react';

interface LinkButtonProps {
	// The accessible name and the tooltip.
	label: string;

	// The page to open in a new tab.
	href: string;

	// The icon.
	children: ReactNode;
}

const LinkButton = ({ label, href, children }: LinkButtonProps) => (
	<Button
		icon
		variant="ghost"
		title={label}
		aria-label={label}
		onClick={() => window.open(href, '_blank')}
	>
		{children}
	</Button>
);

export interface PopupHeaderProps {
	// The tab list, shown under the brand.
	children: ReactNode;
}

/**
 * Glass bar at the top of the popup: logo, name, links and the tabs.
 *
 * @param {PopupHeaderProps} props - The props of component.
 */
export const PopupHeader = ({ children }: PopupHeaderProps) => {
	const rateUrl = getRateUrl();
	return (
		<header
			className={`absolute inset-x-0 top-0 z-[2] border-b border-black/[.08] px-3.5 pb-2.5 pt-3 ${glass}`}
		>
			<div className="mb-2.5 flex items-center gap-2.5">
				<img
					src="./../assets/logo-128.png"
					alt=""
					className="-my-1.5 -ml-1 h-12 w-12"
				/>
				<div className="text-base font-bold leading-[1.1] tracking-[-0.01em]">
					Band Play
				</div>
				<div className="ml-auto flex gap-0.5">
					<LinkButton label="Source on GitHub" href={GITHUB_URL}>
						<GithubIcon />
					</LinkButton>
					<LinkButton label="Buy me a coffee" href={DONATE_URL}>
						<Coffee size={16} aria-hidden="true" />
					</LinkButton>
					{rateUrl && (
						<LinkButton
							label="Rate on the Chrome Web Store"
							href={rateUrl}
						>
							<Star size={16} aria-hidden="true" />
						</LinkButton>
					)}
				</div>
			</div>
			{children}
		</header>
	);
};
