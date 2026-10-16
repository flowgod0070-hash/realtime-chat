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
<title>실시간 채팅 + BGM</title>
<style>
:root{--bg:#fff;--header:rgba(255,255,255,.92);--msgBg:#ABC1D1;--my:#FEE500;--other:#fff;--text:#111;--border:#eee;--inputBg:#f2f2f2;--sheet:#fff}
[data-theme="dark"]{--bg:#121212;--header:rgba(18,18,18,.92);--msgBg:#0f1419;--my:#FEE500;--other:#2a2f36;--text:#e8e8e8;--border:#2a2a2a;--inputBg:#1e1e1e;--sheet:#1e1e1e}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:var(--bg);color:var(--text);height:100dvh;display:flex;justify-content:center;align-items:center;padding-top:env(safe-area-inset-top);transition:.2s}
.app{width:100%;max-width:420px;height:100dvh;height:calc(100dvh - env(safe-area-inset-top));background:var(--bg);display:flex;flex-direction:column;position:relative;overflow:hidden}
@media(min-width:500px){.app{height:90dvh;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,.25)}}
.header{background:var(--header);backdrop-filter:blur(20px);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)}
.header b{font-size:13px;display:flex;align-items:center;gap:5px}
.crown{font-size:10px;background:#FFD700;color:#000;padding:2px 6px;border-radius:10px;font-weight:800;display:none}
.crown.show{display:inline-block}
.right{display:flex;gap:5px;align-items:center}
.btnTop{padding:5px 9px;border-radius:20px;border:1px solid var(--border);background:var(--inputBg);font-size:11px;font-weight:600;cursor:pointer;color:var(--text)}
.btnTop.save{background:#000;color:#fff;border-color:#000;display:none}
.btnTop.save.show{display:block}
[data-theme="dark"] .btnTop.save{background:#fff;color:#000}
.iconCircle{width:30px;height:30px;border-radius:50%;border:1px solid var(--border);background:var(--inputBg);display:grid;place-items:center;cursor:pointer;font-size:14px}
.login{flex:1;display:flex;flex-direction:column;justify-content:center;padding:28px;gap:14px;background:var(--bg)}
.login input{padding:14px;border:1px solid var(--border);border-radius:12px;font-size:16px;background:var(--inputBg);color:var(--text)}
.login button{padding:14px;background:#FEE500;border:none;border-radius:12px;font-weight:700;font-size:16px;cursor:pointer;color:#000}
.chars{display:flex;gap:8px;flex-wrap:wrap}
.char{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-size:20px;background:var(--inputBg);cursor:pointer;border:2px solid transparent}
.char.sel{border-color:#000;background:#FEE500;color:#000}
.messages{flex:1;overflow-y:auto;padding:16px;background:var(--msgBg);display:flex;flex-direction:column;gap:10px}
.msg{max-width:80%;padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:keep-all;color:#111;animation:pop .2s}
@keyframes pop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
.msg.me{align-self:flex-end;background:var(--my);border-bottom-right-radius:4px}
.msg.other{align-self:flex-start;background:var(--other);border-bottom-left-radius:4px}
[data-theme="dark"] .msg.other{color:#e8e8e8}
.sender{font-size:11px;font-weight:700;margin-bottom:3px;display:flex;align-items:center;gap:4px}
.meta{font-size:10px;color:#555;margin-top:3px;text-align:right}
.system{align-self:center;background:rgba(0,0,0,.28);color:#fff;padding:5px 12px;border-radius:20px;font-size:11px}
.msg img.preview{max-width:100%;border-radius:12px;margin-top:6px;display:block}
.emojiBar{display:flex;gap:6px;padding:7px 10px;background:var(--bg);border-top:1px solid var(--border);overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.emojiBar::-webkit-scrollbar{display:none}
.eBtn{flex-shrink:0;height:32px;padding:0 9px;border-radius:18px;border:1px solid var(--border);background:var(--inputBg);font-size:11px;cursor:pointer;display:inline-flex;align-items:center;gap:3px;color:var(--text)}
.quickTabs{display:flex;gap:5px;padding:5px 10px;background:var(--bg);border-top:1px solid var(--border)}
.qTab{font-size:10px;padding:3px 8px;border-radius:12px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--text)}
.qTab.active{background:#000;color:#fff;border-color:#000}
[data-theme="dark"] .qTab.active{background:#fff;color:#000}
.clipSheet{position:absolute;left:0;right:0;bottom:0;background:var(--sheet);border-top-left-radius:20px;border-top-right-radius:20px;box-shadow:0 -10px 30px rgba(0,0,0,.3);z-index:100;padding:16px;display:none;flex-direction:column;gap:12px}
.clipSheet.show{display:flex}
.sheetHeader{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:14px}
.sheetBtn{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:14px;background:var(--bg);cursor:pointer;width:100%;color:var(--text)}
.sheetBtn .ico{width:40px;height:40px;border-radius:12px;background:var(--inputBg);display:grid;place-items:center;font-size:20px;border:1px solid var(--border)}
.inputArea{display:flex;gap:6px;padding:9px;background:var(--bg);border-top:1px solid var(--border);align-items:center}
.inputArea input{flex:1;padding:11px 14px;border:none;background:var(--inputBg);border-radius:24px;font-size:14px;outline:none;color:var(--text)}
.iconBtn{width:36px;height:36px;border-radius:50%;border:none;background:var(--inputBg);display:grid;place-items:center;font-size:16px;cursor:pointer;flex-shrink:0;color:var(--text)}
.send{background:#FEE500!important;color:#000!important}
.overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:99;display:none}
.overlay.show{display:block}
.participants{display:flex;gap:0;padding:5px 14px;background:var(--bg);border-bottom:1px solid var(--border);overflow-x:auto;align-items:center}
.pAvatar{width:24px;height:24px;border-radius:50%;border:2px solid var(--bg);display:grid;place-items:center;font-size:12px;background:var(--inputBg);margin-left:-5px;position:relative}
.pAvatar:first-child{margin-left:0}
.pAvatar.host{border-color:#FFD700}
.pCount{font-size:10px;color:#888;margin-left:8px;white-space:nowrap}

/* BGM Player */
.bgmBar{display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--bg);border-bottom:1px solid var(--border);font-size:11px}
.bgmBar .track{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#888}
.bgmControls{display:flex;gap:6px;align-items:center}
.bgmBtn{width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--inputBg);display:grid;place-items:center;cursor:pointer;font-size:12px}
.bgmBtn.active{background:#000;color:#fff;border-color:#000}
[data-theme="dark"] .bgmBtn.active{background:#fff;color:#000}
input[type=range]{width:60px;height:4px;accent-color:#000}
.bgmSheet{position:absolute;left:0;right:0;bottom:0;background:var(--sheet);border-top-left-radius:20px;border-top-right-radius:20px;box-shadow:0 -10px 30px rgba(0,0,0,.3);z-index:101;padding:16px;display:none;flex-direction:column;gap:12px}
.bgmSheet.show{display:flex}
.bgmOption{display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--bg);cursor:pointer}
.bgmOption.active{border-color:#000;background:var(--inputBg)}
.bgmOption .left b{font-size:13px;display:block}
.bgmOption .left span{font-size:11px;color:#888}
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

// BGM - 조용한 버전 3곡 (무료 저작권 프리 로파이)
const BGM_LIST = [
  {id:'lofi', name:'🌙 조용한 로파이', desc:'공부·작업용, 가장 조용함', url:'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3'},
  {id:'rain', name:'🌧️ 빗소리 + 피아노', desc:'비 오는 날 감성', url:'https://cdn.pixabay.com/audio/2022/03/24/audio_4d7d87fc38.mp3'},
  {id:'night', name:'🌃 새벽 카페', desc:'재즈 피아노, 졸릴 때', url:'https://cdn.pixabay.com/audio/2022/10/30/audio_fbd14dd40e.mp3'}
];
let currentBGM = 0;
let audioEl = null;
let isPlaying = false;
let bgmVol = parseFloat(localStorage.getItem('bgmVol') || '0.15'); // 기본 15% - 매우 조용

function initAudio(){
  if(audioEl) return;
  audioEl = new Audio();
  audioEl.loop = true;
  audioEl.volume = bgmVol;
  audioEl.preload = 'auto';
  audioEl.crossOrigin = 'anonymous';
  audioEl.addEventListener('play', ()=>{ isPlaying=true; updateBGMUI(); });
  audioEl.addEventListener('pause', ()=>{ isPlaying=false; updateBGMUI(); });
  audioEl.addEventListener('error', ()=>{ console.log('BGM load error, trying next'); });
}

function toggleBGM(){
  initAudio();
  if(isPlaying){
    audioEl.pause();
  } else {
    audioEl.src = BGM_LIST[currentBGM].url;
    audioEl.volume = bgmVol;
    audioEl.play().catch(e=>{
      console.log('autoplay blocked', e);
      alert('브라우저가 자동재생을 막았어요. 한 번 더 눌러주세요!');
    });
  }
}

function setBGMVol(v){
  bgmVol = parseFloat(v);
  localStorage.setItem('bgmVol', bgmVol);
  if(audioEl) audioEl.volume = bgmVol;
  const label = document.getElementById('volLabel');
  if(label) label.textContent = Math.round(bgmVol*100)+'%';
}

function selectBGM(idx){
  currentBGM = idx;
  localStorage.setItem('bgmIdx', idx);
  if(audioEl && isPlaying){
    audioEl.src = BGM_LIST[idx].url;
    audioEl.play();
  }
  updateBGMUI();
  closeBGMSheet();
}

function updateBGMUI(){
  const playBtn = document.getElementById('bgmPlayBtn');
  const track = document.getElementById('bgmTrack');
  if(playBtn) playBtn.textContent = isPlaying ? '⏸️' : '🎵';
  if(playBtn) playBtn.classList.toggle('active', isPlaying);
  if(track) track.textContent = (isPlaying ? '▶️ ' : '⏸️ ') + BGM_LIST[currentBGM].name;
  document.querySelectorAll('.bgmOption').forEach((el,i)=>{
    el.classList.toggle('active', i===currentBGM);
  });
}

function openBGMSheet(){ document.getElementById('bgmSheet').classList.add('show'); document.getElementById('overlay').classList.add('show'); }
function closeBGMSheet(){ document.getElementById('bgmSheet').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); }

const EMOJI_GROUPS = {
  '반응': ['👍 좋아요','❤️ 하트','😂 웃겨','😢 슬퍼요','👏 짝짝'],
  '축하': ['🎉 축하해','🎂 생일축하','🥳 파티','🎁 선물','🏆 1등','👑 왕관'],
  '일상': ['☕ 커피','🍺 맥주','💪 화이팅','👋 하이','💤 잘자','🏃 운동']
};

function toggleTheme(){
  theme = theme==='light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('chatTheme', theme);
  const btn=document.getElementById('themeBtn');
  if(btn) btn.textContent = theme==='dark' ? '☀️' : '🌙';
}

function renderLogin(){
 const savedIdx = parseInt(localStorage.getItem('bgmIdx')||'0');
 currentBGM = savedIdx;
 appEl.innerHTML=\`
 <div class="login">
  <div style="display:flex;justify-content:space-between;align-items:center"><h1>🐣 채팅 입장</h1><div style="display:flex;gap:6px"><div class="iconCircle" onclick="toggleTheme()">\${theme==='dark'?'☀️':'🌙'}</div></div></div>
  <p style="color:#888;font-size:12px">조용한 BGM + 방장 저장 + 다크모드</p>
  <input id="nameIn" placeholder="내 이름" />
  <div><p style="font-size:13px;margin-bottom:8px">내 캐릭터</p><div class="chars" id="chars"></div></div>
  <input id="roomIn" placeholder="방 이름" value="main-room"/>
  <div style="border:1px solid var(--border);border-radius:12px;padding:12px;background:var(--inputBg)">
    <p style="font-size:12px;font-weight:700;margin-bottom:6px">🎵 배경음악 미리듣기 (조용한 버전)</p>
    <div style="display:flex;gap:6px;align-items:center">
      <button class="btnTop" onclick="toggleBGM()" id="loginBgmBtn">🎵 재생</button>
      <span style="font-size:11px;color:#888" id="loginTrack">\${BGM_LIST[currentBGM].name}</span>
    </div>
  </div>
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
 initAudio();
 updateBGMUI();
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
   myInfo.socketId = info.mySocketId;
   updateHeader();
   renderParticipants(info.participants, info.hostId);
 });
 socket.on('chatMessage', addMsg); 
 socket.on('fileMessage', addFileMsg);
 socket.on('systemMessage', (txt)=> addSystem(txt));
 socket.on('participantsUpdate', (data)=> renderParticipants(data.participants, data.hostId));
}
function updateHeader(){
 const saveBtn = document.getElementById('saveBtn');
 const crown = document.getElementById('crown');
 if(saveBtn){ if(isHost){ saveBtn.classList.add('show'); } else { saveBtn.classList.remove('show'); } }
 if(crown){ if(isHost){ crown.classList.add('show'); } else { crown.classList.remove('show'); } }
}
function renderChat(){
 const tabs = Object.keys(EMOJI_GROUPS).map((k,i)=>\`<button class="qTab \${i==0?'active':''}" onclick="switchTab(this,'\${k}')">\${k}</button>\`).join('');
 const firstGroup = EMOJI_GROUPS[Object.keys(EMOJI_GROUPS)[0]].map(e=>emojiBtnHtml(e)).join('');
 const bgmOptions = BGM_LIST.map((b,i)=>\`
   <div class="bgmOption \${i===currentBGM?'active':''}" onclick="selectBGM(\${i})">
     <div class="left"><b>\${b.name}</b><span>\${b.desc}</span></div>
     <div>\${i===currentBGM?'✅':''}</div>
   </div>\`).join('');
 appEl.innerHTML=\`
  <div class="header">
    <b><span id="crown" class="crown">👑 방장</span> \${myInfo.character} \${myInfo.username}</b>
    <div class="right">
      <button class="btnTop save" id="saveBtn" onclick="saveChat()">💾 저장</button>
      <div class="iconCircle" id="themeBtn" onclick="toggleTheme()">\${theme==='dark'?'☀️':'🌙'}</div>
    </div>
  </div>
  <div class="bgmBar">
    <button class="bgmBtn" id="bgmPlayBtn" onclick="toggleBGM()">🎵</button>
    <div class="track" id="bgmTrack" onclick="openBGMSheet()">\${BGM_LIST[currentBGM].name}</div>
    <input type="range" min="0" max="0.5" step="0.01" value="\${bgmVol}" oninput="setBGMVol(this.value)" title="볼륨 (최대 50% - 조용함 유지)"/>
    <span style="font-size:10px;color:#888" id="volLabel">\${Math.round(bgmVol*100)}%</span>
    <button class="bgmBtn" onclick="openBGMSheet()">⋯</button>
  </div>
  <div class="participants" id="participants"></div>
  <div class="messages" id="msgs"></div>
  <div class="quickTabs">\${tabs}</div>
  <div class="emojiBar" id="emojiBar">\${firstGroup}</div>
  <div class="overlay" id="overlay" onclick="closeAllSheets()"></div>
  <div class="clipSheet" id="clipSheet">
    <div class="sheetHeader"><span>📎 보내기</span><button onclick="closeAllSheets()" style="border:none;background:none;font-size:20px;color:var(--text)">✕</button></div>
    <button class="sheetBtn" onclick="triggerPhoto()"><div class="ico">📸</div><div class="txt"><b>사진 보내기</b><span>자동 압축</span></div></button>
    <button class="sheetBtn" onclick="triggerFile()"><div class="ico">📄</div><div class="txt"><b>파일 보내기</b><span>10MB 이하</span></div></button>
  </div>
  <div class="bgmSheet" id="bgmSheet">
    <div class="sheetHeader"><span>🎵 배경음악 선택 (조용한 버전)</span><button onclick="closeAllSheets()" style="border:none;background:none;font-size:20px;color:var(--text)">✕</button></div>
    <p style="font-size:11px;color:#888">최대 볼륨 50%로 제한 - 채팅 방해 안 함. 입장 시 자동재생은 브라우저 정책상 첫 클릭 후 가능.</p>
    \${bgmOptions}
    <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
      <span style="font-size:11px">볼륨:</span>
      <input type="range" min="0" max="0.5" step="0.01" value="\${bgmVol}" oninput="setBGMVol(this.value)" style="flex:1"/>
      <span style="font-size:11px" id="volLabel2">\${Math.round(bgmVol*100)}%</span>
    </div>
    <button class="sheetBtn" onclick="toggleBGM()"><div class="ico">🎵</div><div class="txt"><b id="bgmAction">\${isPlaying?'일시정지':'재생하기'}</b><span>클릭으로 재생/정지</span></div></button>
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
 updateBGMUI();
}
function closeAllSheets(){ document.getElementById('clipSheet')?.classList.remove('show'); document.getElementById('bgmSheet')?.classList.remove('show'); document.getElementById('overlay')?.classList.remove('show'); }
function openClip(){ document.getElementById('clipSheet').classList.add('show'); document.getElementById('overlay').classList.add('show'); }
function openBGMSheet(){ document.getElementById('bgmSheet').classList.add('show'); document.getElementById('overlay').classList.add('show'); }
function triggerPhoto(){ document.getElementById('photoIn').click(); closeAllSheets(); }
function triggerFile(){ document.getElementById('fileIn').click(); closeAllSheets(); }
function emojiBtnHtml(full){ const emoji=full.split(' ')[0]; const label=full.split(' ').slice(1).join(' '); return \`<button class="eBtn" onclick="insertEmoji('\${full}')"><span style="font-size:16px">\${emoji}</span> \${label}</button>\`; }
function switchTab(btn,group){ document.querySelectorAll('.qTab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); document.getElementById('emojiBar').innerHTML=EMOJI_GROUPS[group].map(e=>emojiBtnHtml(e)).join(''); }
function insertEmoji(full){ const inp=document.getElementById('textIn'); const toInsert=full+' '; const start=inp.selectionStart||inp.value.length; inp.value=inp.value.slice(0,start)+toInsert+inp.value.slice(start); inp.focus(); }
function toggleEmojiBar(){ const bar=document.getElementById('emojiBar'); const tabs=document.querySelector('.quickTabs'); window.emojiVisible=!window.emojiVisible; bar.style.display=window.emojiVisible?'flex':'none'; tabs.style.display=window.emojiVisible?'flex':'none'; }
function escapeHtml(str){ return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function renderParticipants(list, hostId){
 const el=document.getElementById('participants'); if(!el) return;
 if(!list||list.length===0){ el.innerHTML=''; return; }
 const avatars = list.slice(0,6).map(u=>{
   const isH = u.socketId === hostId;
   return \`<div class="pAvatar \${isH?'host':''}" title="\${u.username} \${isH?'(방장)':''}">\${u.character}</div>\`;
 }).join('');
 el.innerHTML = avatars + \`<span class="pCount">\${list.length}명 | 방장: \${list.find(u=>u.socketId===hostId)?.username||'?'}</span>\`;
}
function addMsg(data){
 const isMe=data.socketId===myInfo.socketId;
 const el=document.createElement('div'); el.className=isMe?'msg me':'msg other';
 el.innerHTML=\`<div class="sender">\${data.character} \${escapeHtml(data.username)} \${data.isHost?'<span class="crown show">👑</span>':''}</div><div>\${escapeHtml(data.text)}</div><div class="meta">\${new Date(data.id).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div>\`;
 document.getElementById('msgs').appendChild(el); scroll();
}
function addSystem(txt){ const el=document.createElement('div'); el.className='system'; el.textContent=txt; document.getElementById('msgs').appendChild(el); scroll(); }
function addFileMsg(data){
 const el=document.createElement('div'); el.className=data.socketId===myInfo.socketId?'msg me':'msg other';
 let c=\`<div class="sender">\${data.character} \${escapeHtml(data.username)} \${data.isHost?'<span class="crown show">👑</span>':''}</div>\`;
 if(data.isImage){ c+=\`<img class="preview" src="\${data.dataUrl}" onclick="window.open('\${data.dataUrl}')"/>\`; }
 else{ c+=\`<div>📄 \${escapeHtml(data.fileName)}</div><a href="\${data.dataUrl}" download="\${data.fileName}" style="font-size:12px;color:#007AFF">다운로드</a>\`; }
 c+=\`<div class="meta">\${new Date(data.id).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div>\`;
 el.innerHTML=c; document.getElementById('msgs').appendChild(el); scroll();
}
function scroll(){ const m=document.getElementById('msgs'); m.scrollTop=m.scrollHeight; }
function sendText(){ if(isComposing) return; const inp=document.getElementById('textIn'); let t=inp.value.trim(); if(!t) return; socket.emit('chatMessage',{roomId, text:t}); inp.value=''; inp.focus(); }
function saveChat(){
  if(!isHost){ alert('방장만 저장 가능'); return; }
  socket.emit('requestExport', {roomId}, (res)=>{
    if(!res.allowed){ alert('방장 아님 - 서버 차단'); return; }
    const blob = new Blob([res.data], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='채팅기록_' + new Date().toISOString().slice(0,10) + '_' + roomId + '.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    alert('👑 방장 저장 완료!');
  });
}
function handlePhoto(file){
 if(!file) return; if(file.size>5*1024*1024) return alert('5MB 이하만!');
 const reader=new FileReader(); reader.onload=()=>{ const img=new Image(); img.onload=()=>{ const canvas=document.createElement('canvas'); const maxW=800; let w=img.width,h=img.height; if(w>maxW){ h=h*maxW/w; w=maxW; } canvas.width=w; canvas.height=h; canvas.getContext('2d').drawImage(img,0,0,w,h); const comp=canvas.toDataURL('image/jpeg',0.7); socket.emit('fileMessage',{roomId, fileName:file.name, size:file.size, dataUrl:comp, isImage:true}); }; img.src=reader.result; }; reader.readAsDataURL(file);
}
function handleFile(file){
 if(!file) return; if(file.size>10*1024*1024) return alert('10MB 이하만!');
 const reader=new FileReader(); reader.onload=()=>{ const isImage=file.type.startsWith('image/'); socket.emit('fileMessage',{roomId, fileName:file.name, size:file.size, dataUrl:reader.result, isImage:isImage}); }; reader.readAsDataURL(file);
}
renderLogin();
</script>
</body>
</html>`;

app.get('/', (req,res)=> res.send(HTML));
let rooms = {};
io.on('connection', (socket)=>{
  socket.on('joinRoom', (data)=>{
    const roomId = data.roomId;
    if(!rooms[roomId]) rooms[roomId] = { hostId: socket.id, users: {}, history: [], createdAt: Date.now() };
    const room = rooms[roomId];
    const isHost = room.hostId === socket.id;
    room.users[socket.id] = { socketId: socket.id, username: data.username, character: data.character, roomId, joinedAt: Date.now() };
    socket.join(roomId);
    socket.emit('roomInfo', { isHost, mySocketId: socket.id, hostId: room.hostId, participants: Object.values(room.users) });
    io.to(roomId).emit('participantsUpdate', { participants: Object.values(room.users), hostId: room.hostId });
    io.to(roomId).emit('systemMessage', `${data.character} ${data.username}님이 입장하셨습니다 ${isHost ? '👑(방장)' : ''}`);
  });
  socket.on('chatMessage', (data)=>{
    const room = rooms[data.roomId]; if(!room) return; const user=room.users[socket.id]; if(!user) return;
    const isHost = room.hostId === socket.id;
    const msg={ socketId: socket.id, username: user.username, character: user.character, roomId: data.roomId, text: data.text, isHost, id: Date.now() };
    room.history.push(msg); if(room.history.length>1000) room.history.shift();
    io.to(data.roomId).emit('chatMessage', msg);
  });
  socket.on('fileMessage', (data)=>{
    const room = rooms[data.roomId]; if(!room) return; const user=room.users[socket.id]; if(!user) return;
    const isHost = room.hostId === socket.id;
    io.to(data.roomId).emit('fileMessage', { socketId: socket.id, username: user.username, character: user.character, roomId: data.roomId, fileName: data.fileName, size: data.size, dataUrl: data.dataUrl, isImage: data.isImage, isHost, id: Date.now() });
  });
  socket.on('requestExport', (data, cb)=>{
    const room = rooms[data.roomId]; if(!room){ cb({allowed:false}); return; }
    if(room.hostId !== socket.id){ cb({allowed:false}); return; }
    const text = room.history.map(m=>`[${new Date(m.id).toLocaleString('ko-KR')}] ${m.character} ${m.username}${m.isHost?'👑':''}: ${m.text||m.fileName}`).join('\\n');
    cb({allowed:true, data:text});
  });
  socket.on('disconnect', ()=>{
    for(const roomId in rooms){
      const room = rooms[roomId];
      if(room.users[socket.id]){
        const u = room.users[socket.id]; delete room.users[socket.id];
        if(socket.id === room.hostId && Object.keys(room.users).length > 0){
          const sorted = Object.values(room.users).sort((a,b)=>a.joinedAt - b.joinedAt);
          const nextHost = sorted[0]; room.hostId = nextHost.socketId;
          io.to(roomId).emit('systemMessage', `👑 방장이 ${nextHost.username}님에게 위임되었습니다`);
          for(const sid in room.users){
            io.to(sid).emit('roomInfo', { isHost: sid===room.hostId, mySocketId: sid, hostId: room.hostId, participants: Object.values(room.users) });
            io.to(sid).emit('participantsUpdate', { participants: Object.values(room.users), hostId: room.hostId });
          }
        } else {
          io.to(roomId).emit('participantsUpdate', { participants: Object.values(room.users), hostId: room.hostId });
          io.to(roomId).emit('systemMessage', `${u.character} ${u.username}님이 퇴장하셨습니다`);
        }
        if(Object.keys(room.users).length===0) delete rooms[roomId];
        break;
      }
    }
  });
});
app.get('/export', (req,res)=>{
  let all=[]; for(const rid in rooms) all=all.concat(rooms[rid].history);
  const text = all.map(m=>`[${new Date(m.id).toLocaleString('ko-KR')}] ${m.character} ${m.username}${m.isHost?'👑':''}: ${m.text||m.fileName}`).join('\\n');
  res.type('text/plain').send(text);
});
server.listen(PORT, ()=> console.log(`🎵 BGM quiet on ${PORT}`));
