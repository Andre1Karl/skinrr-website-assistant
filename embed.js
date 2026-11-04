(()=>{
 const script=document.currentScript;const host=new URL(script.src).origin;
 const frame=document.createElement('iframe');frame.src=new URL('widget.html',script.src).href;frame.title='Virtual website assistant';frame.setAttribute('referrerpolicy','no-referrer');frame.setAttribute('allow','');
 Object.assign(frame.style,{position:'fixed',right:'max(12px, env(safe-area-inset-right))',bottom:'max(12px, env(safe-area-inset-bottom))',width:'205px',height:'74px',border:'0',zIndex:'2147483000',colorScheme:'light'});
 document.body.append(frame);
 let opened=false;const size=()=>{frame.style.width=opened?'min(410px, calc(100vw - 24px))':'205px';frame.style.height=opened?'min(680px, calc(100dvh - 24px))':'74px';};
 window.addEventListener('message',e=>{if(e.origin!==host||e.source!==frame.contentWindow||e.data?.type!=='skinrr:size')return;opened=e.data.open===true;size();});window.addEventListener('resize',size);
})();
