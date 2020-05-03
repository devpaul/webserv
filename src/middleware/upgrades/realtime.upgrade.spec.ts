/// <reference types="intern" />
import { assert } from 'chai';
import { before, describe, it } from 'intern/lib/interfaces/bdd';
import { describeSuite } from '../../_support/describeSuite';
import { setupMocks, setupSinon } from '../../_support/mocks';
import { mockLog } from '../../_support/mocks/mockLog';
import WebSocket = require('ws');

describeSuite(() => {
	const sinon = setupSinon();
	const websocketUpgrader = sinon.stub();
	const mockWebSocketUpgrade = sinon.stub().returns(websocketUpgrader);
	const socketId = 'socketId';
	const logMock = mockLog();
	let realtimeUpgrade: typeof import('./realtime.upgrade').realtimeUpgrade;

	setupMocks({
		'../upgrades/websocket.upgrade': {
			websocket: mockWebSocketUpgrade
		},
		'../../core/log': {
			log: logMock
		}
	});

	before(() => {
		realtimeUpgrade = require('./realtime.upgrade').realtimeUpgrade;
	});

	function createMockClient(): WebSocket {
		return {
			send: sinon.stub()
		} as any;
	}

	function addConnection(id = socketId, client = createMockClient()) {
		const { onConnection } = mockWebSocketUpgrade.lastCall.args[0];
		assert.isFunction(onConnection);

		onConnection(client, id);
		return client;
	}

	describe('realtimeUpgrade', () => {
		it('calls onInit on creation and passes methods', () => {
			const onInit = sinon.stub();
			const upgrader = realtimeUpgrade({
				onInit
			});

			assert.strictEqual(upgrader, websocketUpgrader);
			assert.strictEqual(onInit.callCount, 1);

			const [methods] = onInit.lastCall.args;
			assert.isDefined(methods);
			assert.strictEqual(methods.getSize(), 0);
			assert.deepEqual(Array.from(methods.getAll()), []);
			assert.isUndefined(methods.get('socketId'));
		});

		it('works with only required properties', () => {
			realtimeUpgrade({});

			assert.strictEqual(mockWebSocketUpgrade.callCount, 1);
			addConnection();

			const { onClose, onError, onMessage } = mockWebSocketUpgrade.lastCall.args[0];
			onMessage(socketId, {});
			onError(socketId, new Error());
			onClose(socketId, 42, 'reason');
		});

		describe('onConnection', () => {
			it('adds a new connection', () => {
				const onConnect = sinon.stub();
				realtimeUpgrade({
					onConnect
				});

				assert.strictEqual(mockWebSocketUpgrade.callCount, 1);
				addConnection();

				assert.strictEqual(onConnect.callCount, 1);
				const [con, methods] = onConnect.lastCall.args;
				assert.strictEqual(con.id, socketId);
				assert.strictEqual(methods.get(socketId), con);
			});
		});

		describe('onClose', () => {
			const code = 42;
			const reason = 'reason';

			it('deletes a connection', () => {
				const onDisconnect = sinon.stub();
				realtimeUpgrade({
					onDisconnect
				});
				addConnection();

				assert.strictEqual(mockWebSocketUpgrade.callCount, 1);
				const { onClose } = mockWebSocketUpgrade.lastCall.args[0];
				assert.isFunction(onClose);

				onClose(socketId, code, reason);
				assert.strictEqual(onDisconnect.callCount, 1);
				const [con, methods] = onDisconnect.lastCall.args;
				assert.strictEqual(con.id, socketId);
				assert.isUndefined(methods.get(socketId));
			});

			it('warns if there is no matching connection', () => {
				const onDisconnect = sinon.stub();
				realtimeUpgrade({
					onDisconnect
				});

				assert.strictEqual(mockWebSocketUpgrade.callCount, 1);
				const { onClose } = mockWebSocketUpgrade.lastCall.args[0];
				assert.isFunction(onClose);

				onClose(socketId, code, reason);
				assert.strictEqual(onDisconnect.callCount, 0);
				assert.strictEqual(logMock.warn.callCount, 1);
			});
		});

		describe('onError', () => {
			it('passes socketId when no matching connection', () => {
				const err = new Error();
				const onError = sinon.stub();
				realtimeUpgrade({
					onError
				});

				assert.strictEqual(mockWebSocketUpgrade.callCount, 1);
				const { onError: internalOnError } = mockWebSocketUpgrade.lastCall.args[0];
				assert.isFunction(internalOnError);

				internalOnError(socketId, err);
				assert.strictEqual(onError.callCount, 1);
				assert.deepEqual(onError.lastCall.args, [err, socketId]);
			});

			it('passes the connection to onError', () => {
				const err = new Error();
				const onError = sinon.stub();
				realtimeUpgrade({
					onError
				});
				addConnection();

				assert.strictEqual(mockWebSocketUpgrade.callCount, 1);
				const { onError: internalOnError } = mockWebSocketUpgrade.lastCall.args[0];
				assert.isFunction(internalOnError);

				internalOnError(socketId, err);
				assert.strictEqual(onError.callCount, 1);
				const [error, con] = onError.lastCall.args;
				assert.strictEqual(error, err);
				assert.strictEqual(con.id, socketId);
			});
		});

		describe('onMessage', () => {
			const data = {};

			it('does nothing if there is no matching connection', () => {
				const onMessage = sinon.stub();
				realtimeUpgrade({
					onMessage
				});

				assert.strictEqual(mockWebSocketUpgrade.callCount, 1);
				const { onMessage: internalOnMessage } = mockWebSocketUpgrade.lastCall.args[0];
				assert.isFunction(internalOnMessage);

				internalOnMessage(socketId, data);
				assert.strictEqual(onMessage.callCount, 0);
			});

			it('handles the message', () => {
				const onMessage = sinon.stub();
				realtimeUpgrade({
					onMessage
				});

				assert.strictEqual(mockWebSocketUpgrade.callCount, 1);
				const { onMessage: internalOnMessage } = mockWebSocketUpgrade.lastCall.args[0];
				assert.isFunction(internalOnMessage);
				addConnection();

				internalOnMessage(socketId, data);
				assert.strictEqual(onMessage.callCount, 1);
				const [message, con, methods] = onMessage.lastCall.args;
				assert.strictEqual(message, data);
				assert.strictEqual(con.id, socketId);
				assert.strictEqual(methods.get(socketId), con);
			});
		});
	});
});
