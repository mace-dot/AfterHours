import {validateRulebook,type RuleNight,type RuleEntry} from './model';
export function scoreRuleNight(n:RuleNight,owner:string){
 validateRulebook(n.rules);
 const out:Record<string,{points:number;reason:string}>={};
 const defs=new Map(n.rules.categories.map(c=>[c.id,c]));
 const groups=new Map<string,RuleEntry[]>();
 const entries=n.entries.filter(e=>e.owner===owner||(defs.get(e.categoryId)?.kind==='assist'&&e.creditedTo===owner)).sort((a,b)=>a.created-b.created||a.id.localeCompare(b.id));
 for(const e of entries){
  const c=defs.get(e.categoryId);
  const needsFriend=c?.requiresConfirmation||c?.kind==='assist';
  const reason=!e.shared?'Private · excluded':!e.scoring?'Scoring off':!c?.enabled?'Category disabled':!n.participants[owner]?.includes(c.id)?'Category opted out':needsFriend&&(!e.creditedTo||e.creditedTo===e.owner||!n.participants[e.creditedTo]||e.confirmedBy!==e.creditedTo)?'Awaiting friend confirmation':n.modifier==='assists_only'&&c.kind!=='assist'?'Assists only tonight':c.kind==='assist'&&e.creditedTo!==owner?'Credit awarded to friend':'Included';
  out[e.id]={points:0,reason};
  if(reason==='Included')groups.set(e.encounter,[...(groups.get(e.encounter)||[]),e]);
 }
 const counts=new Map<string,number>();let encounters=0;
 // Encounter order comes from the first eligible record, independent of when an upgrade was posted.
 for(const group of groups.values()){
  if(encounters>=n.rules.cap){for(const e of group)out[e.id].reason='Encounter cap reached';continue;}
  const applicable=group.filter(e=>{const c=defs.get(e.categoryId)!;if(c.perNightLimit!==undefined&&(counts.get(c.id)||0)>=c.perNightLimit){out[e.id].reason='Category limit reached';return false;}return true;});
  const stackWinners=new Map<string,RuleEntry>();
  for(const e of applicable){const c=defs.get(e.categoryId)!;if(!c.stackGroup)continue;const previous=stackWinners.get(c.stackGroup);if(!previous||c.points>defs.get(previous.categoryId)!.points)stackWinners.set(c.stackGroup,e);}
  let counted=false;
  for(const e of applicable){const c=defs.get(e.categoryId)!;
   if(c.stackGroup&&stackWinners.get(c.stackGroup)!==e){out[e.id].reason='Highest in stack group only';continue;}
   if(c.perNightLimit!==undefined&&(counts.get(c.id)||0)>=c.perNightLimit){out[e.id].reason='Category limit reached';continue;}
   counts.set(c.id,(counts.get(c.id)||0)+1);counted=true;
   const double=n.modifier==='double_side_quests'&&c.kind==='side_quest'||n.modifier==='double_fumbles'&&c.kind==='fumble';
   out[e.id].points=c.points*(double?2:1);
  }
  if(counted)encounters++;
 }
 return out;
}
export function ruleTotal(n:RuleNight,owner:string){return Object.values(scoreRuleNight(n,owner)).reduce((sum,v)=>sum+v.points,0);}
export function ruleWinners(n:RuleNight){
 let rows=Object.keys(n.participants).map(owner=>({owner,total:ruleTotal(n,owner)}));
 if(!rows.some(r=>Object.values(scoreRuleNight(n,r.owner)).some(v=>v.reason==='Included')))return [];
 const best=Math.max(...rows.map(r=>r.total));rows=rows.filter(r=>r.total===best);
 if(n.rules.tiebreak!=='shared'){
  const kind=n.rules.tiebreak==='assists'?'assist':'side_quest';
  const counts=rows.map(r=>({owner:r.owner,count:n.entries.filter(e=>(kind==='assist'?e.creditedTo===r.owner:e.owner===r.owner)&&n.rules.categories.find(c=>c.id===e.categoryId)?.kind===kind&&scoreRuleNight(n,r.owner)[e.id]?.reason==='Included').length}));
  const max=Math.max(...counts.map(x=>x.count));rows=rows.filter(r=>counts.some(x=>x.owner===r.owner&&x.count===max));
 }
 return rows.map(r=>r.owner);
}
