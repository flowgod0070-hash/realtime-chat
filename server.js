// server.js - 플로우갓의 채팅방 v38 COMBO FIX FULL
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req,res)=> res.json({status:'ok', version:'v38 COMBO FIX FULL', comboCount:3}));

let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  console.log('[v38] user connected', socket.id, 'online:', onlineUsers);
  io.emit('onlineCount', {count: onlineUsers});

  socket.on('chatMessage', (data) => {
    console.log('[chat]', data);
    io.emit('chatMessage', data);
  });

  socket.on('emojiMessage', (data) => {
    console.log('[emoji]', data);
    io.emit('emojiMessage', data);
  });

  // ===== COMBO FIX v38 =====
  socket.on('emojiComboRain', (data) => {
    console.log('[COMBO_RAIN]', data.emoji, 'x'+data.count, 'by', data.user);
    io.emit('emojiComboRain', data);
  });

  socket.on('emojiFloat', (data) => {
    console.log('[COMBO_FLOAT]', data.emoji, 'by', data.user);
    io.emit('emojiFloat', data);
  });

  socket.on('disconnect', () => {
    onlineUsers = Math.max(0, onlineUsers-1);
    console.log('[v38] disconnected', socket.id, 'online:', onlineUsers);
    io.emit('onlineCount', {count: onlineUsers});
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('=================================');
  console.log(' 플로우갓의 채팅방 v38 COMBO FIX FULL');
  console.log(' COMBO_COUNT=3');
  console.log(' Events: emojiComboRain, emojiFloat');
  console.log(' Running on http://localhost:'+PORT);
  console.log('=================================');
});
