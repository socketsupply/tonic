export const showError = (response, error) => {
	response.writeHead(500);
	response.end(`Error ${error.code}\n`);
};
