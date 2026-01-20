import { MessageCode } from '@shared/enums';
import { PageService } from '@shared/interfaces';
import { ConfigModel } from '@shared/models/config-model';
import { MessageModel } from '@shared/models/messages';
import configService from '@shared/services/config-service';
import messageService from '@shared/services/message-service';
import { exist, notExist } from '@shared/utils';

import { AlbumPageService } from '../page-services/bandcamp/album-page-service';
import { CollectionPageService } from '../page-services/bandcamp/collection-page-service';
import { DiscoverPageService } from '../page-services/bandcamp/discover-page-service';
import { FeedPageService } from '../page-services/bandcamp/feed-page-service';

/**
 * Service worker that manages page-specific services and handles page type detection.
 *
 * This class is responsible for:
 * - Detecting the current page type and selecting the appropriate service
 * - Managing autoplay functionality with configurable delays
 * - Handling URL changes and service switching
 * - Initializing tracks on page load
 * - Managing configuration updates across services
 */
export class PageServiceWorker {
	/** Delay in milliseconds for autoplay checks */
	private readonly autoplayDelay: number = 250;

	/** Delay in milliseconds for track initialization */
	private readonly initTracksDelay: number = 300;

	/** Array of all available page services for different platforms */
	private readonly pageServices: PageService[] = [
		new AlbumPageService(),
		new DiscoverPageService(),
		new FeedPageService(),
		new CollectionPageService(),
	];

	/** Currently active page service for the current page */
	public pageService: PageService = null;

	/**
	 * Creates a new PageServiceWorker instance.
	 */
	constructor() {}

	/**
	 * Starts the page service worker.
	 * Initializes the service and sets up all event listeners and intervals.
	 */
	public start(): void {
		console.log('[Start]: Band Play');

		this.startAsync().catch((error: Error) => {
			console.error(error);
		});
	}

	/**
	 * Asynchronous initialization of the service worker.
	 * Sets up message listeners, configuration updates, and periodic tasks.
	 *
	 * @private
	 */
	private async startAsync(): Promise<void> {
		this.pageService = await this.currentService();

		// Register URL changes listener
		messageService.addListener(
			async (message: MessageModel<unknown>) => {
				if (message.code === MessageCode.UrlChanged) {
					this.pageService = await this.currentService();
				}
			},
			(error: Error) => console.error(error)
		);

		// Add config changes listener
		configService.addListener((newConfig: ConfigModel) => {
			this.pageService.config = newConfig;
		});

		// Register autoplay with cleanup
		const autoplayInterval = setInterval(() => {
			if (
				notExist(this.pageService) ||
				!this.pageService.config.autoplay
			) {
				return;
			}

			try {
				this.pageService.tryAutoplay();
			} catch (error) {
				console.error(error);
			}
		}, this.autoplayDelay);

		// Register track initialization with cleanup
		const initTracksInterval = setInterval(() => {
			try {
				this.pageService?.initTracks();
			} catch (error) {
				console.error(error);
			}
		}, this.initTracksDelay);

		// Store intervals for potential cleanup
		(this as any).autoplayInterval = autoplayInterval;
		(this as any).initTracksInterval = initTracksInterval;
	}

	/**
	 * Gets the appropriate service to handle the current page functionality.
	 * Determines which page service should be used based on the current URL.
	 *
	 * @private
	 * @returns Promise resolving to the appropriate page service or null
	 */
	private async currentService(): Promise<PageService> {
		const url = window.location.href;

		const service: PageService = this.pageServices.find((x) =>
			x.isServiceUrl(url)
		);
		if (exist(service)) {
			service.config = await configService.getAll();
			service.initTracks();
		}

		return service;
	}
}
