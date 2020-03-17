import { chatService, ChatServiceProperties } from '../../core/services/chat.service';
import { SimpleServiceLoader } from '../loader';

export const bootChatService: SimpleServiceLoader<ChatServiceProperties> = (config) => chatService(config);
