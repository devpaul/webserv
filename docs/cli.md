# webserv cli

webserv includes a simple binary file that will create a server from the command line or npm.

## command line usage

To use `webserv` at the command line you will need to install it globally

```bash
npm install webserv -g
```

You can then start a server from the current directory by typing

```bash
webserv
```

## npm usage

npm scripts in `package.json` automatically use locally installed binaries from your `node_modules/.bin` directory.
 To start a server from npm update:
 
1. install webserv in your project (`npm i webserv --save-dev`)
1. update `package.json` with 
 ```
 	"scripts": {
 		"serve": "webserv"
 	}
 ```
3. from the command line run `npm run serve` 
