import { Upgrade, UpgradeMiddleware } from '../interface';

export type ErrorUpgradeHandler = (error: any) => void;

export function createUpgradeHandler(upgrade: Upgrade, errorHandler?: ErrorUpgradeHandler): UpgradeMiddleware {
	return async (request, socket, head) => {
		try {
			if (await upgrade.test(request)) {
				await upgrade.run(request, socket, head);
			}
		} catch (e) {
			if (errorHandler) {
				errorHandler(e);
			} else {
				throw e;
			}
		}
	};
}
