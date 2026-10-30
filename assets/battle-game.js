/* One complete match. Same seeded result regardless of playback controls. */
(() => {
 'use strict';
 const $=s=>document.querySelector(s),engine=window.FriendsBattle,renderer=window.ManoSkillPreview;
 const storageKey='jumpsea-match-v1',cards=[...document.querySelectorAll('.card')];
 const ui=document.createElement('section');ui.className='match-controls';
 ui.innerHTML='<div class="match-buttons"><button id="match-start">▶ 开始自动对战</button><button id="match-replay">同局重播</button><button id="match-skip">跳过本招</button><button id="match-new">重开一局</button><button id="match-resume" hidden>继续上次对战</button><button id="match-preview">技能预览</button></div><div id="match-info" aria-live="polite"></div>';
 $('.stage').before(ui);
 const result=document.createElement('div');result.className='match-result';result.hidden=true;$('#decks').before(result);
 const logSection=document.createElement('section');logSection.className='match-log';logSection.innerHTML='<h2>对战日志</h2><ol id="match-log-list" aria-live="polite"></ol><p id="match-storage"></p>';$('#decks').after(logSection);
 const names=['Mano','通风橱'],buttons={start:$('#match-start'),replay:$('#match-replay'),skip:$('#match-skip'),fresh:$('#match-new'),resume:$('#match-resume'),preview:$('#match-preview')};
 let mode='battle',match=null,cursor=0,playing=false,paused=false,speed=1,epoch=0,offset=0,saved=null,finished=false;
 const originalPlay=$('#play').onclick;
 const freshSeed=()=>{if(window.crypto?.getRandomValues){const a=new Uint32Array(1);window.crypto.getRandomValues(a);return a[0];}return(Date.now()^Math.floor(Math.random()*4294967296))>>>0;};
 function storageRead(){try{const value=JSON.parse(localStorage.getItem(storageKey)||'null');if(value?.version===1&&Number.isInteger(value.seed)&&value.seed>=0&&value.seed<=4294967295&&Number.isInteger(value.cursor)&&value.cursor>=0&&Number.isFinite(value.offset))return value;}catch{}return null;}
 function save(){if(!match||mode!=='battle')return;try{const active=renderer.state.battle&&renderer.state.running;localStorage.setItem(storageKey,JSON.stringify({version:1,seed:match.seed,cursor,offset:active?renderer.state.elapsed:offset,speed,finished}));$('#match-storage').textContent='进度已保存在此浏览器；重新打开可继续。';}catch{$('#match-storage').textContent='此浏览器未能保存本地进度；当前对战仍可正常播放。';}}
 function log(text){const li=document.createElement('li');li.textContent=text;$('#match-log-list').append(li);$('#match-log-list').scrollTop=$('#match-log-list').scrollHeight;}
 function summary(e){const a=names[e.owner],b=names[1-e.owner];return`${e.index+1}. ${a} 使用「${e.name}」：`+(!e.hit?'未命中':e.recovered?`恢复 ${e.recovered} HP`:`对 ${b} 造成 ${e.total} 点伤害${e.critical?'（暴击）':''}${e.reduced?'（受 30% 减伤影响）':''}`)+(e.skill==='shove'&&e.after[1-e.owner].weakened?'；附加下次攻击伤害 −30%':'')+`。HP ${e.after[0].hp} : ${e.after[1].hp}`;}
 function setMode(value){mode=value;document.body.classList.toggle('battle-mode',value==='battle');ui.hidden=value!=='battle';logSection.hidden=value!=='battle';document.querySelectorAll('.skill-demo-note').forEach(n=>n.hidden=value==='battle');document.querySelectorAll('.switcher').forEach(n=>n.hidden=value==='battle');cards.forEach(c=>{c.disabled=value==='battle';if(value!=='battle')c.classList.remove('unavailable');});$('#auto').textContent=value==='battle'?'自动对战':'返回对战';}
 function paint(fighters,owner=null){for(let i=0;i<2;i++){const side=i===0?'left':'right';$(`.hp.${side} .name span`).textContent=`${fighters[i].hp} / 100`;$(`.hp.${side} .fill`).style.width=fighters[i].hp+'%';}
  const badges=document.querySelectorAll('.skill-status-badge');badges.forEach(n=>{n.hidden=!fighters.some(f=>f.weakened);});
  const heads=document.querySelectorAll('.deck-head small');fighters.forEach((f,i)=>{if(heads[i])heads[i].textContent=`已行动 ${f.actions} 次 · 大招${f.ultimateUsed?'已使用':f.actions>=2?'可用':`还需 ${2-f.actions} 次行动`}`;});
  cards.forEach(c=>{const i=names.indexOf(c.dataset.owner),key=Object.keys(engine.SKILLS).find(k=>engine.SKILLS[k].owner===i&&engine.SKILLS[k].name===c.dataset.skill);c.classList.toggle('unavailable',!engine.legal(fighters,i).includes(key));c.classList.toggle('acting-owner',owner===i);});
 }
 function controls(){buttons.start.textContent=playing?(paused?'▶ 继续对战':'Ⅱ 暂停对战'):finished?'↻ 再看这场':'▶ 开始自动对战';buttons.skip.disabled=!playing;$('#play').textContent=playing?(paused?'▶ 继续对战':'Ⅱ 暂停对战'):'▶ 开始对战';$('#match-info').textContent=match?`对战种子 ${match.seed} · ${names[match.first]} 先手 · ${finished?'对战结束':`行动 ${Math.min(cursor+1,match.events.length)}`}${playing&&paused?' · 已暂停':''}`:'等待开始';}
 function clearVisuals(){document.querySelectorAll('.fighter').forEach(f=>{f.style.opacity='';f.style.filter='';});result.hidden=true;}
 function interrupt(){epoch++;playing=false;paused=false;renderer.reset();clearVisuals();}
 function prepare(seed,at=0,elapsed=0){interrupt();setMode('battle');match=engine.simulate(seed);cursor=Math.max(0,Math.min(at,match.events.length));offset=Math.max(0,Math.min(elapsed,match.events[cursor]?.duration||0));finished=cursor===match.events.length;$('#match-log-list').textContent='';log(`随机先手：${names[match.first]}。双方 HP 100，轮流行动。`);for(let i=0;i<cursor;i++)log(summary(match.events[i]));paint(cursor?match.events[cursor-1].after:engine.initial());if(cursor<match.events.length&&offset){const p=engine.project(match.events[cursor],offset),fs=match.events[cursor].before.map((f,i)=>({...f,hp:p.hp[i],weakened:p.weakened[i]}));paint(fs);}controls();if(finished)finish();}
 function finish(){playing=false;paused=false;finished=true;offset=0;paint(match.final);result.hidden=false;result.textContent=`${names[match.winner]} 获胜！ · ${match.reason}`;$('#announce').textContent=`${names[match.winner]} 获胜！`;const loser=$('.fighter.'+(match.winner===0?'right':'left'));loser.style.opacity='.35';loser.style.filter='grayscale(1)';log(`胜者：${names[match.winner]}。${match.reason}。`);controls();save();}
 async function run(){if(mode!=='battle')setMode('battle');if(playing){togglePause();return;}if(finished)prepare(match.seed);if(!await renderer.ready){$('#announce').textContent='动作素材未能加载，请保留完整 assets 文件夹后刷新。';return;}
  playing=true;paused=false;const token=++epoch;renderer.setSpeed(speed);controls();
  try{while(token===epoch&&cursor<match.events.length){const e=match.events[cursor];paint(e.before,e.owner);save();const pending=renderer.playBattle(e,{startAt:offset});const outcome=await pending;if(token!==epoch||outcome.cancelled)return;offset=0;paint(e.after);log(summary(e));cursor++;save();controls();}if(token===epoch)finish();}
  catch(error){if(token!==epoch)return;playing=false;paused=false;$('#announce').textContent='对战播放中断：'+error.message;controls();save();}
 }
 function togglePause(){if(!playing){run();return;}paused=!paused;renderer.setPaused(paused);controls();save();}
 buttons.start.onclick=()=>run();buttons.replay.onclick=()=>{prepare(match.seed);run();};buttons.fresh.onclick=()=>{prepare(freshSeed());save();run();};buttons.skip.onclick=()=>{if(!playing)return;paused=false;renderer.setPaused(false);renderer.finishBattle();controls();};
 buttons.preview.onclick=()=>{save();interrupt();setMode('preview');$('#announce').textContent='技能预览模式 · 点击任一技能；点击顶部“返回对战”继续游戏';document.querySelectorAll('.deck-head small').forEach(n=>n.textContent='独立技能预览');};
 $('#play').onclick=function(){if(mode==='preview'){originalPlay.call(this);return;}togglePause();};$('#auto').onclick=()=>{if(mode==='preview')prepare(match.seed,cursor,offset);run();};
 document.querySelectorAll('.speed').forEach(b=>{const previous=b.onclick;b.onclick=()=>{previous.call(b);speed=Number.parseFloat(b.textContent);renderer.setSpeed(speed);save();};});
 buttons.resume.onclick=()=>{if(!saved)return;speed=[1,2,4,8].includes(saved.speed)?saved.speed:1;prepare(saved.seed,saved.cursor,saved.offset);document.querySelectorAll('.speed').forEach(b=>b.classList.toggle('active',Number.parseFloat(b.textContent)===speed));buttons.resume.hidden=true;run();};
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){paused=true;renderer.setPaused(true);controls();save();}});window.addEventListener('beforeunload',save);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&playing){paused=true;renderer.setPaused(true);controls();save();}});
 saved=storageRead();prepare(freshSeed());if(saved){buttons.resume.hidden=false;$('#match-storage').textContent='发现上次记录，点击“继续上次对战”恢复。';}
 $('.round b').textContent='样板实战 · BO1';$('.prototype').textContent='真实结算 · 先跑通两人完整对战';$('.foot').textContent='随机先手 / 轮流行动 / 普通技不可连续重复 / 行动两次解锁大招，每场一次';
 window.FriendsBattleGame={run,prepare,get state(){return{mode,seed:match?.seed,cursor,playing,paused,finished,match}}};
})();
