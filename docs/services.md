# Services

A Service is a bundle of [routes] and [upgrades] that contains a piece of complete end-user functionality. webserv comes complete with a number of basic, foundational services that make it an ideal development tool for quickly scaffolding out functionality.

## Service Definition

A service has 3 components. A [route][routes] consists of the guards, transforms, process, and middleware necessary to handle an incoming request. The [upgrade][upgrades] is (almost exclusively) used for websocket connections. A `global` property allows you to add guards, transforms, and processes at the top level of the application, above all other services and routes. This is used by the logging service to add top-level logging to a server.

```ts
export interface Service {
	global?: Omit<RouteDescriptor, 'middleware'>;
	route?: RouteDescriptor;
	upgrade?: UpgradeDescriptor;
}
```

## Included Services

### CRUD

The CRUD service provides an in-memory Create/Read/Update/Delete/List functionality. The CRUD service can initialize its data from disk or from its initial configuration and it maintains changes to the data in-memory.

### File

The File service hosts files from disk.

### Log

The Log service has two uses. It can log all incoming and outgoing requests and responses. It can also behave as a simple log server by logging all requests and returning a 200 OK response as a quick way to log data.

### Proxy

The Proxy service proxies requests between webserv and another server. It uses [http-proxy](https://www.npmjs.com/package/http-proxy) and exposes most of http-proxy's options in the configuration.

### Upload

The File service provides a basic upload page for single-file uploads and a POST handler for saving uploaded files.

[routes]: ./routes.md
[upgrades]: ./upgrades.md
