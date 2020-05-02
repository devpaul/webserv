const injectorMap = new Map<string, Injector<any>>();

export function getInjector<T>(type: string): Injector<Factory<T>> | undefined {
	return injectorMap.get(type);
}

export function hasInjector(type: string) {
	return injectorMap.has(type);
}

export function createInjector<T>(type: string, initial?: [string, Factory<T, any>][]): Injector<T> {
	if (!injectorMap.has(type)) {
		injectorMap.set(type, new Injector(type, initial));
	}
	return injectorMap.get(type);
}

export type Factory<T, CONFIG extends object = object> = (config: CONFIG) => T;

export class Injector<T> {
	private factoryMap = new Map<string, Factory<T>>();

	constructor(private id: string, initial?: [string, Factory<T>][]) {
		if (initial) {
			for (let [name, factory] of initial) {
				this.register(name, factory);
			}
		}
	}

	get<C extends object = object>(name: string): Factory<T, C> {
		return this.factoryMap.get(name);
	}

	register(name: string, factory: Factory<T>) {
		if (this.factoryMap.has(name)) {
			throw new Error(`${name} already exists on the ${this.id} factory`);
		}
		this.factoryMap.set(name, factory);
	}
}
