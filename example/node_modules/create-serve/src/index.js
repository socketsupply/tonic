import http from 'http';
import fs from 'fs';
import path from 'path';
import listen from './listen.js';
import {
	addClient,
	error,
	getFilePath,
	injectContent,
	log,
	mimeType,
	setRoot,
	show404,
	showError,
	showFile
} from './utils/index.js';

export let options = {
	port: 7000,
	root: '.',
	live: true
};

export const defaultRoot = './public';
export const encoding = 'utf-8';
export const eventSource = '/create-serve';
export const clients = [];

export const start = (startOptions = {}) => {
	Object.assign(options, startOptions);
	options.root = setRoot();

	const { live } = options;
	const server = http.createServer((request, response) => {
		if (live && request.url == eventSource) {
			const client = addClient(response);

			return clients.push(client);
		}

		const filePath = getFilePath(request);
		const extension = path.extname(filePath).toLowerCase().slice(1);
		const contentType = mimeType(extension) || 'application/octet-stream';
		const isHtml = contentType == 'text/html';
		const encode = isHtml ? 'utf8' : null;

		fs.readFile(filePath, encode, (error, content) => {
			if (error) {
				if (error.code == 'ENOENT') {
					return show404(response);
				}

				return showError(response, error);
			}

			if (live && isHtml) content = injectContent(content);

			return showFile(response, content, contentType);
		});
	});

	listen(server);
};

export const update = () => {
	clients.forEach(response => response.write('data: update\n\n'));
	clients.length = 0;
};

export { error, log };
export default { start, update };
