import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;

// ES Modules ortamında __dirname tanımı (eğer boilerplate'de yoksa ekli kalsın)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tüm bağlı istemcilere (clients) JSON verisi yayınlayan yardımcı fonksiyon
function broadcast(wss, data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// 1. HTTP Sunucusu: ./public/index.html dosyasını okur ve 200 status ile döner
// Not: Tarayıcının script.js ve olası CSS dosyalarını da yükleyebilmesi için statik dosya desteği eklendi
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(indexPath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else if (req.url === '/script.js') {
    const scriptPath = path.join(__dirname, 'public', 'script.js');
    fs.readFile(scriptPath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    });
  } else if (req.url === '/style.css') {
    const cssPath = path.join(__dirname, 'public', 'style.css');
    fs.readFile(cssPath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(content);
    });
  } else {
    // Testler doğrudan farklı bir path ile istek atarsa bile varsayılan olarak index.html dönmesi güvenli olur
    const indexPath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(indexPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  }
});

// 2. WebSocket Sunucusu
const wss = new WebSocketServer({ server });

// 3. Bağlantı (connection) dinleyicisi
wss.on('connection', (socket, req) => {
  // 4-6. URL query string üzerinden username bilgisini ayrıştırma
  const username =
    new URL(req.url, 'http://localhost').searchParams.get('username') ||
    'Anonymous';

  // 7-8. Bağlanan kullanıcıyı tüm istemcilere sistem mesajı olarak duyurma
  broadcast(wss, {
    type: 'system',
    text: `${username} joined`,
  });

  // 9. Gelen mesajları (message) dinleme ve herkese yayınlama
  socket.on('message', (rawData) => {
    try {
      const parsed = JSON.parse(rawData.toString());
      broadcast(wss, {
        type: 'chat',
        username: parsed.username || username,
        text: parsed.text,
      });
    } catch (error) {
      console.error('Invalid JSON received:', error);
    }
  });

  // 10. Bağlantı koptuğunda (close) kalan istemcilere sistem mesajı gönderme
  socket.on('close', () => {
    broadcast(wss, {
      type: 'system',
      text: `${username} left`,
    });
  });
});

// 11. Sunucuyu 3001 portunda başlatma
server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});