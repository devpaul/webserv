import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import BufferedResponse from 'src/util/BufferedResponse';

registerSuite('src/util/BufferedResponse', {
	add: {
		async 'add an item'() {
			const expected = Symbol();
			const buffer = new BufferedResponse<Symbol>();

			buffer.add(expected);

			const iterator = buffer[Symbol.asyncIterator]();

			assert.strictEqual((await iterator.next()).value, expected);
		},

		async 'response is done; no item is added'() {
			const buffer = new BufferedResponse<Symbol>();

			buffer.close();
			buffer.add(Symbol());

			for await (let _item of buffer) {
				assert.fail();
			}
		}
	},

	close: {
		async 'close a stream'() {
			const buffer = new BufferedResponse<Symbol>();

			buffer.close();

			for await (let _item of buffer) {
				assert.fail();
			}
		}
	},

	async 'async iterator'() {
		const buffer = new BufferedResponse<Symbol>();
		const expected = [ Symbol(), Symbol(), Symbol() ];

		expected.forEach(item => buffer.add(item));
		buffer.close();

		for await (let item of buffer) {
			assert.strictEqual(item, expected.shift());
		}
		assert.lengthOf(expected, 0);
	}
});
