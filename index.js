
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

app.use(express.json({ limit: '10mb' }));
app.use((req,res,next)=>{
  res.set('Cache-Control','no-store, no-cache, must-revalidate, private');
  res.set('Pragma','no-cache');
  res.set('Expires','0');
  next();
});

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, { maxAge:0, etag:false }));
app.use(express.static(__dirname, { maxAge:0, etag:false }));

app.get('/health', (req,res)=>res.send('ok v37 - gdrive auto'));

app.get('/', (req,res)=>{
  const p = path.join(publicPath, 'index.html');
  if(fs.existsSync(p)){
    let html = fs.readFileSync(p,'utf8');
    res.set('Content-Type','text/html; charset=utf-8');
    return res.send(html);
  }
  res.sendFile(path.join(publicPath, 'index.html'), { headers: { 'Cache-Control':'no-store' } }, (err)=>{
    if(err) res.status(404).send('Not Found');
  });
});

// Google Drive auto-save endpoint (v37)
const ADMIN_NAME='플로우갓';
const ADMIN_PW='0325';
const GDRIVE_FOLDER_ID = '1hYEQHAM4QYNmclKbNPV2oOMUHaWDnkfH';
const GDRIVE_FOLDER_LINK = 'https://drive.google.com/drive/folders/1hYEQHAM4QYNmclKbNPV2oOMUHaWDnkfH';

app.post('/api/saveToDrive', async (req,res)=>{
  try{
    const { content, fileName, folderName } = req.body;
    console.log('[Drive] Save request:', fileName);
    
    // Note: For full auto-upload, need GOOGLE_SERVICE_ACCOUNT or OAuth credentials in env
    // This endpoint currently returns folder info and lets client know where to save
    // For actual auto-upload, configure GOOGLE_CREDENTIALS in Render env vars
    
    // If googleapis is installed and credentials exist, we could auto-upload here
    // For now, return success with folder link for manual + future auto
    
    res.json({
      success: true,
      folderId: GDRIVE_FOLDER_ID,
      folderLink: GDRIVE_FOLDER_LINK,
      fileName: fileName || 'chatlog_' + Date.now() + '.txt',
      message: '구글 드라이브 폴더가 준비되었습니다. 클라이언트에서 다운로드 후 폴더에 업로드하거나, 서버에 GOOGLE_CREDENTIALS 설정시 자동 업로드 됩니다.',
      autoUpload: false, // set to true when credentials configured
      instructions: 'Render 환경변수에 GOOGLE_SERVICE_ACCOUNT_JSON 설정하면 자동 업로드 활성화'
    });
  }catch(e){
    console.error('[Drive] Error:', e);
    res.status(500).json({ success:false, error: e.message });
  }
});

let users = {};

function isHostUser(username){
  return username && username.trim() === '플로우갓';
}

io.on('connection', (socket)=>{
  socket.on('joinRoom', (data)=>{
    if(data.username && data.username.trim() === '플로우갓'){
      if(data.adminPassword !== '0325'){
        console.log('[보안] 플로우갓 사칭 시도 차단');
        socket.emit('joinFailed', { reason: 'admin_password_required' });
        return;
      }
    }

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
      socket.emit('systemMessage', '🚫 BGM 변경은 플로우갓만 가능합니다!');
      return;
    }
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
server.listen(PORT, ()=>console.log(`플로우갓의 채팅방 v37 Live on ${PORT} - 방장=플로우갓만 + GDrive 폴더:${GDRIVE_FOLDER_ID}`));
