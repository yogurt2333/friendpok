import {Window} from './qa/node_modules/happy-dom/lib/index.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const html=fs.readFileSync('outputs/全角色技能校验.html','utf8');
const w=new Window({url:'https://offline-test.invalid/',settings:{enableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,enableCSSFileLoading:false,enableImageFileLoading:false}});
w.document.write(html.replace(/<script[\s\S]*?<\/script>/g,''));
const images=[];w.Image=class{set src(s){images.push(s);queueMicrotask(()=>this.onload())}};
const noop=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(o,k)=>o[k]??noop,set:(o,k,v)=>(o[k]=v,true)});
let now=1,id=0;const frames=new Map();w.requestAnimationFrame=fn=>{frames.set(++id,fn);return id};w.cancelAnimationFrame=i=>frames.delete(i);
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){const src=m[1].match(/src="([^"]+)"/);w.eval(src?fs.readFileSync('outputs/'+src[1],'utf8'):m[2])}
const settle=()=>new Promise(r=>setImmediate(r));await settle();
const qa=w.SkillPreviewQA,roster=w.ROSTER_SKILLS;assert.equal(roster.length,8);assert.equal(roster.flatMap(h=>h.skills).length,32);
for(let h=0;h<roster.length;h++)for(let s=0;s<4;s++){
 await qa.play(h,s,false);assert(qa.state.running);assert.equal(w.document.querySelectorAll('#cards button').length,4);
 for(const ms of [0,350,650,1050,1250,1550,1700,2050,2400,3000])qa.seek(ms);
 const skill=roster[h].skills[s],heal=['heal','toilet'].includes(skill.mode);
 assert.equal(w.document.querySelector('#foe-hp').textContent,(heal?100:100-skill.amount)+' / 100',skill.name);
 assert.equal(w.document.querySelector('#own-hp').textContent,(heal?78:skill.mode==='drain'?68:60)+' / 100',skill.name);
 qa.reset();assert(!qa.state.running);assert.equal(w.document.querySelector('#own-hp').textContent,'60 / 100');
}
await qa.play(0,0,false);w.document.querySelector('#pause').click();const before=qa.state.t;for(const f of [...frames.values()])f(500);assert.equal(qa.state.t,before);assert(qa.state.paused);w.document.querySelector('#reset').click();
w.document.querySelector('#speed').value='8';w.document.querySelector('#all').click();await settle();for(let i=0;i<1000&& (qa.state.running||qa.state.queue);i++){now+=100;const batch=[...frames.values()];frames.clear();for(const f of batch)f(now);await settle()}
assert.equal(w.document.querySelector('#status').textContent,'32招连播结束');assert(!qa.state.queue);
if(process.argv.includes('--assets'))for(const src of new Set([...images,...roster.flatMap(h=>[h.idle,...h.skills.map(s=>s.art)])]))assert(fs.existsSync('outputs/'+src),src);
console.log('PASS nonvisual DOM: 32 actions, damage/heal totals, pause/reset, 8x full playlist'+(process.argv.includes('--assets')?', all asset files exist':''));await w.happyDOM.abort();
