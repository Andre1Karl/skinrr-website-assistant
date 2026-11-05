// Keep recent complete exchanges; never send an unbounded transcript.
export function recentMessages(history, text) {
 const messages=[...history.map(({role,content})=>({role,content})),{role:'user',content:text.trim()}];
 while(messages.length>11||messages.reduce((sum,m)=>sum+m.content.length,0)>12000)messages.splice(0,2);
 return messages;
}
