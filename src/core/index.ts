import { createRequestHandler } from './app';
import { headerGuard } from './guards/headers';
import { every, some } from './guards/logic';
import { method, methodGuard } from './guards/method';
import { pathGuard } from './guards/path';
import { forwarder } from './middleware/forwarder';
import { notFound } from './middleware/notFound';
import { proxy } from './middleware/proxy';
import { response } from './middleware/response';
import { saveFiles } from './middleware/saveFiles';
import { serve } from './middleware/serve';
import { subroute } from './middleware/subroute';
import { body } from './processors/body.processor';
import { cache, noCache } from './processors/cache.processor';
import { cors } from './processors/cors.processor';
import { fileProcessor } from './processors/file.processor';
import { header } from './processors/header.processor';
import { log } from './processors/log.processor';
import { crudRoute } from './routes/crud.route';
import { fileBrowser } from './routes/fileBrowser.route';
import { proxyRoute } from './routes/proxy.route';
import { route } from './routes/route';
import { uploadRoute } from './routes/upload.route';
import { startHttpServer } from './servers/createHttpServer';
import { startHttpsServer } from './servers/createHttpsServer';
import { acceptTransform } from './transforms/accept.transform';
import { jsonTransform } from './transforms/json.transform';
import { textTransform } from './transforms/text.transform';
import { proxyUpgrade } from './upgrades/proxy.upgrade';
import { contentNegotiator } from './util/contentNegotiator';
import { createProxy } from './util/createProxy';

export const guards = {
	every: every,
	header: headerGuard,
	method: methodGuard,
	path: pathGuard,
	some: some,
	... method
};

export const middleware = {
	forwarder: forwarder,
	notFound: notFound,
	proxy: proxy,
	response: response,
	saveFiles: saveFiles,
	serve: serve,
	subroute: subroute
};

export const processors = {
	body: body,
	cache: cache,
	cors: cors,
	file: fileProcessor,
	header: header,
	log: log,
	noCache: noCache
}

export const routes = {
	crud: crudRoute,
	fileBrowser: fileBrowser,
	proxy: proxyRoute,
	route: route,
	upload: uploadRoute
};

export const servers = {
	http: startHttpServer,
	https: startHttpsServer
}

export const transforms = {
	accept: acceptTransform,
	json: jsonTransform,
	text: textTransform
}

export const upgrades = {
	proxy: proxyUpgrade
};

export const util = {
	contentNegotiator: contentNegotiator,
	createProxy: createProxy,
	createRequest: createRequestHandler
}
