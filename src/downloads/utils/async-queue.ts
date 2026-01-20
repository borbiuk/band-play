/**
 * Minimal async task queue with concurrency control (no external deps).
 */
export class AsyncQueue {
	private running: number = 0;
	private tasks: Array<() => Promise<void>> = [];

	constructor(public concurrency: number) {}

	public add(task: () => Promise<void>): void {
		this.tasks.push(task);
		this.drain();
	}

	private drain(): void {
		while (this.running < this.concurrency && this.tasks.length > 0) {
			const task = this.tasks.shift();

			if (!task) {
				return;
			}

			this.running++;

			task()
				.catch(() => {
					// Errors are handled by task implementors.
				})
				.finally(() => {
					this.running--;
					this.drain();
				});
		}
	}

	public clear(): void {
		this.tasks = [];
	}
}
