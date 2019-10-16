export interface MessageDispatcher {
	test(): Promise<boolean> | boolean;
	run(): Promise<void> | void;
}
