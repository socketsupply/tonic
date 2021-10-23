import injectCode from '../injectCode.js';

export const injectContent = content => {
	const index = content.indexOf('</body>');
	const start = content.slice(0, index);
	const end = content.slice(index);

	return start + injectCode() + end;
};
