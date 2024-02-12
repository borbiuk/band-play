import { MessageCode } from './message-code';

export interface Message<T> {
	code: MessageCode;
	data?: T;
}
