# Webserv

[![Build Status](https://travis-ci.org/devpaul/webserv.svg?branch=master)](https://travis-ci.org/devpaul/webserv)
[![codecov.io](https://codecov.io/github/devpaul/webserv/coverage.svg?branch=master)](https://codecov.io/github/devpaul/webserv?branch=master)
[![npm version](https://badge.fury.io/js/webserv.svg)](https://badge.fury.io/js/webserv)

Programatic API for creating front-end webservers to support development. Webserv was built to provide a complete
	and simple way for front-end engineers develop decoupled from the backend.
	
## Features

* Fully typed API
* Command line interface
* Grunt support

## Usage

## Programmatic

Let's start a new server that servers files from a directory and proxies requests through to a parent server

```javascript
import WebServer from 'webserv/WebServer';
import ServeFile from 'webserv/middleware/ServeFile';
import ServeDirectory from 'webserv/middleware/ServeDirectory';
import Proxy from 'webserv/middleware/Proxy';
import Group from 'webserv/handlers/Group';
import WebApplication from 'webserv/WebApplication';

const server = new WebServer();
const group: Group = <Group> (<WebApplication> server.app).middleware;
group.add(new ServeFile('./_dist'));
group.add(new ServeDirectory('./_dist'));
group.add(new Proxy('https://devpaul.com'));
server.start()
	.then(function () {
		console.log(`started server on ${ server.config.port }`);
	})
```

## Grunt

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
