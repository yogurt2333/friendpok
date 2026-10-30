const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=f=>fs.readFileSync('assets/'+f+'.js','utf8');
function setup(saved){
  const elements=new Map(),listeners={},timers=[],messages=[];
  class Element{constructor(){this.value='';this.children=[];this.hidden=false;this.contentWindow={postMessage:m=>messages.push(m)}}append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x}scrollIntoView(){}}
  const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id)};
  get('battle-speed').value='2';let stored=saved||null;
  const c={console,Uint32Array,JSON,Math,Number,String,URLSearchParams,crypto:{getRandomValues:a=>(a[0]=123,a)},document:{getElementById:get,createElement:()=>new Element(),addEventListener(){}},localStorage:{setItem:(k,v)=>stored=v,getItem:()=>stored},setTimeout:f=>timers.push(f),BattleAudio:{play(){},pause(){},stopMusic(){},unlock(){},effect(){},setMusic(){},setEffects(){},setVolume(){}},addEventListener:(k,f)=>listeners[k]=f};c.window=c;vm.createContext(c);for(const f of ['roster-skills','battle-roster','roster-battle-engine','swiss-engine','swiss-ui'])vm.runInContext(code(f),c);
  function emit(type,extra={},source=get('viewer').contentWindow){listeners.message({source,data:{channel:'friendpok-battle',run:String(c.SwissUI.state.run),type,...extra}})}
  function finish(){const a=c.SwissUI.state.active;emit('finished',{seed:a.seed,ids:a.ids})}
  return {c,get,emit,finish,timers,messages,saved:()=>stored};
}
let a=setup();a.get('next').onclick();assert(a.c.SwissUI.state.active);assert.equal(a.c.SwissUI.state.t.players.reduce((s,p)=>s+p.points,0),0,'start must not score');a.emit('ready');assert.equal(a.messages.at(-1).type,'play');a.emit('skill',{actor:'小月',name:'蘑菇敲敲',action:1});assert(a.get('now-skill').textContent.includes('蘑菇敲敲'));a.get('pause-battle').onclick();assert(a.c.SwissUI.state.paused);assert.equal(a.messages.at(-1).type,'pause');a.get('pause-battle').onclick();assert(!a.c.SwissUI.state.paused);
a.emit('finished',{seed:123,ids:['bad','bad']});assert.equal(a.c.SwissUI.state.t.players.reduce((s,p)=>s+p.points,0),0);a.emit('finished',{},{});assert(a.c.SwissUI.state.active,'foreign frame rejected');
a.finish();assert.equal(a.c.SwissUI.state.t.players.reduce((s,p)=>s+p.points,0),1);a.emit('finished',{});assert.equal(a.c.SwissUI.state.t.players.reduce((s,p)=>s+p.points,0),1,'duplicate end must not score');
a=setup(a.saved());assert.equal(a.c.SwissUI.state.t.pending.played.length,1);assert.equal(a.c.SwissUI.state.active,null);a.get('next').onclick();
for(let i=1;i<24;i++){a.finish();if(i%6===5&&i<23)a.get('next').onclick();else if(i<23)a.timers.shift()();}
assert.equal(a.c.SwissUI.state.t.rounds.length,4);assert.equal(a.c.SwissUI.state.t.players.reduce((s,p)=>s+p.points,0),24);assert(a.get('champion').textContent.includes('冠军'));assert(a.get('next').disabled);
const before=a.saved();const replay=a.get('rounds').children[0].children[1].children[0];replay.onclick();a.finish();assert.equal(a.saved(),before,'replay must not change tournament');
console.log('PASS playback bridge: zero early scores, ready/start, skill names, pause, message filtering, duplicate finish, refresh resume, all 24 matches, champion, replay unchanged');
