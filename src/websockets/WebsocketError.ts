export class WebsocketError {
	constructor(public readonly socketId: string, public readonly message?: string) {}
}
