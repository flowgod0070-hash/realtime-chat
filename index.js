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
const io = new Server(server, { cors: { origin: "*" } });

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));
app.use(express.static(__dirname, { maxAge: 0 }));

app.get('/sw.js', (req,res)=>{
  res.set('Content-Type','application/javascript');
  res.set('Cache-Control','no-store');
  res.send("self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request,{cache:'no-store'}))});");
});

app.get('/', (req,res)=>{
  const fp = path.join(__dirname,'public','index.html');
  if(fs.existsSync(fp)){
    let html = fs.readFileSync(fp,'utf8');
    html = html.replace(/<title>.*?<\/title>/, '<title>플로우갓의 채팅방</title>');
    res.set('Content-Type','text/html; charset=utf-8');
    return res.send(html);
  }
  res.set('Content-Type','text/html; charset=utf-8');
  res.send('<html><body><h1>플로우갓의 채팅방</h1><p>public/index.html을 업로드해주세요. <a href="/">새로고침</a></p></body></html>');
});

let users={};
io.on('connection',(socket)=>{
  socket.on('joinRoom',(data)=>{socket.join(data.roomId);users[socket.id]=data;socket.to(data.roomId).emit('userJoined',data);socket.to(data.roomId).emit('systemMessage',`🔔 ${data.character||''} ${data.username}님이 입장`);});
  socket.on('chatMessage',(data)=>{io.to(data.roomId).emit('chatMessage',{...data,id:Date.now()});});
  socket.on('fileMessage',(data)=>{const u=users[socket.id]; if(u) io.to(u.roomId).emit('fileMessage',data);});
  socket.on('voiceMessage',(data)=>{const u=users[socket.id]; if(u) io.to(u.roomId).emit('voiceMessage',data);});
  socket.on('bgmTrackChange',(track)=>{const u=users[socket.id]; if(u) io.to(u.roomId).emit('bgmTrackChange',track);});
  socket.on('disconnect',()=>{const u=users[socket.id]; if(u){socket.to(u.roomId).emit('userLeft',u);socket.to(u.roomId).emit('systemMessage',`👋 ${u.username}님이 나감`);delete users[socket.id];}});
});

const PORT=process.env.PORT||10000;
server.listen(PORT,()=>console.log('Live on '+PORT));
