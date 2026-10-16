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

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// 비상용 HTML - public 파일 없어도 작동
const EMERGENCY_HTML = `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover">
<link rel="manifest" href="/manifest.json?v=11">
<link rel="apple-touch-icon" href="/my-icon-180.png?v=11">
<title>플로우갓의 채팅방</title>
<meta name="theme-color" content="#ffffff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="플로우갓의 채팅방">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;background:#fff;height:100dvh;display:flex;justify-content:center;align-items:center}.app{width:100%;max-width:420px;height:100dvh;background:#fff;display:flex;flex-direction:column}.header{background:#ffffffcc;backdrop-filter:blur(20px);padding:14px 16px;border-bottom:1px solid #f0f0f0;position:sticky;top:0}.bgmBar{display:flex;align-items:center;gap:8px;background:#f5f5f5;padding:8px 12px;border-radius:12px;font-size:13px}.bgmBar select{padding:4px 8px;border-radius:8px;border:1px solid #ddd}.bgmBar input[type=range]{flex:1;max-width:90px}.bgmBar button{padding:4px 8px;border-radius:8px;background:#fff;border:1px solid #ddd;cursor:pointer}.login{flex:1;display:flex;flex-direction:column;justify-content:center;padding:32px;gap:16px}.login h1{font-size:24px}.login input{padding:14px;border:1px solid #ddd;border-radius:12px;font-size:16px}.login button{padding:14px;background:#FEE500;border:none;border-radius:12px;font-weight:700;cursor:pointer}.chars{display:flex;gap:8px;flex-wrap:wrap}.char{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:#f5f5f5;cursor:pointer;border:2px solid transparent}.char.sel{border-color:#000;background:#FEE500}.messages{flex:1;overflow-y:auto;padding:16px;background:#ABC1D1;display:flex;flex-direction:column;gap:10px}.msg{max-width:78%;padding:10px 14px;border-radius:18px;font-size:15px;line-height:1.5;white-space:pre-wrap}.msg.me{align-self:flex-end;background:#FEE500;border-bottom-right-radius:4px}.msg.other{align-self:flex-start;background:#fff;border-bottom-left-radius:4px}.msg .sender{font-size:12px;font-weight:700;margin-bottom:4px}.system{align-self:center;background:rgba(0,0,0,.2);color:#fff;padding:4px 12px;border-radius:20px;font-size:12px}.inputArea{display:flex;gap:8px;padding:10px;background:#fff;border-top:1px solid #eee;align-items:center}.inputArea input{flex:1;padding:12px 16px;border:none;background:#f2f2f2;border-radius:24px;font-size:15px;outline:none}.iconBtn{width:40px;height:40px;border-radius:50%;border:none;background:#f2f2f2;display:grid;place-items:center;font-size:18px;cursor:pointer}.send{background:#FEE500}</style>
</head><body>
<script>if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister()));} if(window.caches){caches.keys().then(k=>k.forEach(x=>caches.delete(x)));}</script>
<div class="app" id="app"></div><audio id="bgmPlayer" loop preload="auto"></audio><audio id="enterSound" preload="auto"></audio>
<script src="/socket.io/socket.io.js"></script>
<script>
const appEl=document.getElementById('app');let socket,myInfo,roomId='main-room';let isComposing=false,isHost=false;let currentTrack=localStorage.getItem('lastBgmTrack')||'bgm1.mp3';let myVolume=parseFloat(localStorage.getItem('myBgmVolume')||'0.5');const bgmList=['bgm1.mp3','bgm2.mp3','bgm3.mp3','bgm4.mp3','bgm5.mp3'];
function renderLogin(){appEl.innerHTML='<div class=login><h1>🐣 플로우갓의 채팅방 입장</h1><p style=color:#666;font-size:14px>아이폰·갤럭시 둘 다 설치 가능! 플로우갓의 채팅방 v11 - 긴급복구</p><input id=nameIn placeholder=\"내 이름 (방장 포함하면 방장)\" /><div><p style=font-size:13px;margin-bottom:8px>내 캐릭터</p><div class=chars id=chars></div></div><input id=roomIn placeholder=\"방 이름\" value=main-room /><button onclick=enter()>입장하기 →</button></div>';const emojis=['🐻','🐱','🐶','🐰','🦊','🐼','🐨','🐯','🐸','🐵','🦁','🐧'];let sel=emojis[0];const wrap=document.getElementById('chars');emojis.forEach(e=>{const d=document.createElement('div');d.className='char'+(e===sel?' sel':'');d.textContent=e;d.onclick=()=>{sel=e;document.querySelectorAll('.char').forEach(c=>c.classList.remove('sel'));d.classList.add('sel')};wrap.appendChild(d);});window._sel=()=>sel;}
function enter(){const name=document.getElementById('nameIn').value.trim();if(!name)return alert('이름 입력');const room=document.getElementById('roomIn').value.trim()||'main-room';roomId=room;myInfo={username:name,character:window._sel(),roomId};isHost=name.includes('방장')||name.includes('플로우갓')||name.includes('관리자');initSocket();renderChat();initBgm();}
function playEnterSound(){try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const vol=ctx.createGain();vol.gain.value=myVolume*0.6;vol.connect(ctx.destination);[0,150].forEach((delay,idx)=>{setTimeout(()=>{const osc=ctx.createOscillator();osc.type='sine';osc.frequency.value=idx===0?800:1200;osc.connect(vol);osc.start();osc.stop(ctx.currentTime+0.25);},delay);});}catch(e){}}
function initSocket(){socket=io();socket.emit('joinRoom',myInfo);socket.on('chatMessage',d=>addMsg(d));socket.on('systemMessage',txt=>{addSystem(txt);if(txt.includes('들어왔')&&!txt.includes(myInfo.username))playEnterSound();});socket.on('userJoined',data=>{if(data.username!==myInfo.username){addSystem('🔔 '+(data.character||'🐣')+' '+data.username+'님이 들어왔습니다.');playEnterSound();}});socket.on('userLeft',data=>addSystem('👋 '+data.username+'님이 나갔습니다.'));socket.on('bgmTrackChange',track=>{if(bgmList.includes(track)){currentTrack=track;const p=document.getElementById('bgmPlayer');const was=!p.paused;p.src='/'+track+'?v=11';localStorage.setItem('lastBgmTrack',track);if(was)p.play().catch(()=>{});addSystem('🎵 BGM 변경: '+track);}});}
function renderChat(){appEl.innerHTML='<div class=header><div style=display:flex;justify-content:space-between><b>'+myInfo.character+' '+myInfo.username+' · '+roomId+' '+(isHost?'👑':'')+'</b></div><div id=bgmBarWrap></div></div><div class=messages id=msgs></div><div class=inputArea><input id=textIn placeholder=\"메시지 입력\" /><button class=iconBtn send onclick=sendText()>↑</button></div>';const ti=document.getElementById('textIn');ti.focus();ti.addEventListener('compositionstart',()=>{isComposing=true;});ti.addEventListener('compositionend',()=>{setTimeout(()=>{isComposing=false;},100);});ti.addEventListener('keydown',e=>{if(e.key==='Enter'){if(isComposing||e.isComposing||e.keyCode===229)return;e.preventDefault();sendText();}});renderBgmBar();}
function renderBgmBar(){const w=document.getElementById('bgmBarWrap');if(!w)return;const hostC=isHost?'<select id=bgmSelect onchange=changeTrack(this.value)>'+bgmList.map(t=>'<option value='+t+' '+(t===currentTrack?'selected':'')+'>'+t+'</option>').join('')+'</select>':'<span>🎵 '+currentTrack+'</span>';w.innerHTML='<div class=bgmBar><button id=bgmPlayBtn onclick=toggleBgm()>▶</button>'+hostC+'<span style=margin-left:auto>🔊</span><input type=range id=volSlider min=0 max=1 step=0.01 value='+myVolume+' oninput=changeMyVolume(this.value)><button onclick=toggleBgmMute()>🔇</button></div><div style=font-size:10px;color:#888>볼륨 개인 | 곡 변경 방장</div>';}
function initBgm(){const p=document.getElementById('bgmPlayer');p.src='/'+currentTrack+'?v=11';p.volume=myVolume;p.play().catch(()=>{});}
function toggleBgm(){const p=document.getElementById('bgmPlayer');if(p.paused){p.play().then(()=>{document.getElementById('bgmPlayBtn').textContent='⏸';}).catch(()=>{});}else{p.pause();document.getElementById('bgmPlayBtn').textContent='▶';}}
function changeTrack(t){if(!isHost)return alert('방장만');currentTrack=t;const p=document.getElementById('bgmPlayer');const was=!p.paused;p.src='/'+t+'?v=11';localStorage.setItem('lastBgmTrack',t);if(was)p.play().catch(()=>{});socket.emit('bgmTrackChange',t);addSystem('🎵 BGM 변경: '+t);}
function changeMyVolume(v){myVolume=parseFloat(v);document.getElementById('bgmPlayer').volume=myVolume;localStorage.setItem('myBgmVolume',myVolume);}
function toggleBgmMute(){const p=document.getElementById('bgmPlayer');const s=document.getElementById('volSlider');if(p.volume>0){s.dataset.prev=p.volume;changeMyVolume(0);s.value=0;}else{const prev=parseFloat(s.dataset.prev||'0.5');changeMyVolume(prev);s.value=prev;}}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function addMsg(d){const me=d.username===myInfo.username;const el=document.createElement('div');el.className=me?'msg me':'msg other';el.innerHTML='<div class=sender>'+d.character+' '+esc(d.username)+'</div><div>'+esc(d.text)+'</div>';document.getElementById('msgs').appendChild(el);scroll();}
function addSystem(t){const el=document.createElement('div');el.className='system';el.textContent=t;const m=document.getElementById('msgs');if(m){m.appendChild(el);scroll();}}
function scroll(){const m=document.getElementById('msgs');if(m)m.scrollTop=m.scrollHeight;}
function sendText(){if(isComposing)return;const i=document.getElementById('textIn');let t=i.value.trim();if(!t)return;t=t.replace(/\s+/g,' ');socket.emit('chatMessage',{...myInfo,text:t});i.value='';i.focus();}
renderLogin();
</script></body></html>`;

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0, etag: false }));
app.use(express.static(__dirname, { maxAge: 0, etag: false }));

