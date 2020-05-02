import { chatService, ChatServiceProperties } from '../../../core/services/chat.service';
import { ServiceFactory } from '../../interfaces';

export type ChatConfig = ChatServiceProperties;

export const chatServiceFactory: ServiceFactory<ChatConfig> = (config) => chatService(config);
