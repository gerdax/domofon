export class Intercom {
  constructor({render,play,stop,setTimer=(fn,ms)=>setTimeout(fn,ms),clearTimer=id=>clearTimeout(id)}){Object.assign(this,{render,play,stop,setTimer,clearTimer});this.timers=new Set();this.reset();}
  later(fn,ms){const id=this.setTimer(()=>{this.timers.delete(id);fn();},ms);this.timers.add(id);}
  clear(){for(const id of this.timers)this.clearTimer(id);this.timers.clear();}
  show(text,message,calling=false){this.render({text,message,calling,mode:this.mode});}
  reset(){this.clear();this.stop();this.mode='idle';this.digits='';this.codeKeys=[];this.apartment='';this.show('.','Domofon gotowy.');}
  press(key){
    if(key==='x'){this.reset();return 'x';}
    if(this.mode==='code'&&(key==='key'||/^\d$/.test(key))){
      this.codeKeys.push(key);this.show('-'.repeat(this.codeKeys.length).padStart(4,' '),`Wpisano ${this.codeKeys.length} znaków kodu.`);
      if(this.codeKeys.length===4){const code=this.codeKeys.join('');const valid=code==='1234'||(this.apartment==='6'&&code==='2901');this.mode=valid?'open':'error';this.show(valid?'door':'Err',valid?'Drzwi otwarte.':'Błędny kod.');
        this.later(()=>this.play(valid?'open':'error'),120);this.later(()=>this.reset(),valid?3000:1500);}
      return 'key';
    }
    if(key==='key'){const apartment=this.mode==='dialing'?this.digits:'';this.clear();this.stop();this.mode='code';this.apartment=apartment;this.digits='';this.codeKeys=[];this.show('----','Wpisz czterocyfrowy kod.');return 'key';}
    if(!/^\d$/.test(key)||['open','error'].includes(this.mode))return key;
    if(this.digits.length===4)return key;
    this.mode='dialing';this.digits+=key;this.show(this.digits,`Numer lokalu: ${this.digits}`);this.clear();
    return key;
  }
}
