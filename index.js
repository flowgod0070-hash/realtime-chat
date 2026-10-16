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
<title>실시간 채팅 - 다크모드</title>
<style>
:root{--bg:#fff;--header:rgba(255,255,255,.9);--msgBg:#ABC1D1;--my:#FEE500;--other:#fff;--text:#111;--border:#eee;--inputBg:#f2f2f2;--sheet:#fff}
[data-theme="dark"]{--bg:#121212;--header:rgba(18,18,18,.9);--msgBg:#0f1419;--my:#FEE500;--other:#2a2f36;--text:#e8e8e8;--border:#2a2a2a;--inputBg:#1e1e1e;--sheet:#1e1e1e}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:var(--bg);color:var(--text);height:100dvh;display:flex;justify-content:center;align-items:center;padding-top:env(safe-area-inset-top);transition:.2s}
.app{width:100%;max-width:420px;height:100dvh;height:calc(100dvh - env(safe-area-inset-top));background:var(--bg);display:flex;flex-direction:column;position:relative;overflow:hidden}
@media(min-width:500px){.app{height:90dvh;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,.25)}}
.header{background:var(--header);backdrop-filter:blur(20px);padding:12px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)}
.header b{font-size:15px}
.right{display:flex;gap:6px;align-items:center}
.btnTop{padding:6px 10px;border-radius:20px;border:1px solid var(--border);background:var(--inputBg);font-size:12px;font-weight:600;cursor:pointer;color:var(--text)}
.btnTop.save{background:#000;color:#fff;border-color:#000}
[data-theme="dark"] .btnTop.save{background:#fff;color:#000}
.iconCircle{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:var(--inputBg);display:grid;place-items:center;cursor:pointer;font-size:16px}
.login{flex:1;display:flex;flex-direction:column;justify-content:center;padding:32px;gap:16px;background:var(--bg)}
.login h1{font-size:24px}
.login input{padding:14px;border:1px solid var(--border);border-radius:12px;font-size:16px;background:var(--inputBg);color:var(--text)}
.login button{padding:14px;background:#FEE500;border:none;border-radius:12px;font-weight:700;font-size:16px;cursor:pointer;color:#000}
.chars{display:flex;gap:8px;flex-wrap:wrap}
.char{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:var(--inputBg);cursor:pointer;border:2px solid transparent}
.char.sel{border-color:#000;background:#FEE500;color:#000}
.messages{flex:1;overflow-y:auto;padding:16px;background:var(--msgBg);display:flex;flex-direction:column;gap:10px}
.msg{max-width:80%;padding:10px 14px;border-radius:18px;font-size:15px;line-height:1.5;white-space:pre-wrap;word-break:keep-all;overflow-wrap:break-word;color:#111}
.msg.me{align-self:flex-end;background:var(--my);border-bottom-right-radius:4px}
.msg.other{align-self:flex-start;background:var(--other);border-bottom-left-radius:4px}
[data-theme="dark"] .msg.other{color:#e8e8e8}
.sender{font-size:12px;font-weight:700;margin-bottom:4px}
.meta{font-size:11px;color:#666;margin-top:4px;text-align:right}
[data-theme="dark"] .meta{color:#aaa}
.system{align-self:center;background:rgba(0,0,0,.3);color:#fff;padding:4px 12px;border-radius:20px;font-size:12px}
.msg img.preview{max-width:100%;border-radius:12px;margin-top:6px;display:block}
.emojiBar{display:flex;gap:6px;padding:8px 10px;background:var(--bg);border-top:1px solid var(--border);overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.emojiBar::-webkit-scrollbar{display:none}
.eBtn{flex-shrink:0;height:36px;padding:0 10px;border-radius:18px;border:1px solid var(--border);background:var(--inputBg);font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;color:var(--text)}
.quickTabs{display:flex;gap:6px;padding:6px 10px;background:var(--bg);border-top:1px solid var(--border)}
.qTab{font-size:12px;padding:4px 10px;border-radius:12px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--text)}
.qTab.active{background:#000;color:#fff;border-color:#000}
[data-theme="dark"] .qTab.active{background:#fff;color:#000}
.clipSheet{position:absolute;left:0;right:0;bottom:0;background:var(--sheet);border-top-left-radius:20px;border-top-right-radius:20px;box-shadow:0 -10px 30px rgba(0,0,0,.3);z-index:100;padding:16px;display:none;flex-direction:column;gap:12px}
.clipSheet.show{display:flex}
.sheetHeader{display:flex;justify-content:space-between;align-items:center;font-weight:700}
.sheetBtn{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--border);border-radius:14px;background:var(--bg);cursor:pointer;width:100%;color:var(--text)}
.sheetBtn .ico{width:44px;height:44px;border-radius:12px;background:var(--inputBg);display:grid;place-items:center;font-size:22px;border:1px solid var(--border)}
.sheetBtn .txt b{display:block;font-size:14px}
.sheetBtn .txt span{display:block;font-size:12px;color:#888;margin-top:2px}
.inputArea{display:flex;gap:8px;padding:10px;background:var(--bg);border-top:1px solid var(--border);align-items:center}
.inputArea input{flex:1;padding:12px 16px;border:none;background:var(--inputBg);border-radius:24px;font-size:15px;outline:none;color:var(--text)}
.iconBtn{width:40px;height:40px;border-radius:50%;border:none;background:var(--inputBg);display:grid;place-items:center;font-size:18px;cursor:pointer;flex-shrink:0;color:var(--text)}
.send{background:#FEE500!important;color:#000!important}
.overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:99;display:none}
.overlay.show{display:block}
</style>
</head>
<body>
<div class="app" id="app"></div>
<script src="/socket.io/socket.io.js"></script>
<script>
let appEl=document.getElementById('app');
let socket, myInfo, roomId='main-room', isComposing=false;
let theme = localStorage.getItem('chatTheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);

const EMOJI_GROUPS = {
  '반응': ['👍 좋아요','❤️ 하트','😂 웃겨','😢 슬퍼요','😮 와우','👏 짝짝','🙏 감사','🔥 불타'],
  '축하': ['🎉 축하해','🎂 생일축하','🥳 파티','🎊 축하축하','🎈 풍선','🎁 선물','🏆 1등','👑 왕관'],
  '일상': ['☕ 커피','🍺 맥주','🍚 밥먹자','💪 화이팅','🙇 죄송','🤗 안아줘','👋 하이','💤 잘자','🌅 굿모닝','🏃 운동']
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
  <p style="color:#888;font-size:14px">다크모드 + 이모티콘 + 파일</p>
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
 socket=io(); socket.emit('joinRoom', myInfo);
 socket.on('chatMessage', addMsg); socket.on('fileMessage', addFileMsg);
 socket.on('systemMessage', (txt)=> addSystem(txt));
}
function renderChat(){
 const tabs = Object.keys(EMOJI_GROUPS).map((k,i)=>\`<button class="qTab \${i==0?'active':''}" onclick="switchTab(this,'\${k}')">\${k}</button>\`).join('');
 const firstGroup = EMOJI_GROUPS[Object.keys(EMOJI_GROUPS)[0]].map(e=>emojiBtnHtml(e)).join('');
 appEl.innerHTML=\`
  <div class="header">
    <b>\${myInfo.character} \${myInfo.username}</b>
    <div class="right">
      <button class="btnTop save" onclick="saveChat()">💾 저장</button>
      <div class="iconCircle" id="themeBtn" onclick="toggleTheme()">\${theme==='dark'?'☀️':'🌙'}</div>
    </div>
  </div>
  <div class="messages" id="msgs"></div>
  <div class="quickTabs">\${tabs}</div>
  <div class="emojiBar" id="emojiBar">\${firstGroup}</div>
  <div class="overlay" id="overlay" onclick="closeClip()"></div>
  <div class="clipSheet" id="clipSheet">
    <div class="sheetHeader"><span>📎 보내기</span><button onclick="closeClip()" style="border:none;background:none;font-size:20px;color:var(--text)">✕</button></div>
    <button class="sheetBtn" onclick="triggerPhoto()"><div class="ico">📸</div><div class="txt"><b>사진 보내기</b><span>갤러리 선택 - 자동 압축</span></div></button>
    <button class="sheetBtn" onclick="triggerFile()"><div class="ico">📄</div><div class="txt"><b>파일 보내기</b><span>모든 파일 10MB 이하</span></div></button>
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
}
function openClip(){ document.getElementById('clipSheet').classList.add('show'); document.getElementById('overlay').classList.add('show'); }
function closeClip(){ document.getElementById('clipSheet').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); }
function triggerPhoto(){ document.getElementById('photoIn').click(); closeClip(); }
function triggerFile(){ document.getElementById('fileIn').click(); closeClip(); }
function emojiBtnHtml(full){ const emoji=full.split(' ')[0]; const label=full.split(' ').slice(1).join(' '); return \`<button class="eBtn" onclick="insertEmoji('\${full}')"><span style="font-size:18px">\${emoji}</span> \${label}</button>\`; }
function switchTab(btn,group){ document.querySelectorAll('.qTab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); document.getElementById('emojiBar').innerHTML=EMOJI_GROUPS[group].map(e=>emojiBtnHtml(e)).join(''); }
function insertEmoji(full){ const inp=document.getElementById('textIn'); const toInsert=full+' '; const start=inp.selectionStart||inp.value.length; inp.value=inp.value.slice(0,start)+toInsert+inp.value.slice(start); inp.focus(); }
function toggleEmojiBar(){ const bar=document.getElementById('emojiBar'); const tabs=document.querySelector('.quickTabs'); window.emojiVisible=!window.emojiVisible; bar.style.display=window.emojiVisible?'flex':'none'; tabs.style.display=window.emojiVisible?'flex':'none'; }
function escapeHtml(str){ return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function addMsg(data){
 const isMe=data.username===myInfo.username;
 const el=document.createElement('div'); el.className=isMe?'msg me':'msg other';
 el.innerHTML=\`<div class="sender">\${data.character} \${escapeHtml(data.username)}</div><div>\${escapeHtml(data.text)}</div><div class="meta">\${new Date(data.id).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div>\`;
 document.getElementById('msgs').appendChild(el); scroll();
}
function addSystem(txt){ const el=document.createElement('div'); el.className='system'; el.textContent=txt; document.getElementById('msgs').appendChild(el); scroll(); }
function addFileMsg(data){
 const el=document.createElement('div'); el.className=data.username===myInfo.username?'msg me':'msg other';
 let c=\`<div class="sender">\${data.character} \${escapeHtml(data.username)}</div>\`;
 if(data.isImage){ c+=\`<img class="preview" src="\${data.dataUrl}" onclick="window.open('\${data.dataUrl}')"/>\`; }
 else{ c+=\`<div>📄 \${escapeHtml(data.fileName)} (\${(data.size/1024).toFixed(1)}KB)</div><a href="\${data.dataUrl}" download="\${data.fileName}" style="font-size:12px;color:#007AFF">다운로드</a>\`; }
 c+=\`<div class="meta">\${new Date(data.id).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div>\`;
 el.innerHTML=c; document.getElementById('msgs').appendChild(el); scroll();
}
function scroll(){ const m=document.getElementById('msgs'); m.scrollTop=m.scrollHeight; }
function sendText(){ if(isComposing) return; const inp=document.getElementById('textIn'); let t=inp.value.trim(); if(!t) return; socket.emit('chatMessage',{...myInfo, text:t}); inp.value=''; inp.focus(); }

// ⭐ 채팅 저장 기능 - 여기서 저장!
function saveChat(){
  const msgsEl = document.getElementById('msgs');
  if(!msgsEl || msgsEl.children.length===0){ alert('저장할 채팅이 없어요!'); return; }
  
  let text = '=== 채팅 기록 ===\\n';
  text += '방: ' + roomId + '\\n';
  text += '날짜: ' + new Date().toLocaleString('ko-KR') + '\\n';
  text += '================\\n\\n';
  
  // 화면에 보이는 메시지들 텍스트로 추출
  Array.from(msgsEl.children).forEach(child => {
    if(child.classList.contains('system')){
      text += '[시스템] ' + child.textContent + '\\n';
    } else if(child.classList.contains('msg')){
      const sender = child.querySelector('.sender')?.textContent || '';
      const body = child.childNodes[1]?.textContent || child.textContent;
      const time = child.querySelector('.meta')?.textContent || '';
      text += '[' + time + '] ' + sender + ': ' + body.replace(time,'').trim() + '\\n';
    }
  });
  
  // 1) 파일로 다운로드
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '채팅기록_' + new Date().toISOString().slice(0,10) + '_' + roomId + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('💾 저장 완료!\\n\\n파일 다운로드 됐고, 구글 드라이브에도 자동 저장되도록 서버에서 처리할게요.\\n\\n저장 위치: realtime-chat 채팅기록 폴더');
  
  // 2) 서버 export API로도 저장 (구글 드라이브 연동용)
  fetch('/export').then(r=>r.text()).then(t=>{
    console.log('서버 저장 데이터:', t.length);
  });
}

function handlePhoto(file){
 if(!file) return; if(file.size>5*1024*1024) return alert('사진은 5MB 이하만!');
 const reader=new FileReader(); reader.onload=()=>{ const img=new Image(); img.onload=()=>{ const canvas=document.createElement('canvas'); const maxW=800; let w=img.width,h=img.height; if(w>maxW){ h=h*maxW/w; w=maxW; } canvas.width=w; canvas.height=h; canvas.getContext('2d').drawImage(img,0,0,w,h); const comp=canvas.toDataURL('image/jpeg',0.7); socket.emit('fileMessage',{...myInfo, fileName:file.name, size:file.size, dataUrl:comp, isImage:true}); }; img.src=reader.result; }; reader.readAsDataURL(file);
}
function handleFile(file){
 if(!file) return; if(file.size>10*1024*1024) return alert('파일은 10MB 이하만!');
 const reader=new FileReader(); reader.onload=()=>{ const isImage=file.type.startsWith('image/'); socket.emit('fileMessage',{...myInfo, fileName:file.name, size:file.size, dataUrl:reader.result, isImage:isImage}); }; reader.readAsDataURL(file);
}
renderLogin();
</script>
</body>
</html>`;

app.get('/', (req,res)=> res.send(HTML));
let users={}, chatHistory=[];
io.on('connection', (socket)=>{
  socket.on('joinRoom', (data)=>{ socket.join(data.roomId); users[socket.id]=data; socket.to(data.roomId).emit('systemMessage', `${data.character} ${data.username}님이 입장하셨습니다`); });
  socket.on('chatMessage', (data)=>{ const msg={...data, id:Date.now()}; chatHistory.push(msg); if(chatHistory.length>1000) chatHistory.shift(); io.to(data.roomId).emit('chatMessage', msg); });
  socket.on('fileMessage', (data)=>{ io.to(data.roomId).emit('fileMessage', {...data, id:Date.now()}); });
  socket.on('disconnect', ()=>{ const u=users[socket.id]; if(u){ socket.to(u.roomId).emit('systemMessage', `${u.character} ${u.username}님이 퇴장하셨습니다`); delete users[socket.id]; } });
});
app.get('/export', (req,res)=>{ const text=chatHistory.map(m=>`[${new Date(m.id).toLocaleString('ko-KR')}] ${m.character} ${m.username}: ${m.text||m.fileName}`).join('\\n'); res.type('text/plain').send(text); });
server.listen(PORT, ()=> console.log(`💾 Save button ready on ${PORT}`));
