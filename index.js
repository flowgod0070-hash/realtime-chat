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

function listFiles(dir, depth = 0) {
  if (depth > 3) return [];
  try {
    const files = fs.readdirSync(dir);
    let result = [`📁 ${dir}: ${files.join(', ')}`];
    for (const f of files) {
      const full = path.join(dir, f);
      try {
        if (fs.statSync(full).isDirectory() && !f.startsWith('node_modules') && !f.startsWith('.git')) {
          result = result.concat(listFiles(full, depth + 1));
        }
      } catch {}
    }
    return result;
  } catch (e) {
    return [`❌ Cannot read ${dir}: ${e.message}`];
  }
}

function findFile(name, searchRoots) {
  for (const root of searchRoots) {
    try {
      const files = fs.readdirSync(root);
      if (files.includes(name)) return path.join(root, name);
      // 하위 폴더도 탐색
      for (const f of files) {
        const full = path.join(root, f);
        try {
          if (fs.statSync(full).isDirectory() && !f.startsWith('node_modules')) {
            const subFiles = fs.readdirSync(full);
            if (subFiles.includes(name)) return path.join(full, name);
          }
        } catch {}
      }
    } catch {}
  }
  return null;
}

const searchRoots = [
  __dirname,
  path.join(__dirname, '..'),
  process.cwd(),
  path.join(process.cwd(), '..'),
  '/opt/render/project',
  '/opt/render/project/src',
  '/opt/render/project/src/src',
];

console.log('=== FILE SYSTEM DEBUG ===');
for (const dir of [...new Set(searchRoots)]) {
  console.log(listFiles(dir, 1).join('\n'));
}

app.get('/', (req, res) => {
  const found = findFile('index.html', searchRoots);
  if (found) {
    console.log(`✅ Serving index.html from: ${found}`);
    return res.sendFile(found);
  }
  
  console.log('❌ index.html not found anywhere!');
  const debug = searchRoots.map(d => listFiles(d, 2).join('\n')).join('\n\n');
  
  return res.status(404).send(`
    <html><head><meta charset="UTF-8"><title>디버그</title></head><body style="font-family:monospace;padding:20px;white-space:pre-wrap;">
    <h1>🔍 index.html을 찾을 수 없습니다</h1>
    <p>__dirname: ${__dirname}</p>
    <p>cwd: ${process.cwd()}</p>
    <h2>파일 시스템:</h2>
    ${debug}
    <h2>해결방법:</h2>
    1. GitHub에 index.html이 있는지 확인<br>
    2. Render Settings -> Root Directory가 비어있는지 확인 (빈칸)<br>
    3. Manual Deploy 다시 실행<br>
    </body></html>
  `);
});

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(process.cwd()));
app.use(express.static('/opt/render/project'));
app.use(express.static('/opt/render/project/src'));

let users = {};
io.on('connection', (socket) => {
  socket.on('joinRoom', (data) => {
    socket.join(data.roomId);
    users[socket.id] = data;
    socket.to(data.roomId).emit('systemMessage', `${data.character} ${data.username}님이 입장하셨습니다`);
  });
  socket.on('chatMessage', (data) => {
    io.to(data.roomId).emit('chatMessage', { ...data, id: Date.now() });
  });
  socket.on('fileMessage', (data) => {
    io.to(data.roomId).emit('fileMessage', { ...data, id: Date.now() });
  });
  socket.on('voiceMessage', (data) => {
    io.to(data.roomId).emit('voiceMessage', { ...data, id: Date.now() });
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
  console.log(`Server running on port ${PORT}`);
});
