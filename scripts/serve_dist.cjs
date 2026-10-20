const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4173;
const DIST_DIR = path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];
  if (cleanUrl.startsWith('/myarea24-frontend')) {
    cleanUrl = cleanUrl.replace(/^\/myarea24-frontend/, '') || '/';
  }

  if (cleanUrl.startsWith('/api')) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend API offline on static test server', status: 503 }));
    return;
  }

  if (cleanUrl === '/' || cleanUrl === '') cleanUrl = '/index.html';

  let filePath = path.join(DIST_DIR, cleanUrl);

  // If path doesn't exist or is a directory, fallback to index.html (SPA)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  } catch (err) {
    res.writeHead(500);
    res.end('Server Error: ' + err.message);
  }
});

server.on('upgrade', (req, socket) => {
  socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
  socket.destroy();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Production dist server listening at http://127.0.0.1:${PORT}`);
});
