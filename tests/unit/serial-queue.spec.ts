import { expect, test } from '@playwright/test';
import { createSerialQueue } from '@shared/utils';

test.describe('createSerialQueue', () => {
	test('should run the jobs one after another in the order they were queued', async () => {
		const enqueue = createSerialQueue();
		const log: string[] = [];
		const job = (name: string, delayMs: number) => async () => {
			log.push(`${name} start`);
			await new Promise((resolve) => setTimeout(resolve, delayMs));
			log.push(`${name} end`);
			return name;
		};

		const results = await Promise.all([
			enqueue(job('a', 20)),
			enqueue(job('b', 1)),
			enqueue(job('c', 1)),
		]);

		expect(results).toEqual(['a', 'b', 'c']);
		expect(log).toEqual([
			'a start',
			'a end',
			'b start',
			'b end',
			'c start',
			'c end',
		]);
	});

	test('should reject only the failed job and still run the next one', async () => {
		const enqueue = createSerialQueue();

		const failed = enqueue(() => Promise.reject(new Error('boom')));
		const next = enqueue(() => Promise.resolve('ok'));

		await expect(failed).rejects.toThrow('boom');
		await expect(next).resolves.toBe('ok');
	});
});
