import {fixture,type Store} from '../domain/game';
import {validateRulebook} from '../features/rulebook/model';
export interface Repository {load():Store;save(data:Store):void}
// Retain the original storage key so existing visitors keep their nights.
const key='afterhours-demo-v1';
export function migrate(value:unknown):Store{
 if(!value||typeof value!=='object')throw Error('Saved demo data is invalid.');
 const v=value as Store;
 if(![1,2].includes(v.version as number)||!Array.isArray(v.nights)||!v.nights.length||!Array.isArray(v.members))throw Error('Unsupported saved data.');
 for(const n of v.nights){if(!n||!Array.isArray(n.entries)||!n.rules||!n.participants||!['draft','live','review','finalized'].includes(n.state))throw Error('Invalid saved night.');if(n.rulebook)validateRulebook(n.rulebook);}
 if(v.rulebook)validateRulebook(v.rulebook);
 return {...v,version:2,nights:v.nights.map(n=>({...n,sealedNight:n.sealedNight??true,entries:n.entries.map(e=>n.state==='live'&&e.shared&&e.sealed===undefined?{...e,sealed:true}:e)}))};
}
export const repository:Repository={load(){const raw=localStorage.getItem(key);return raw?migrate(JSON.parse(raw)):fixture();},save(data){localStorage.setItem(key,JSON.stringify(migrate(data)));}};
