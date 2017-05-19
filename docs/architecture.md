# webserv architecture

webserv architecture is divided into two main components: handlers and middleware. Handlers are functions that handle
 low-level http requests by transforming, filter, routing, or in grouping requests for the middleware. The middleware
 is comprised of `Handler` objects that are used to respond to a request. In brief, handlers are used to pipe requests
 and middleware responds to requests.
