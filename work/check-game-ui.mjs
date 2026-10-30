import {Window} from './qa/node_modules/happy-dom/lib/index.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const html=fs.readFileSync('outputs/battle-prototype.html','utf8');
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(m=>{const src=m[1].match(/\bsrc="([^"]+)"/);return src?fs.readFileSync('outputs/'+src[1],'utf8'):m[2];});
const settle=()=>new Promise(r=>setImmediate(r));
async function setup(record){const w=new Window({url:'https://offline-test.invalid/',settings:{enableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,enableCSSFileLoading:false,enableImageFileLoading:false}});w.document.write(html.replace(/<script[\s\S]*?<\/script>/g,''));
 Object.defineProperty(w.document,'fonts',{value:{ready:Promise.resolve()},configurable:true});
 w.Image=class{set src(s){assert(fs.existsSync('outputs/'+s),s);queueMicrotask(()=>this.onload());}};
 w.HTMLElement.prototype.getAnimations=()=>[];w.HTMLElement.prototype.animate=()=>({cancel(){}});
 w.HTMLElement.prototype.getBoundingClientRect=function(){if(this.matches('.mano'))return{left:250,top:100,width:270,height:265};if(this.matches('.tong'))return{left:1000,top:115,width:288,height:288};return{left:0,top:0,width:1536,height:390};};
 let now=0,id=0;const frames=new Map();w.requestAnimationFrame=fn=>{frames.set(++id,fn);return id;};w.cancelAnimationFrame=id=>frames.delete(id);Object.defineProperty(w,'performance',{value:{now:()=>now},configurable:true});
 if(record)w.localStorage.setItem('jumpsea-match-v1',record);
 for(const script of scripts)w.eval(script);await settle();
 async function advance(ms){for(let n=0;n<ms;n+=16){now+=Math.min(16,ms-n);const batch=[...frames.values()];frames.clear();batch.forEach(f=>f(now));await Promise.resolve();await Promise.resolve();if(n%160===0)await settle();}await settle();}
 return{w,advance};}
const a=await setup();const {w,advance}=a;const game=w.FriendsBattleGame,renderer=w.ManoSkillPreview;
assert(w.document.body.classList.contains('battle-mode'));assert.equal(w.document.querySelectorAll('.card:disabled').length,8);
game.prepare(123456);await settle();w.document.querySelectorAll('.speed')[3].click();const firstRun=game.run();await settle();await advance(200);assert(game.state.playing);
w.document.querySelector('#match-start').click();const pausedAt=renderer.state.elapsed;await advance(500);assert.equal(renderer.state.elapsed,pausedAt);assert(game.state.paused);
const saved=w.localStorage.getItem('jumpsea-match-v1');assert(saved);w.document.querySelector('#match-start').click();await advance(100);w.document.querySelector('#match-skip').click();await advance(9000);await firstRun;assert(game.state.finished);assert.equal(game.state.cursor,game.state.match.events.length);assert(!w.document.querySelector('.match-result').hidden);assert.equal(w.document.querySelector('.hp.left .name span').textContent,game.state.match.final[0].hp+' / 100');
const winner=game.state.match.winner;w.document.querySelector('#match-replay').click();await settle();await advance(9000);assert(game.state.finished);assert.equal(game.state.match.winner,winner);
w.document.querySelector('#match-preview').click();assert(!w.document.body.classList.contains('battle-mode'));assert.equal(w.document.querySelectorAll('.card:disabled').length,0);
const b=await setup(saved);assert(!b.w.document.querySelector('#match-resume').hidden);b.w.document.querySelector('#match-resume').click();await settle();await b.advance(9000);assert(b.w.FriendsBattleGame.state.finished);assert.equal(b.w.FriendsBattleGame.state.match.seed,123456);assert.equal(b.w.FriendsBattleGame.state.match.winner,winner);
console.log('PASS (nonvisual DOM): real HTML wiring, full autoplay, pause, skip, winner, seeded replay, preview switch, local save/restore');await w.happyDOM.abort();await b.w.happyDOM.abort();