app.get('/', (req, res) => {
  const fp = path.join(__dirname, 'public', 'index.html');
  try {
    if (fs.existsSync(fp)) {
      let data = fs.readFileSync(fp, 'utf8');
      // 강제 치환
      data = data.replace(/<title>.*?<\/title>/g, '<title>플로우갓의 채팅방</title>');
      data = data.replace(/실시간 채팅/g, '플로우갓의 채팅방');
      res.set('Content-Type', 'text/html; charset=utf-8');
      return res.send(data);
    }
  } catch(e){ console.log('파일 읽기 실패, 비상 HTML 사용', e); }
  console.log('public/index.html 없음 -> 비상 HTML 반환');
  res.set('Content-Type', 'text/html; charset=utf-8');
  return res.send(EMERGENCY_HTML);
});

app.get('/sw.js', (req,res)=>{
  res.set('Content-Type','application/javascript'); res.set('Cache-Control','no-store');
  res.send("const V='v11'; self.addEventListener('install',e=>{console.log('SW v11 설치'); self.skipWaiting();}); self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>{console.log('삭제',k); return caches.delete(k);}))).then(()=>self.clients.claim()));}); self.addEventListener('fetch',e=>{ e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request))); });");
});

let users={};
io.on('connection',(socket)=>{
  socket.on('joinRoom',(data)=>{ socket.join(data.roomId); users[socket.id]=data; socket.to(data.roomId).emit('systemMessage', `🔔 ${data.character||'🐣'} ${data.username}님이 들어왔습니다.`); socket.to(data.roomId).emit('userJoined', data); });
  socket.on('chatMessage',(data)=>{ io.to(data.roomId).emit('chatMessage',{...data,id:Date.now()}); });
  socket.on('bgmTrackChange',(track)=>{ const u=users[socket.id]; if(u) io.to(u.roomId).emit('bgmTrackChange',track); });
  socket.on('disconnect',()=>{ const u=users[socket.id]; if(u){ socket.to(u.roomId).emit('userLeft',u); delete users[socket.id]; } });
});

const PORT=process.env.PORT||10000;
server.listen(PORT,()=>console.log('플로우갓의 채팅방 v11 긴급서버:'+PORT));
