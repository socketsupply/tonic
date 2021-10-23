import { styles } from './index.js';

export const log = (message, color = styles.green) =>
	console.log(color + message + styles.reset);
