import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 캐시 금지
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0, etag: false }));
app.use(express.static(__dirname, { maxAge: 0, etag: false }));

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  try {
    if (fs.existsSync(filePath)) {
      let data = fs.readFileSync(filePath, 'utf8');
      data = data.replace(/<title>.*?<\/title>/g, '<title>플로우갓의 채팅방</title>');
      data = data.replace(/🐣 실시간 채팅/g, '🐣 플로우갓의 채팅방');
      data = data.replace(/실시간 채팅 - 내 카페음악/g, '플로우갓의 채팅방');
      data = data.replace(/실시간 채팅/g, '플로우갓의 채팅방');
      data = data.replace(/BGM 파일: public\/bgm1.mp3 ~ bgm5.mp3/g, '플로우갓의 채팅방 v9');
      data = data.replace(/BGM 파일:.*bgm5.mp3.*/g, '플로우갓의 채팅방 v9');
      res.set('Content-Type', 'text/html; charset=utf-8');
      return res.send(data);
    }
  } catch(e){ console.error(e); }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sw.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.set('Cache-Control', 'no-store');
  res.send(`
    const VERSION='v9';
    self.addEventListener('install', e=>{ console.log('SW v9 설치'); self.skipWaiting(); });
    self.addEventListener('activate', e=>{
      e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>{console.log('삭제',k); return caches.delete(k); }))).then(()=>self.clients.claim()));
    });
    self.addEventListener('fetch', e=>{ e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request))); });
  `);
});

let users = {};
io.on('connection', (socket) => {
  socket.on('joinRoom', (data) => {
    socket.join(data.roomId);
    users[socket.id] = data;
    console.log(`[입장] ${data.username} -> ${data.roomId}`);
    socket.to(data.roomId).emit('systemMessage', `🔔 ${data.character||'🐣'} ${data.username}님이 들어왔습니다.`);
    socket.to(data.roomId).emit('userJoined', data);
  });
  socket.on('chatMessage', (data) => {
    io.to(data.roomId).emit('chatMessage', { ...data, id: Date.now() });
  });
  socket.on('fileMessage', (data) => { io.to(data.roomId).emit('fileMessage', data); });
  socket.on('voiceMessage', (data) => { io.to(data.roomId).emit('voiceMessage', data); });
  socket.on('bgmTrackChange', (track) => {
    const u = users[socket.id];
    if(u) io.to(u.roomId).emit('bgmTrackChange', track);
  });
  socket.on('disconnect', () => {
    const u = users[socket.id];
    if(u){ socket.to(u.roomId).emit('userLeft', u); delete users[socket.id]; }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`플로우갓의 채팅방 서버 실행: ${PORT}`));
