# webserv command line

Webserv allows you to quickly start a fully fledged development server from the command line without editing a single file.

Start a https server with self-signed certificate like this:

```
webserv -m https -t file ./_dist -p 9999
```

or use `webserv` without installing anything via `npx` (included with npm).

Serve your current directory instantly to http://localhost:8888 using

```
npx webserv
```

## Command-line Options

#### -m, --mode { http | https }

Create a `http` or `https` server (defaults to http)

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
