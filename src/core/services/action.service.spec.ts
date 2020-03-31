/// <reference types="intern" />
import { assert } from 'chai';
import { before, describe, it } from 'intern/lib/interfaces/bdd';
import { describeSuite } from '../../_support/describeSuite';
import { setupMocks, setupSinon } from '../../_support/mocks';
import { ActionServiceProperties, sendError, sendResponse } from './action.service';

describeSuite(() => {
	const sinon = setupSinon();
	const realtimeUpgradeMock = sinon.stub().returns({});
	let actionService: typeof import('./action.service').actionService;

	setupMocks({
		'../upgrades/realtime.upgrade': {
			realtimeUpgrade: realtimeUpgradeMock
		}
	});

	before(() => {
		actionService = require('./action.service').actionService;
	});

	function createMockConnection() {
		return {
			client: {
				send: sinon.stub()
			}
		} as any;
	}

	describe('sendError', () => {
		it('sends an error', () => {
			const con = createMockConnection();
			const action = {
				type: 'test',
				payload: {
					data: 'payload'
				}
			};
			const payload = {
				message: 'message'
			};
			const expected = {
				type: 'test-error',
				payload: {
					...payload,
					source: action
				}
			};
			sendError(con, action, payload);
			assert.strictEqual(con.client.send.callCount, 1);
			assert.strictEqual(con.client.send.lastCall.args[0], JSON.stringify(expected));
		});
	});

	describe('sendResponse', () => {
		it('sends a serialized response', () => {
			const con = createMockConnection();
			const action = {
				type: 'test',
				payload: {}
			};
			sendResponse(con, action);
			assert.strictEqual(con.client.send.callCount, 1);
			assert.strictEqual(con.client.send.lastCall.args[0], JSON.stringify(action));
		});

		it('sends a response to all connections', () => {
			const connections = [createMockConnection(), createMockConnection()];
			const action = {
				type: 'test',
				payload: {}
			};
			sendResponse(connections, action);
			for (let con of connections) {
				assert.strictEqual(con.client.send.callCount, 1);
				assert.strictEqual(con.client.send.lastCall.args[0], JSON.stringify(action));
			}
		});
	});

	describe('actionService', () => {
		it('creates a service', () => {
			const service = actionService({
				handlers: []
			});

			assert.isDefined(service.upgrade.upgrade);
		});

		describe('onMessage', () => {
			const methods = {};
			const action = { type: 'test', payload: {} };
			const con = createMockConnection();

			function setup(props: ActionServiceProperties) {
				actionService(props);

				assert.strictEqual(realtimeUpgradeMock.callCount, 1);
				const { onMessage } = realtimeUpgradeMock.lastCall.args[0];
				return onMessage;
			}

			it('deserializes strings', () => {
				const defaultHandler = sinon.stub();
				const onMessage = setup({
					handlers: [],
					defaultHandler
				});

				onMessage(JSON.stringify(action), con, methods);

				assert.strictEqual(defaultHandler.callCount, 1);
				assert.deepEqual(defaultHandler.lastCall.args, [action, con, methods]);
			});

			it('ignores data that is not an action', () => {
				const defaultHandler = sinon.stub();
				const onMessage = setup({
					handlers: [],
					defaultHandler
				});

				onMessage('"i am not an action"', con, methods);

				assert.strictEqual(defaultHandler.callCount, 0);
			});

			it('maps an action to a handler', () => {
				const defaultHandler = sinon.stub();
				const handler = sinon.stub();
				const onMessage = setup({
					handlers: [
						{
							type: action.type,
							handler
						}
					],
					defaultHandler
				});

				onMessage(JSON.stringify(action), con, methods);

				assert.strictEqual(defaultHandler.callCount, 0);
				assert.strictEqual(handler.callCount, 1);
				assert.deepEqual(handler.lastCall.args, [action, con, methods]);
			});

			it('will ignore an action if there is no handler', () => {
				const handler = sinon.stub();
				const onMessage = setup({
					handlers: [
						{
							type: 'not a matching type',
							handler
						}
					]
				});

				onMessage(JSON.stringify(action), con, methods);

				assert.strictEqual(handler.callCount, 0);
			});
		});
	});
});
