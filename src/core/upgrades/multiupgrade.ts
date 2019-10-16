import { Upgrade } from "./upgrade";
import { UpgraderFactory } from "../interface";
import { HttpError, HttpStatus } from "../HttpError";

export interface MultiupgradeProperties {
	upgrades: Upgrade[];
}

export const multiupgrade: UpgraderFactory<MultiupgradeProperties> = ({ upgrades }) => {
	return async (request, socket, head) => {
		for (let upgrade of upgrades) {
			if (await upgrade.test(request)) {
				return await upgrade.upgrader(request, socket, head);
			}
		}
		// TODO May need to translate this into Socket-style errors and close socket
		throw new HttpError(HttpStatus.NotFound);
	}
}
