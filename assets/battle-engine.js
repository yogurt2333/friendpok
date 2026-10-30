/* Pure deterministic battle rules. Animation is a consumer of these records. */
(function(root){
 'use strict';
 const CONFIG=Object.freeze({hp:100,heal:18,critRate:.1,critMultiplier:1.5,variance:.05,weaken:.3,maxActions:40});
 const SKILLS=Object.freeze({
  trip:{owner:0,name:'我烟呢？',power:[24],accuracy:1,times:[1600]},
  scatter:{owner:0,name:'怎么全掉了',power:[9,9,9],accuracy:.95,times:[950,1400,1850]},
  heal:{owner:0,name:'抽一口',heal:18,times:[1500]},
  ultimate:{owner:0,name:'大烟杆子出离愤怒',power:[6,6,6,24],accuracy:1,times:[1200,1350,1500,2050],ultimate:true},
  stab:{owner:1,name:'夏洛克三连刺',power:[9,9,9],accuracy:.95,times:[650,1200,1750]},
  eat:{owner:1,name:'吃肠',heal:18,times:[1500]},
  shove:{owner:1,name:'塞你嘴里',power:[15],accuracy:1,times:[1350],weaken:true},
  dj:{owner:1,name:'肠控全场',power:[14,14,14],accuracy:1,times:[1050,1600,2150],ultimate:true}
 });
 const clone=value=>JSON.parse(JSON.stringify(value));
 function random(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
 function initial(){return [{name:'Mano',hp:CONFIG.hp,actions:0,last:null,ultimateUsed:false,weakened:false},{name:'通风橱',hp:CONFIG.hp,actions:0,last:null,ultimateUsed:false,weakened:false}];}
 function legal(fighters,owner){const f=fighters[owner];if(f.hp<=0||fighters[1-owner].hp<=0)return[];return Object.keys(SKILLS).filter(key=>{const s=SKILLS[key];return s.owner===owner&&(s.ultimate?f.actions>=2&&!f.ultimateUsed:key!==f.last);});}
 function choose(fighters,owner,rng){const self=fighters[owner],other=fighters[1-owner];return legal(fighters,owner).map(key=>{const s=SKILLS[key];let score;if(s.heal){const gain=Math.min(s.heal,CONFIG.hp-self.hp);score=gain*(self.hp<=35?1.9:self.hp<=60?1.3:.15);if(other.hp<=24)score*=.2;}else{const expected=s.power.reduce((a,b)=>a+b,0)*s.accuracy*(self.weakened?1-CONFIG.weaken:1);score=Math.min(expected,other.hp)+(expected>=other.hp?100:0);if(s.weaken&&!other.weakened)score+=7;}return{key,score:score*(.94+rng()*.12)};}).sort((a,b)=>b.score-a.score)[0]?.key;}
 function action(fighters,owner,key,rng,index=0){
  if(!legal(fighters,owner).includes(key))throw new Error('非法技能：'+key);
  const skill=SKILLS[key],before=clone(fighters),next=clone(fighters),a=next[owner],b=next[1-owner],beats=[];
  const wasWeakened=a.weakened;let critical=false,hit=true,total=0,recovered=0;
  if(skill.heal){recovered=Math.min(skill.heal,CONFIG.hp-a.hp);a.hp+=recovered;beats.push({at:skill.times[0],kind:'heal',amount:recovered,hp:next.map(f=>f.hp),weakened:next.map(f=>f.weakened)});}
  else{
   hit=rng()<skill.accuracy;critical=hit&&rng()<CONFIG.critRate;const factor=(1+(rng()*2-1)*CONFIG.variance)*(critical?CONFIG.critMultiplier:1)*(wasWeakened?1-CONFIG.weaken:1);
   a.weakened=false;
   if(!hit)beats.push({at:skill.times[0],kind:'miss',amount:0,hp:next.map(f=>f.hp),weakened:next.map(f=>f.weakened)});
   else for(let i=0;i<skill.power.length;i++){
    if(b.hp<=0)break;const amount=Math.min(b.hp,Math.max(1,Math.round(skill.power[i]*factor)));b.hp-=amount;total+=amount;if(skill.weaken&&b.hp>0)b.weakened=true;
    beats.push({at:skill.times[i],kind:'damage',amount,critical,hp:next.map(f=>f.hp),weakened:next.map(f=>f.weakened)});
   }
  }
  a.actions++;a.last=key;if(skill.ultimate)a.ultimateUsed=true;
  return {index,owner,skill:key,name:skill.name,before,after:next,beats,total,recovered,hit,critical,reduced:!skill.heal&&wasWeakened,duration:skill.ultimate?3000:2800};
 }
 function simulate(seed){const rng=random(seed);let fighters=initial(),turn=rng()<.5?0:1;const first=turn,events=[];while(events.length<CONFIG.maxActions&&fighters.every(f=>f.hp>0)){const key=choose(fighters,turn,rng),e=action(fighters,turn,key,rng,events.length);events.push(e);fighters=clone(e.after);turn=1-turn;}
  const knockout=fighters.some(f=>f.hp===0);let winner;if(fighters[0].hp!==fighters[1].hp)winner=fighters[0].hp>fighters[1].hp?0:1;else winner=rng()<.5?0:1;
  return{version:1,seed:seed>>>0,first,events,final:fighters,winner,reason:knockout?'击倒':fighters[0].hp===fighters[1].hp?'行动上限后同血量，种子抽签决胜':'行动上限，剩余血量决胜'};
 }
 function project(event,time){let hp=event.before.map(f=>f.hp),weakened=event.before.map(f=>f.weakened);for(const beat of event.beats){if(time<beat.at)break;hp=beat.hp;weakened=beat.weakened;}if(time>=event.duration){hp=event.after.map(f=>f.hp);weakened=event.after.map(f=>f.weakened);}return{hp:[...hp],weakened:[...weakened],fighters:clone(time>=event.duration?event.after:event.before)};}
 const api={CONFIG,SKILLS,random,initial,legal,choose,action,simulate,project};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.FriendsBattle=api;
})(typeof globalThis!=='undefined'?globalThis:this);
