# Webserv Core

Programatic API for creating front-end webservers to support development. Webserv was built to provide a complete
	and simple way for front-end engineers develop decoupled from the backend.

## Configuration Commands

### middleware()

`.middleware(handler)`

* handler :`function (req, res)` - handler for the request

### route()

`.route(routeMatcher)`

## Route Methods

### all()
### filter()
### delete()
### get()
### post()
### put()

## Request Actions

### cors

Add CORS headers to a response and premtively approve pre-flights

### latency

Delay an outgoing request to inject latency

### log

Log outgoing requests

### proxy

proxy an outgoing request to an external server

### serve

serve a file or directory from the local filesystem

### template

respond with a templated action

## Response Actions

### log

Log incomming responses

### cacheControl

Always set Cache-Control headers to `no-cache` (configurable)

## WebServ Commands

### start()

Starts a web server on the specified port

`.start(port, options)`

* port :number - the port number to open the server
* options
	* type :string - http or https
	* key :string | Buffer - https key
	* cert :string | Buffer - https cert
* Returns :WebServCommands


### adminConsole()
###!!!TODO move this into a middleware module
`.adminConsole(port, options)`

Enable connections to WebServ via an administrative port

* options
	* readonly :boolean
	* username :string
	* password :string

### close()

Closes a started web server

## Related Projects

Webserv is broken up into a number of projects so engineers can pick what works best for them

* [webserv] - an all-in-one solution bringing together the webserv ecosystem
* [webserv-cli] - command-line interface for webserv-core
* [webserv-core] - programmatic APIs for creating development servers
* [webserv-web] - a web front-end for webserv-core
* [grunt-webserv] - grunt interface for webserv-core

## Quick Start

* `npm install`

## Grunt Commands

* `grunt lint` - validates style rules
* `grunt test` - builds tests and runs the complete test suite
* `grunt clean` - cleans development work
* `grunt` - builds everything from start to finish
