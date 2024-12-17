import { MessageCode } from '../../shared/enums/message-code';
import { PageService } from '../../shared/interfaces/page-service';
import { ConfigModel } from '../../shared/models/config-model';
import { MessageModel } from '../../shared/models/messages/message-model';
import configService from '../../shared/services/config-service';
import messageService from '../../shared/services/message-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { AlbumPageService } from '../page-services/album-page-service';
import { CollectionPageService } from '../page-services/collection-page-service';
import { DiscoverPageService } from '../page-services/discover-page-service';
import { FeedPageService } from '../page-services/feed-page-service';

export class PageServiceWorker {
	private readonly autoplayDelay: number = 250;
	private readonly initTracksDelay: number = 700;

	private readonly pageServices: PageService[] = [
		new AlbumPageService(),
		new DiscoverPageService(),
		new FeedPageService(),
		new CollectionPageService(),
	];

	public pageService: PageService = null;

	constructor() {}

	public start(): void {
		console.log('[Start]: Band Play');

		this.startAsync().catch((error: Error) => {
			console.error(error);
		});
	}

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

		// Register autoplay
		setInterval(() => {
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

		// Register track initialization
		setInterval(() => {
			try {
				this.pageService?.initTracks();
			} catch (error) {
				console.error(error);
			}
		}, this.initTracksDelay);
	}

	// Get the service to handle current page functionality.
	private async currentService(): Promise<PageService> {
		const url = window.location.href;

		const service: PageService = this.pageServices.find((x) =>
			x.isServiceUrl(url)
		);
		if (exist(service)) {
			service.tracks = [];
			service.config = await configService.getAll();
			service.initTracks();
		}

		return service;
	}
}
