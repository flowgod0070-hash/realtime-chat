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
:root{--bg:#fff;--header:rgba(255,255,255,.92);--msgBg:#ABC1D1;--my:#FEE500;--other:#fff;--text:#111;--border:#eee;--inputBg:#f2f2f2;--sheet:#fff}
[data-theme="dark"]{--bg:#121212;--header:rgba(18,18,18,.92);--msgBg:#0f1419;--my:#FEE500;--other:#2a2f36;--text:#e8e8e8;--border:#2a2a2a;--inputBg:#1e1e1e;--sheet:#1e1e1e}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:var(--bg);color:var(--text);height:100dvh;display:flex;justify-content:center;align-items:center;padding-top:env(safe-area-inset-top)}
.app{width:100%;max-width:420px;height:100dvh;height:calc(100dvh - env(safe-area-inset-top));background:var(--bg);display:flex;flex-direction:column;position:relative;overflow:hidden}
@media(min-width:500px){.app{height:90dvh;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,.25)}}
.header{background:var(--header);backdrop-filter:blur(20px);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)}
.header b{font-size:12px;display:flex;align-items:center;gap:4px}
.crown{font-size:10px;background:#FFD700;color:#000;padding:2px 6px;border-radius:10px;font-weight:800;display:none}
.crown.show{display:inline-block}
.right{display:flex;gap:4px;align-items:center}
.btnTop{padding:5px 9px;border-radius:20px;border:1px solid var(--border);background:var(--inputBg);font-size:11px;font-weight:600;cursor:pointer;color:var(--text)}
.btnTop.save{background:#000;color:#fff;border-color:#000;display:none}
.btnTop.save.show{display:block}
[data-theme="dark"] .btnTop.save{background:#fff;color:#000}
.iconCircle{width:30px;height:30px;border-radius:50%;border:1px solid var(--border);background:var(--inputBg);display:grid;place-items:center;cursor:pointer;font-size:14px}
.login{flex:1;display:flex;flex-direction:column;justify-content:center;padding:28px;gap:14px;background:var(--bg)}
.login h1{font-size:22px}
.login input{padding:14px;border:1px solid var(--border);border-radius:12px;font-size:16px;background:var(--inputBg);color:var(--text)}
.login button{padding:14px;background:#FEE500;border:none;border-radius:12px;font-weight:700;font-size:16px;cursor:pointer;color:#000}
.chars{display:flex;gap:8px;flex-wrap:wrap}
.char{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-size:20px;background:var(--inputBg);cursor:pointer;border:2px solid transparent}
.char.sel{border-color:#000;background:#FEE500;color:#000}
.messages{flex:1;overflow-y:auto;padding:16px;background:var(--msgBg);display:flex;flex-direction:column;gap:10px}
.msg{max-width:80%;padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:keep-all;color:#111}
.msg.me{align-self:flex-end;background:var(--my);border-bottom-right-radius:4px}
.msg.other{align-self:flex-start;background:var(--other);border-bottom-left-radius:4px}
[data-theme="dark"] .msg.other{color:#e8e8e8}
.sender{font-size:11px;font-weight:700;margin-bottom:3px;display:flex;align-items:center;gap:4px}
.meta{font-size:10px;color:#555;margin-top:3px;text-align:right}
.system{align-self:center;background:rgba(0,0,0,.28);color:#fff;padding:5px 12px;border-radius:20px;font-size:11px}
.msg img.preview{max-width:200px;max-height:200px;border-radius:12px;margin-top:8px;display:block;cursor:pointer;object-fit:cover;border:2px solid transparent;transition:.15s;touch-action:manipulation}
.msg img.preview:active{transform:scale(.97)}
.photoHint{font-size:10px;color:#666;margin-top:4px}
.emojiBar{display:flex;gap:6px;padding:7px 10px;background:var(--bg);border-top:1px solid var(--border);overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.emojiBar::-webkit-scrollbar{display:none}
.eBtn{flex-shrink:0;height:32px;padding:0 9px;border-radius:18px;border:1px solid var(--border);background:var(--inputBg);font-size:11px;cursor:pointer;display:inline-flex;align-items:center;gap:3px;color:var(--text)}
.quickTabs{display:flex;gap:5px;padding:5px 10px;background:var(--bg);border-top:1px solid var(--border)}
.qTab{font-size:10px;padding:3px 8px;border-radius:12px;border:1px solid var(--border);background:var(--bg);cursor:pointer;color:var(--text)}
.qTab.active{background:#000;color:#fff;border-color:#000}
[data-theme="dark"] .qTab.active{background:#fff;color:#000}
.clipSheet,.bgmSheet{position:absolute;left:0;right:0;bottom:0;background:var(--sheet);border-top-left-radius:20px;border-top-right-radius:20px;box-shadow:0 -10px 30px rgba(0,0,0,.3);z-index:100;padding:16px;display:none;flex-direction:column;gap:10px;max-height:75%;overflow-y:auto}
.clipSheet.show,.bgmSheet.show{display:flex}
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
.pAvatar{width:24px;height:24px;border-radius:50%;border:2px solid var(--bg);display:grid;place-items:center;font-size:12px;background:var(--inputBg);margin-left:-5px}
.pAvatar:first-child{margin-left:0}
.pAvatar.host{border-color:#FFD700}
.pCount{font-size:10px;color:#888;margin-left:8px;white-space:nowrap}
.bgmBar{display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--bg);border-bottom:1px solid var(--border);font-size:11px}
.bgmBar .track{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#888;cursor:pointer}
.bgmBtn{width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--inputBg);display:grid;place-items:center;cursor:pointer;font-size:12px}
.bgmBtn.active{background:#000;color:#fff;border-color:#000}
.bgmBtn:disabled{opacity:.4;cursor:not-allowed}
input[type=range]{width:80px;height:6px;accent-color:#000;cursor:pointer}
.bgmOption{display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--bg);cursor:pointer;transition:.15s}
.bgmOption.active{border-color:#000;background:#000;color:#fff}
.bgmOption.active span{color:#ccc!important}
.badge{font-size:9px;background:#FFD700;color:#000;padding:2px 5px;border-radius:8px;font-weight:700;margin-left:6px}
.photoModal{position:absolute;inset:0;background:rgba(0,0,0,.9);z-index:200;display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px}
.photoModal.show{display:flex}
.photoModal img{max-width:90%;max-height:70%;border-radius:16px;object-fit:contain}
.photoModal .closeBtn{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);border:none;color:#fff;font-size:18px;cursor:pointer;display:grid;place-items:center}
.photoModal .actionBar{display:flex;gap:8px;margin-top:16px}
.photoModal .actionBtn{padding:8px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.15);color:#fff;font-size:12px;cursor:pointer}
</style>
</head>
<body>
<div class="app" id="app"></div>
<script src="/socket.io/socket.io.js"></script>
<script>
let appEl=document.getElementById('app');
let socket, myInfo, roomId='main-room', isHost=false;
let theme = localStorage.getItem('chatTheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);

const BGM_LIST = [
  {id:'lofi1', name:'🌙 조용한 로파이 1', desc:'공부용'},
  {id:'lofi2', name:'☕ 카페 로파이', desc:'보사노바'},
  {id:'rain', name:'🌧️ 빗소리 피아노', desc:'비오는 날'},
  {id:'night', name:'🌃 새벽 재즈', desc:'졸릴 때'},
  {id:'forest', name:'🍃 숲속 바람', desc:'힐링'}
];

let currentBGM = 0;
let audioContext = null;
let masterGain = null;
let oscillators = [];
let isPlaying = false;
let bgmVol = 0.15;
let volumeDebounceTimer = null;

function initAudio(){
  if(audioContext) return audioContext;
  try{
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = bgmVol;
    masterGain.connect(audioContext.destination);
  }catch(e){}
  return audioContext;
}
function stopAll(){ oscillators.forEach(o=>{ try{ o.osc.stop(); }catch(e){} }); oscillators = []; }
function playTone(freq, vol, type='sine', detune=0){
  if(!audioContext) return null;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  osc.type = type; osc.frequency.value = freq; osc.detune.value = detune;
  filter.type = 'lowpass'; filter.frequency.value = 800;
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(vol * bgmVol, audioContext.currentTime + 0.5);
  osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
  osc.start();
  oscillators.push({osc, gain});
  return {osc, gain};
}
function playWhiteNoise(vol){
  if(!audioContext) return;
  const bufferSize = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){ output[i] = (Math.random()*2-1) * 0.5; }
  const source = audioContext.createBufferSource();
  source.buffer = buffer; source.loop = true;
  const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400;
  const gain = audioContext.createGain(); gain.gain.value = vol * bgmVol * 0.3;
  source.connect(filter); filter.connect(gain); gain.connect(masterGain);
  source.start();
  oscillators.push({osc: source, gain: gain});
}
function startBGM(idx){
  stopAll();
  if(!audioContext) initAudio();
  if(audioContext.state === 'suspended') audioContext.resume();
  currentBGM = idx;
  switch(idx){
    case 0: playTone(110, 0.15, 'sine'); playTone(130.81, 0.12, 'triangle', 2); playTone(164.81, 0.08, 'sine', -3); playWhiteNoise(0.02); break;
    case 1: playTone(220, 0.12, 'sine'); playTone(277.18, 0.09, 'triangle', 5); playTone(329.63, 0.06, 'sine', -2); playWhiteNoise(0.015); break;
    case 2: playWhiteNoise(0.06); playTone(261.63, 0.1, 'triangle'); setTimeout(()=>{ if(currentBGM===2 && isPlaying) playTone(329.63, 0.08, 'sine'); }, 800); break;
    case 3: playTone(146.83, 0.13, 'sine'); playTone(185.00, 0.10, 'triangle', 3); playTone(220.00, 0.07, 'sine', -4); break;
    case 4: playWhiteNoise(0.08); playTone(55, 0.18, 'sine'); playTone(82.41, 0.12, 'triangle'); break;
  }
  isPlaying = true;
  updateBGMUI();
}
function stopBGM(){ stopAll(); isPlaying = false; updateBGMUI(); }
function requestBGM(action, data){
  if(!isHost){ alert('🎵 BGM은 방장만 조작 가능 👑'); return; }
  socket.emit('bgmControl', {roomId, action, data});
}
function toggleBGM(){ if(!isHost){ alert('방장만 가능'); return; } requestBGM('toggle'); }
function setBGMVol(v){
  if(!isHost) return;
  bgmVol = parseFloat(v);
  if(masterGain){ masterGain.gain.setValueAtTime(bgmVol, audioContext ? audioContext.currentTime : 0); }
  const volLabel = document.getElementById('volLabel');
  const volLabel2 = document.getElementById('volLabel2');
  if(volLabel) volLabel.textContent = Math.round(bgmVol*100)+'%';
  if(volLabel2) volLabel2.textContent = Math.round(bgmVol*100)+'%';
  if(volumeDebounceTimer) clearTimeout(volumeDebounceTimer);
  volumeDebounceTimer = setTimeout(()=>{ socket.emit('bgmControl', {roomId, action: 'volume', data: {vol: bgmVol}}); volumeDebounceTimer=null; }, 500);
}
function selectBGM(idx){ if(!isHost){ alert('방장만 곡 변경 가능'); return; } requestBGM('select', {idx}); }
function applyBGMState(state){
  currentBGM = state.idx ?? 0;
  if(!volumeDebounceTimer){ bgmVol = state.vol ?? 0.15; if(masterGain) masterGain.gain.value = bgmVol; }
  const wasPlaying = isPlaying;
  isPlaying = state.isPlaying ?? false;
  initAudio();
  if(masterGain && !volumeDebounceTimer) masterGain.gain.value = bgmVol;
  if(isPlaying && !wasPlaying){ startBGM(currentBGM); }
  else if(!isPlaying && wasPlaying){ stopAll(); }
  else if(isPlaying && currentBGM !== state.idx){ startBGM(state.idx); }
  isPlaying = state.isPlaying;
  updateBGMUI();
}
function updateBGMUI(){
  const playBtn = document.getElementById('bgmPlayBtn');
  const track = document.getElementById('bgmTrack');
  const volLabel = document.getElementById('volLabel');
  if(playBtn){ playBtn.textContent = isPlaying ? '⏸️' : '🎵'; playBtn.classList.toggle('active', isPlaying); playBtn.disabled = !isHost; }
  if(track) track.textContent = (isPlaying ? '▶️ ' : '⏸️ ') + BGM_LIST[currentBGM].name + (isHost ? '' : ' (방장 전용)');
  if(volLabel && !volumeDebounceTimer) volLabel.textContent = Math.round(bgmVol*100)+'%';
  document.querySelectorAll('.bgmOption').forEach((el,i)=>{ el.classList.toggle('active', i===currentBGM); el.style.opacity = isHost ? '1' : '0.6'; });
  const badge = document.getElementById('bgmHostBadge');
  if(badge) badge.style.display = isHost ? 'inline-block' : 'none';
  const action = document.getElementById('bgmAction');
  if(action) action.textContent = isPlaying ? '일시정지 (방장)' : '재생하기 (방장)';
}
function closeAllSheets(){ document.getElementById('clipSheet')?.classList.remove('show'); document.getElementById('bgmSheet')?.classList.remove('show'); document.getElementById('overlay')?.classList.remove('show'); }
function openClip(){ document.getElementById('clipSheet').classList.add('show'); document.getElementById('overlay').classList.add('show'); }
function openBGMSheet(){ document.getElementById('bgmSheet').classList.add('show'); document.getElementById('overlay').classList.add('show'); updateBGMUI(); }
let currentPhotoUrl = ''; let currentPhotoName = '';
function openPhotoModal(url, name){ currentPhotoUrl = url; currentPhotoName = name; document.getElementById('modalImg').src = url; document.getElementById('modalInfo').textContent = name; document.getElementById('photoModal').classList.add('show'); }
function closePhotoModal(){ document.getElementById('photoModal').classList.remove('show'); }
function downloadCurrentPhoto(){ if(!currentPhotoUrl) return; const a = document.createElement('a'); a.href = currentPhotoUrl; a.download = currentPhotoName || 'photo.jpg'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
const EMOJI_GROUPS = { '반응': ['👍 좋아요','❤️ 하트','😂 웃겨','😢 슬퍼요','👏 짝짝'], '축하': ['🎉 축하해','🎂 생일축하','🥳 파티','🎁 선물','🏆 1등','👑 왕관'], '일상': ['☕ 커피','🍺 맥주','💪 화이팅','👋 하이','💤 잘자','🏃 운동'] };
function toggleTheme(){ theme = theme==='light' ? 'dark' : 'light'; document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('chatTheme', theme); const btn=document.getElementById('themeBtn'); if(btn) btn.textContent = theme==='dark' ? '☀️' : '🌙'; }
function renderLogin(){
 appEl.innerHTML=\`
 <div class="login">
  <div style="display:flex;justify-content:space-between;align-items:center"><h1>🐣 실시간 채팅</h1><div class="iconCircle" onclick="toggleTheme()">\${theme==='dark'?'☀️':'🌙'}</div></div>
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
 initSocket();
 renderChat();
}
function initSocket(){
 socket = io({transports:['websocket','polling']});
 socket.emit('joinRoom', myInfo);
 socket.on('roomInfo', (info)=>{
   isHost = info.isHost;
   myInfo.isHost = isHost;
   myInfo.socketId = info.mySocketId;
   updateHeader();
   renderParticipants(info.participants, info.hostId);
   if(info.bgmState) applyBGMState(info.bgmState);
 });
 socket.on('chatMessage', addMsg);
 socket.on('fileMessage', addFileMsg);
 socket.on('systemMessage', (txt)=> addSystem(txt));
 socket.on('participantsUpdate', (data)=>{ renderParticipants(data.participants, data.hostId); });
 socket.on('bgmState', (state)=>{ applyBGMState(state); });
}
function updateHeader(){
 const saveBtn = document.getElementById('saveBtn');
 const crown = document.getElementById('crown');
 if(saveBtn){ saveBtn.classList.toggle('show', isHost); }
 if(crown){ crown.classList.toggle('show', isHost); }
}
function renderChat(){
 const tabs = Object.keys(EMOJI_GROUPS).map((k,i)=>\`<button class="qTab \${i==0?'active':''}" onclick="switchTab(this,'\${k}')">\${k}</button>\`).join('');
 const firstGroup = EMOJI_GROUPS[Object.keys(EMOJI_GROUPS)[0]].map(e=>emojiBtnHtml(e)).join('');
 const bgmOptions = BGM_LIST.map((b,i)=>\`<div class="bgmOption \${i===currentBGM?'active':''}" onclick="selectBGM(\${i})"><div><b>\${b.name}</b><br><span style="font-size:11px;color:#888">\${b.desc}</span></div><div>\${i===currentBGM?'✅':''}</div></div>\`).join('');
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
    <span id="bgmHostBadge" class="badge" style="display:none">방장 전용</span>
    <input type="range" id="volRange" min="0" max="0.5" step="0.01" value="\${bgmVol}" oninput="setBGMVol(this.value)" onchange="setBGMVol(this.value)"/>
    <span style="font-size:10px;color:#888" id="volLabel">\${Math.round(bgmVol*100)}%</span>
    <button class="bgmBtn" onclick="openBGMSheet()">⋯</button>
  </div>
  <div class="participants" id="participants"></div>
  <div class="messages" id="msgs"></div>
  <div class="quickTabs">\${tabs}</div>
  <div class="emojiBar" id="emojiBar">\${firstGroup}</div>
  <div class="overlay" id="overlay" onclick="closeAllSheets()"></div>
  <div class="photoModal" id="photoModal" onclick="closePhotoModal()">
    <button class="closeBtn" onclick="closePhotoModal()">✕</button>
    <img id="modalImg" src="" alt="사진"/>
    <div class="info" id="modalInfo"></div>
    <div class="actionBar"><button class="actionBtn" onclick="event.stopPropagation(); downloadCurrentPhoto()">📥 다운로드</button><button class="actionBtn" onclick="event.stopPropagation(); closePhotoModal()">닫기</button></div>
  </div>
  <div class="clipSheet" id="clipSheet">
    <div class="sheetHeader"><span>📎 보내기</span><button onclick="closeAllSheets()" style="border:none;background:none;font-size:20px;color:var(--text)">✕</button></div>
    <button class="sheetBtn" id="btnPhoto"><div class="ico">📸</div><div><b>사진 보내기</b><br><span style="font-size:11px;color:#888">클릭 확대</span></div></button>
    <button class="sheetBtn" id="btnFile"><div class="ico">📄</div><div><b>파일 보내기</b><br><span style="font-size:11px;color:#888">10MB 이하</span></div></button>
  </div>
  <div class="bgmSheet" id="bgmSheet">
    <div class="sheetHeader"><span>🎵 배경음악 5종 <span class="badge">방장 전용</span></span><button onclick="closeAllSheets()" style="border:none;background:none;font-size:20px;color:var(--text)">✕</button></div>
    <p style="font-size:11px;color:#888">👑 방장만 조작 가능. 볼륨 조절 시 도배 안 함!</p>
    \${bgmOptions}
    <div style="display:flex;gap:8px;align-items:center;margin-top:8px"><span style="font-size:11px">볼륨:</span><input type="range" id="volRange2" min="0" max="0.5" step="0.01" value="\${bgmVol}" oninput="setBGMVol(this.value)" onchange="setBGMVol(this.value)" style="flex:1"/><span style="font-size:11px" id="volLabel2">\${Math.round(bgmVol*100)}%</span></div>
    <button class="sheetBtn" onclick="toggleBGM()"><div class="ico">🎵</div><div><b id="bgmAction">재생하기</b><br><span style="font-size:11px;color:#888">방장 전용</span></div></button>
  </div>
  <div class="inputArea">
   <button class="iconBtn" id="clipBtn">📎</button>
   <input id="photoIn" type="file" accept="image/*" hidden/>
   <input id="fileIn" type="file" hidden/>
   <input id="textIn" placeholder="메시지 입력 - 엔터" autocomplete="off" />
   <button class="iconBtn" id="emojiBtn">😊</button>
   <button class="iconBtn send" id="sendBtn">↑</button>
  </div>\`;
 document.getElementById('clipBtn').addEventListener('click', openClip);
 document.getElementById('emojiBtn').addEventListener('click', toggleEmojiBar);
 document.getElementById('sendBtn').addEventListener('click', sendText);
 document.getElementById('btnPhoto').addEventListener('click', ()=>{ document.getElementById('photoIn').click(); closeAllSheets(); });
 document.getElementById('btnFile').addEventListener('click', ()=>{ document.getElementById('fileIn').click(); closeAllSheets(); });
 const textIn = document.getElementById('textIn'); textIn.focus();
 textIn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); sendText(); } });
 document.getElementById('photoIn').addEventListener('change', (e)=>{ if(e.target.files[0]) handlePhoto(e.target.files[0]); e.target.value=''; });
 document.getElementById('fileIn').addEventListener('change', (e)=>{ if(e.target.files[0]) handleFile(e.target.files[0]); e.target.value=''; });
 window.emojiVisible=true;
 updateHeader();
 updateBGMUI();
}
function emojiBtnHtml(full){ const emoji=full.split(' ')[0]; const label=full.split(' ').slice(1).join(' '); return \`<button class="eBtn" onclick="insertEmoji('\${full.replace(/'/g, "\\\\'")}')"><span style="font-size:16px">\${emoji}</span> \${label}</button>\`; }
function switchTab(btn,group){ document.querySelectorAll('.qTab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); document.getElementById('emojiBar').innerHTML=EMOJI_GROUPS[group].map(e=>emojiBtnHtml(e)).join(''); }
function insertEmoji(full){
  const inp=document.getElementById('textIn'); if(!inp) return;
  const toInsert = full + ' '; const start = inp.selectionStart ?? inp.value.length;
  inp.value = inp.value.slice(0,start) + toInsert + inp.value.slice(start);
  inp.focus(); inp.selectionStart = inp.selectionEnd = start + toInsert.length;
}
function toggleEmojiBar(){
  const bar=document.getElementById('emojiBar'); const tabs=document.querySelector('.quickTabs');
  if(!bar) return; window.emojiVisible=!window.emojiVisible;
  bar.style.display=window.emojiVisible?'flex':'none'; if(tabs) tabs.style.display=window.emojiVisible?'flex':'none';
}
function escapeHtml(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function renderParticipants(list, hostId){
 const el=document.getElementById('participants'); if(!el) return;
 if(!list||list.length===0){ el.innerHTML=''; return; }
 const avatars = list.slice(0,6).map(u=>{ const isH = u.socketId === hostId; return \`<div class="pAvatar \${isH?'host':''}" title="\${u.username}">\${u.character}</div>\`; }).join('');
 el.innerHTML = avatars + \`<span class="pCount">\${list.length}명 | 방장: \${list.find(u=>u.socketId===hostId)?.username||'?'}</span>\`;
}
function addMsg(data){
 const isMe = data.socketId === myInfo.socketId;
 const el=document.createElement('div'); el.className=isMe?'msg me':'msg other';
 el.innerHTML=\`<div class="sender">\${data.character} \${escapeHtml(data.username)} \${data.isHost?'<span class="crown show">👑</span>':''}</div><div>\${escapeHtml(data.text)}</div><div class="meta">\${new Date(data.id).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div>\`;
 document.getElementById('msgs').appendChild(el); scroll();
}
function addSystem(txt){ const el=document.createElement('div'); el.className='system'; el.textContent=txt; document.getElementById('msgs').appendChild(el); scroll(); }
function addFileMsg(data){
 const isMe = data.socketId === myInfo.socketId;
 const el=document.createElement('div'); el.className=isMe?'msg me':'msg other';
 let c=\`<div class="sender">\${data.character} \${escapeHtml(data.username)} \${data.isHost?'<span class="crown show">👑</span>':''}</div>\`;
 if(data.isImage){
   const imgId = 'img_' + data.id;
   c+=\`<img class="preview" id="\${imgId}" src="\${data.dataUrl}" alt="\${escapeHtml(data.fileName)}"/><div class="photoHint">👆 클릭하면 확대</div>\`;
   setTimeout(()=>{
     const imgEl = document.getElementById(imgId);
     if(imgEl){
       imgEl.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); openPhotoModal(data.dataUrl, data.fileName); });
       imgEl.addEventListener('touchend', (e)=>{ e.preventDefault(); openPhotoModal(data.dataUrl, data.fileName); }, {passive:false});
     }
   }, 50);
 } else {
   c+=\`<div>📄 \${escapeHtml(data.fileName)}</div><a href="\${data.dataUrl}" download="\${data.fileName}" style="font-size:12px;color:#007AFF">다운로드</a>\`;
 }
 c+=\`<div class="meta">\${new Date(data.id).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div>\`;
 el.innerHTML=c; document.getElementById('msgs').appendChild(el); scroll();
}
function scroll(){ const m=document.getElementById('msgs'); if(m) m.scrollTop=m.scrollHeight; }
function sendText(){
  const inp=document.getElementById('textIn'); if(!inp) return;
  let t=inp.value.trim(); if(!t) return;
  if(!socket || !socket.connected){ alert('연결 끊김'); return; }
  socket.emit('chatMessage',{roomId, text:t}); inp.value=''; inp.focus();
}
function saveChat(){
  if(!isHost){ alert('방장만 저장 가능'); return; }
  socket.emit('requestExport', {roomId}, (res)=>{
    if(!res.allowed){ alert('방장 아님'); return; }
    const blob = new Blob([res.data], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='채팅기록_' + new Date().toISOString().slice(0,10) + '_' + roomId + '.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    alert('👑 저장 완료!');
  });
}
function handlePhoto(file){
 if(!file) return; if(file.size>8*1024*1024){ alert('8MB 이하만!'); return; }
 const reader=new FileReader();
 reader.onload=()=>{
   const img=new Image();
   img.onerror=()=>{ socket.emit('fileMessage',{roomId, fileName:file.name, size:file.size, dataUrl:reader.result, isImage:true}); };
   img.onload=()=>{
     try{
       const canvas=document.createElement('canvas'); const maxW=800; let w=img.width,h=img.height;
       if(w>maxW){ h=h*maxW/w; w=maxW; } canvas.width=w; canvas.height=h;
       canvas.getContext('2d').drawImage(img,0,0,w,h);
       const comp=canvas.toDataURL('image/jpeg',0.7);
       socket.emit('fileMessage',{roomId, fileName:file.name, size:file.size, dataUrl:comp, isImage:true});
     }catch(err){ socket.emit('fileMessage',{roomId, fileName:file.name, size:file.size, dataUrl:reader.result, isImage:true}); }
   }; img.src=reader.result;
 }; reader.readAsDataURL(file);
}
function handleFile(file){
 if(!file) return; if(file.size>10*1024*1024){ alert('10MB 이하만!'); return; }
 const reader=new FileReader();
 reader.onload=()=>{ const isImage=file.type.startsWith('image/'); socket.emit('fileMessage',{roomId, fileName:file.name, size:file.size, dataUrl:reader.result, isImage:isImage}); };
 reader.readAsDataURL(file);
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
    if(!rooms[roomId]) rooms[roomId] = { hostId: socket.id, users: {}, history: [], bgmState: {idx:0, isPlaying:false, vol:0.15} };
    const room = rooms[roomId];
    const isHost = room.hostId === socket.id;
    room.users[socket.id] = { socketId: socket.id, username: data.username, character: data.character, roomId, joinedAt: Date.now() };
    socket.join(roomId);
    socket.emit('roomInfo', { isHost, mySocketId: socket.id, hostId: room.hostId, participants: Object.values(room.users), bgmState: room.bgmState });
    io.to(roomId).emit('participantsUpdate', { participants: Object.values(room.users), hostId: room.hostId });
    io.to(roomId).emit('systemMessage', `${data.character} ${data.username}님이 입장하셨습니다 ${isHost ? '👑(방장)' : ''}`);
    socket.emit('bgmState', room.bgmState);
  });
  socket.on('bgmControl', (data)=>{
    const room = rooms[data.roomId]; if(!room) return;
    if(room.hostId !== socket.id){ return; }
    const state = room.bgmState;
    let shouldBroadcastSystem = false; let systemMsg = '';
    if(data.action === 'toggle'){ state.isPlaying = !state.isPlaying; shouldBroadcastSystem = true; systemMsg = `🎵 BGM: ${['로파이1','카페 로파이','빗소리 피아노','새벽 재즈','숲속 바람'][state.idx]} ${state.isPlaying ? '▶️ 재생' : '⏸️ 정지'} (방장)`; }
    else if(data.action === 'select'){ const idx = data.data.idx; if(idx >=0 && idx < 5){ state.idx = idx; state.isPlaying = true; shouldBroadcastSystem = true; systemMsg = `🎵 BGM: ${['로파이1','카페 로파이','빗소리 피아노','새벽 재즈','숲속 바람'][state.idx]} ▶️ 재생 (방장)`; } }
    else if(data.action === 'volume'){ state.vol = Math.min(0.5, Math.max(0, data.data.vol)); shouldBroadcastSystem = false; }
    io.to(data.roomId).emit('bgmState', state);
    if(shouldBroadcastSystem){ io.to(data.roomId).emit('systemMessage', systemMsg); }
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
          io.to(roomId).emit('systemMessage', `👑 방장이 ${nextHost.username}님에게 위임됨`);
          for(const sid in room.users){
            io.to(sid).emit('roomInfo', { isHost: sid===room.hostId, mySocketId: sid, hostId: room.hostId, participants: Object.values(room.users), bgmState: room.bgmState });
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
server.listen(PORT, ()=> console.log(`✅ Final fixed on ${PORT}`));
