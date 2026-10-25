export const frequencies = Object.freeze({'1':650,'2':713,'3':782,'4':858,'5':941,'6':1032,'7':1132,'8':1241,'9':1361,key:1493,'0':1638,x:1800});
export class Sound {
  constructor(){this.context=null;this.muted=false;this.voices=new Set();}
  prepare(){
    if(!this.context||this.context.state==='closed'){
      const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
      if(!Context)return null;
      this.context=new Context({latencyHint:'interactive'});
    }
    return this.context;
  }
  unlock(){
    try{
      const ctx=this.prepare();
      if(!ctx)return Promise.resolve(false);
      if(ctx.state!=='running')return ctx.resume().then(()=>ctx.state==='running').catch(()=>false);
      return Promise.resolve(true);
    }catch{return Promise.resolve(false);}
  }
  async tone(frequency,duration=.1,type='square',volume=.035){
    try{
      if(this.muted)return;
      const ctx=this.prepare();if(!ctx)return;
      // Resume and schedule inside the same user gesture. Starting a source also
      // unlocks Web Audio on WebKit; do not wait for the resume promise first.
      const ready=this.unlock();
      const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),now=ctx.currentTime;
      osc.type=type;osc.frequency.value=frequency;filter.type='lowpass';filter.frequency.value=2400;
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.004);gain.gain.setValueAtTime(volume,now+duration-.015);gain.gain.linearRampToValueAtTime(0,now+duration);
      osc.connect(filter).connect(gain).connect(ctx.destination);this.voices.add(osc);
      osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect();this.voices.delete(osc);};osc.start();osc.stop(now+duration);
      if(!await ready){try{osc.stop();}catch{}}
    }catch{/* Visual interaction remains available when audio is unavailable. */}
  }
  key(key){return this.tone(frequencies[key]);}
  stop(){for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();}
  mute(value){this.muted=value;if(value)this.stop();}
}
