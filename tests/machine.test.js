import test from 'node:test';
import assert from 'node:assert/strict';
import {Intercom} from '../dist/machine.js';
import {frequencies} from '../dist/audio.js';
function setup(){let now=0,id=0,last;const jobs=new Map(),sounds=[];const machine=new Intercom({render:v=>last=v,play:v=>sounds.push(v),stop:()=>{},setTimer:(fn,delay)=>{jobs.set(++id,{fn,at:now+delay});return id;},clearTimer:id=>jobs.delete(id)});return {machine,sounds,get view(){return last;},tick(ms){const end=now+ms;while(true){const next=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;jobs.delete(next[0]);next[1].fn();}now=end;}};}
test('digits remain on display without calling or ringing after inactivity',()=>{const s=setup();s.machine.press('1');s.tick(2900);s.machine.press('2');s.tick(30000);assert.equal(s.view.mode,'dialing');assert.equal(s.view.text,'12');assert.equal(s.machine.timers.size,0);assert.deepEqual(s.sounds,[]);s.machine.press('3');assert.equal(s.view.text,'123');});
test('X clears displayed digits after inactivity',()=>{const s=setup();s.machine.press('7');s.tick(30000);s.machine.press('x');s.tick(20000);assert.equal(s.view.text,'door');assert.deepEqual(s.sounds,[]);});
test('four digit limit and code mode have independent timers',()=>{const s=setup();for(const d of '12345')s.machine.press(d);assert.equal(s.view.text,'1234');s.machine.press('key');s.tick(4000);assert.equal(s.view.mode,'code');for(const d of '1234')s.machine.press(d);assert.equal(s.view.mode,'open');s.tick(120);assert.deepEqual(s.sounds,['open']);s.tick(2880);assert.equal(s.view.mode,'idle');});
test('wrong code rejects and clears; X cancels delayed confirmation',()=>{const s=setup();s.machine.press('key');for(const d of '9999')s.machine.press(d);assert.equal(s.view.mode,'error');s.tick(120);assert.deepEqual(s.sounds,['error']);s.tick(1380);assert.equal(s.view.mode,'idle');s.machine.press('key');for(const d of '1234')s.machine.press(d);s.machine.reset();s.tick(10000);assert.deepEqual(s.sounds,['error']);});
test('keypad follows requested A#5–G#6 notes, with 0 matching 1',()=>{
  const expected={'1':932.327523,'2':987.766603,'3':1046.502261,'4':1108.730524,'5':1174.659072,'6':1244.507935,'7':1318.510228,'8':1396.912926,'9':1479.977691,'0':932.327523,key:1661.218790,x:1567.981744};
  assert.deepEqual(Object.keys(frequencies).sort(),Object.keys(expected).sort());
  for(const [key,hz] of Object.entries(expected))assert.ok(Math.abs(frequencies[key]-hz)<.000001,`Wrong note for ${key}`);
  assert.equal(frequencies['0'],frequencies['1']);
});
test('browser timers are called without an Intercom receiver',t=>{
  let scheduled=0,cleared=0;
  t.mock.method(globalThis,'setTimeout',function(){assert.equal(this,undefined);scheduled++;return scheduled;});
  t.mock.method(globalThis,'clearTimeout',function(){assert.equal(this,undefined);cleared++;});
  const machine=new Intercom({render:()=>{},play:()=>{},stop:()=>{}});
  machine.press('key');for(const digit of '1234')machine.press(digit);assert.equal(scheduled,2);
  machine.press('x');assert.equal(cleared,2);
});
test('exactly four keys after the key button share its tone, including repeated key buttons',()=>{
  const s=setup();assert.equal(s.machine.press('key'),'key');
  for(const key of ['1','key','0','key'])assert.equal(s.machine.press(key),'key');
  assert.equal(s.view.mode,'error');assert.equal(s.machine.codeKeys.length,4);
  assert.equal(s.machine.press('7'),'7');
});
test('X immediately cancels the shared tone and resets code progress',()=>{
  const s=setup();s.machine.press('key');assert.equal(s.machine.press('2'),'key');
  assert.equal(s.machine.press('x'),'x');assert.equal(s.machine.press('2'),'2');
  assert.equal(s.view.mode,'dialing');assert.equal(s.view.text,'2');
  s.machine.press('key');assert.equal(s.machine.codeKeys.length,0);
});
test('6 then key then 2901 opens the door; a different or missing apartment does not',()=>{
  for(const apartment of ['6','5','']){
    const s=setup();if(apartment)s.machine.press(apartment);s.machine.press('key');
    for(const digit of '2901')assert.equal(s.machine.press(digit),'key');
    assert.equal(s.view.mode,apartment==='6'?'open':'error');
    s.tick(120);assert.deepEqual(s.sounds,[apartment==='6'?'open':'error']);
  }
});
test('key can interrupt open or error feedback and starts a new four-key sequence',()=>{
  for(const code of ['1234','9999']){
    const s=setup();s.machine.press('key');for(const digit of code)s.machine.press(digit);
    assert.equal(s.machine.press('key'),'key');assert.equal(s.view.mode,'code');
    assert.equal(s.machine.codeKeys.length,0);s.tick(10000);assert.equal(s.view.mode,'code');assert.deepEqual(s.sounds,[]);
  }
});
