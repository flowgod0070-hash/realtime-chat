import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
// 👇 이 2줄이 핵심 수정!
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {};

io.on('connection', (socket) => {
  console.log('connected', socket.id);

  socket.on('joinRoom', ({ roomId, username, character }) => {
    socket.join(roomId);
    socket.data = { roomId, username, character };
    if(!rooms[roomId]) rooms[roomId]=[];
    rooms[roomId].push({ id: socket.id, username, character });
    io.to(roomId).emit('userList', rooms[roomId]);
    socket.to(roomId).emit('systemMessage', `${username} ${character} 님이 입장했어요`);
  });

  socket.on('chatMessage', (data) => {
    io.to(data.roomId).emit('chatMessage', {...data, id: Date.now(), socketId: socket.id });
  });

  socket.on('fileMessage', (data) => {
    io.to(data.roomId).emit('fileMessage', {...data, id: Date.now() });
  });

  socket.on('voiceMessage', (data) => {
    io.to(data.roomId).emit('voiceMessage', {...data, id: Date.now() });
  });

  socket.on('disconnect', () => {
    const { roomId, username } = socket.data || {};
    if(roomId && rooms[roomId]){
      rooms[roomId] = rooms[roomId].filter(u => u.id!== socket.id);
      io.to(roomId).emit('userList', rooms[roomId]);
      if(username) socket.to(roomId).emit('systemMessage', `${username} 님이 나갔어요`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
