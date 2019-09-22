# Webserv

[![Build Status](https://travis-ci.org/devpaul/webserv.svg?branch=master)](https://travis-ci.org/devpaul/webserv)
[![Windows build status](https://ci.appveyor.com/api/projects/status/pwxbf43ctu05uxn8?svg=true)](https://ci.appveyor.com/project/devpaul/webserv)
[![codecov.io](https://codecov.io/github/devpaul/webserv/coverage.svg?branch=master)](https://codecov.io/github/devpaul/webserv?branch=master)
[![npm version](https://badge.fury.io/js/webserv.svg)](https://badge.fury.io/js/webserv)

Programatic API for creating front-end webservers to support development. Webserv was built to provide a complete
	and simple way for front-end engineers develop decoupled from the backend.

## Features

* Command line interface
* Configuration driven
* Fully typed, programmatic API
* Grunt support

## Command Line

WebServ offers a very basic command-line usage. Simply install webserv globally (`npm i webserv -g`)
and type `webserv` on the command line to serve files and directories from your current directory.

### Command Line options

**-c, --config**: selects a configuration file

When using a configuration file `webserv` will not serve the current directory by default.

```
webserv -c webserv.json
```

**-f, --folder**: serves this folder

```
webserv -f ./dist
```

When launched `webserv` will automatically look a file named `webserv.ts`, `webserv.js`, or `webserv.json` in the current directory.

**-m, --mode**: use `http` or `https` (defaults to http)

```
webserv -m https
```

**-p, --port**: sets the port to use (defaults to 8888)

```
webserv -p 8000
```

**--proxy**: create a proxy to an external url

```
webserv --proxy "https://example.com"
```

**-s, --server**: starts a server defined in the configuration

```
webserv -s myproxy
```
