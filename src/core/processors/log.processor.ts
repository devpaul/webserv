import { ProcessFactory } from '../interface';
import { NPMLoggingLevel } from 'winston';
import { log as consoleLog } from '../log';
import { getParams } from '../util/request';

export interface LogProperties {
	level?: NPMLoggingLevel;
	logBody?: boolean;
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
};

export const logResponse: ProcessFactory<LogResponseProperties> = ({ level = 'info', logIncomplete = false }) => {
	return (request, response) => {
		if (response.finished || logIncomplete) {
			consoleLog[level](`[${request.method} ${response.finished ? response.statusCode : 'Not finished'}]`);
		}
	};
};

export const logRequest: ProcessFactory<LogProperties> = ({ level = 'info', logBody = false }) => {
	return (request) => {
		const { method, url } = request;
		consoleLog[level](`[${method}] ${url}`);

		if (logBody && method !== 'GET') {
			const { body } = getParams(request, 'body');
			body && consoleLog[level](`body: ${JSON.stringify(body)}`);
		}
	};
};
