/// <reference types="intern" />

import { IncomingMessage } from 'http';
import { Guard } from '../../core/interface';
import { every, some } from './logic';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

const failingGuard: Guard = () => false;
const passingGuard: Guard = () => true;
const request: IncomingMessage = {} as any;

describe('core/guards/logic', () => {
	describe('some', () => {
		describe('no guards', () => {
			it('returns false', () => {
				const guard = some({ guards: [] });
				assert.isFalse(guard(request));
			});
		});

		describe('all guards pass', () => {
			it('returns true', () => {
				const guard = some({ guards: [passingGuard, passingGuard] });
				assert.isTrue(guard(request));
			});
		});

		describe('one guard of many fails', () => {
			it('returns true', () => {
				const guard = some({ guards: [passingGuard, passingGuard, failingGuard] });
				assert.isTrue(guard(request));
			});
		});

		describe('one guard of many pass', () => {
			it('returns true', () => {
				const guard = some({ guards: [failingGuard, passingGuard, failingGuard] });
				assert.isTrue(guard(request));
			});
		});

		describe('all guards fail', () => {
			it('returns false', () => {
				const guard = some({ guards: [failingGuard, failingGuard, failingGuard] });
				assert.isFalse(guard(request));
			});
		});
	});

	describe('every', () => {
		describe('no guards', () => {
			it('returns true', () => {
				const guard = every({ guards: [] });
				assert.isTrue(guard(request));
			});
		});

		describe('all guards pass', () => {
			it('returns true', () => {
				const guard = every({ guards: [passingGuard, passingGuard] });
				assert.isTrue(guard(request));
			});
		});

		describe('one guard of many fails', () => {
			it('returns false', () => {
				const guard = every({ guards: [passingGuard, passingGuard, failingGuard] });
				assert.isFalse(guard(request));
			});
		});

		describe('all guards fail', () => {
			it('returns false', () => {
				const guard = every({ guards: [failingGuard, failingGuard] });
				assert.isFalse(guard(request));
			});
		});
	});
});
