import { Message } from '@shared/models/messages';
import { exist, notExist } from '@shared/utils';

/**
 * Service for handling messaging between different components of the Chrome extension.
 */
class MessageService {
	/**
	 * Sends a message to the content script running in a specific tab.
	 *
	 * @param tabId - The ID of the tab to send the message to.
	 * @param message - The message to be sent.
	 * @returns A promise that resolves when the message has been sent.
	 */
	public async sendToContent(tabId: number, message: Message): Promise<void> {
		return chrome.tabs.sendMessage(tabId, message);
	}

	/**
	 * Sends a message to the content script running in a active tab.
	 *
	 * @param message - The message to be sent.
	 * @returns A promise that resolves when the message has been sent.
	 */
	public async sendToActiveContent(message: Message): Promise<void> {
		return chrome.tabs
			.query({ active: true, currentWindow: true })
			.then(async (tabs) => {
				await this.sendToContent(tabs[0].id, message);
			});
	}

	/**
	 * Sends a message to the background script of the extension.
	 *
	 * @param message - The message to be sent.
	 * @returns A promise that resolves when the message has been sent.
	 */
	public async sendToBackground(message: Message): Promise<void> {
		await chrome.runtime.sendMessage(message);
	}

	/**
	 * Sends a message to the background script and ignores the outcome: for commands
	 * whose failure the sender cannot act on.
	 *
	 * @param message - The message to be sent.
	 */
	public post(message: Message): void {
		this.sendToBackground(message).catch(() => void 0);
	}

	/**
	 * Adds a listener for incoming messages from content scripts or other parts of the extension.
	 *
	 * @param func - The callback function to handle incoming messages.
	 * @param errorHandler - Optional. A callback function to handle errors that may occur during message processing.
	 */
	public addListener(
		func: (message: Message) => void | Promise<void>,
		errorHandler?: (error: Error) => void
	): void {
		chrome.runtime.onMessage.addListener(
			(
				message: Message,
				_sender: chrome.runtime.MessageSender,
				_sendResponse: (response?: unknown) => void
			) => {
				if (notExist(message?.code)) {
					return;
				}

				try {
					// Async handlers reject instead of throwing: route those
					// rejections to the error handler as well.
					Promise.resolve(func(message)).catch((error: Error) => {
						if (exist(errorHandler)) {
							errorHandler(error);
						}
					});
				} catch (error) {
					if (exist(errorHandler)) {
						errorHandler(error);
					}
				}
			}
		);
	}
}

const messageService = new MessageService();

export default messageService;
