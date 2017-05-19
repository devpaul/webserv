import { Logger, LoggerInstance, transports } from 'winston';

/**
 * Global logger instance used with Winston
 */
export let log: LoggerInstance = new Logger({
	transports: [
		new transports.Console()
	]
});

/**
 * Change the global logger instance
 */
export function setLogger(logger: LoggerInstance) {
	log = logger;
}
