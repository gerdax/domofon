import test from 'node:test';
import assert from 'node:assert/strict';
import {Sound} from '../dist/audio.js';
import {bindKey} from '../dist/input.js';

function engine(state='suspended'){
  let resolve;const calls=[];
  const connectable=()=>({connect(){return this;},disconnect(){}});
  const ctx={state,currentTime:0,destination:{},resume(){calls.push('resume');return new Promise(done=>{resolve=()=>{ctx.state='running';done();};});},
    createOscillator(){return {...connectable(),frequency:{},start(){calls.push('start');},stop(time){calls.push(['stop',time]);}};},
    createGain(){return {...connectable(),gain:{setValueAtTime(){},linearRampToValueAtTime(){}}};},
    createBiquadFilter(){return {...connectable(),frequency:{}};}};
  const sound=new Sound();sound.context=ctx;
  return {sound,ctx,calls,resume:()=>resolve()};
}
test('first gesture schedules the complete 100ms tone before resume resolves',async()=>{
  const e=engine();const pending=e.sound.key('1');
  assert.deepEqual(e.calls,['resume','start',['stop',.1]]);
  assert.equal(e.sound.voices.size,1);e.resume();await pending;
  assert.equal(e.sound.voices.size,1);
});
test('interrupted Safari audio resumes on the same gesture',async()=>{
  const e=engine('interrupted');const pending=e.sound.key('2');
  assert.equal(e.calls[0],'resume');assert.equal(e.calls[1],'start');e.resume();await pending;
});
test('stop and mute cancel tones queued while the first resume is pending',async()=>{
  for(const stop of [sound=>sound.stop(),sound=>sound.mute(true)]){
    const e=engine();const pending=e.sound.key('3');stop(e.sound);
    assert.deepEqual(e.calls.at(-1),['stop',undefined]);assert.equal(e.sound.voices.size,0);
    e.resume();await pending;assert.equal(e.calls.filter(c=>c==='start').length,1);
  }
});
test('running audio starts synchronously and mute never schedules sound',async()=>{
  const e=engine('running');const pending=e.sound.key('4');assert.equal(e.calls[0],'start');await pending;
  e.sound.mute(true);const count=e.calls.length;await e.sound.key('5');assert.equal(e.calls.length,count);
});
test('pointer contact triggers immediately; release and click do not duplicate',()=>{
  const button=new EventTarget();let presses=0,resumes=0;
  bindKey(button,()=>presses++,()=>resumes++);
  function fire(type,props){const event=new Event(type);Object.assign(event,props);button.dispatchEvent(event);}
  fire('pointerdown',{button:0,isPrimary:true});assert.equal(presses,1);
  fire('pointerup',{});fire('click',{detail:1});assert.equal(presses,1);assert.equal(resumes,2);
  fire('click',{detail:0});assert.equal(presses,2);
  fire('pointerdown',{button:2,isPrimary:true});fire('pointerdown',{button:0,isPrimary:false});assert.equal(presses,2);
});
