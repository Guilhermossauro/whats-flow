const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('steps.json');
const middlewares = jsonServer.defaults();
const port =  3421;

server.use(middlewares);
server.use(router);

server.listen(port);
console.log('JSON Server is running on port \x1b[1;32m' + port + '\x1b[1;30m \n');