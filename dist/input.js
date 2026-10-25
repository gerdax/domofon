// Pointer events sound on contact; the following native click must not replay it.
// Keyboard and assistive-technology clicks have detail=0 and remain supported.
export function bindKey(button,activate,unlock){
  button.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.isPrimary===false)return;
    activate();
  });
  button.addEventListener('pointerup',()=>{unlock();});
  button.addEventListener('click',event=>{
    unlock();
    if(event.detail===0)activate();
  });
}
