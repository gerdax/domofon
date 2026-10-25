import test from 'node:test';
import assert from 'node:assert/strict';
import {Intercom} from '../dist/machine.js';
import {frequencies} from '../dist/audio.js';
function setup(){let now=0,id=0,last;const jobs=new Map(),sounds=[];const machine=new Intercom({render:v=>last=v,play:v=>sounds.push(v),stop:()=>{},setTimer:(fn,delay)=>{jobs.set(++id,{fn,at:now+delay});return id;},clearTimer:id=>jobs.delete(id)});return {machine,sounds,get view(){return last;},tick(ms){const end=now+ms;while(true){const next=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;jobs.delete(next[0]);next[1].fn();}now=end;}};}
test('dialing restarts 3 second timer; ringing ends after 12 seconds',()=>{const s=setup();s.machine.press('1');s.tick(2900);s.machine.press('2');s.tick(2999);assert.equal(s.view.mode,'dialing');s.tick(1);assert.equal(s.view.mode,'calling');assert.equal(s.view.text,'12');s.tick(11999);assert.equal(s.view.mode,'calling');s.tick(1);assert.equal(s.view.mode,'idle');assert.equal(s.sounds.length,12);});
test('X cancels pending calls and active rings',()=>{for(const delay of [100,3100]){const s=setup();s.machine.press('7');s.tick(delay);s.machine.press('x');const count=s.sounds.length;s.tick(20000);assert.equal(s.view.text,'door');assert.equal(s.sounds.length,count);}});
test('four digit limit and code mode have independent timers',()=>{const s=setup();for(const d of '12345')s.machine.press(d);assert.equal(s.view.text,'1234');s.machine.press('key');s.tick(4000);assert.equal(s.view.mode,'code');for(const d of '1234')s.machine.press(d);assert.equal(s.view.mode,'open');s.tick(120);assert.deepEqual(s.sounds,['open']);s.tick(2880);assert.equal(s.view.mode,'idle');});
test('wrong code rejects and clears; X cancels delayed confirmation',()=>{const s=setup();s.machine.press('key');for(const d of '9999')s.machine.press(d);assert.equal(s.view.mode,'error');s.tick(120);assert.deepEqual(s.sounds,['error']);s.tick(1380);assert.equal(s.view.mode,'idle');s.machine.press('key');for(const d of '1234')s.machine.press(d);s.machine.reset();s.tick(10000);assert.deepEqual(s.sounds,['error']);});
test('all 12 tones are distinct and inside requested range',()=>{const values=Object.values(frequencies);assert.equal(values.length,12);assert.equal(new Set(values).size,12);assert.ok(values.every(v=>v>=650&&v<=1800));});
test('browser timers are called without an Intercom receiver',t=>{
  let scheduled=0,cleared=0;
  t.mock.method(globalThis,'setTimeout',function(){assert.equal(this,undefined);scheduled++;return scheduled;});
  t.mock.method(globalThis,'clearTimeout',function(){assert.equal(this,undefined);cleared++;});
  const machine=new Intercom({render:()=>{},play:()=>{},stop:()=>{}});
  machine.press('1');assert.equal(scheduled,1);
  machine.press('2');assert.equal(scheduled,2);assert.equal(cleared,1);
  machine.press('x');assert.equal(cleared,2);
});
