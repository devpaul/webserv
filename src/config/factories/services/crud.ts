import { resolve } from 'path';
import { RequireSome } from '../../../core/interface';
import { crudService, CrudServiceProperties, Record } from '../../../core/services/crud.service';
import { readDir } from '../../../core/util/file/readDir';
import { readJsonFile } from '../../../core/util/file/readFile';
import { ServiceFactory } from '../../interfaces';
import { $Env, Environment } from '../../utils/environment';

export interface CrudConfig extends RequireSome<CrudServiceProperties, 'route'> {
	/** load crud data from disk */
	loadData?: {
		path: string;
	};
	[$Env]: Environment;
}

function createFileLoader(path: string) {
	function dataLoader(id: string): Promise<Record> | Record | undefined;
	function dataLoader(): Promise<Record[]> | Record[];
	function dataLoader(id?: string): Promise<Record | Record[]> | Record | Record[] | undefined {
		if (id) {
			const filePath = resolve(path, `${id}.json`);
			return readJsonFile<Record>(filePath).catch(() => undefined);
		}
		return readDir(path).then((files) =>
			Promise.all(
				files.filter((file) => file.endsWith('.json')).map((file) => readJsonFile<Record>(resolve(path, file)))
			)
		);
	}

	return dataLoader;
}

export const crudServiceFactory: ServiceFactory<CrudConfig> = (config) => {
	if (config.loadData) {
		const path = resolve(config[$Env].configPath, config.loadData.path);
		config.dataLoader = createFileLoader(path);
	}
	return crudService(config);
};
