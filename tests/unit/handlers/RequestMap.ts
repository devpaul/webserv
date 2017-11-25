import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import { stub } from 'sinon';
import RequestMap from '../../../src/handlers/RequestMap';
import { createMockRequest, createMockResponse } from '../_support/mocks';

registerSuite('src/handlers/map', {
	tests: {
		handle: {
			'matching condition; executes handler'() {
				const handler = stub();
				const map = new RequestMap({
					map: new Map([
						[ 'condition', handler ]
					]),
					mapper() {
						return [ 'condition' ];
					}
				});
				map.handle(createMockRequest(), createMockResponse());
				assert.isTrue(handler.calledOnce);
			},

			'missing condition; returns void'() {
				const handler = stub();
				const map = new RequestMap({
					map: new Map([
						[ 'condition', handler ]
					]),
					mapper() {
						return [ ];
					}
				});
				map.handle(createMockRequest(), createMockResponse());
				assert.isFalse(handler.called);
			},

			'missing condition with default handler'() {
				const defaultHandler = stub();
				const handler = stub();
				const map = new RequestMap({
					defaultHandler,
					map: new Map([
						[ 'condition', handler ]
					]),
					mapper() {
						return [ ];
					}
				});
				map.handle(createMockRequest(), createMockResponse());
				assert.isFalse(handler.called);
				assert.isTrue(defaultHandler.calledOnce);
			}
		}
	}
});
