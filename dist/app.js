import {Sound} from './audio.js';
import {Intercom} from './machine.js';
const $=id=>document.getElementById(id),sound=new Sound();
const paths=['12,4 48,4 43,11 16,11','49,6 53,10 48,43 43,47 40,41 44,14','43,51 48,48 43,87 37,91 35,84 39,57','9,88 35,88 40,94 35,99 5,99','3,52 8,48 12,54 8,84 3,90 0,85','10,10 15,14 11,41 6,46 2,42 6,14','9,46 40,46 45,50 39,54 8,54 4,50'];
const glyphs={'0':[0,1,2,3,4,5],'1':[1,2],'2':[0,1,6,4,3],'3':[0,1,2,3,6],'4':[5,6,1,2],'5':[0,5,6,2,3],'6':[0,5,6,4,2,3],'7':[0,1,2],'8':[0,1,2,3,4,5,6],'9':[0,1,2,3,5,6],d:[1,2,3,4,6],o:[2,3,4,6],r:[4,6],E:[0,5,6,4,3],'-':[6],' ':[]};
function render({text,message,calling}){
  const chars=text.padStart(4,' ').slice(-4).split('');
  $('display').innerHTML=chars.map((c,i)=>`<g transform="translate(${8+i*76} 5) skewX(-5)">${paths.map((p,s)=>`<polygon class="${(glyphs[c]||[]).includes(s)?'lit':'unlit'}" points="${p}"/>`).join('')}</g>`).join('');
  $('display').classList.toggle('calling',calling);$('status').textContent=message;
}
const machine=new Intercom({render,stop:()=>sound.stop(),play:kind=>{
  if(kind==='ring')sound.tone(820,.25,'square',.025);
  if(kind==='open')sound.tone(95,2.7,'sawtooth',.05);
  if(kind==='error')sound.tone(220,.4,'square',.035);
}});
const keys=['1','2','3','4','5','6','7','8','9','key','0','x'];
const buttons=new Map();
function activate(key){machine.press(key);sound.key(key);const button=buttons.get(key);button.classList.add('pressed');setTimeout(()=>button.classList.remove('pressed'),120);}
for(const key of keys){const b=document.createElement('button');b.type='button';b.className='key';b.dataset.key=key;b.setAttribute('aria-label',key==='key'?'Kluczyk — wpisz kod':key==='x'?'Anuluj':key);b.addEventListener('click',()=>activate(key));$('keypad').append(b);buttons.set(key,b);}
const held=new Set();
document.addEventListener('keydown',e=>{
  if($('help-dialog').open||e.ctrlKey||e.metaKey||e.altKey)return;
  const key=/^\d$/.test(e.key)?e.key:['Escape','Backspace'].includes(e.key)?'x':e.key==='Enter'?'key':null;
  if(!key||e.target.closest('.tools'))return;
  e.preventDefault();if(e.repeat||held.has(e.code))return;held.add(e.code);activate(key);
});
document.addEventListener('keyup',e=>held.delete(e.code));
function suspend(){held.clear();machine.reset();}
window.addEventListener('blur',()=>held.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});window.addEventListener('pagehide',suspend);
try{sound.mute(localStorage.getItem('domofon-muted')==='true');}catch{}
function updateMute(){$('mute').setAttribute('aria-pressed',String(sound.muted));$('mute').setAttribute('aria-label',sound.muted?'Włącz dźwięk':'Wycisz dźwięk');$('mute').textContent=sound.muted?'♩':'♪';}
updateMute();$('mute').onclick=()=>{sound.mute(!sound.muted);updateMute();try{localStorage.setItem('domofon-muted',String(sound.muted));}catch{}};
$('help').onclick=()=>{suspend();$('help-dialog').showModal();};$('close-help').onclick=()=>$('help-dialog').close();$('help-dialog').addEventListener('click',e=>{if(e.target===$('help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('install').hidden=false;});$('install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('install').hidden=true;}};
if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{$('offline-status').textContent='Gotowy do działania offline.';}).catch(()=>{$('offline-status').textContent='Tryb offline jest niedostępny w tej przeglądarce.';});}
else $('offline-status').textContent='Tryb offline jest niedostępny w tej przeglądarce.';
