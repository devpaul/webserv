import { IncomingMessage } from 'http';
import { UpgradeDescriptor, UpgradeMiddlewareFactory, Upgrade } from '../interface';
import { HttpError, HttpStatus } from '../HttpError';

export type UpgradeFactory = (options: UpgradeDescriptor) => Upgrade;

export interface MultiupgradeProperties {
	upgrades: Array<Upgrade | UpgradeDescriptor>;
}

function isUpgrade(value: any): value is Upgrade {
	return value && typeof value === 'object' && typeof value.run === 'function' && typeof value.test === 'function';
}

export const multiupgrade: UpgradeMiddlewareFactory<MultiupgradeProperties> = (props) => {
	const upgrades = props.upgrades.map((prop) => (isUpgrade(prop) ? prop : upgrade(prop)));
	return async (request, socket, head) => {
		for (let upgrade of upgrades) {
			if (await upgrade.test(request)) {
				return await upgrade.run(request, socket, head);
			}
		}
		// TODO May need to translate this into Socket-style errors and close socket
		throw new HttpError(HttpStatus.NotFound);
	};
};

export const upgrade: UpgradeFactory = ({ guards = [], upgrade }) => {
	const run = Array.isArray(upgrade) ? multiupgrade({ upgrades: upgrade }) : upgrade;

	async function test(request: IncomingMessage) {
		for (let guard of guards) {
			if (!(await guard(request))) {
				return false;
			}
		}
		return true;
	}

	return {
		test,
		run
	};
};
