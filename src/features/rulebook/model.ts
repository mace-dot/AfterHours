export type Kind='moment'|'side_quest'|'fumble'|'assist';
export type RuleCategory={id:string;name:string;emoji:string;description?:string;kind:Kind;points:number;stackGroup?:string;perNightLimit?:number;sensitive:boolean;requiresConfirmation?:boolean;enabled:boolean;createdBy:string;createdAt:number};
export type Award={id:string;name:string;emoji:string};
export type Rulebook={id:string;version:number;name:string;emoji:string;accent:string;currency:string;currencyEmoji:string;firstTitle:string;lastTitle:string;cap:number;tiebreak:'shared'|'assists'|'side_quests';punishment:string;categories:RuleCategory[];awards:Award[]};
export type Modifier='none'|'double_side_quests'|'double_fumbles'|'assists_only';
export type RuleEntry={id:string;owner:string;encounter:string;categoryId:string;shared:boolean;scoring:boolean;created:number;confirmedBy?:string;creditedTo?:string};
export type RuleNight={rules:Rulebook;modifier:Modifier;entries:RuleEntry[];participants:Record<string,string[]>};
export type AmendmentChange={type:'category';category:RuleCategory}|{type:'remove';categoryId:string}|{type:'cap';cap:number};
export type Amendment={id:string;number:number;proposer:string;created:number;deadline:number;change:AmendmentChange;voters:string[];votes:Record<string,boolean>;status:'open'|'passed'|'rejected';closedAt?:number};
export function validateRulebook(r:Rulebook){
 if(!r.name.trim()||!r.currency.trim())throw Error('Give the circle and its currency a name.');
 if(!Number.isInteger(r.cap)||r.cap<1||r.cap>10)throw Error('Encounter cap must be 1–10.');
 if(r.categories.filter(c=>c.enabled).length>40)throw Error('Maximum 40 enabled categories.');
 if(new Set(r.categories.map(c=>c.id)).size!==r.categories.length)throw Error('Category IDs must be unique.');
 for(const c of r.categories){if(!c.name.trim())throw Error('Categories need a name.');if(!Number.isInteger(c.points)||c.points< -1000||c.points>1000)throw Error('Category values must be integers from −1,000 to 1,000.');if(c.perNightLimit!==undefined&&(!Number.isInteger(c.perNightLimit)||c.perNightLimit<1))throw Error('Category limits must be positive integers.');if(!['moment','side_quest','fumble','assist'].includes(c.kind))throw Error('Unknown category kind.');}
 return r;
}
export function snapshot(r:Rulebook){return structuredClone(validateRulebook(r));}
