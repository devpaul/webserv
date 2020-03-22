import { IncomingMessage } from 'http';
import { Upgrade, UpgradeDescriptor, UpgradeListener } from './interface';

export type UpgradeFactory = (options: UpgradeDescriptor) => Upgrade;

function isUpgrade(value: any): value is Upgrade {
	return value && typeof value === 'object' && typeof value.run === 'function' && typeof value.test === 'function';
}

export const upgrade: UpgradeFactory = ({ guards = [], upgrade, errorHandler }) => {
	const handler = Array.isArray(upgrade) ? multiupgrade(upgrade) : upgrade;

	async function test(request: IncomingMessage) {
		try {
			for (let guard of guards) {
				if (!(await guard(request))) {
					return false;
				}
			}
			return true;
		} catch (e) {
			if (errorHandler) {
				errorHandler(e);
				return false;
			}
			throw e;
		}
	}

	const run: UpgradeListener = async (request, socket, head) => {
		try {
			return await handler(request, socket, head);
		} catch (e) {
			if (errorHandler) {
				errorHandler(e);
			} else {
				throw e;
			}
		}
	};

	return {
		run,
		test
	};
};

export const multiupgrade = (list: Array<Upgrade | UpgradeDescriptor>): UpgradeListener => {
	const upgrades = list.map((item) => (isUpgrade(item) ? item : upgrade(item)));
	return async (request, socket, head) => {
		for (let upgrade of upgrades) {
			if (await upgrade.test(request)) {
				return await upgrade.run(request, socket, head);
			}
		}
	};
};
