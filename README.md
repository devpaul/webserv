# Webserv

[![Build Status](https://travis-ci.org/devpaul/webserv.svg?branch=master)](https://travis-ci.org/devpaul/webserv)
[![Windows build status](https://ci.appveyor.com/api/projects/status/pwxbf43ctu05uxn8?svg=true)](https://ci.appveyor.com/project/devpaul/webserv)
[![codecov.io](https://codecov.io/github/devpaul/webserv/coverage.svg?branch=master)](https://codecov.io/github/devpaul/webserv?branch=master)
[![npm version](https://badge.fury.io/js/webserv.svg)](https://badge.fury.io/js/webserv)

## Why use `webserv`?

Webserv's aim is to have a fast, simple way to provide a backend to your projects. We want to enable developers to start working on their experience immediately. Webserv is not, nor will ever be a production-ready server (for that we recommend [Nestjs](https://nestjs.com/)). Instead it is a quick and easy way to start serving your app with zero thought or investment.

Serve your folder right now without installing anything using `npx`.

```
npx webserv
```

Webserv comes with standard server patterns. Start a proxy, CRUD server, upload, or log connections from the command-line or use `webserv`'s fully typed API to programmatically create a custom server.

Interested? Start experimenting now on [Glitch](https://glitch.com)

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/hello-webserv)

## Command Line

Webserv allows you to quickly start a fully fledged development server from the command line without editing a single file.

Start a https server with self-signed certificate like this:

```
webserv -m https -t file ./_dist -p 9999
```

### Command-line Options

#### -m, --mode {http | https | ngrok}

Create a `http` or `https` server (defaults to http)

`ngrok` mode will create a local `http` server and use ngrok to create an externally accessible site on ngrok. The public url will be displayed on the console.

```
webserv -m https
```

#### -l, --log

Log all requests to the console

```
webserv -l
```

#### -p, --port

Set the port to use (defaults to 8888)

```
webserv -p 8000
```

#### -t crud

Start a basic CRUD server

```
webserv -t crud
```

This server keeps records in an internal store.

* GET `/` will list all of the records
* POST `/` with a json object in the body with an `id` to add a record
* PUT `/` with a json object in the body to update a record
* GET `/id/:id` to view a single record
* DELETE `/id/:id` to delete a record

#### -t file {directory}

Serve the directory.

This is the default server type. If the `directory` is omitted the current directory will be served.

```
webserv -t file ./dist
```

#### -t log

Create a log server that logs all request to the console and returns 200.

```
webserv -t log
```

#### -t proxy {target}

Create a proxy server.

```
webserv -t proxy http://devpaul.com
```

#### -t upload {directory}

Create an upload server.

`directory` is the location where uploaded files will be stored

```
webserv -t upload ./files
```

* GET `/` provides an interface to upload files
* POST `/` uploads the file(s)
* GET `/list` lists files that have been uploaded


## Programmatic API

Webserv offers a fully-typed programmatic API. See `./examples/hello` and `./src/webserv/bin/webserv.ts`.
