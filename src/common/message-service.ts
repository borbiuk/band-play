import { Message } from '../contracts/message';

export class MessageService {
	public async sendToContent<T>(
		tabId: number,
		message: Message<T>
	): Promise<void> {
		return chrome.tabs.sendMessage(tabId, message);
	}

	public async sendToBackground<T>(message: Message<T>): Promise<void> {
		return chrome.runtime.sendMessage(message);
	}

	public addListener<T>(
		func: (message: Message<T>) => void | Promise<void>,
		errorHandler?: (error: Error) => void
	): void {
		chrome.runtime.onMessage.addListener(
			(
				message: Message<T>,
				_sender: chrome.runtime.MessageSender,
				_sendResponse: (response?: any) => void
			) => {
				try {
					func(message);
				} catch (e) {
					errorHandler(e);
				}
			}
		);
	}
}
