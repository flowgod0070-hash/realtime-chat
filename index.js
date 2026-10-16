
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 15 * 1024 * 1024, cors: { origin: "*" } });

const PORT = process.env.PORT || 10000;

// 캐시 완전 금지
app.use((req,res,next)=>{
  res.set('Cache-Control','no-store, no-cache, must-revalidate, private, max-age=0');
  res.set('Pragma','no-cache');
  res.set('Expires','0');
  next();
});

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, { etag:false, lastModified:false, maxAge:0 }));

// 루트 - 무조건 플로우갓의 채팅방으로 강제 치환 + sw.js 제거 스크립트 주입
app.get('/', (req,res)=>{
  const p = path.join(publicPath, 'index.html');
  if(fs.existsSync(p)){
    let html = fs.readFileSync(p,'utf8');
    // sw.js 삭제 코드가 없으면 주입
    if(!html.includes('serviceWorker')){
      html = html.replace('<body>', `<body><script>if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister()));}if(window.caches){caches.keys().then(k=>k.forEach(c=>caches.delete(c)));}</script>`);
    }
    res.send(html);
  } else {
    res.send('<h1>플로우갓의 채팅방 v13 - public/index.html 없음!</h1>');
  }
});

app.get('/health', (req,res)=>res.send('ok v13'));

io.on('connection', (socket)=>{
  console.log('connected', socket.id);

  socket.on('joinRoom', (data)=>{
    socket.username = data.username;
    socket.character = data.character;
    socket.roomId = data.roomId || 'main-room';
    socket.join(socket.roomId);
    // 입장 알림
    socket.to(socket.roomId).emit('userJoined', { username: data.username, character: data.character });
    io.to(socket.roomId).emit('systemMessage', `🐣 ${data.character||''} ${data.username}님이 입장했습니다.`);
  });

  socket.on('chatMessage', (data)=>{
    const room = data.roomId || socket.roomId || 'main-room';
    const payload = { ...data, id: Date.now() };
    io.to(room).emit('chatMessage', payload);
  });

  // ★ 파일(사진) 수신 - 이게 빠져있어서 사진 안 떴음!
  socket.on('fileMessage', (data)=>{
    const room = data.roomId || socket.roomId || 'main-room';
    console.log('fileMessage', data.fileName, room);
    io.to(room).emit('fileMessage', { ...data, id: Date.now() });
  });

  socket.on('voiceMessage', (data)=>{
    const room = data.roomId || socket.roomId || 'main-room';
    io.to(room).emit('voiceMessage', { ...data, id: Date.now() });
  });

  socket.on('bgmTrackChange', (track)=>{
    const room = socket.roomId || 'main-room';
    console.log('bgmTrackChange', track, room);
    io.to(room).emit('bgmTrackChange', track);
  });

  socket.on('disconnect', ()=>{
    if(socket.roomId){
      socket.to(socket.roomId).emit('userLeft', { username: socket.username||'누군가', character: socket.character });
      io.to(socket.roomId).emit('systemMessage', `👋 ${socket.username||'누군가'}님이 퇴장했습니다.`);
    }
  });
});

server.listen(PORT, ()=>console.log(`Live on ${PORT}`));
