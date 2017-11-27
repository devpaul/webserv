import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import { htmlTemplate } from 'src/util/templates';

registerSuite('src/util/templates', {
	htmlTemplate: {
		'body only'() {
			const html = htmlTemplate('expected body');
			assert.include(html, 'expected body');
		},

		'with title'() {
			const html = htmlTemplate('expected body', 'expected title');
			assert.include(html, 'expected body');
			assert.include(html, 'expected title');
		}
	}
});
