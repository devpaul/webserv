import { IncomingMessage } from 'http';
import { Guard, Upgrader } from '../interface';
import { multiupgrade } from './multiupgrade';

export interface UpgradeProperties {
	guards?: Guard[];
	upgrade: Upgrader | Upgrade[];
}

export interface Upgrade {
	test(request: IncomingMessage): Promise<boolean> | boolean;
	upgrader: Upgrader;
}

export type UpgradeFactory = (options: UpgradeProperties) => Upgrade;

export const upgrade: UpgradeFactory = ({ guards = [], upgrade }) => {
	const upgrader = Array.isArray(upgrade) ? multiupgrade({ upgrades: upgrade }) : upgrade;

	async function test(request: IncomingMessage) {
		return guards.every((guard) => guard(request));
	}

	return {
		test,
		upgrader
	};
}
