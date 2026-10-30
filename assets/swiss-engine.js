(function(root){
'use strict';
function create(seed,heroes){const rng=root.RosterBattle.random(seed),players=heroes.map(h=>({id:h.id,name:h.name,points:0,hp:0,opponents:[],lot:rng()}));return {seed:seed>>>0,players,rounds:[]}}
function standings(t){return t.players.map(p=>({...p,buchholz:p.opponents.reduce((sum,id)=>sum+t.players.find(x=>x.id===id).points,0)})).sort((a,b)=>b.points-a.points||b.buchholz-a.buchholz||b.hp-a.hp||a.lot-b.lot)}
function pair(t){const sorted=standings(t);function search(rest){if(!rest.length)return [];const a=rest[0];const candidates=rest.slice(1).filter(b=>!a.opponents.includes(b.id)).sort((a1,b1)=>Math.abs(a.points-a1.points)-Math.abs(a.points-b1.points));for(const b of candidates){const tail=search(rest.filter(p=>p.id!==a.id&&p.id!==b.id));if(tail)return [[a.id,b.id],...tail]}return null}const pairs=search(sorted);if(!pairs)throw Error('无法生成无重复配对');return pairs}
function next(t,heroes){if(t.rounds.length>=4)throw Error('四轮已完成');const pairs=pair(t),round=pairs.map((ids,i)=>{const seed=(t.seed+Math.imul(t.rounds.length+1,1009)+i*9176)>>>0;const m=root.RosterBattle.simulate(seed,ids,heroes);ids.forEach((id,j)=>{const p=t.players.find(p=>p.id===id);p.opponents.push(ids[1-j]);p.hp+=m.final[j].hp;if(j===m.winner)p.points++});return {ids,seed,winner:ids[m.winner],hp:m.final.map(f=>f.hp)}});t.rounds.push(round);return round}
root.Swiss={create,standings,pair,next};if(typeof module!=='undefined')module.exports=root.Swiss;
})(globalThis);
