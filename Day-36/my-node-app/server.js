// server.js
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Hello, Node.js!</h1><p>Server is running with nodemon.</p>');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔄 Nodemon is watching for changes...`);
});