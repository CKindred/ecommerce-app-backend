const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3001;
//start the server
const server = http.createServer(app);
server.listen(port);