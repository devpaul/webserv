export function eventuallyRejects(value: any) {
	return Promise.resolve(value).then(
		() => {
			throw new Error('expected reject');
		},
		(err: any) => {
			return err;
		}
	);
}
