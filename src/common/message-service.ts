import { MessageCode } from './message-code';

export class MessageService {
	public async sendTabMessage<T>(
		tabId: number,
		code: MessageCode,
		data?: T
	): Promise<void> {
		return chrome.tabs.sendMessage(tabId, {
			code,
			data,
		});
	}

	public async sendRuntimeMessage<T>(
		code: MessageCode,
		data?: T
	): Promise<void> {
		return chrome.runtime.sendMessage({
			code,
			data,
		});
	}
}
