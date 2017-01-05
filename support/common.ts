import { join } from 'path';

/*
 * Common variables shared between modules
 */

export const rootDirectory = join(__dirname, '..');

export const binDirectory = join(rootDirectory, 'node_modules', '.bin');

export const distDirectory = join(rootDirectory, '_dist');
