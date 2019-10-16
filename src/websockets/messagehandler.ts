export interface MessageHandler {
	test(socketId: string, data: any): Promise<boolean> | boolean;
	run(socketId: string, data: any): Promise<void> | void;
}
