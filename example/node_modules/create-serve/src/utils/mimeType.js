import mimeTypes from '../mimeTypes.js';

export const mimeType = extension =>
	Object.keys(mimeTypes).find(key => mimeTypes[key].includes(extension));
