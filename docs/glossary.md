# Glossary

### Guard

A guard is used to test whether a [route][routes] should handle an incoming request

### Middleware

Middleware is responsible for handling an incoming request and producing a response. It is part of a [route][routes]

### Process

A process is a function that performs a task on a request or a response. They are part of the `before` and `after` properties of a route descriptor. webserv includes `before` processors to extract a form body and make it available on the request and process uploaded files. For more information see [routes].

### Route

A [route][routes] is a collection of guards, processes, transforms, and middleware that describe how to handle an incoming request.

### Service

A [service] is a bundle of [routes] and [upgrades] that describe a single, reusable collection of APIs that create a single piece of functionality.

### Upgrade

An [upgrade][upgrades] handles a HTTP Upgrade request. This is (almost) exclusively used to upgrade to a websocket connection.

[routes]: ./routes.md
[service]: ./services.md
[upgrades]: ./upgrades.md
