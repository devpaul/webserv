/// <reference types="intern" />
import { describe, it } from 'intern/lib/interfaces/bdd';
import { assert } from 'chai';

import { describeSuite } from '../../_support/bdd';
import { setupSinon } from '../../_support/mocks';
import { multiupgrade, upgrade } from './upgrade';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { eventuallyRejects } from '../../_support/assertions';

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
			const upgrade = multiupgrade({
				upgrades
			});

			assert.isFunction(upgrade);
			await upgrade(request, socket, head);
			assert.isFalse(upgrades[0].upgrade.called);
			assert.isTrue(upgrades[1].upgrade.called);
		});

		it('throws a HttpError when an upgrade is not available', () => {
			const upgrader = multiupgrade({ upgrades: [] });

			return eventuallyRejects(Promise.resolve(upgrader(request, socket, head)));
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
		});

		describe('run', () => {
			it('multiupgrades an array', async () => {
				const mocks = [sinon.stub(), sinon.stub()];
				const upgrader = upgrade({
					upgrade: [{ guards: [() => false], upgrade: mocks[0] }, { upgrade: mocks[1] }]
				});

				await upgrader.run(request, socket, head);

				assert.isFalse(mocks[0].called);
				assert.isTrue(mocks[1].called);
			});

			it('passes through an upgrade', () => {
				const mock = sinon.stub();
				const upgrader = upgrade({ upgrade: mock });
				assert.strictEqual(upgrader.run, mock);
			});
		});
	});
});
