# Webserv

[![Build Status](https://travis-ci.org/devpaul/webserv.svg?branch=master)](https://travis-ci.org/devpaul/webserv)
[![Windows build status](https://ci.appveyor.com/api/projects/status/pwxbf43ctu05uxn8?svg=true)](https://ci.appveyor.com/project/devpaul/webserv)
[![npm version](https://badge.fury.io/js/webserv.svg)](https://badge.fury.io/js/webserv)

## Why use `webserv`?

Webserv's aim is to have a fast, simple way to provide a backend to your projects. We want to enable developers to start working on their experience immediately. Webserv is not, nor will ever be a production-ready server (for that we recommend [Nestjs](https://nestjs.com/)). Instead it is a quick and easy way to start serving your app with zero thought or investment.

Serve a folder right now without installing anything using `npx`.

```
npx webserv
```

Webserv comes with standard server patterns. Start a proxy, CRUD server, upload, or log connections from the command-line. Have a more complex use case? `webserv` supports JSON configs and has a fully-typed programmatic API so you will *never* be stuck.

Want to learn more? Look at our [examples](https://github.com/devpaul/webserv/tree/master/examples) and read through our [documentation](https://github.com/devpaul/webserv/tree/master/docs).

## Command Line

Webserv allows you to quickly start a fully fledged development server from the command line without editing a single file.

### Command-line Options

#### -m, --mode { http | https }

Create a `http` or `https` server (defaults to http)

```
webserv -m https
```

https servers will auto-generate self-signed certificates

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

## webserv configuration

Webserv supports more complex usage through config files. When a file named `webserv.json` is present or when `webserv` is launched using the `-c <configPath>` option, webserv will launch using the provided configuration.

The available configurations match the server types (available with the `-t` option): crud, file, log, proxy, and upload.

See the [configuration documentation](https://github.com/devpaul/webserv/blob/master/docs/configuration.md) for all of the details.

## Programmatic API

For users that may need to create their own services or have complex use cases that are not served the configuration, `webserv` offers a fully-typed programmatic API written in TypeScript. See the [hello world example](https://github.com/devpaul/webserv/blob/master/examples/hello-world/services/hello.ts) for example usage.
