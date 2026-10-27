import {type Rulebook,type RuleCategory,type Kind} from './model';
export const templates=['Classic','Wholesome','Chaos','Roast','Build from scratch'] as const;
export type Template=typeof templates[number];
export function makeTemplate(template:Template,author:string,now=Date.now()):Rulebook{
 const category=(id:string,name:string,emoji:string,kind:Kind,points:number,sensitive=false,stackGroup?:string):RuleCategory=>({id,name,emoji,kind,points,sensitive,stackGroup,enabled:true,createdBy:author,createdAt:now,...(kind==='assist'?{requiresConfirmation:true}:{})});
 const romantic=[category('contact','Contact exchange','💬','moment',1),category('kissing','Kissing','💋','moment',2,false,'physical'),category('makeout','Makeout','✨','moment',2,true,'physical'),category('hookup','Hookup','🌙','moment',2,true,'physical'),category('sex','Sex','🔒','moment',2,true,'physical'),category('date','Later date','📅','moment',1)];
 const social=[category('dj-song','Our song made the playlist','🎵','side_quest',2),category('dance','First on the dance floor','🪩','moment',1),category('lost-phone','Lost my phone','📱','fumble',-1),category('wrong-chat','Wrong group chat','🫠','fumble',1),category('wingfriend','Wingfriend','🪽','assist',2),category('got-home','Got the group home','🏠','assist',2)];
 let categories:RuleCategory[]=[];
 if(template==='Classic')categories=romantic;
 if(template==='Wholesome')categories=social.filter(c=>c.kind!=='fumble');
 if(template==='Chaos')categories=social;
 if(template==='Roast')categories=social.map(c=>c.kind==='fumble'?{...c,points:-2}:c);
 return {id:`rulebook-${now}`,version:1,name:'The inner circle',emoji:'🌙',accent:'#ff5097',currency:'Aura',currencyEmoji:'✨',firstTitle:'Main Character',lastTitle:'The Fumbler',cap:3,tiebreak:'shared',punishment:'',categories,awards:['MVP','Plot Twist of the Night','Most Unhinged','Best Fumble','Mom of the Group'].map((name,i)=>({id:`award-${i}`,name,emoji:['🏆','🎭','🌀','🫠','🫶'][i]}))};
}
