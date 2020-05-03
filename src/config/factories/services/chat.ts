import { chatService, ChatServiceProperties } from '../../../middleware/services/chat.service';
import { ServiceFactory } from '../../interfaces';

export type ChatConfig = ChatServiceProperties;

export const chatServiceFactory: ServiceFactory<ChatConfig> = (config) => chatService(config);
