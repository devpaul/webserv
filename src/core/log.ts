import { Logger, LoggerInstance, transports } from 'winston';

/**
 * Global logger instance used with Winston
 */
export let log: LoggerInstance = new Logger({
	transports: [new transports.Console()]
});

/**
 * Change the global logger instance
 */
export function setLogger(logger: LoggerInstance) {
	log = logger;
}

/**
 * Sets the log level for all transports
 * @param level the log level
 */
export function setLogLevel(level: string) {
	for (let key in log.transports) {
		const transport = log.transports[key];
		transport.level = level;
	}
}
