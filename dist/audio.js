export const frequencies = Object.freeze({'1':650,'2':713,'3':782,'4':858,'5':941,'6':1032,'7':1132,'8':1241,'9':1361,key:1493,'0':1638,x:1800});
export class Sound {
  constructor(){this.context=null;this.muted=false;this.voices=new Set();this.generation=0;}
  async unlock(){
    if(!this.context){const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return false;this.context=new Context();}
    if(this.context.state==='suspended')await this.context.resume();
    return this.context.state==='running';
  }
  async tone(frequency,duration=.1,type='square',volume=.035){
    const generation=this.generation;
    try{
      if(this.muted||!await this.unlock()||generation!==this.generation||this.muted)return;
      const ctx=this.context,osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),now=ctx.currentTime;
      osc.type=type;osc.frequency.value=frequency;filter.type='lowpass';filter.frequency.value=2400;
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.004);gain.gain.setValueAtTime(volume,now+duration-.015);gain.gain.linearRampToValueAtTime(0,now+duration);
      osc.connect(filter).connect(gain).connect(ctx.destination);this.voices.add(osc);
      osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect();this.voices.delete(osc);};osc.start();osc.stop(now+duration);
    }catch{/* Visual interaction remains available when audio is unavailable. */}
  }
  key(key){return this.tone(frequencies[key]);}
  stop(){this.generation++;for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();}
  mute(value){this.muted=value;if(value)this.stop();}
}
