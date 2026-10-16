import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, maxHttpBufferSize: 1e7 });
const PORT = process.env.PORT || 10000;

const HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>실시간 채팅</title>
<style>
:root{--bg:#fff;--header:rgba(255,255,255,.9);--msgBg:#ABC1D1;--my:#FEE500;--other:#fff;--text:#111;--border:#eee;--inputBg:#f2f2f2;--sheet:#fff}
[data-theme="dark"]{--bg:#121212;--header:rgba(18,18,18,.9);--msgBg:#0f1419;--my:#FEE500;--other:#2a2f36;--text:#e8e8e8;--border:#2a2a2a;--inputBg:#1e1e1e;--sheet:#1e1e1e}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:var(--bg);color:var(--text);height:100dvh;display:flex;justify-content:center;align-items:center;padding-top:env(safe-area-inset-top);transition:.2s}
.app{width:100%;max-width:420px;height:100dvh;height:calc(100dvh - env(safe-area-inset-top));background:var(--bg);display:flex;flex-direction:column;position:relative;overflow:hidden}
@media(min-width:500px){.app{height:90dvh;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,.25)}}
.header{background:var(--header);backdrop-filter:blur(20px);padding:12px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)}
.header b{font-size:14px;display:flex;align-items:center;gap:6px}
.crown{font-size:12px;background:#FFD700;color:#000;padding:2px 6px;border-radius:10px;font-weight:800}
.right{display:flex;gap:6px;align-items:center}
.btnTop{padding:6px 10px;border-radius:20px;border:1px solid var(--border);background:var(--inputBg);font-size:12px;font-weight:600;cursor:pointer;color:var(--text)}
.btnTop.save{background:#000;color:#fff;border-color:#000;display:none}
.btnTop.save.show{display:block}
[data-theme="dark"] .btnTop.save{background:#fff;color:#000}
.iconCircle{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:var(--inputBg);display:grid;place-items:center;cursor:pointer;font-size:16px}
.login{flex:1;display:flex;flex-direction:column;justify-content:center;padding:32px;gap:16px;background:var(--bg)}
.login input{padding:14px;border:1px solid var(--border);border-radius:12px;font-size:16px;background:var(--inputBg);color:var(--text)}
.login button{padding:14px;background:#FEE500;border:none;border-radius:12px;font-weight:700;font-size:16px;cursor:pointer;color:#000}
.chars{display:flex;gap:8px;flex-wrap:wrap}
.char{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:var(--inputBg);cursor:pointer;border:2px solid transparent}
.char.sel{border-color:#000;background:#FEE500;color:#000}
.messages{flex:1;overflow-y:auto;padding:16px;background:var(--msgBg);display:flex;flex-direction:column;gap:10px}
.msg{max-width:80%;padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:keep-all;overflow-wrap:break-word;color:#111;animation:pop .2s}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.msg.me{align-self:flex-end;background:var(--my);border-bottom-right-radius:4px}
.msg.other{align-self:flex-start;background:var(--other);border-bottom-left-radius:4px}
[data-theme="dark"] .msg.other{color:#e8e8e8}
.sender{font-size:12px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:4px}
.meta{font-size:10px;color:#666;margin-top:4px;text-align:right}
.system{align-self:center;background:rgba(0,0,0,.25);color:#fff;padding:5px 12px;border-radius:20px;font-size:12px;animation:pop .3s}
.msg img.preview{max-width:100%;border-radius:12px;margin-top:6px;display:block}
.emojiBar{display:flex;gap:6px;padding:8px 10px;background:var(--bg);border-top:1px solid var(--border);overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.emojiBar::-webkit-scrollbar{display:none}
.eBtn{flex-shrink:0;height:34px;padding:0 10px;border-radius:18px;border:1px solid var(--border);background:var(--inputBg);font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;color:var(--text)}
.quickTabs{display:flex;gap:6px;padding:6px 10px;background:var(--bg);border-top:1px solid var(--border)}
.qTab{font-size:11px;padding:4px 10px;border-radius:12px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--text)}
.qTab.active{background:#000;color:#fff;border-color:#000}
[data-theme="dark"] .qTab.active{background:#fff;color:#000}
.clipSheet{position:absolute;left:0;right:0;bottom:0;background:var(--sheet);border-top-left-radius:20px;border-top-right-radius:20px;box-shadow:0 -10px 30px rgba(0,0,0,.3);z-index:100;padding:16px;display:none;flex-direction:column;gap:12px}
.clipSheet.show{display:flex}
.sheetHeader{display:flex;justify-content:space-between;align-items:center;font-weight:700}
.sheetBtn{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--border);border-radius:14px;background:var(--bg);cursor:pointer;width:100%;color:var(--text)}
.sheetBtn .ico{width:44px;height:44px;border-radius:12px;background:var(--inputBg);display:grid;place-items:center;font-size:22px;border:1px solid var(--border)}
.inputArea{display:flex;gap:8px;padding:10px;background:var(--bg);border-top:1px solid var(--border);align-items:center}
.inputArea input{flex:1;padding:12px 16px;border:none;background:var(--inputBg);border-radius:24px;font-size:14px;outline:none;color:var(--text)}
.iconBtn{width:40px;height:40px;border-radius:50%;border:none;background:var(--inputBg);display:grid;place-items:center;font-size:18px;cursor:pointer;flex-shrink:0;color:var(--text)}
.send{background:#FEE500!important;color:#000!important}
.overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:99;display:none}
.overlay.show{display:block}
.participants{display:flex;gap:-6px;padding:6px 14px;background:var(--bg);border-bottom:1px solid var(--border);overflow-x:auto;align-items:center}
.pAvatar{width:28px;height:28px;border-radius:50%;border:2px solid var(--bg);display:grid;place-items:center;font-size:14px;background:var(--inputBg);margin-left:-6px}
.pAvatar:first-child{margin-left:0}
.pCount{font-size:11px;color:#888;margin-left:8px}
</style>
</head>
<body>
<div class="app" id="app"></div>
<script src="/socket.io/socket.io.js"></script>
<script>
let appEl=document.getElementById('app');
let socket, myInfo, roomId='main-room', isComposing=false, isHost=false;
let theme = localStorage.getItem('chatTheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);

const EMOJI_GROUPS = {
  '반응': ['👍 좋아요','❤️ 하트','😂 웃겨','😢 슬퍼요','😮 와우','👏 짝짝'],
  '축하': ['🎉 축하해','🎂 생일축하','🥳 파티','🎁 선물','🏆 1등','👑 왕관','✨ 반짝'],
  '일상': ['☕ 커피','🍺 맥주','🍚 밥먹자','💪 화이팅','👋 하이','💤 잘자','🏃 운동']
};

function toggleTheme(){
  theme = theme==='light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('chatTheme', theme);
  const btn=document.getElementById('themeBtn');
  if(btn) btn.textContent = theme==='dark' ? '☀️' : '🌙';
}

function renderLogin(){
 appEl.innerHTML=\`
 <div class="login">
  <div style="display:flex;justify-content:space-between;align-items:center"><h1>🐣 실시간 채팅</h1><div class="iconCircle" onclick="toggleTheme()">\${theme==='dark'?'☀️':'🌙'}</div></div>
  <p style="color:#888;font-size:13px">첫 입장자가 방장! 방장만 저장 가능</p>
  <input id="nameIn" placeholder="내 이름" />
  <div><p style="font-size:13px;margin-bottom:8px">내 캐릭터</p><div class="chars" id="chars"></div></div>
  <input id="roomIn" placeholder="방 이름" value="main-room"/>
  <button onclick="enter()">입장하기 →</button>
 </div>\`;
 const emojis=['🐻','🐱','🐶','🐰','🦊','🐼','🐨','🐯','🐸','🐵','🦁','🐧'];
 let sel=emojis[0];
 const wrap=document.getElementById('chars');
 emojis.forEach(e=>{
   const d=document.createElement('div'); d.className='char'+(e===sel?' sel':''); d.textContent=e;
   d.onclick=()=>{sel=e; document.querySelectorAll('.char').forEach(c=>c.classList.remove('sel')); d.classList.add('sel')};
   wrap.appendChild(d);
 });
 window._sel=()=>sel;
}
function enter(){
 const name=document.getElementById('nameIn').value.trim();
 if(!name) return alert('이름 입력해줘');
 roomId=document.getElementById('roomIn').value.trim()||'main-room';
 myInfo={username:name, character:window._sel(), roomId};
 initSocket(); renderChat();
}
function initSocket(){
 socket=io(); 
 socket.emit('joinRoom', myInfo);
 socket.on('roomInfo', (info)=>{
   isHost = info.isHost;
   myInfo.isHost = isHost;
   updateHeader();
   renderParticipants(info.participants);
 });
 socket.on('chatMessage', addMsg); 
 socket.on('fileMessage', addFileMsg);
 socket.on('systemMessage', (txt)=> addSystem(txt));
 socket.on('participantsUpdate', (list)=> renderParticipants(list));
}
function updateHeader(){
 const saveBtn = document.getElementById('saveBtn');
 if(saveBtn){
   if(isHost){ saveBtn.classList.add('show'); saveBtn.innerHTML='👑 💾 저장'; }
   else { saveBtn.classList.remove('show'); }
 }
 const crown = document.getElementById('crown');
 if(crown){ crown.style.display = isHost ? 'inline-block' : 'none'; }
}
function renderChat(){
 const tabs = Object.keys(EMOJI_GROUPS).map((k,i)=>\`<button class="qTab \${i==0?'active':''}" onclick="switchTab(this,'\${k}')">\${k}</button>\`).join('');
 const firstGroup = EMOJI_GROUPS[Object.keys(EMOJI_GROUPS)[0]].map(e=>emojiBtnHtml(e)).join('');
 appEl.innerHTML=\`
  <div class="header">
    <b><span id="crown" class="crown" style="display:none">방장</span> \${myInfo.character} \${myInfo.username} · \${roomId}</b>
    <div class="right">
      <button class="btnTop save" id="saveBtn" onclick="saveChat()">💾 저장</button>
      <div class="iconCircle" id="themeBtn" onclick="toggleTheme()">\${theme==='dark'?'☀️':'🌙'}</div>
    </div>
  </div>
  <div class="participants" id="participants"></div>
  <div class="messages" id="msgs"></div>
  <div class="quickTabs">\${tabs}</div>
  <div class="emojiBar" id="emojiBar">\${firstGroup}</div>
  <div class="overlay" id="overlay" onclick="closeClip()"></div>
  <div class="clipSheet" id="clipSheet">
    <div class="sheetHeader"><span>📎 보내기</span><button onclick="closeClip()" style="border:none;background:none;font-size:20px;color:var(--text)">✕</button></div>
    <button class="sheetBtn" onclick="triggerPhoto()"><div class="ico">📸</div><div class="txt"><b>사진 보내기</b><span>자동 압축</span></div></button>
    <button class="sheetBtn" onclick="triggerFile()"><div class="ico">📄</div><div class="txt"><b>파일 보내기</b><span>10MB 이하</span></div></button>
  </div>
  <div class="inputArea">
   <button class="iconBtn" onclick="openClip()">📎</button>
   <input id="photoIn" type="file" accept="image/*" hidden onchange="handlePhoto(this.files[0])"/>
   <input id="fileIn" type="file" hidden onchange="handleFile(this.files[0])"/>
   <input id="textIn" placeholder="메시지 입력" autocomplete="off" />
   <button class="iconBtn" onclick="toggleEmojiBar()">😊</button>
   <button class="iconBtn send" onclick="sendText()">↑</button>
  </div>\`;
 const textIn=document.getElementById('textIn'); textIn.focus();
 textIn.addEventListener('compositionstart', ()=>{ isComposing=true; });
 textIn.addEventListener('compositionend', ()=>{ setTimeout(()=>{ isComposing=false; },80); });
 textIn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ if(isComposing||e.isComposing||e.keyCode===229) return; e.preventDefault(); sendText(); } });
 window.emojiVisible=true;
 updateHeader();
}
function renderParticipants(list){
 const el=document.getElementById('participants');
 if(!el) return;
 if(!list || list.length===0){ el.innerHTML=''; return; }
 const avatars = list.slice(0,6).map(u=>\`<div class="pAvatar" title="\${u.username}">\${u.character}</div>\`).join('');
 const more = list.length>6 ? \`+${list.length-6}\` : '';
 el.innerHTML = avatars + \`<span class="pCount">\${list.length}명 접속중 \${more}</span>\`;
}
function openClip(){ document.getElementById('clipSheet').classList.add('show'); document.getElementById('overlay').classList.add('show'); }
function closeClip(){ document.getElementById('clipSheet').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); }
function triggerPhoto(){ document.getElementById('photoIn').click(); closeClip(); }
function triggerFile(){ document.getElementById('fileIn').click(); closeClip(); }
function emojiBtnHtml(full){ const emoji=full.split(' ')[0]; const label=full.split(' ').slice(1).join(' '); return \`<button class="eBtn" onclick="insertEmoji('\${full}')"><span style="font-size:16px">\${emoji}</span> \${label}</button>\`; }
function switchTab(btn,group){ document.querySelectorAll('.qTab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); document.getElementById('emojiBar').innerHTML=EMOJI_GROUPS[group].map(e=>emojiBtnHtml(e)).join(''); }
function insertEmoji(full){ const inp=document.getElementById('textIn'); const toInsert=full+' '; const start=inp.selectionStart||inp.value.length; inp.value=inp.value.slice(0,start)+toInsert+inp.value.slice(start); inp.focus(); }
function toggleEmojiBar(){ const bar=document.getElementById('emojiBar'); const tabs=document.querySelector('.quickTabs'); window.emojiVisible=!window.emojiVisible; bar.style.display=window.emojiVisible?'flex':'none'; tabs.style.display=window.emojiVisible?'flex':'none'; }
function escapeHtml(str){ return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function addMsg(data){
 const isMe=data.username===myInfo.username;
 const el=document.createElement('div'); el.className=isMe?'msg me':'msg other';
 el.innerHTML=\`<div class="sender">\${data.character} \${escapeHtml(data.username)} \${data.isHost?'<span class="crown">방장</span>':''}</div><div>\${escapeHtml(data.text)}</div><div class="meta">\${new Date(data.id).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div>\`;
 document.getElementById('msgs').appendChild(el); scroll();
}
function addSystem(txt){ const el=document.createElement('div'); el.className='system'; el.textContent=txt; document.getElementById('msgs').appendChild(el); scroll(); }
function addFileMsg(data){
 const el=document.createElement('div'); el.className=data.username===myInfo.username?'msg me':'msg other';
 let c=\`<div class="sender">\${data.character} \${escapeHtml(data.username)} \${data.isHost?'<span class="crown">방장</span>':''}</div>\`;
 if(data.isImage){ c+=\`<img class="preview" src="\${data.dataUrl}" onclick="window.open('\${data.dataUrl}')"/>\`; }
 else{ c+=\`<div>📄 \${escapeHtml(data.fileName)}</div><a href="\${data.dataUrl}" download="\${data.fileName}" style="font-size:12px;color:#007AFF">다운로드</a>\`; }
 c+=\`<div class="meta">\${new Date(data.id).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div>\`;
 el.innerHTML=c; document.getElementById('msgs').appendChild(el); scroll();
}
function scroll(){ const m=document.getElementById('msgs'); m.scrollTop=m.scrollHeight; }
function sendText(){ if(isComposing) return; const inp=document.getElementById('textIn'); let t=inp.value.trim(); if(!t) return; socket.emit('chatMessage',{...myInfo, text:t, isHost}); inp.value=''; inp.focus(); }
function saveChat(){
  if(!isHost){ alert('저장은 방장만 할 수 있어요!'); return; }
  const msgsEl = document.getElementById('msgs');
  let text = '=== 채팅 기록 (방장 저장) ===\\n방: ' + roomId + '\\n날짜: ' + new Date().toLocaleString('ko-KR') + '\\n방장: ' + myInfo.username + '\\n================\\n\\n';
  Array.from(msgsEl.children).forEach(child => {
    if(child.classList.contains('system')){ text += '[시스템] ' + child.textContent + '\\n'; }
    else if(child.classList.contains('msg')){ 
      const sender = child.querySelector('.sender')?.textContent || ''; 
      const time = child.querySelector('.meta')?.textContent || ''; 
      const body = child.textContent.replace(sender,'').replace(time,'').trim();
      text += '[' + time + '] ' + sender + ': ' + body + '\\n'; 
    }
  });
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='채팅기록_' + new Date().toISOString().slice(0,10) + '_' + roomId + '.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  alert('👑 방장 저장 완료! 파일 다운로드 됐어요.');
  fetch('/export').then(r=>r.text()).then(t=>console.log('export length', t.length));
}
function handlePhoto(file){
 if(!file) return; if(file.size>5*1024*1024) return alert('사진은 5MB 이하만!');
 const reader=new FileReader(); reader.onload=()=>{ const img=new Image(); img.onload=()=>{ const canvas=document.createElement('canvas'); const maxW=800; let w=img.width,h=img.height; if(w>maxW){ h=h*maxW/w; w=maxW; } canvas.width=w; canvas.height=h; canvas.getContext('2d').drawImage(img,0,0,w,h); const comp=canvas.toDataURL('image/jpeg',0.7); socket.emit('fileMessage',{...myInfo, fileName:file.name, size:file.size, dataUrl:comp, isImage:true, isHost}); }; img.src=reader.result; }; reader.readAsDataURL(file);
}
function handleFile(file){
 if(!file) return; if(file.size>10*1024*1024) return alert('파일은 10MB 이하만!');
 const reader=new FileReader(); reader.onload=()=>{ const isImage=file.type.startsWith('image/'); socket.emit('fileMessage',{...myInfo, fileName:file.name, size:file.size, dataUrl:reader.result, isImage:isImage, isHost}); }; reader.readAsDataURL(file);
}
renderLogin();
</script>
</body>
</html>`;

app.get('/', (req,res)=> res.send(HTML));

let rooms = {}; // roomId -> {hostId, users: {socketId: userInfo}, history: []}
let chatHistory = [];

io.on('connection', (socket)=>{
  socket.on('joinRoom', (data)=>{
    const roomId = data.roomId;
    if(!rooms[roomId]) rooms[roomId] = { hostId: socket.id, users: {}, history: [] };
    
    const room = rooms[roomId];
    const isFirst = Object.keys(room.users).length === 0;
    if(isFirst) room.hostId = socket.id;
    
    const isHost = room.hostId === socket.id;
    data.isHost = isHost;
    
    socket.join(roomId);
    room.users[socket.id] = data;
    
    // 본인에게 방장 여부 알려주기
    socket.emit('roomInfo', { isHost, participants: Object.values(room.users), hostId: room.hostId });
    
    // 다른 사람들에게 참가자 업데이트
    socket.to(roomId).emit('participantsUpdate', Object.values(room.users));
    // 전체에게 입장 메시지
    io.to(roomId).emit('systemMessage', `${data.character} ${data.username}님이 입장하셨습니다 ${isHost ? '👑(방장)' : ''}`);
    
    // 방에 있는 사람들 목록을 본인에게도 다시 보내기 (전체 목록)
    io.to(roomId).emit('participantsUpdate', Object.values(room.users));
  });
  
  socket.on('chatMessage', (data)=>{
    const msg={...data, id:Date.now()};
    chatHistory.push(msg); if(chatHistory.length>1000) chatHistory.shift();
    const roomId = data.roomId;
    if(rooms[roomId]) rooms[roomId].history.push(msg);
    io.to(roomId).emit('chatMessage', msg);
  });
  
  socket.on('fileMessage', (data)=>{
    io.to(data.roomId).emit('fileMessage', {...data, id:Date.now()});
  });
  
  socket.on('disconnect', ()=>{
    for(const roomId in rooms){
      const room = rooms[roomId];
      if(room.users[socket.id]){
        const u = room.users[socket.id];
        delete room.users[socket.id];
        
        // 방장이 나가면 다음 사람에게 방장 위임
        if(socket.id === room.hostId && Object.keys(room.users).length > 0){
          const nextHostId = Object.keys(room.users)[0];
          room.hostId = nextHostId;
          room.users[nextHostId].isHost = true;
          io.to(nextHostId).emit('roomInfo', { isHost: true, participants: Object.values(room.users), hostId: nextHostId });
          io.to(roomId).emit('systemMessage', `👑 방장이 ${room.users[nextHostId].username}님에게 위임되었습니다`);
        }
        
        io.to(roomId).emit('systemMessage', `${u.character} ${u.username}님이 퇴장하셨습니다`);
        io.to(roomId).emit('participantsUpdate', Object.values(room.users));
        
        if(Object.keys(room.users).length === 0) delete rooms[roomId];
        break;
      }
    }
  });
});

app.get('/export', (req,res)=>{ const text=chatHistory.map(m=>`[${new Date(m.id).toLocaleString('ko-KR')}] ${m.character} ${m.username}${m.isHost?'👑':''}: ${m.text||m.fileName}`).join('\\n'); res.type('text/plain').send(text); });
server.listen(PORT, ()=> console.log(`👑 Host-only save on ${PORT}`));
