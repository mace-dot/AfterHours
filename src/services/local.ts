import {fixture,type Store} from '../domain/game';
export interface Repository {load():Store;save(data:Store):void;reset():Store}
const key='afterhours-demo-v1';
export const repository:Repository={load(){const raw=localStorage.getItem(key);if(!raw)return fixture();try{const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.nights)||!Array.isArray(value.members)||!value.nights.length)throw Error();return value;}catch{throw Error('Saved demo data cannot be read. Reset the demo to continue.');}},save(data){localStorage.setItem(key,JSON.stringify(data));},reset(){localStorage.removeItem(key);return fixture();}};
