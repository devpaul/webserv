import { App } from '../../core/app';
import { ChatServiceProperties, chatService } from '../../core/services/chat.service';

export function bootChatService(app: App, config: ChatServiceProperties) {
	app.addService(chatService(config));
}
