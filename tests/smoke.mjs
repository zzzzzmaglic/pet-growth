// Dependency-free domain/interaction checks. Browser layout is checked separately.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
function boot(storage=new Map(),unavailable=false){
 const nodes=new Map(),listeners={};
 const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',open:false,classList:{add(){},remove(){}},addEventListener(){},focus(){},showModal(){this.open=true;},close(){this.open=false;}});return nodes.get(s);};
 const ctx=vm.createContext({crypto:webcrypto,console,Date,JSON,Math,Number,String,Array,Object,Map,Set,Blob,URL,setTimeout:()=>0,clearTimeout(){},FormData:class{constructor(f){return Object.entries(f.values);}},localStorage:{getItem:k=>{if(unavailable)throw Error('blocked');return storage.get(k)||null;},setItem:(k,v)=>{if(unavailable)throw Error('blocked');storage.set(k,v);}},location:{hash:'#home'},document:{querySelector:node,addEventListener:(k,fn)=>listeners[k]=fn},window:{addEventListener(){},scrollTo(){}}});
 vm.runInContext(source,ctx);
 return {ctx,nodes,listeners,run:s=>vm.runInContext(s,ctx),submit(kind,values,id=''){listeners.submit({target:{id:'editor',dataset:{kind,id},values},preventDefault(){}});},click(action,id='',type=''){listeners.click({target:{closest:()=>({dataset:{action,id,type}})}});}};
}
const app=boot();let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
check('all five routes render',()=>{for(const route of ['home','health','timeline','community','profile']){app.run(`location.hash='#${route}';render()`);assert.ok(app.nodes.get('#main').innerHTML.length>1000);}});
check('pets have isolated weight series',()=>{assert.equal(app.run('weights().at(-1).weight'),24.5);app.run("state.activePet='p2'");assert.equal(app.run('weights().at(-1).weight'),4.2);app.run("state.activePet='p1'");});
const today=app.run('today()');
check('weight creates health record and timeline event',()=>{app.submit('record',{type:'weight',date:today,weight:'25.2',notes:'测试'});assert.equal(app.run('weights().at(-1).weight'),25.2);assert.equal(app.run('events()[0].weight'),25.2);});
check('negative weight rejected',()=>{const n=app.run('records().length');app.submit('record',{type:'weight',date:today,weight:'-5',notes:''});assert.equal(app.run('records().length'),n);});
check('future health record rejected',()=>{const n=app.run('records().length');app.submit('record',{type:'weight',date:'2099-01-01',weight:'20',notes:''});assert.equal(app.run('records().length'),n);});
check('backdated next plan rejected',()=>{const n=app.run('records().length');app.submit('record',{type:'vaccine',date:today,title:'疫苗',nextDate:'2000-01-01',notes:''});assert.equal(app.run('records().length'),n);});
check('record edit does not duplicate',()=>{const id=app.run('weights().at(-1).id'),n=app.run('records().length');app.submit('record',{type:'weight',date:today,weight:'25.1',notes:'更正'},id);assert.equal(app.run('records().length'),n);assert.equal(app.run('weights().at(-1).weight'),25.1);});
check('complete plan creates a record exactly once',()=>{const id=app.run('plans()[0].id'),n=app.run('records().length');app.click('confirm-complete',id);app.click('confirm-complete',id);assert.equal(app.run('records().length'),n+1);assert.equal(app.run('plans().length'),2);});
check('private diary does not auto-post',()=>{const n=app.run('state.posts.length');app.submit('diary',{type:'diary',date:today,title:'测试日记',notes:'私密内容'});assert.equal(app.run('state.posts.length'),n);assert.ok(app.run("events().some(e=>e.title==='测试日记')"));});
check('explicit sharing creates local post',()=>{app.submit('post',{title:'测试分享',text:'这是一条日常',city:'上海',district:'徐汇区',diaryId:'',consent:'on'});assert.equal(app.run('state.posts[0].title'),'测试分享');assert.equal(app.run('state.posts[0].sample'),false);});
check('likes toggle without duplicate counts',()=>{app.click('like','s1');assert.equal(app.run("state.likes.filter(x=>x==='s1').length"),1);app.click('like','s1');assert.equal(app.run('state.likes.length'),0);});
check('district and species filters compose',()=>{assert.equal(app.run("city='上海';district='徐汇区';species='猫咪';state.friends.filter(locationMatch).length"),1);});
check('local comment persists in post',()=>{app.submit('comment',{text:'测试评论'},'s1');assert.equal(app.run("state.posts.find(p=>p.id==='s1').comments.at(-1).text"),'测试评论');});
check('user text is HTML-escaped',()=>{assert.equal(app.run("esc('<img src=x onerror=alert(1)>')"),'&lt;img src=x onerror=alert(1)&gt;');});
check('pet dates validated',()=>{const n=app.run('state.pets.length');app.submit('pet',{name:'测试',type:'猫咪',breed:'田园猫',sex:'女孩',birth:today,arrival:'2000-01-01'});assert.equal(app.run('state.pets.length'),n);});
check('reload restores saved state',()=>{const storage=new Map([['pawprints-v1',app.run('JSON.stringify(state)')]]);const next=boot(storage);assert.equal(next.run('state.posts[0].title'),'测试分享');assert.equal(next.run('weights().at(-1).weight'),25.1);});
check('storage denied still renders and mutation rolls back',()=>{const blocked=boot(new Map(),true);const n=blocked.run('state.records.length');blocked.submit('record',{type:'weight',date:today,weight:'30',notes:''});assert.equal(blocked.run('state.records.length'),n);assert.ok(blocked.nodes.get('#main').innerHTML.includes('本地数据无法读取'));});
check('corrupt storage falls back without overwriting original',()=>{const data=new Map([['pawprints-v1','invalid-json']]);const recovered=boot(data);assert.equal(data.get('pawprints-v1'),'invalid-json');assert.equal(recovered.run('state.pets.length'),2);});
check('delete health record also removes timeline entry',()=>{const id=app.run('weights().at(-1).id');app.click('confirm-delete-record',id);assert.equal(app.run(`events().some(e=>e.id==='${id}')`),false);});
console.log(`\n${checks} checks passed.`);
