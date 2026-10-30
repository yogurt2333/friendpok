const assert=require('assert'),E=require('../outputs/assets/battle-engine.js');
const steady=()=>.5;
let fs=E.initial();assert(!E.legal(fs,0).includes('ultimate'));assert.throws(()=>E.action(fs,0,'ultimate',steady));
let e=E.action(fs,0,'trip',steady);assert.equal(e.total,24);assert.equal(fs[1].hp,100);assert(!E.legal(e.after,0).includes('trip'));
e=E.action(e.after,0,'scatter',steady);assert(E.legal(e.after,0).includes('ultimate'));e=E.action(e.after,0,'ultimate',steady);assert(e.after[0].ultimateUsed);assert(!E.legal(e.after,0).includes('ultimate'));
fs=E.initial();fs[0].hp=95;e=E.action(fs,0,'heal',steady);assert.equal(e.recovered,5);assert.equal(e.after[0].hp,100);
fs=E.action(E.initial(),1,'shove',steady).after;assert(fs[0].weakened);fs[0].hp=40;e=E.action(fs,0,'heal',steady);assert(e.after[0].weakened);e=E.action(e.after,0,'trip',steady);assert(e.reduced);assert.equal(e.total,17);assert(!e.after[0].weakened);
fs=E.initial();fs[0].weakened=true;e=E.action(fs,0,'scatter',()=>.999);assert(!e.hit);assert(e.reduced);assert(!e.after[0].weakened);assert.equal(e.total,0);
fs=E.initial();fs[1].hp=3;e=E.action(fs,0,'scatter',steady);assert.equal(e.total,3);assert.equal(e.beats.length,1);assert.equal(e.after[1].hp,0);assert.deepEqual(E.legal(e.after,1),[]);
fs=E.initial();e=E.action(fs,0,'trip',()=>0);assert(e.critical);assert.equal(e.total,34);assert.equal(E.project(e,1599).hp[1],100);assert.equal(E.project(e,1600).hp[1],66);assert.deepEqual(E.project(e,9999).hp,e.after.map(f=>f.hp));
assert.deepEqual(E.simulate(123456),E.simulate(123456));let total=0,min=100,max=0,wins=[0,0];
for(let seed=0;seed<1000;seed++){const m=E.simulate(seed);total+=m.events.length;min=Math.min(min,m.events.length);max=Math.max(max,m.events.length);wins[m.winner]++;assert(m.events.length<=E.CONFIG.maxActions);assert(m.final.every(f=>f.hp>=0&&f.hp<=100));
 let previous=E.initial();const used=[0,0];m.events.forEach((ev,i)=>{assert.deepEqual(ev.before,previous);assert(E.legal(previous,ev.owner).includes(ev.skill));if(i)assert.notEqual(ev.owner,m.events[i-1].owner);if(E.SKILLS[ev.skill].ultimate){used[ev.owner]++;assert(previous[ev.owner].actions>=2);}assert(used.every(n=>n<=1));assert(ev.after.every(f=>f.hp>=0&&f.hp<=100));assert.equal(ev.after[ev.owner].actions,previous[ev.owner].actions+1);assert.equal(ev.after[1-ev.owner].actions,previous[1-ev.owner].actions);previous=ev.after;});assert.deepEqual(previous,m.final);if(m.reason==='击倒')assert.equal(m.final[1-m.winner].hp,0);
}
console.log('PASS: unlock/use-once, no-repeat, heal cap, debuff carry/consume/miss, KO cancellation, seeded replay, 1000 matches');console.log(JSON.stringify({actions:{min,max,mean:total/1000},wins}));
