# Webserv

[![Build Status](https://travis-ci.org/devpaul/webserv.svg?branch=master)](https://travis-ci.org/devpaul/webserv)
[![Windows build status](https://ci.appveyor.com/api/projects/status/pwxbf43ctu05uxn8?svg=true)](https://ci.appveyor.com/project/devpaul/webserv)
[![codecov.io](https://codecov.io/github/devpaul/webserv/coverage.svg?branch=master)](https://codecov.io/github/devpaul/webserv?branch=master)
[![npm version](https://badge.fury.io/js/webserv.svg)](https://badge.fury.io/js/webserv)

Programatic API for creating front-end webservers to support development. Webserv was built to provide a complete
	and simple way for front-end engineers develop decoupled from the backend.
	
## Features

* Fully typed API
* Configuration driven
* Command line interface
* Grunt support

## Middleware Included

Webserv comes with [middleware](https://github.com/devpaul/webserv/tree/master/src/middleware) to make it easy to add standard server functionality. 

* Serve Directory
* Serve File
* Upload Files
* HTTP Headers
	* Cors Support
	* No Cache
* HTTP Responses
	* 301 Forwarding
	* 404 Not Found
* Logging
* Proxying

## Usage

## Configuration

Most common usage can be handled with the [createServer]() command. It accepts an options object and returns a `Promise`
that provides a reference to the created server. More working examples can be found in the 
[examples](https://github.com/devpaul/webserv/tree/master/examples) directory.

```typescript
import createServer, { ServerType } from 'webserv/commands/createServer';
import { noCache } from 'webserv/middleware/SetHeaders';


createServer({
	// global debug level for webserv
	debugLevel: 'debug',
	// serve files from this directory
	directory: process.cwd(),
	// additional middleware to handle requests
	middleware: [ 
   		noCache(),
	],
	// listen on this port (default 8888)
	port: 9999,
	// immediately start the server after its created
	start: true,
	// the type of server to create (http or https)
	type: ServerType.HTTPS
});
```

## Programmatic

Programmatic usage is useful when describing the routes, filters, and transforms that direct requests to your 
middleware. Let's start a new server that servers files from a directory and proxies requests through to a parent 
server.

```typescript
import HttpServer from 'webserv/HttpServer';
import ServePath from 'webserv/middleware/ServePath';
import Proxy from 'webserv/middleware/Proxy';
import WebApplication from 'webserv/WebApplication';
import route from 'webserv/handlers/route';

const server = new HttpServer({ port: 7777 }, new WebApplication());
server.app.middleware.add([
	route('/dist(.*)').wrap(new ServePath('./_dist')),
	new Proxy('https://devpaul.com')
]);
server.start()
	.then(function () {
		console.log(`started server on ${ server.config.port }`);
	})
```

## Grunt

Webserv's grunt usage simply passes options directly to `createServer`.

```javascript
{
	webserv: {
		options: {
			port: number, // defaults to 8888
			directory: string // if present, host the directory
			middleware: Handler[] // array of middleware
		}
	}
}
```

## Command Line

WebServ offers a very basic command-line usage at this time. Simply install webserv globally (`npm i webserv -g`)
and type `webserv` on the command line to serve files and directories from your current directory.

## Examples

Example usage is available in the [examples](https://github.com/devpaul/webserv/tree/master/examples) directory. Run 
them using `ts-node` or via `package.json` scripts.
