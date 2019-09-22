import { log } from '../log';
import { CertificateCreationOptions, CertificateCreationResult, createCertificate } from 'pem';

export default async function buildCert(
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
