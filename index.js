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
const io = new Server(server, { maxHttpBufferSize: 15 * 1024 * 1024, cors: { origin: "*" } });

app.use((req,res,next)=>{
  res.set('Cache-Control','no-store, no-cache, must-revalidate, private');
  res.set('Pragma','no-cache');
  res.set('Expires','0');
  next();
});

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, { maxAge:0, etag:false }));
app.use(express.static(__dirname, { maxAge:0, etag:false }));

app.get('/health', (req,res)=>res.send('ok v18 - only 플로우갓 host'));

app.get('/', (req,res)=>{
  const p = path.join(publicPath, 'index.html');
  if(fs.existsSync(p)){
    let html = fs.readFileSync(p,'utf8');
    res.set('Content-Type','text/html; charset=utf-8');
    return res.send(html);
  }
  res.sendFile(path.join(publicPath, 'index.html'), { headers: { 'Cache-Control':'no-store' } }, (err)=>{
    if(err) res.status(404).send('Not Found - public/index.html 필요');
  });
});

let users = {};

function isHostUser(username){
  return username && username.trim() === '플로우갓';
}

io.on('connection', (socket)=>{
  socket.on('joinRoom', (data)=>{
    const roomId = data.roomId || 'main-room';
    socket.username = data.username;
    socket.character = data.character;
    socket.roomId = roomId;
    socket.isHost = isHostUser(data.username);
    socket.join(roomId);
    users[socket.id] = { username: data.username, character: data.character, roomId, isHost: socket.isHost };
    console.log(`[입장] ${data.username} (${socket.isHost ? '방장' : '게스트'}) -> ${roomId}`);
    socket.to(roomId).emit('userJoined', { username: data.username, character: data.character, isHost: socket.isHost });
    io.to(roomId).emit('systemMessage', `${data.character||'🐣'} ${data.username}님이 입장했습니다. ${socket.isHost ? '👑 방장' : '게스트'}`);
  });

  socket.on('chatMessage', (data)=>{
    const room = data.roomId || socket.roomId || 'main-room';
    io.to(room).emit('chatMessage', { ...data, id: Date.now(), isHost: isHostUser(data.username) });
  });

  socket.on('fileMessage', (data)=>{
    const room = data.roomId || socket.roomId || 'main-room';
    io.to(room).emit('fileMessage', { ...data, id: Date.now(), isHost: isHostUser(data.username) });
  });

  socket.on('voiceMessage', (data)=>{
    const room = data.roomId || socket.roomId || 'main-room';
    io.to(room).emit('voiceMessage', { ...data, id: Date.now() });
  });

  socket.on('bgmTrackChange', (track)=>{
    const room = socket.roomId || 'main-room';
    const user = users[socket.id];
    if(!user || !isHostUser(user.username)){
      console.log(`[BGM 차단] ${user?.username}는 방장이 아니라서 BGM 변경 불가`);
      socket.emit('systemMessage', '🚫 BGM 변경은 플로우갓만 가능합니다!');
      return;
    }
    console.log(`[BGM 변경] ${user.username} -> ${track}`);
    io.to(room).emit('bgmTrackChange', track);
    io.to(room).emit('systemMessage', `🎵 BGM 변경: ${track} (플로우갓)`);
  });

  socket.on('disconnect', ()=>{
    const u = users[socket.id];
    if(u){
      socket.to(u.roomId).emit('userLeft', { username: u.username, character: u.character });
      io.to(u.roomId).emit('systemMessage', `👋 ${u.username}님이 퇴장했습니다.`);
      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, ()=>console.log(`플로우갓의 채팅방 v18 Live on ${PORT} - 방장=플로우갓만`));
