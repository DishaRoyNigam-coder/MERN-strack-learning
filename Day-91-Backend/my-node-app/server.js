// server.js

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>Node.js Server</title></head>
      <body>
        <h1>🚀 Hello from Node.js!</h1>
        <p>This is a simple HTTP server.</p>
        <p>Request URL: ${req.url}</p>
      </body>
    </html>
  `);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔄 Press Ctrl+C to stop`);
});