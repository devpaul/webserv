# Webserv

[![Build Status](https://travis-ci.org/devpaul/webserv.svg?branch=master)](https://travis-ci.org/devpaul/webserv)
[![Windows build status](https://ci.appveyor.com/api/projects/status/pwxbf43ctu05uxn8?svg=true)](https://ci.appveyor.com/project/devpaul/webserv)
[![codecov.io](https://codecov.io/github/devpaul/webserv/coverage.svg?branch=master)](https://codecov.io/github/devpaul/webserv?branch=master)
[![npm version](https://badge.fury.io/js/webserv.svg)](https://badge.fury.io/js/webserv)

Webserv aims to be the fastest way to deploy server for development. It comes fully loaded with standard definitions for basic web patterns. Serve a directory, start a proxy, create a CRUD server, a basic upload, or just log connections instantly from the command line.

## Quick Start

Use `webserv` instantly with `npx`

```
npx webserv -t log
```

## Command Line

Webserv allows you to quickly start a fully fledged development server from the command line without editing a single file.

```
webserv -m https -t file ./_dist -p 9999
```

**-f**: serves this folder

```
webserv -f ./dist
```

**-m, --mode**: use `http` or `https` (defaults to http)

```
webserv -m https
```

**-l**: log all requests to the console

```
webserv -l
```

**-p, --port**: sets the port to use (defaults to 8888)

```
webserv -p 8000
```

**-t {crud, file, log, proxy, upload} [options]**: start a predefined server type

*Create a basic CRUD server*

```
webserv -t crud
```

*Create a proxy server*

```
webserv -t proxy http://devpaul.com
```

*Create a file browser* (same as -f)

```
webserv -t file ./dist
```

*Create an upload server*

```
webserv -t upload ./files
```

*Create a log server*

A log server logs all request to the console and returns 200

```
webserv -t log
```
## Programmatic API

Webserv offers a fully-typed programmatic API. See `./examples/hello` and `./src/webserv/bin/webserv.ts`.
