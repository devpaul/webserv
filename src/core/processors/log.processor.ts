import { ProcessFactory } from "../interface";
import { NPMLoggingLevel } from "winston";
import { log as consoleLog } from '../log';

export interface LogProperties {
	level?: NPMLoggingLevel;
}

export interface LogResponseProperties extends LogProperties {
	logIncomplete?: boolean;
}

export const log: ProcessFactory<LogResponseProperties> = (options) => {
	const requestLogger = logRequest(options);
	const responseLogger = logResponse(options);

	return (request, response) => {
		requestLogger(request, response);
		responseLogger(request, response);
	};
}

export const logResponse: ProcessFactory<LogResponseProperties> = ({ level = 'info', logIncomplete = false }) => {
	return (request, response) => {
		if (response.finished || logIncomplete) {
			consoleLog[level](`[${request.method} ${response.finished ? response.statusCode : 'Not finished' }]`);
		}
	}
}

export const logRequest: ProcessFactory<LogProperties> = ({ level = 'info' }) => {
	return (request, response) => {
		consoleLog[level](`[${request.method}] ${request.url}`);
	}
}
