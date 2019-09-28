import { createServer, ServerOptions } from 'https';
import { ServerConfig, startServer } from './startServer';
import { RequestListener } from 'http';
import { log } from '../log';
import { CertificateCreationOptions, CertificateCreationResult, createCertificate } from 'pem';

export interface HttpsConfig {
	httpsOptions?: ServerOptions;
	timeout?: number;
	onRequest: RequestListener;
}

export function createHttpsServer(config: HttpsConfig) {
	return async () => {
		const httpsOptions = config.httpsOptions || {};
		if (!httpsOptions.key || !httpsOptions.cert) {
			const { certificate, clientKey } = await buildCert();
			httpsOptions.key = clientKey;
			httpsOptions.cert = certificate;
		}
		const server = createServer(httpsOptions, config.onRequest);
		config.timeout && server.setTimeout(config.timeout);
		return server;
	}
}

export type StartHttpsConfig = Omit<ServerConfig, 'createServer'> & HttpsConfig;

export function startHttpsServer(config: StartHttpsConfig) {
	return startServer({
		... config,
		createServer: createHttpsServer(config)
	});
}

async function buildCert(
	pemOptions: CertificateCreationOptions = { days: 7, selfSigned: true }
): Promise<CertificateCreationResult> {
	log.info('Creating self-signed cert');

	return new Promise<CertificateCreationResult>((resolve, reject) => {
		createCertificate(pemOptions, (err, keys) => {
			if (err) {
				reject(err);
			} else {
				resolve(keys);
			}
		});
	});
}
