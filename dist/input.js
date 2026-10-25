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

export function preventPinchZoom(target){
  const options={passive:false,capture:true};
  // WebKit's native gesture events supplement touch-action on iPad Safari.
  for(const type of ['gesturestart','gesturechange','gestureend']){
    target.addEventListener(type,event=>event.preventDefault(),options);
  }
  for(const type of ['touchstart','touchmove']){
    target.addEventListener(type,event=>{
      if(event.touches.length>1)event.preventDefault();
    },options);
  }
}
