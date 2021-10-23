import fs from 'fs';
import { options, defaultRoot } from '../index.js';

export const setRoot = () => {
	const { root } = options;
	const isRoot = !root || root == '.';

	return isRoot && fs.existsSync(defaultRoot) ? defaultRoot : root;
};
