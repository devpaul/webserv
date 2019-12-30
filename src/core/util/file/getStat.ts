import { stat, Stats } from 'fs';

export function getStat(target: string): Promise<Stats> {
	return new Promise((resolve, reject) => {
		stat(target, (err, stats) => {
			err ? reject(err) : resolve(stats);
		});
	});
}
