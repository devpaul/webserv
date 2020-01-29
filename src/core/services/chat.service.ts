import { Service } from '../app';
import { realtimeUpgrade, RealtimeUpgradeProperties } from '../upgrades/realtime.upgrade';
import { Guard } from '../interface';

export interface ChatServiceProperties extends RealtimeUpgradeProperties {
	guards?: Guard[];
}

export const echoMessage: RealtimeUpgradeProperties['onMessage'] = (data, con, { getAll }) => {
	const socketId = con.id;
	for (let target of getAll()) {
		if (target.id !== socketId) {
			target.client.send(data);
		}
	}
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function chatService(props: ChatServiceProperties): Service {
	return {
		upgrade: {
			guards: props.guards ?? [],
			upgrade: realtimeUpgrade({
				onMessage: echoMessage,
				...props
			})
		}
	};
}
