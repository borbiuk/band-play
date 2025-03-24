import { MessageModel } from '@shared/models/messages';
import { notExist } from '@shared/utils';

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
	public async sendToContent<T>(
		tabId: number,
		message: MessageModel<T>
	): Promise<void> {
		return chrome.tabs.sendMessage(tabId, message);
	}

	/**
	 * Sends a message to the content script running in a active tab.
	 *
	 * @param message - The message to be sent.
	 * @returns A promise that resolves when the message has been sent.
	 */
	public async sendToActiveContent<T>(
		message: MessageModel<T>
	): Promise<void> {
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
	public async sendToBackground<T>(message: MessageModel<T>): Promise<void> {
		return chrome.runtime.sendMessage(message);
	}

	/**
	 * Adds a listener for incoming messages from content scripts or other parts of the extension.
	 *
	 * @param func - The callback function to handle incoming messages.
	 * @param errorHandler - Optional. A callback function to handle errors that may occur during message processing.
	 */
	public addListener<T>(
		func: (message: MessageModel<T>) => void | Promise<void>,
		errorHandler?: (error: Error) => void
	): void {
		chrome.runtime.onMessage.addListener(
			(
				message: MessageModel<T>,
				_sender: chrome.runtime.MessageSender,
				_sendResponse: (response?: unknown) => void
			) => {
				if (notExist(message?.code)) {
					return;
				}

				try {
					func(message);
				} catch (error) {
					errorHandler(error);
				}
			}
		);
	}
}

const messageService = new MessageService();

export default messageService;
