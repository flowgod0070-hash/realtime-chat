const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 10000;

// 모든 정적 파일 제공 - 여러 위치 시도
const possiblePaths = [
  path.join(__dirname, 'index.html'),
  path.join(__dirname, '..', 'index.html'),
  path.join(process.cwd(), 'index.html'),
  path.join(process.cwd(), 'src', 'index.html'),
  '/opt/render/project/src/index.html',
  '/opt/render/project/index.html'
];

app.get('/', (req, res) => {
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log(`Serving index.html from: ${p}`);
      return res.sendFile(p);
    }
  }
  console.error('index.html not found in any of:', possiblePaths);
  return res.status(404).send(`
    <h1>index.html을 찾을 수 없습니다</h1>
    <p>시도한 경로:</p>
    <pre>${possiblePaths.join('\n')}</pre>
    <p>현재 디렉토리: ${__dirname}</p>
    <p>작업 디렉토리: ${process.cwd()}</p>
    <p>파일 목록: ${fs.readdirSync(__dirname).join(', ')}</p>
  `);
});

// 정적 파일 제공
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(process.cwd()));

// manifest, sw.js 등
app.get('/manifest.json', (req, res) => {
  const p = possiblePaths.map(p=>p.replace('index.html','manifest.json')).find(f=>fs.existsSync(f));
  if(p) return res.sendFile(p);
  res.status(404).send('manifest not found');
});
app.get('/sw.js', (req, res) => {
  const p = possiblePaths.map(p=>p.replace('index.html','sw.js')).find(f=>fs.existsSync(f));
  if(p) return res.sendFile(p);
  res.status(404).send('sw not found');
});

let users = {};

io.on('connection', (socket) => {
  socket.on('joinRoom', (data) => {
    socket.join(data.roomId);
    users[socket.id] = data;
    socket.to(data.roomId).emit('systemMessage', `${data.character} ${data.username}님이 입장하셨습니다`);
  });

  socket.on('chatMessage', (data) => {
    const msg = { ...data, id: Date.now() };
    io.to(data.roomId).emit('chatMessage', msg);
  });

  socket.on('fileMessage', (data) => {
    const msg = { ...data, id: Date.now() };
    io.to(data.roomId).emit('fileMessage', msg);
  });

  socket.on('voiceMessage', (data) => {
    const msg = { ...data, id: Date.now() };
    io.to(data.roomId).emit('voiceMessage', msg);
  });

  socket.on('disconnect', () => {
    const u = users[socket.id];
    if(u){
      socket.to(u.roomId).emit('systemMessage', `${u.character} ${u.username}님이 퇴장하셨습니다`);
      delete users[socket.id];
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`cwd: ${process.cwd()}`);
  console.log(`Files in __dirname: ${fs.readdirSync(__dirname).join(', ')}`);
  try{
    console.log(`Files in cwd: ${fs.readdirSync(process.cwd()).join(', ')}`);
  }catch(e){}
});
