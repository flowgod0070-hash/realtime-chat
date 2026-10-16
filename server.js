const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ⭐ 캐시 완전 금지!
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0, etag: false }));

// ⭐ index.html은 항상 최신 파일로 직접 읽기!
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    // 강제로 제목을 플로우갓의 채팅방으로 교체!
    const fixed = data.replace(/<title>.*?<\/title>/, '<title>플로우갓의 채팅방</title>')
                      .replace(/🐣 실시간 채팅/, '🐣 플로우갓의 채팅방');
    res.send(fixed);
  });
});

let users = {};
io.on('connection', (socket) => {
  socket.on('joinRoom', (data) => {
    socket.join(data.roomId);
    users[socket.id] = data;
    socket.to(data.roomId).emit('systemMessage', `🔔 ${data.character} ${data.username}님이 들어왔습니다.`);
    socket.to(data.roomId).emit('userJoined', data);
  });
  socket.on('chatMessage', (data) => { io.to(data.roomId).emit('chatMessage', { ...data, id: Date.now() }); });
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
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
