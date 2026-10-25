/**
 * Creates a queue that runs async jobs one after another, in the order they were queued.
 * A failed job rejects its own promise only: the next job still runs.
 *
 * @returns A function that queues a job and resolves with its result.
 */
export const createSerialQueue = () => {
	let chain: Promise<unknown> = Promise.resolve();

	return <T>(run: () => Promise<T>): Promise<T> => {
		const result = chain.then(run, run);
		chain = result.catch(() => void 0);
		return result;
	};
};
