const DONE = Symbol();

type BufferData<T> = Symbol | T;

interface Resolve<T> {
	(result?: BufferData<T> | PromiseLike<BufferData<T>>): void;
}

interface Notifier<T> {
	offset: number;
	resolve: Resolve<T>;
}

/**
 * Provide a stream of responses from a producer
 */
export default class BufferedResponse<T> {
	private data: BufferData<T>[] = [];

	private done = false;

	private notifiers: Notifier<T>[] = [];

	add(item: T) {
		if (!this.done) {
			this.data.push(item);
			this.notify();
		}
	}

	close() {
		if (!this.done) {
			this.done = true;
			this.data.push(DONE);
			this.notify();
		}
	}

	async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
		let i = 0;
		let value: BufferData<T> = await this.wait(i++);

		while (this.isValue(value)) {
			yield value;
			value = await this.wait(i++);
		}
	}

	private isValue(value: any): value is T {
		return value !== DONE;
	}

	private notify() {
		for (let i = this.notifiers.length - 1; i >= 0; i--) {
			const notifier = this.notifiers[i];

			if (this.data.length > notifier.offset) {
				notifier.resolve(this.data[notifier.offset]);
				this.notifiers.slice(i, 1);
			} else if (this.done) {
				notifier.resolve(DONE);
				this.notifiers.slice(i, 1);
			}
		}
	}

	private wait(i: number): Promise<BufferData<T>> {
		if (i < this.data.length) {
			return Promise.resolve(this.data[i]);
		}

		return new Promise<BufferData<T>>((resolve) => {
			this.notifiers.push({
				offset: i,
				resolve
			});
		});
	}
}
