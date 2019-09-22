export interface Config {
	servers: Server[];
}

export interface Server {
	name: string;
	httpsOptions?: {
		key: string;
	};
	mode?: 'http' | 'https';
	port?: number;
}

export interface Route {
	path?: string;
	type: 'get' | 'post' | 'delete' | 'put';
	middleware: any;
}
