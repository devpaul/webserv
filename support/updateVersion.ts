import { resolve } from 'path';
import { writeFileSync } from 'fs';

const packagePath = resolve(__dirname, '..', '_dist', 'package.json');
const packageJson = require(packagePath);
const [version] = packageJson.version.split('-');
const timestamp = Date.now();
const nextVersion = `${version}-next.${timestamp}`;
packageJson.version = nextVersion;

writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
