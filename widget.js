const scriptUrl=new URL(document.currentScript?.src||'/widget.js',location.href);
let api=scriptUrl.origin;
let previewOnly=false;
const embedded=document.body.classList.contains('embed-page');
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
const launcher=el('button','launcher');launcher.type='button';launcher.setAttribute('aria-label','Open Skin R&R Assistant');launcher.setAttribute('aria-expanded','false');launcher.setAttribute('aria-controls','skinrr-panel');launcher.textContent='◇  Ask Skin R&R';document.body.append(launcher);
const panel=el('section','panel');panel.id='skinrr-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Skin R&R Assistant');
const header=el('header','chat-header'),mark=el('div','brand-icon','R');
const reset=el('button','icon-button','↻');reset.type='button';reset.setAttribute('aria-label','New conversation');reset.title='New conversation';const close=el('button','icon-button','×');close.type='button';close.setAttribute('aria-label','Close assistant');header.append(mark,reset,close);
const status=el('p','status','Checking AI connection…');status.setAttribute('role','status');
const messages=el('div','messages');messages.setAttribute('aria-label','Conversation');messages.setAttribute('role','log');messages.setAttribute('aria-live','polite');
const footer=el('footer','chat-footer'),form=el('form','compose'),input=el('input');input.placeholder='Ask a question…';input.setAttribute('aria-label','Message the assistant');input.maxLength=1200;input.autocomplete='off';const send=el('button','send','↑');send.type='submit';send.setAttribute('aria-label','Send message');form.append(input,send);footer.append(form);
panel.append(header,status,messages,footer);document.body.append(panel);
let config,history=[],busy=false,controller,epoch=0;
function resizeFrame(open){if(embedded)parent.postMessage({type:'skinrr:size',open},'*');}
function toggle(open){panel.hidden=!open;launcher.hidden=open;launcher.setAttribute('aria-expanded',String(open));resizeFrame(open);if(open)input.focus();else launcher.focus();}
launcher.onclick=()=>toggle(true);close.onclick=()=>toggle(false);panel.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false);});
function bubble(role,text){const item=el('div',`message ${role}`);item.append(el('div','speaker',role==='user'?'You':config?.assistantName||'Virtual assistant'));const content=el('div','bubble',text);item.append(content);messages.append(item);messages.scrollTop=messages.scrollHeight;return {item,content};}
function addSources(item,sources){const box=el('div','sources');for(const source of sources){let u;try{u=new URL(source.url);}catch{continue;}if(u.protocol!=='https:')continue;const a=el('a','',source.title+' ↗');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';box.append(a);}item.append(box);}
function welcome(){messages.replaceChildren();bubble('assistant',config.welcome);const suggestions=el('div','suggestions');for(const q of config.suggestedQuestions){const b=el('button','',q);b.type='button';b.onclick=()=>submit(q);suggestions.append(b);}messages.append(suggestions);}
reset.onclick=()=>{epoch++;controller?.abort();history=[];busy=false;send.disabled=previewOnly;input.disabled=previewOnly;welcome();if(previewOnly){showPreview();}else{status.textContent='New conversation. Ask a question to check the connection.';input.focus();}};
async function submit(text){
 if(previewOnly){showPreview();return;}if(busy||!config||!text.trim())return;
 if(history.length>=10){status.textContent='Conversation limit reached. Use New conversation to continue.';return;}
 const requestHistory=[...history,{role:'user',content:text.trim()}];bubble('user',text.trim());input.value='';busy=true;send.disabled=true;const turn=epoch;controller=new AbortController();const answer=bubble('assistant','');const typing=el('div','typing','Preparing an answer…');answer.item.append(typing);status.textContent='Generating with '+(config.providerLabel||'the configured AI service')+'…';status.className='status';let output='',completed=false;
 try{
  const response=await fetch(api+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:requestHistory}),signal:controller.signal});
  if(!response.ok){const data=await response.json();throw Error(data.error||'The local server could not answer.');}
  const reader=response.body.getReader(),decoder=new TextDecoder();let pending='';
  while(true){const {value,done}=await reader.read();pending+=decoder.decode(value,{stream:!done});const lines=pending.split('\n');pending=lines.pop();for(const line of lines){if(!line.trim())continue;const event=JSON.parse(line);if(turn!==epoch)return;if(event.type==='token'){typing.remove();output+=event.text;answer.content.textContent=output;messages.scrollTop=messages.scrollHeight;}if(event.type==='sources')addSources(answer.item,event.sources);if(event.type==='error')throw Error(event.error);if(event.type==='done')completed=true;}if(done)break;}
  if(!completed||!output.trim())throw Error('The model response was interrupted or empty. Please try again.');
  history=[...requestHistory,{role:'assistant',content:output.slice(0,2000)}];status.textContent='Response complete · Check the linked official sources.';
 }catch(e){if(turn!==epoch)return;answer.content.textContent=output?output+'\n\n[Response interrupted — please verify before relying on it.]':'No AI answer was generated.';const err=el('p','error',e.name==='AbortError'?'Request cancelled.':e.message);answer.item.append(err);addSources(answer.item,config.locations.map(l=>({title:'Contact '+l.name,url:l.contactUrl})));status.className='status error';status.textContent='AI connection or usage-limit error. See the message below.';}
 finally{typing.remove();if(turn===epoch){busy=false;send.disabled=false;}}
}
form.onsubmit=e=>{e.preventDefault();submit(input.value);};
function showPreview(){status.textContent='Design preview · AI chat is offline. GitHub Pages cannot run Ollama. A hosted backend must be connected before visitors can chat.';send.disabled=true;input.disabled=true;input.placeholder='AI backend not connected';const last=messages.querySelector('.preview-links');if(!last){const note=el('div','preview-links');note.append(el('p','chat-disclosure','Knowledge is curated from skinrr.com and the official location websites. You can visit them directly:'));addSources(note,[{title:'Skin R&R',url:'https://skinrr.com/'},...config.locations.map(l=>({title:l.name,url:l.contactUrl}))]);messages.append(note);}}
async function init(){try{const deploymentResponse=await fetch(new URL('deployment.json',scriptUrl));const deployment=deploymentResponse.ok?await deploymentResponse.json():{mode:'local'};previewOnly=deployment.mode==='preview'&&!deployment.backendUrl;if(deployment.backendUrl){const backend=new URL(deployment.backendUrl);if(backend.protocol!=='https:')throw Error('Hosted backend must use HTTPS.');api=backend.origin;}
const response=await fetch(previewOnly?new URL('brand.public.json',scriptUrl):api+'/api/config');if(!response.ok)throw Error('Brand configuration unavailable.');config=await response.json();panel.setAttribute('aria-label',config.assistantName);launcher.setAttribute('aria-label','Open '+config.assistantName);launcher.textContent='◇  Ask '+config.businessName;
 for(const [key,value]of Object.entries(config.colors)){document.documentElement.style.setProperty({'background':'--bg','text':'--ink','accent':'--accent'}[key],value);}
 document.documentElement.style.setProperty('--body',config.fonts.body);document.documentElement.style.setProperty('--display',config.fonts.display);
 if(config.logo){const img=el('img');img.src=new URL(config.logo,scriptUrl);img.alt=config.businessName;mark.classList.add('with-logo');mark.replaceChildren(img);}welcome();if(previewOnly){showPreview();return;}
 const health=await fetch(api+'/api/health');const data=await health.json();status.textContent=data.ok?'Ready to help.':data.message;if(!data.ok){status.classList.add('error');const notice=el('p','error',data.message);notice.setAttribute('role','alert');messages.append(notice);addSources(messages,config.locations.map(l=>({title:'Contact '+l.name,url:l.contactUrl})));}
 }catch{status.textContent='Cannot reach the assistant backend. Please reload this page and try again.';status.classList.add('error');const notice=el('p','error',status.textContent);notice.setAttribute('role','alert');messages.append(notice);}}
init();
if(window.visualViewport){const fit=()=>{if(embedded)return;if(!panel.hidden&&innerWidth<=600){panel.style.height=Math.max(220,visualViewport.height-16)+'px';panel.style.bottom=Math.max(8,innerHeight-visualViewport.height-visualViewport.offsetTop+8)+'px';}else{panel.style.height='';panel.style.bottom='';}};visualViewport.addEventListener('resize',fit);visualViewport.addEventListener('scroll',fit);launcher.addEventListener('click',fit);}
