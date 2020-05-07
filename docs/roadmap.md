# webserv Roadmap

## Status

* CLI usage: stable
* Configuration: stable
* Programmatic: *unstable*
* Core: mostly stable

The focus for webserv 2.0 is to update the programmatic API to support using configuration for service instantiation.

This will affect the programmatic APIs around configuration. We will be rebuilding the loader to better generalize factory patterns around service instantiation so the same patterns can be used for middleware components (processors, guards, handlers, and transforms). This will allow us to build services entirely from configuration. This leads to introspectable service definitions, which in turn gives us a lot of options in working with services.

## Roadmap

### Version 2.1

Generalize the loader pattern so it can be used with middleware components

* Add middleware component loaders
* Update JSON schema to include services defined as a collection of middleware component configurations
* Add a Service that takes a configuration-defined service and compiles it to a `Route` with `{ run(), test() }`

### Version 2.x

Create a `webserv` service

* listing, creating, starting, and shutting down servers
* exploring the service hierarchy
* streaming logs via websockets
* CRUD services from the service hierarchy

### Version 3.x

Add support for generating and using JSON schemas as a way to validate configurations and bridge configuration and types

* Add built-in support for building JSON schema from service/middleware configuration types
* Add support for validating configuration using JSON schema
* Add support to `webserv` cli to build JSON schema for third-party services

### Ongoing

Document and provide examples for common patterns

* How to proxy a live development server
* How to create a live server
* How to mock an API for an existing backend
* Set up a dev/production server
* How to set up a real-time React client/server
* How to create a custom service
* How to use passport for authentication
* How to use a database

