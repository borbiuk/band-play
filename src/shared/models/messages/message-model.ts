import { MessageCode } from '../../enums/message-code';

export interface MessageModel<T> {
	code: MessageCode;
	data?: T;
}
