import { Service } from '../app';
import { realtimeService, RealtimeServiceProperties } from '../upgrades/realtime.upgrade';
import { Guard } from '../interface';

export interface ChatServiceProperties extends RealtimeServiceProperties {
	guards?: Guard[];
}

export const echoMessage: RealtimeServiceProperties['onMessage'] = (data, con, connections) => {
	const socketId = con.id;
	for (let target of connections) {
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
			upgrade: realtimeService({
				onMessage: echoMessage,
				...props
			})
		}
	};
}
