(function(root){
'use strict';
function create(seed,heroes){const rng=root.RosterBattle.random(seed);return {version:2,seed:seed>>>0,players:heroes.map(h=>({id:h.id,name:h.name,points:0,hp:0,opponents:[],lot:rng()})),rounds:[],pending:null}}
function standings(t){return t.players.map(p=>({...p,buchholz:p.opponents.reduce((sum,id)=>sum+t.players.find(x=>x.id===id).points,0)})).sort((a,b)=>b.points-a.points||b.buchholz-a.buchholz||b.hp-a.hp||a.lot-b.lot)}
function pair(t){const sorted=standings(t);function search(rest){if(!rest.length)return [];const a=rest[0];const candidates=rest.slice(1).filter(b=>!a.opponents.includes(b.id)).sort((x,y)=>Math.abs(a.points-x.points)-Math.abs(a.points-y.points));for(const b of candidates){const tail=search(rest.filter(p=>p.id!==a.id&&p.id!==b.id));if(tail)return [[a.id,b.id],...tail]}return null}const pairs=search(sorted);if(!pairs)throw Error('无法生成无重复配对');return pairs}
function begin(t){if(t.pending)return t.pending;if(t.rounds.length>=4)throw Error('四轮已完成');t.pending={number:t.rounds.length+1,matches:pair(t).map((ids,i)=>({ids,seed:(t.seed+Math.imul(t.rounds.length+1,1009)+i*9176)>>>0})),played:[]};return t.pending}
function complete(t,heroes){if(!t.pending)throw Error('没有进行中的轮次');const p=t.pending,m=p.matches[p.played.length];if(!m)throw Error('本轮已结束');const sim=root.RosterBattle.simulate(m.seed,m.ids,heroes);const result={...m,winner:m.ids[sim.winner],hp:sim.final.map(f=>f.hp)};m.ids.forEach((id,j)=>{const player=t.players.find(p=>p.id===id);player.opponents.push(m.ids[1-j]);player.hp+=result.hp[j];if(j===sim.winner)player.points++});p.played.push(result);if(p.played.length===p.matches.length){t.rounds.push(p.played);t.pending=null}return result}
function next(t,heroes){begin(t);while(t.pending)complete(t,heroes);return t.rounds.at(-1)}
root.Swiss={create,standings,pair,begin,complete,next};if(typeof module!=='undefined')module.exports=root.Swiss;
})(globalThis);
