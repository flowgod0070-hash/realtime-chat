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

const PORT = process.env.PORT || 10000;

// 모든 정적 파일 위치 후보
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
  console.error('index.html not found');
  const cwdFiles = fs.existsSync(process.cwd()) ? fs.readdirSync(process.cwd()).join(', ') : 'none';
  const dirFiles = fs.readdirSync(__dirname).join(', ');
  return res.status(404).send(`
    <h1>index.html을 찾을 수 없습니다</h1>
    <p>시도한 경로: ${possiblePaths.join('<br>')}</p>
    <p>__dirname: ${__dirname} => ${dirFiles}</p>
    <p>cwd: ${process.cwd()} => ${cwdFiles}</p>
  `);
});

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(process.cwd()));

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
});
