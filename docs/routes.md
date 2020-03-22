# Routes

Routes are the mechanism which webserv filters and handles requests. They are made up of to functions:

* `test(request, response): boolean` determines if the request should be handled by the route
* `run(request, response): object | void` handles the request by directly updating the response object or returning an object to be returned as JSON data.

While you can manually write a route and use it in webserv, they are much easier to construct using a `RouteDescriptor`.

## RouteDescriptor
A route is made up of several parts defined by the `RouteDescriptor`. The descriptor describes the lifecycle of a route.

### before

The before phase is made up of any number of `Process` functions that allow you to directly modify the request or response. This phase is usually used for any extra processing needed. The before phase is useful for doing thing like

* processing the body and appending it as a value to the request
* processing query parameters and appending it as value to the request
* loading a user record from the Authentication header and appending it to the request
* logging the request

In general, the before phase is used to hydrate request data for the other phases.

### guards

`Guard`s are functions that act on the request object to determine if the request should be handled by the route. If all of the guards return `true` then the request is handled by the route.

### middleware

Middleware is responsible for creating a response to the request. Middleware usually returns an object that may be used later in the process to return a response. It can also directly update the response (as is often done by other third-party middleware).

### transforms

A `Transform` is responsible for taking the object returned by a middleware and translating it into a response. This can be used in a number of different ways.

* translate an object to an XML response or other format requested by the Accepts header
* trim or truncate sensitive information based on user permissions

Transforms are only applied when the middleware returns an object and a response hasn't already been provided.

### after

The after phase is similar to the before phase. It is made up of `Process` functions that have one last chance to act on the response.

This phase can be used to provide a default response when there wasn't a matching middleware to handle a request, or log the outgoing response.
