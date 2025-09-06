class EventEmitter<T> {
	private previousPayload: T;
	private listeners: Array<(payload: T) => void> = [];

	/**
	 * Add a listener for the event.
	 * @param listener The callback function to invoke when the event is emitted.
	 */
	on(listener: (payload: T) => void): void {
		this.listeners.push(listener);
	}

	/**
	 * Remove a specific listener.
	 * @param listener The callback function to remove.
	 */
	off(listener: (payload: T) => void): void {
		this.listeners = this.listeners.filter((l) => l !== listener);
	}

	/**
	 * Emit the event and call all listeners with the provided payload.
	 * @param payload The data to pass to the listeners.
	 */
	emit(payload: T): void {
		if (this.previousPayload === payload) {
			return;
		}

		this.previousPayload = payload;
		this.listeners.forEach((listener) => listener(payload));
	}

	/**
	 * Remove all listeners for the event.
	 */
	removeAllListeners(): void {
		this.listeners = [];
	}
}

export default EventEmitter;
