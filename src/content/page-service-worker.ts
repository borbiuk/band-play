import { MessageCode } from '../shared/enums/message-code';
import { PageService } from '../shared/interfaces/page-service';
import { MessageModel } from '../shared/models/message-model';
import { ConfigService } from "../shared/services/config-service";
import { MessageService } from '../shared/services/message-service';
import { exist } from '../shared/utils';
import { AlbumPageService } from './page-services/album-page-service';
import { CollectionPageService } from './page-services/collection-page-service';
import { DiscoverPageService } from './page-services/discover-page-service';
import { FeedPageService } from './page-services/feed-page-service';

export class PageServiceWorker {

	private readonly configService: ConfigService = new ConfigService();
	private readonly messageService: MessageService = new MessageService();

	private readonly services: PageService[] = [
		new AlbumPageService(),
		new DiscoverPageService(),
		new FeedPageService(),
		new CollectionPageService(),
	];

	public service: PageService = null;

	public start(): void {
		console.log('[Start]: Band Play');

		this.startAsync()
			.catch((error: Error) => {
				console.error(error);
			});
	}

	private async startAsync(): Promise<void> {
		this.service = await this.currentService();

		this.serviceConfiguration();

		this.registerAutoplay();
		this.registerTracksInitialization();
		this.registerPageChange();
	}

	// Get the object to handle current page functionality.
	private async currentService(): Promise<PageService> {
		const url = window.location.href;

		const service = this.services.find((x) => x.checkUrl(url));
		if (exist(service)) {
			service.tracks = [];
			service.config = await this.configService.getAll();
		}

		return service;
	};

	private serviceConfiguration(): void {
		this.configService.addListener((newConfig) => {
			if (exist(this.service)) {
				this.service.config = newConfig;
			}
		});
	}

	private registerAutoplay(): void {
		setInterval(() => {
			if (!this.service?.config.autoplay) {
				return;
			}

			try {
				this.service?.tryAutoplay();
			} catch (e) {
				console.log(e);
			}
		}, 300);
	}

	private registerTracksInitialization(): void {
		this.service?.initTracks();
		setInterval(() => {
			try {
				this.service?.initTracks();
			} catch (e) {
				console.log(e);
			}
		}, 1_000);
	}

	private registerPageChange(): void {
		this.messageService.addListener(
			async (message: MessageModel<any>) => {
				// clear data on URL change message
				if (message.code === MessageCode.UrlChanged) {
					this.service = await this.currentService();
					this.service.initTracks();
				}
			},
			(error: Error) => console.error(error)
		);
	}
}
