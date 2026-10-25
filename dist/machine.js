export class Intercom {
  constructor({render,play,stop,setTimer=(fn,ms)=>setTimeout(fn,ms),clearTimer=id=>clearTimeout(id)}){Object.assign(this,{render,play,stop,setTimer,clearTimer});this.timers=new Set();this.reset();}
  later(fn,ms){const id=this.setTimer(()=>{this.timers.delete(id);fn();},ms);this.timers.add(id);}
  clear(){for(const id of this.timers)this.clearTimer(id);this.timers.clear();}
  show(text,message,calling=false){this.render({text,message,calling,mode:this.mode});}
  reset(){this.clear();this.stop();this.mode='idle';this.digits='';this.show('door','Domofon gotowy.');}
  press(key){
    if(key==='x'){this.reset();return;}
    if(key==='key'){this.clear();this.stop();this.mode='code';this.digits='';this.show('----','Wpisz czterocyfrowy kod.');return;}
    if(!/^\d$/.test(key)||['open','error'].includes(this.mode))return;
    if(this.mode==='code'){
      this.digits+=key;this.show('-'.repeat(this.digits.length).padStart(4,' '),`Wpisano ${this.digits.length} cyfr kodu.`);
      if(this.digits.length===4){const valid=this.digits==='1234';this.mode=valid?'open':'error';this.show(valid?'door':'Err',valid?'Drzwi otwarte.':'Błędny kod.');
        this.later(()=>this.play(valid?'open':'error'),120);this.later(()=>this.reset(),valid?3000:1500);}
      return;
    }
    if(this.digits.length===4)return;
    this.mode='dialing';this.digits+=key;this.show(this.digits,`Numer lokalu: ${this.digits}`);this.clear();
  }
}
