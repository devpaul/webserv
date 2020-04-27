# Https Server

webserv can automatically create self-signed certificates for running https servers.

This example starts 2 servers: a http server on port 8080 that is responsible for automatically forwarding users to the secure https server on port 8443 that hosts the website.

## Quick Start

run `npm run examples:https`

OR

run `webserv` in this directory

## Usage

visit http://localhost:8080 to be forwarded to https://localhost:8443
