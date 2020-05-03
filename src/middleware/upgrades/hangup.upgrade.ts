import { UpgradeListener } from '../../core/interface';

/**
 * Immediately hangs up the socket
 */
export const hangupUpgrade: UpgradeListener = (_request, socket) => {
	socket.end();
};
