import { MessageCode } from '@shared/enums';

/**
 * Generic message model for inter-component communication.
 * Used for sending messages between background scripts, content scripts, and popup UI.
 *
 * @template T - The type of data payload (optional)
 */
export interface MessageModel<T> {
	/** Message code identifying the type of message */
	code: MessageCode;

	/** Optional data payload associated with the message */
	data?: T;
}
