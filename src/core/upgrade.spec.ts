/// <reference types="intern" />
import { assert } from 'chai';
import { IncomingMessage } from 'http';
import { describe, it } from 'intern/lib/interfaces/bdd';
import { Socket } from 'net';
import { eventuallyRejects } from '../_support/assertions';
import { describeSuite } from '../_support/bdd';
import { setupSinon } from '../_support/mocks';
import { multiupgrade, upgrade } from './upgrade';

describeSuite(__filename, () => {
	const sinon = setupSinon();
	const request = {} as IncomingMessage;
	const socket = {} as Socket;
	const head = {} as Buffer;

	describe('multiupgrade', () => {
		it('upgrades descriptors', async () => {
			const upgrades = [
				{
					guards: [() => true, () => Promise.resolve(false)],
					upgrade: sinon.stub()
				},
				{
					upgrade: sinon.stub()
				}
			];
			const upgrade = multiupgrade(upgrades);

			assert.isFunction(upgrade);
			await upgrade(request, socket, head);
			assert.isFalse(upgrades[0].upgrade.called);
			assert.isTrue(upgrades[1].upgrade.called);
		});

		it(`doesn't upgrade when guard doesn't match`, async () => {
			const upgrades = [
				{
					guards: [() => false],
					upgrade: sinon.stub()
				}
			];
			const upgrader = multiupgrade(upgrades);

			await upgrader(request, socket, head);
			assert.isFalse(upgrades[0].upgrade.called);
		});
	});

	describe('upgrade', () => {
		describe('test', () => {
			it('returns true with zero guards', async () => {
				const upgrader = upgrade({
					guards: [],
					upgrade: sinon.stub()
				});

				assert.isTrue(await upgrader.test(request));
			});

			it('returns true with all true guards', async () => {
				const upgrader = upgrade({
					guards: [() => true, () => true],
					upgrade: sinon.stub()
				});

				assert.isTrue(await upgrader.test(request));
			});

			it('returns false with one false guard', async () => {
				const upgrader = upgrade({
					guards: [() => true, () => false],
					upgrade: sinon.stub()
				});

				assert.isFalse(await upgrader.test(request));
			});

			it('returns true with all eventually true guards', async () => {
				const upgrader = upgrade({
					guards: [() => true, () => Promise.resolve(true)],
					upgrade: sinon.stub()
				});

				assert.isTrue(await upgrader.test(request));
			});

			it('returns false with one eventually false guard', async () => {
				const upgrader = upgrade({
					guards: [() => true, () => Promise.resolve(false)],
					upgrade: sinon.stub()
				});

				assert.isFalse(await upgrader.test(request));
			});

			describe('error handling', () => {
				it('throws when there is no error handler', async () => {
					const upgrader = upgrade({
						guards: [
							() => {
								throw new Error();
							}
						],
						upgrade: () => {}
					});

					await eventuallyRejects(upgrader.test(request));
				});

				it('hands exceptions to the error handler', async () => {
					const errorHandler = sinon.stub();
					const upgrader = upgrade({
						guards: [
							() => {
								throw new Error();
							}
						],
						upgrade: () => {},
						errorHandler
					});

					const result = await upgrader.test(request);

					assert.isFalse(result);
					assert.strictEqual(errorHandler.callCount, 1);
				});
			});
		});
	});

	describe('run', () => {
		it('single upgrade', async () => {
			const mock = sinon.stub();
			const upgrader = upgrade({ upgrade: mock });

			await upgrader.run(request, socket, head);

			assert.strictEqual(mock.callCount, 1);
		});

		it('multiupgrades an array', async () => {
			const mocks = [sinon.stub(), sinon.stub()];
			const upgrader = upgrade({
				upgrade: [{ guards: [() => false], upgrade: mocks[0] }, { upgrade: mocks[1] }]
			});

			await upgrader.run(request, socket, head);

			assert.isFalse(mocks[0].called);
			assert.isTrue(mocks[1].called);
		});

		describe('error handling', () => {
			it('throws when there is no error handler', async () => {
				const upgrader = upgrade({
					upgrade: () => {
						throw new Error();
					}
				});

				await eventuallyRejects(upgrader.run(request, socket, head));
			});

			it(`doesn't throw when there is an error handler`, async () => {
				const errorHandler = sinon.stub();
				const upgrader = upgrade({
					upgrade: () => {
						throw new Error();
					},
					errorHandler
				});

				await upgrader.run(request, socket, head);

				assert.strictEqual(errorHandler.callCount, 1);
			});
		});
	});
});
