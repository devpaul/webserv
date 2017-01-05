import { Handler } from '../handlers/handler';
import { IncomingMessage, ServerResponse } from 'http';
import { Response } from './Handler';

export interface FilterFunction {
	(request: IncomingMessage): boolean;
}

export declare type Filter = string | RegExp | FilterFunction;

export declare type FilterRules = Filter | Filter[];

function createStringFilter(filter: string): FilterFunction {
	filter;
	return function (request: IncomingMessage) {
		request;
		// TODO add string-based filtering
		return true;
	}
}

function createRegexpFilter(filter: RegExp): FilterFunction {
	filter;
	return function (request: IncomingMessage) {
		request;
		// TODO add regexp-based filtering
		return true;
	}
}

function createArrayFilter(filter: Filter[]): FilterFunction {
	const filters = filter.map(function (filter: Filter) {
		return createFilterFunction(filter);
	});

	return function (request: IncomingMessage) {
		return filters.every(function (filter: FilterFunction) {
			return filter(request);
		});
	}
}

function createFilterFunction(value: FilterRules): FilterFunction {
	if (typeof value === 'string') {
		return createStringFilter(value);
	}
	else if (value instanceof RegExp) {
		return createRegexpFilter(value);
	}
	else if (Array.isArray(value)) {
		return createArrayFilter(value);
	}
	else if (typeof value === 'function') {
		return <FilterFunction> value;
	}

	return function () {
		return true;
	}
}

function createMethodFilter(method: string) {
	return function (filter: Filter, handler: Handler) {
		const filterFunction = createFilterFunction(filter);
		const combinedFilters = function (request: IncomingMessage) {
			if (request.method.toLowerCase() !== method) {
				return false;
			}

			return filterFunction(request);
		};

		return new Route(combinedFilters, handler);
	}
}

export const get = createMethodFilter('get');

export const post = createMethodFilter('post');

export const del = createMethodFilter('delete');

export const put = createMethodFilter('put');

export function method(method: string, filter: Filter, handler: Handler) {
	const methodFilter = createMethodFilter(method);
	return methodFilter(filter, handler);
}

/**
 * A route is simply a piece of middleware that has a filter condition attached
 */
export default class Route implements Handler {
	readonly name: string;

	private _filter: FilterRules;

	private _filterFunction: FilterFunction;

	private _handler: Handler;

	constructor(filter: FilterRules, handler: Handler, name: string = 'route') {
		this.name = name;
		this.filter = filter;
		this._handler = handler;
	}

	get filter() {
		return this._filter;
	}

	set filter(value: FilterRules) {
		this._filter = value;
		this._filterFunction = createFilterFunction(value);
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<Response> {
		if (this._filterFunction(request)) {
			return this._handler.handle(request, response);
		}

		return Promise.resolve();
	}
}
