import { MessageCode } from './message-code';

export interface MessageModel<T> {
	code: MessageCode;
	data?: T;
}
