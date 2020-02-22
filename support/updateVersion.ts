import { resolve } from 'path';
import { writeFileSync } from 'fs';

//
// This script prepares the release's package.json file release
//

const enum ARG {
	/** Prepare package.json for distro */
	DIST = '--dist'
}

const validArgs: string[] = [ARG.DIST];

function validateArgs() {
	const argv = process.argv;
	for (let i = 2; i < argv.length; i++) {
		if (validArgs.indexOf(argv[i]) === -1) {
			const message = `Unknown argument: "${argv[i]}"`;
			console.error(message);
			process.exitCode = 1;
			process.exit();
		}
	}
}

function hasArg(arg: string) {
	return process.argv.indexOf(arg) !== -1;
}

function updatePackageJson(packageJson: any) {
	const isDist = hasArg(ARG.DIST);
	const [version] = packageJson.version.split('-');
	const timestamp = Date.now();
	const nextVersion = isDist ? version : `${version}-next.${timestamp}`;
	packageJson.version = nextVersion;
	packageJson.buildTime = timestamp;
	console.log(`Set version to ${nextVersion}`);
}

validateArgs();

const packagePath = resolve(__dirname, '..', '_dist', 'package.json');
const packageJson = require(packagePath);

updatePackageJson(packageJson);

writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
