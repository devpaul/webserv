export function updateRequest(request: any, params: { [key: string]: any }) {
	for (let [key, value] of Object.entries(params)) {
		request[key] = value;
	}
}

export function getParams<T extends {}>(request: any, ...keys: (keyof T)[]): T {
	const params: any = {};

	for (let key of keys) {
		params[key] = request[key];
	}

	return params;
}
