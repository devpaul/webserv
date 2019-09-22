export function htmlTemplate(body: string, title: string = '') {
	return `
<html>
<head>
	<title>${title}</title>
</head>
<body>
	${body}
</form>
</body>
</html>
`;
}
