if (!Symbol.asyncIterator) {
	(<any> Symbol).asyncIterator = Symbol();
}

if (!Object.entries) {
	Object.entries = function<T = any> (obj: { [ key: string ]: T }): [string, T][] {
		const keys = Object.keys(obj);

		return keys.map<[ string, T ]>(key => [ key, obj[key] ]);
	};
}
