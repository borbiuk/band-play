import { MessageCode } from '../../shared/enums/message-code';
import { PageService } from '../../shared/interfaces/page-service';
import { ConfigModel } from '../../shared/models/config-model';
import { MessageModel } from '../../shared/models/messages/message-model';
import { ConfigService } from '../../shared/services/config-service';
import { MessageService } from '../../shared/services/message-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { AlbumPageService } from '../page-services/album-page-service';
import { CollectionPageService } from '../page-services/collection-page-service';
import { DiscoverPageService } from '../page-services/discover-page-service';
import { FeedPageService } from '../page-services/feed-page-service';

export class PageServiceWorker {
	private readonly autoplayDelay: number = 300;
	private readonly initTracksDelay: number = 700;

	private readonly pageServices: PageService[] = [
		new AlbumPageService(this.messageService),
		new DiscoverPageService(this.messageService),
		new FeedPageService(this.messageService),
		new CollectionPageService(this.messageService),
	];

	public pageService: PageService = null;

	constructor(
		private readonly configService: ConfigService,
		private readonly messageService: MessageService
	) {}

	public start(): void {
		console.log('[Start]: Band Play');

		this.startAsync().catch((error: Error) => {
			console.error(error);
		});
	}

	private async startAsync(): Promise<void> {
		this.pageService = await this.currentService();

		this.serviceConfiguration();

		this.registerAutoplay();
		this.registerTracksInitialization();
		this.registerPageChange();
	}

	// Get the object to handle current page functionality.
	private async currentService(): Promise<PageService> {
		const url = window.location.href;

		const service = this.pageServices.find((x) => x.isServiceUrl(url));
		if (exist(service)) {
			service.tracks = [];
			service.config = await this.configService.getAll();
		}

		return service;
	}

	private serviceConfiguration(): void {
		this.configService.addListener((newConfig: ConfigModel) => {
			if (exist(this.pageService)) {
				this.pageService.config = newConfig;
			}
		});
	}

	private registerAutoplay(): void {
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
	}

	private registerTracksInitialization(): void {
		this.pageService?.initTracks();
		setInterval(() => {
			try {
				this.pageService?.initTracks();
			} catch (error) {
				console.error(error);
			}
		}, this.initTracksDelay);
	}

	private registerPageChange(): void {
		this.messageService.addListener(
			async (message: MessageModel<unknown>) => {
				if (message.code === MessageCode.UrlChanged) {
					this.pageService = await this.currentService();
					this.pageService?.initTracks();
				}
			},
			(error: Error) => console.error(error)
		);
	}
}
