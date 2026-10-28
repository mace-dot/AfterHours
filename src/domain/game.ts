import {type NightMessage} from '../features/conversation/domain';
import {type LoreItem} from '../features/memory/domain';
import {type Rulebook,type Amendment,type Modifier} from '../features/rulebook/model';
import {scoreRuleNight,ruleWinners} from '../features/rulebook/scoring';
export const categories = ['contact','kissing','makeout','hookup','sex','date'] as const;
export type Category = string;
export const labels: Record<Category,string> = {contact:'Contact exchange',kissing:'Kissing',makeout:'Makeout',hookup:'Hookup',sex:'Sex',date:'Later date'};
export type Entry = {id:string; owner:string; encounter:string; category:Category; shared:boolean; scoring:boolean; created:number;confirmedBy?:string;creditedTo?:string;sealed?:boolean;exportConsent?:boolean};
export type Rules = {points:Record<Category,number>; cap:number};
export type Night = {id:string; title:string; state:'draft'|'live'|'review'|'finalized'; start:number; end:number; deadline:number; rules:Rules; participants:Record<string,Category[]>; entries:Entry[]; revision:number;rulebook?:Rulebook;modifier?:Modifier;homeSafe?:string[];awardVotes?:Record<string,Record<string,string>>;sealedNight?:boolean};
export type Store = {version:2; adult:boolean; nights:Night[]; members:string[]; timezone:string;rulebook?:Rulebook;amendments?:Amendment[];optouts?:string[];nickname?:string;avatar?:string;lore?:LoreItem[];usualPrivacy?:'private'|'shared';conversation?:NightMessage[];};
export const defaults:Rules = {points:{contact:1,kissing:2,makeout:2,hookup:2,sex:2,date:1},cap:3};
export function scores(n:Night,owner:string) {
 if(n.rulebook)return scoreRuleNight({rules:n.rulebook,modifier:n.modifier||'none',entries:n.entries.map(e=>({...e,categoryId:e.category})),participants:n.participants},owner);
 const result:Record<string,{points:number;reason:string}>={};
 const eligible=n.entries.filter(e=>e.owner===owner).sort((a,b)=>a.created-b.created||a.id.localeCompare(b.id));
 const groups=new Map<string,Entry[]>();
 for(const e of eligible){result[e.id]={points:0,reason:!e.shared?'Private · excluded':!e.scoring?'Scoring off':!n.participants[owner]?.includes(e.category)?'Category opted out':'Included'};if(e.shared&&e.scoring&&n.participants[owner]?.includes(e.category)){groups.set(e.encounter,[...(groups.get(e.encounter)||[]),e]);}}
 let count=0;
 for(const entries of groups.values()){
  if(count++>=n.rules.cap){for(const e of entries)result[e.id].reason='Encounter cap reached';continue;}
  const physical=entries.filter(e=>!['contact','date'].includes(e.category));
  const winner=physical.sort((a,b)=>n.rules.points[b.category]-n.rules.points[a.category]||(categories as readonly string[]).indexOf(b.category)-(categories as readonly string[]).indexOf(a.category))[0];
  const used=new Set<Category>();
  for(const e of entries){if(physical.includes(e)&&e!==winner){result[e.id].reason='Highest physical activity only';continue;}if(used.has(e.category)){result[e.id].reason='Already counted in encounter';continue;}used.add(e.category);result[e.id].points=n.rules.points[e.category];}
 }
 return result;
}
export function total(n:Night,owner:string){return Object.values(scores(n,owner)).reduce((s,x)=>s+x.points,0);}
export function standings(n:Night){return Object.keys(n.participants).map(owner=>({owner,points:total(n,owner)})).sort((a,b)=>b.points-a.points||a.owner.localeCompare(b.owner));}
export function winners(n:Night){if(n.rulebook)return ruleWinners({rules:n.rulebook,modifier:n.modifier||'none',entries:n.entries.map(e=>({...e,categoryId:e.category})),participants:n.participants});const rows=standings(n);return rows.filter(r=>r.points>0&&r.points===rows[0]?.points).map(r=>r.owner);}
export function projection(n:Night){if(n.sealedNight&&n.state==='live')return Object.keys(n.participants).map(owner=>({owner,sealedCount:n.entries.filter(e=>e.owner===owner&&e.shared).length}));return standings(n).map(r=>({...r,activities:n.entries.filter(e=>e.owner===r.owner&&e.shared).map(e=>({category:e.category,points:scores(n,r.owner)[e.id].points}))}));}
export function addEntry(n:Night,e:Entry,now=Date.now()):Night {if(n.entries.some(x=>x.id===e.id))return n;if(n.state!=='live'||now<n.start||now>=n.end)throw Error('New entries are accepted only while the night is live.');if(!n.participants[e.owner])throw Error('Join tonight before posting.');if(n.rulebook&&!n.rulebook.categories.some(c=>c.id===e.category&&c.enabled))throw Error('Category unavailable.');return {...n,entries:[...n.entries,e]};}
export function changeEntry(n:Night,actor:string,id:string,patch:Partial<Pick<Entry,'category'|'shared'|'scoring'|'exportConsent'>>,remove=false):Night{const e=n.entries.find(x=>x.id===id);if(!e||e.owner!==actor)throw Error('Only your own entries can be changed.');return {...n,entries:remove?n.entries.filter(x=>x.id!==id):n.entries.map(x=>x.id===id?{...x,...patch,...(patch.shared===true&&n.sealedNight&&n.state==='live'?{sealed:true}:{}),...(patch.shared===false?{exportConsent:false}:{})}:x),revision:n.revision+1};}
export function transition(n:Night,now=Date.now()):Night{if(n.state==='draft')return {...n,state:'live',start:now,end:now+4*3600000,deadline:now+16*3600000,rules:structuredClone(n.rules)};if(n.state==='live')return {...n,state:'review',end:now,deadline:now+12*3600000};if(n.state==='review'){if(now<n.deadline)throw Error('The 12-hour review window is still open.');return {...n,state:'finalized'};}return n;}
export function fixture():Store {const now=Date.now();const make=(id:string,title:string,state:Night['state']):Night=>({id,title,state,sealedNight:true,start:now-3600000,end:now+4*3600000,deadline:now+16*3600000,rules:structuredClone(defaults),participants:{Jules:['contact','kissing','makeout'],Maya:['contact','kissing','makeout'],Riley:['contact','kissing','makeout']},entries:[],revision:0});const live=make('tonight','The afterparty','live');const old=make('previous','Friday under the stars','finalized');old.start=now-8*86400000;old.end=old.start+4*3600000;old.deadline=old.end+12*3600000;old.revision=1;
 for(const n of [live,old])for(const [i,owner] of ['Maya','Riley','Jules'].entries())for(let j=0;j<(owner==='Jules'?1:4);j++)n.entries.push({id:`${n.id}-${i}-${j}`,owner,encounter:`${i}-${j}`,category:j%2?'contact':'kissing',shared:owner!=='Jules',scoring:true,sealed:n.state==='live',created:n.start+j});
 return {version:2,adult:false,nights:[live,old],members:['You','Maya','Riley','Jules'],timezone:'America/New_York'};}
export function deleteOwnData(store:Store,owner:string):Store {
 return {...store,conversation:(store.conversation||[]).filter(m=>m.owner!==owner),lore:(store.lore||[]).filter(item=>item.nominator!==owner).map(item=>({...item,votes:item.votes.filter(v=>v!==owner)})),nights:store.nights.map(n=>{
  const affected=!!n.participants[owner]||n.entries.some(e=>e.owner===owner);
  return {...n,participants:Object.fromEntries(Object.entries(n.participants).filter(([id])=>id!==owner)),entries:n.entries.filter(e=>e.owner!==owner),revision:n.revision+(affected&&n.state==='finalized'?1:0)};
 })};
}
