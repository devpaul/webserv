import { resolve } from 'path';
import { readDir } from '../../core/util/file/readDir';
import { readJsonFile } from '../../core/util/file/readFile';
import { crudService, CrudServiceProperties, Record } from '../../core/services/crud.service';
import { ServiceLoader } from '../loader';

export interface CrudConfig extends CrudServiceProperties {
	path: string;
	/** load crud data from disk */
	loadData?: {
		path: string;
	};
}

function createFileLoader(path: string) {
	function dataLoader(id: string): Promise<Record> | Record | undefined;
	function dataLoader(): Promise<Record[]> | Record[];
	function dataLoader(id?: string): Promise<Record | Record[]> | Record | Record[] | undefined {
		if (id) {
			const filePath = resolve(path, `${id}.json`);
			console.log(filePath);
			return readJsonFile<Record>(filePath).catch(() => undefined);
		}
		console.log(path);
		return readDir(path).then((files) =>
			Promise.all(
				files.filter((file) => file.endsWith('.json')).map((file) => readJsonFile<Record>(resolve(path, file)))
			)
		);
	}

	return dataLoader;
}

export const bootCrudService: ServiceLoader<CrudConfig> = (config, { configPath }) => {
	if (config.loadData) {
		const path = resolve(configPath, config.loadData.path);
		config.dataLoader = createFileLoader(path);
	}
	return crudService(config);
};
