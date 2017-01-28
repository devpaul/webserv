import { Logger, LoggerInstance, transports } from 'winston';

export let log: LoggerInstance = new Logger({
	transports: [
		new transports.Console()
	]
});

export function setLogger(logger: LoggerInstance) {
	log = logger;
}
