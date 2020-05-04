/// <reference types="intern" />
import { assert } from 'chai';
import { IncomingMessage } from 'http';
import { before, describe, it } from 'intern/lib/interfaces/bdd';
import { Socket } from 'net';
import { describeSuite } from '../../_support/describeSuite';
import { setupMocks, setupSinon } from '../../_support/mocks';
import { WebSocketProperties } from './websocket.upgrade';

describeSuite(() => {
	let websocketUpgrade: typeof import('./websocket.upgrade').websocket;
	const sinon = setupSinon();
	const handleUpgradeMock = sinon.stub();
	const mockServer = sinon.stub().returns({
		handleUpgrade: handleUpgradeMock
	});

	setupMocks({
		ws: {
			Server: mockServer
		}
	});

	before(() => {
		websocketUpgrade = require('./websocket.upgrade').websocket;
	});

	it('adds a ws property to the upgrader', () => {
		const upgrade = websocketUpgrade({});
		assert.isDefined((upgrade as any).ws);
		assert.deepEqual((upgrade as any).ws, { handleUpgrade: handleUpgradeMock });
	});

	describe('upgrader', () => {
		const request = {} as IncomingMessage;
		const socket = {} as Socket;
		const head = {} as Buffer;
		const client = {
			on: sinon.stub()
		};

		function assertUpgrader(props: WebSocketProperties) {
			const upgrader = websocketUpgrade(props);
			const promise = upgrader(request, socket, head);

			assert.strictEqual(handleUpgradeMock.callCount, 1);
			assert.deepEqual(handleUpgradeMock.lastCall.args.slice(0, 3), [request, socket, head]);

			const cb = handleUpgradeMock.lastCall.args[3];
			cb(client);

			return promise;
		}

		it('upgrades with minimal properties', async () => {
			const promise = assertUpgrader({});

			assert.strictEqual(client.on.callCount, 0);

			return promise;
		});

		it('attaches listeners', () => {
			const props = {
				onMessage: sinon.stub(),
				onClose: sinon.stub(),
				onError: sinon.stub()
			};
			const promise = assertUpgrader(props);

			assert.strictEqual(client.on.callCount, 3);

			return promise;
		});

		it('calls onConnection', () => {
			const props = {
				onConnection: sinon.stub()
			};
			const promise = assertUpgrader(props);

			assert.strictEqual(props.onConnection.callCount, 1);
			assert.strictEqual(props.onConnection.lastCall.args[0], client);
			assert.typeOf(props.onConnection.lastCall.args[1], 'string');
			assert.strictEqual(props.onConnection.lastCall.args[2], request);

			return promise;
		});

		it('calls onMessage', () => {
			const props = {
				onMessage: sinon.stub()
			};
			const data = {};
			const promise = assertUpgrader(props);

			assert.strictEqual(client.on.callCount, 1);
			assert.strictEqual(client.on.lastCall.args[0], 'message');

			const cb = client.on.lastCall.args[1];
			cb(data);

			assert.strictEqual(props.onMessage.callCount, 1);
			assert.typeOf(props.onMessage.lastCall.args[0], 'string');
			assert.strictEqual(props.onMessage.lastCall.args[1], data);

			return promise;
		});

		it('calls onClose', () => {
			const props = {
				onClose: sinon.stub()
			};
			const code = 42;
			const reason = 'answer found';
			const promise = assertUpgrader(props);

			assert.strictEqual(client.on.callCount, 1);
			assert.strictEqual(client.on.lastCall.args[0], 'close');

			const cb = client.on.lastCall.args[1];
			cb(code, reason);

			assert.strictEqual(props.onClose.callCount, 1);
			assert.typeOf(props.onClose.lastCall.args[0], 'string');
			assert.deepEqual(props.onClose.lastCall.args.slice(1), [code, reason]);

			return promise;
		});

		it('calls onError', () => {
			const props = {
				onError: sinon.stub()
			};
			const error = new Error();
			const promise = assertUpgrader(props);

			assert.strictEqual(client.on.callCount, 1);
			assert.strictEqual(client.on.lastCall.args[0], 'error');

			const cb = client.on.lastCall.args[1];
			cb(error);

			assert.strictEqual(props.onError.callCount, 1);
			assert.typeOf(props.onError.lastCall.args[0], 'string');
			assert.deepEqual(props.onError.lastCall.args[1], error);

			return promise;
		});
	});
});
