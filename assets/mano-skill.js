/* Throwaway skill choreography sample. No tournament simulation or AI. */
(() => {
 'use strict';
 const $=s=>document.querySelector(s);
 const stage=$('.stage'), idle=$('.mano'), defender=$('.tong'), target=$('.fighter.right');
 const announce=$('#announce');
 const paths={pick:'assets/skills/mano-pick.png',fly:'assets/skills/mano-fly.png',vape:'assets/skills/mano-vape.png',phone:'assets/skills/mano-phone.png',keys:'assets/skills/mano-keys.png',scatter:'assets/skills/mano-scatter.png',heal:'assets/skills/mano-heal.png',ultimate:'assets/skills/mano-ultimate.png',stab:'assets/skills/tong-stab.png',eat:'assets/skills/tong-eat.png',shove:'assets/skills/tong-shove.png',dj:'assets/skills/tong-dj.png',ball:'assets/skills/disco-ball.png'};
 const hits=Array.from({length:7},(_,i)=>`assets/fx/hits-2-${i+1}.png`);
 const pulses=Array.from({length:4},(_,i)=>`assets/fx/pulse${i+1}.png`);
 const toolbar=document.createElement('div');
 toolbar.className='skill-demo-tools';
 toolbar.innerHTML='<button id="demo-skill">▶ 我烟呢？完整演出</button><button id="demo-scatter">▶ 怎么全掉了</button><button id="demo-heal">▶ 抽一口</button><button id="demo-ultimate">▶ Mano 大招</button><button id="demo-stab">▶ 夏洛克三连刺</button><button id="demo-eat">▶ 吃肠</button><button id="demo-shove">▶ 塞你嘴里</button><button id="demo-dj">▶ 肠控全场</button><button id="demo-reset">重置预览</button><span class="skill-step" aria-live="polite">待命</span><small>普通技约 2.8 秒 / 大招 3 秒 · 可暂停、加速 · 回血角色从 60 HP 开始</small>';
 stage.before(toolbar);
 const layer=document.createElement('div');layer.className='skill-layer';layer.hidden=true;
 layer.innerHTML=`<img class="skill-actor" src="${paths.pick}" alt="Mano 弯腰捡烟的动作"><img class="skill-vape" src="${paths.vape}" alt="掉落的果汁盒电子烟"><img class="skill-phone" src="${paths.phone}" alt="飞出的手机"><img class="skill-keys" src="${paths.keys}" alt="飞出的钥匙"><div class="skill-trail"></div><img class="skill-hit" src="${hits[0]}" alt="命中星芒"><div class="skill-damage">−24</div>`;
 stage.append(layer);
 const statusBadge=document.createElement('div');statusBadge.className='skill-status-badge';statusBadge.textContent='下次攻击伤害 −30%';statusBadge.hidden=true;stage.append(statusBadge);
 const djFx=document.createElement('div');djFx.className='dj-effects';djFx.hidden=true;
 djFx.innerHTML=`<div class="dj-beam dj-beam-left"></div><div class="dj-beam dj-beam-right"></div><img class="dj-ball" src="${paths.ball}" alt="旋转像素灯球"><div class="dj-floor-lights"></div>`;
 stage.append(djFx);
 const djBall=djFx.querySelector('.dj-ball'),beamLeft=djFx.querySelector('.dj-beam-left'),beamRight=djFx.querySelector('.dj-beam-right');
 const waves=Array.from({length:3},(_,i)=>{const n=document.createElement('img');n.className='dj-wave';n.src=pulses[0];n.alt=`第${i+1}道节拍冲击波`;n.hidden=true;layer.append(n);return n;});
 const actor=layer.querySelector('.skill-actor'),vape=layer.querySelector('.skill-vape'),hit=layer.querySelector('.skill-hit'),damage=layer.querySelector('.skill-damage'),trail=layer.querySelector('.skill-trail');
 const step=toolbar.querySelector('.skill-step'),start=$('#demo-skill'),scatterStart=$('#demo-scatter'),healStart=$('#demo-heal'),ultimateStart=$('#demo-ultimate'),stabStart=$('#demo-stab'),eatStart=$('#demo-eat'),shoveStart=$('#demo-shove'),djStart=$('#demo-dj');
 const phone=layer.querySelector('.skill-phone'),keys=layer.querySelector('.skill-keys'),projectiles=[vape,phone,keys];
 const skillCard=[...document.querySelectorAll('.card')].find(c=>c.dataset.owner==='Mano'&&c.dataset.skill==='我烟呢？');
 skillCard.insertAdjacentHTML('afterbegin',`<img class="skill-preview-thumb" src="${paths.fly}" alt="扑飞动作缩略图">`);
 const scatterCard=[...document.querySelectorAll('.card')].find(c=>c.dataset.owner==='Mano'&&c.dataset.skill==='怎么全掉了');
 scatterCard.insertAdjacentHTML('afterbegin',`<img class="skill-preview-thumb" src="${paths.scatter}" alt="电子烟、手机和钥匙散落的技能图">`);
 const healCard=[...document.querySelectorAll('.card')].find(c=>c.dataset.owner==='Mano'&&c.dataset.skill==='抽一口');
 healCard.insertAdjacentHTML('afterbegin',`<img class="skill-preview-thumb" src="${paths.heal}" alt="Mano 举起果汁盒电子烟抽一口的技能图">`);
 const ultimateCard=[...document.querySelectorAll('.card')].find(c=>c.dataset.owner==='Mano'&&c.dataset.skill==='大烟杆子出离愤怒');
 ultimateCard.insertAdjacentHTML('afterbegin',`<img class="skill-preview-thumb" src="${paths.ultimate}" alt="Mano 平地摔爆装备并飞撞的专属大招图">`);
 const stabCard=[...document.querySelectorAll('.card')].find(c=>c.dataset.owner==='通风橱'&&c.dataset.skill==='夏洛克三连刺');
 stabCard.insertAdjacentHTML('afterbegin',`<img class="skill-preview-thumb" src="${paths.stab}" alt="通风橱手持肉肠向左前刺的动作图">`);
 const eatCard=[...document.querySelectorAll('.card')].find(c=>c.dataset.owner==='通风橱'&&c.dataset.skill==='吃肠');
 eatCard.insertAdjacentHTML('afterbegin',`<img class="skill-preview-thumb" src="${paths.eat}" alt="通风橱举起肉肠咬一口的技能图">`);
 const shoveCard=[...document.querySelectorAll('.card')].find(c=>c.dataset.owner==='通风橱'&&c.dataset.skill==='塞你嘴里');
 shoveCard.insertAdjacentHTML('afterbegin',`<img class="skill-preview-thumb" src="${paths.shove}" alt="通风橱上前把肉肠塞向对手的技能图">`);
 const djCard=[...document.querySelectorAll('.card')].find(c=>c.dataset.owner==='通风橱'&&c.dataset.skill==='肠控全场');
 djCard.insertAdjacentHTML('afterbegin',`<img class="skill-preview-thumb" src="${paths.dj}" alt="通风橱用肉肠在DJ台打碟的技能图">`);
 const note=document.createElement('p');note.className='skill-demo-note';note.innerHTML='已完成独立演出：Mano 四招，以及通风橱「夏洛克三连刺」（9 × 3，算一次行动）、「吃肠」（恢复 18 HP）、「塞你嘴里」（15 伤害与减伤状态提示）、「肠控全场」（14 × 3 伤害）。攻击预览从满血开始，回血预览让对应角色从 60 HP 开始。大招按钮仅用于演出校验，正式解锁条件与每场一次规则待战斗引擎接入；「塞你嘴里」的减伤为状态演示，正式下次攻击结算待战斗引擎接入；两位角色八招的独立演出均已接入，完整对战与赛事尚未接入。<br><span class="skill-credits">命中与回血星芒：<a href="https://opengameart.org/content/warped-shooting-fx" target="_blank" rel="noopener">Warped Shooting Fx / ansimuz · CC0</a>，素材已存本地。</span>';
 $('#decks').after(note);
 const cache=new Map();let ready=false,error='',running=false,paused=false,speed=1,elapsed=0,last=0,raf=0,layout=null,muted=true,activeSkill='trip',hitCount=0,weakened=false,externalEvent=null,completion=null;
 start.disabled=true;scatterStart.disabled=true;healStart.disabled=true;ultimateStart.disabled=true;stabStart.disabled=true;eatStart.disabled=true;shoveStart.disabled=true;djStart.disabled=true;start.textContent='加载动作素材…';
 const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{cache.set(src,im);resolve()};im.onerror=()=>reject(new Error('素材加载失败：'+src));im.src=src;});
 const assetsReady=Promise.all([...Object.values(paths),...hits,...pulses].map(load)).then(()=>{ready=true;start.disabled=false;scatterStart.disabled=false;healStart.disabled=false;ultimateStart.disabled=false;stabStart.disabled=false;eatStart.disabled=false;shoveStart.disabled=false;djStart.disabled=false;start.textContent='▶ 我烟呢？完整演出';return true;}).catch(e=>{error=e.message;start.textContent='素材缺失';announce.textContent=error;return false;});
 const hp=$('.hp.right .name span'),bar=$('.hp.right .fill'),ownHp=$('.hp.left .name span'),ownBar=$('.hp.left .fill');
 const previewButtons={trip:start,scatter:scatterStart,heal:healStart,ultimate:ultimateStart,stab:stabStart,eat:eatStart,shove:shoveStart,dj:djStart},previewCards={trip:skillCard,scatter:scatterCard,heal:healCard,ultimate:ultimateCard,stab:stabCard,eat:eatCard,shove:shoveCard,dj:djCard};
 const move=(node,x,y)=>{node.style.left=`${x}px`;node.style.top=`${y}px`;};
 const lerp=(a,b,t)=>a+(b-a)*t;
 function setStep(label,text){if(step.textContent!==label){step.textContent=label;announce.textContent=text;}}
 function measure(){const box=stage.getBoundingClientRect(),a=idle.getBoundingClientRect(),b=defender.getBoundingClientRect();return {x:a.left-box.left+a.width/2,y:a.top-box.top+a.height/2,tx:b.left-box.left+b.width/2,ty:b.top-box.top+b.height/2,w:a.width,h:a.height,tw:b.width,th:b.height};}
 function restore(){idle.style.visibility='';idle.style.transform='';idle.style.filter='';target.style.transform='';defender.style.visibility='';defender.style.filter='';stage.style.transform='';hit.style.filter='';hit.style.width='';hit.style.height='';damage.style.color='';projectiles.forEach(p=>p.hidden=true);layer.classList.remove('ultimate');djFx.hidden=true;waves.forEach(n=>n.hidden=true);layer.hidden=true;}
 function reset(){cancelAnimationFrame(raf);if(completion){const done=completion;completion=null;done({cancelled:true});}externalEvent=null;running=false;paused=false;elapsed=0;hitCount=0;weakened=false;statusBadge.hidden=true;restore();hp.textContent='100 / 100';bar.style.width='100%';ownHp.textContent='100 / 100';ownBar.style.width='100%';step.textContent='待命';start.textContent='▶ 我烟呢？完整演出';scatterStart.textContent='▶ 怎么全掉了';healStart.textContent='▶ 抽一口';ultimateStart.textContent='▶ Mano 大招';stabStart.textContent='▶ 夏洛克三连刺';eatStart.textContent='▶ 吃肠';shoveStart.textContent='▶ 塞你嘴里';djStart.textContent='▶ 肠控全场';$('#play').textContent='▶ 预览待机';announce.textContent='动作预览已重置 · 点击已完成的技能观看';}
 function impactSound(){if(muted||(externalEvent&&!externalEvent.hit))return;try{const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;const ctx=audioCtx||(audioCtx=new AudioCtx());ctx.resume();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(140,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(45,ctx.currentTime+.1);gain.gain.setValueAtTime(.08,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.13);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.14);}catch{}}
 let audioCtx=null,sounded=false;
 function renderDJ(t){
  const {x,y,tx,ty,w,tw,th}=layout,launches=[650,1200,1750],impacts=[1050,1600,2150];
  actor.hidden=true;projectiles.forEach(p=>p.hidden=true);hit.hidden=true;damage.hidden=true;waves.forEach(p=>p.hidden=true);trail.style.opacity='0';idle.style.visibility='';idle.style.transform='';idle.style.filter='';target.style.transform='';stage.style.transform='';
  const landed=impacts.filter(v=>t>=v).length;ownHp.textContent=`${100-landed*14} / 100`;ownBar.style.width=`${100-landed*14}%`;
  if(landed>hitCount){for(let i=hitCount;i<landed;i++)djBeat(i);hitCount=landed;}
  if(t<350){defender.style.visibility='';setStep('DJ 就位','通风橱使用了「肠控全场」！');return;}
  const fade=t<650?(t-350)/300:t>2600?(3000-t)/400:1;
  djFx.hidden=false;djFx.style.opacity=String(Math.max(0,fade));djBall.style.transform=`rotate(${Math.sin(t/300)*14}deg)`;djBall.style.filter=`hue-rotate(${Math.floor(t/400)*35}deg)`;beamLeft.style.transform=`rotate(${-20+Math.sin(t/450)*25}deg)`;beamRight.style.transform=`rotate(${20-Math.sin(t/500)*25}deg)`;
  const color=Math.floor((t-350)/550)%3;beamLeft.style.background=['#55DBDC40','#E289DA40','#EAD26340'][color];beamRight.style.background=['#E289DA40','#EAD26340','#55DBDC40'][color];
  defender.style.visibility='hidden';actor.hidden=false;actor.src=paths.dj;actor.alt='通风橱用肉肠在DJ台打碟';actor.style.width=`${tw*1.13}px`;actor.style.height=`${th}px`;move(actor,tx-tw*.565,ty-th*.5);actor.style.transform=`translateY(${Math.sin((t-350)/90)*3}px) rotate(${Math.sin(t/180)*2}deg)`;
  if(t<650)setStep('灯球亮起','灯球亮起，通风橱掏出 DJ 台！');
  for(let i=0;i<3;i++){const q=(t-launches[i])/400;if(q<0||q>=1)continue;const wave=waves[i];wave.hidden=false;wave.src=pulses[Math.min(3,Math.floor(q*4))];wave.style.width=`${180+q*35}px`;wave.style.height=`${90+q*18}px`;wave.style.transform='scaleX(-1)';wave.style.filter=`hue-rotate(${[0,65,145][i]}deg)`;move(wave,lerp(tx-tw*.35,x+w*.2,q)-100,lerp(ty+th*.1,y+[0,-15,15][i],q)-50);setStep(`第 ${i+1} 拍`,`肉肠打碟，第 ${i+1} 道节拍冲击波！`);}
  const lastHit=impacts.findLastIndex(v=>t>=v&&t-v<300);
  if(lastHit>=0){const q=(t-impacts[lastHit])/300;hit.hidden=false;hit.src=hits[Math.min(6,Math.floor(q*7))];hit.style.filter=`hue-rotate(${[0,65,145][lastHit]}deg)`;move(hit,x+w*.2-64,y-64);damage.hidden=false;damage.textContent='−14';damage.style.opacity=String(1-q*.6);move(damage,x-w*.35,y-th*.25-q*35);idle.style.transform=`translate(${-Math.sin(q*25)*(1-q)*15}px,0)`;idle.style.filter=Math.floor(q*6)%2===0?'brightness(4)':'';stage.style.transform=`translateY(${Math.sin(q*23)*(1-q)*2}px)`;setStep(`${lastHit+1} / 3 节拍命中`,`第 ${lastHit+1} 拍命中！Mano −14 HP · 累计 ${landed*14} 点伤害`);}
  if(t>=2500&&t<3000)setStep('灯光渐暗','三拍结束，合计 42 点伤害 · 灯球与舞台灯渐暗');
  if(t>=3000){restore();setStep('演出结束','「肠控全场」演出结束 · Mano 剩余 58 HP · 灯光恢复');}
 }
 function djBeat(index){if(muted||(externalEvent&&!externalEvent.hit))return;try{const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;const ctx=audioCtx||(audioCtx=new AudioCtx());ctx.resume();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime([130,155,180][index],ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(42,ctx.currentTime+.16);gain.gain.setValueAtTime(.1,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.2);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.22);}catch{}}
 function renderShove(t){
  const {x,y,tx,ty,w,tw,th}=layout;
  actor.hidden=true;projectiles.forEach(p=>p.hidden=true);hit.hidden=true;damage.hidden=true;trail.style.opacity='0';idle.style.visibility='';idle.style.filter='';idle.style.transform='';target.style.transform='';
  if(t>=1350){ownHp.textContent='85 / 100';ownBar.style.width='85%';weakened=true;statusBadge.hidden=false;if(!sounded){sounded=true;hitCount=1;impactSound();}}
  if(t<350){defender.style.visibility='';setStep('塞肠准备','通风橱使用了「塞你嘴里」！');return;}
  defender.style.visibility='hidden';actor.hidden=false;actor.src=paths.shove;actor.alt='通风橱把肉肠推向对手嘴边';actor.style.width=`${tw*1.08}px`;actor.style.height=`${th}px`;
  const near=x+w*.52,attackX=tx-tw*.54,nearX=near-tw*.54;
  if(t<1350){const q=(t-350)/1000,p=1-Math.pow(1-q,3);move(actor,lerp(attackX,nearX,p),ty-th*.5);actor.style.transform=`rotate(${-q*7}deg)`;setStep('上前塞肠','通风橱上前，把肉肠塞向 Mano 嘴边！');return;}
  if(t<1950){const q=(t-1350)/600;move(actor,nearX+Math.sin(q*22)*3,ty-th*.5);actor.style.transform='rotate(-7deg)';idle.style.transform=`translate(${-Math.sin(q*18)*(1-q)*9}px,0)`;idle.style.filter=q<.4&&Math.floor(q*10)%2===0?'brightness(4)':'';if(q<.5){hit.hidden=false;hit.src=hits[Math.min(6,Math.floor(q*14))];hit.style.filter='hue-rotate(85deg)';move(hit,x+w*.17-64,y-35-64);}damage.hidden=false;damage.textContent='−15';damage.style.opacity=String(1-q*.7);move(damage,x-w*.34,y-th*.27-q*30);setStep('命中并减伤','Mano −15 HP · 下次攻击伤害降低 30%（不叠加）');return;}
  if(t<2550){const q=(t-1950)/600,p=1-Math.pow(1-q,3);move(actor,lerp(nearX,attackX,p),ty-th*.5);actor.style.transform=`rotate(${lerp(-7,0,p)}deg)`;setStep('收招归位','通风橱回到圆盘 · 减伤状态保留');return;}
  restore();if(t<2800)setStep('状态展示','Mano 剩余 85 HP · 下次攻击伤害 −30%');else setStep('演出结束','「塞你嘴里」演出结束 · 15 伤害 + 下次攻击减伤状态提示');
 }
 function renderEat(t){
  const {tx,ty,tw,th}=layout;
  projectiles.forEach(p=>p.hidden=true);trail.style.opacity='0';hit.hidden=true;damage.hidden=true;actor.hidden=true;idle.style.visibility='';
  const amount=Math.round(18*Math.max(0,Math.min(1,(t-1500)/400)));
  hp.textContent=`${60+amount} / 100`;bar.style.width=`${60+amount}%`;
  if(t<350){defender.style.visibility='';setStep('准备吃肠','通风橱使用了「吃肠」！');return;}
  defender.style.visibility='hidden';actor.hidden=false;actor.src=paths.eat;actor.alt='通风橱把肉肠举到嘴边咬一口';actor.style.width=`${tw}px`;actor.style.height=`${th}px`;move(actor,tx-tw*.5,ty-th*.5);actor.style.transform=`translateY(${t<1500?Math.sin((t-350)/90)*2:0}px)`;
  if(t<1500)setStep('咬一口','通风橱举起肉肠，咬了一口……');
  if(t>=900&&t<2300){const q=(t-900)/1400,phase=Math.floor(q*4),local=(q*4)%1;hit.hidden=false;hit.src=hits[Math.min(6,Math.floor(local*7))];hit.style.filter='hue-rotate(-65deg)';const positions=[[-.3,.12],[.18,-.24],[-.18,-.36],[.24,.06]];move(hit,tx+tw*positions[phase][0]-64,ty+th*positions[phase][1]-64);}
  if(t>=1500){if(!sounded){sounded=true;healSound();}setStep('恢复生命','通风橱恢复了 18 HP！');damage.hidden=t>=2450;damage.textContent='+18';damage.style.color='#BDFF97';damage.style.opacity=String(1-Math.max(0,t-1800)/900);move(damage,tx-tw*.42,ty-th*.2-(t-1500)*.045);}
  if(t>=2300&&t<2800){actor.hidden=true;defender.style.visibility='';setStep('恢复完成','通风橱 HP：60 → 78 / 100 · 回到待机');}
  if(t>=2800){restore();setStep('演出结束','「吃肠」演出结束 · 通风橱恢复 18 HP，当前 78 / 100');}
 }
 function renderStab(t){
  const {x,y,tx,ty,w,tw,th}=layout,impacts=[650,1200,1750];
  actor.hidden=true;hit.hidden=true;damage.hidden=true;trail.style.opacity='0';projectiles.forEach(p=>p.hidden=true);idle.style.visibility='';idle.style.transform='';idle.style.filter='';target.style.transform='';defender.style.filter='';
  const landed=impacts.filter(v=>t>=v).length;ownHp.textContent=`${100-landed*9} / 100`;ownBar.style.width=`${100-landed*9}%`;
  if(landed>hitCount){for(let i=hitCount;i<landed;i++)impactSound();hitCount=landed;}
  if(t<300){defender.style.visibility='';setStep('三连刺准备','通风橱使用了「夏洛克三连刺」！');return;}
  defender.style.visibility='hidden';actor.hidden=false;actor.src=paths.stab;actor.alt='通风橱用肉肠向左前刺';actor.style.width=`${tw*1.08}px`;actor.style.height=`${th}px`;
  let pulse=0,stroke=0;
  if(t>=400&&t<2050){stroke=Math.min(2,Math.floor((t-400)/550));const q=((t-400)%550)/550;pulse=q<.455?q/.455:(1-q)/.545;setStep(`第 ${stroke+1} 刺`,['第一刺！','回收，再刺！','第三刺，收招！'][stroke]);}
  const reach=Math.max(0,tx-x-w*.6),cx=tx-reach*Math.max(0,pulse);
  move(actor,cx-tw*.54,ty-th*.5);actor.style.transform=`rotate(${-pulse*5}deg)`;
  if(pulse>.15){trail.style.opacity=String(pulse*.8);move(trail,cx+tw*.22,ty+th*.16);}
  const lastHit=impacts.findLastIndex(v=>t>=v&&t-v<260);
  if(lastHit>=0){const q=(t-impacts[lastHit])/260;hit.hidden=false;hit.src=hits[Math.min(6,Math.floor(q*7))];move(hit,x+w*.25-64,y+15-64);damage.hidden=false;damage.textContent='−9';damage.style.opacity=String(1-q*.6);move(damage,x-w*.35,y-th*.25-q*35);idle.style.transform=`translate(${-Math.sin(q*24)*(1-q)*12}px,0)`;idle.style.filter=Math.floor(q*6)%2===0?'brightness(4)':'';setStep(`${lastHit+1} / 3 命中`,`第 ${lastHit+1} 刺命中！Mano −9 HP · 累计 ${landed*9} 点伤害`);}
  if(t>=2050&&t<2800){setStep('回到圆盘','三连刺结束 · 合计 27 点伤害，算一次行动');actor.hidden=true;defender.style.visibility='';}
  if(t>=2800){restore();setStep('演出结束','「夏洛克三连刺」演出结束 · Mano 剩余 73 HP');}
 }
 function renderUltimate(t){
  const {x,y,tx,ty,w,h}=layout;const launches=[700,850,1000],lands=[1200,1350,1500];
  projectiles.forEach(p=>p.hidden=true);actor.hidden=true;hit.hidden=true;damage.hidden=true;trail.style.opacity='0';target.style.transform='';defender.style.filter='';stage.style.transform='';
  const gearHits=lands.filter(v=>t>=v).length,bodyHit=t>=2050,total=gearHits*6+(bodyHit?24:0),n=gearHits+(bodyHit?1:0);
  hp.textContent=`${100-total} / 100`;bar.style.width=`${100-total}%`;
  if(n>hitCount){for(let i=hitCount;i<n;i++)impactSound();hitCount=n;}
  if(t<450){idle.style.visibility='';setStep('大招发动','Mano 使用了「大烟杆子出离愤怒」！');return;}
  idle.style.visibility='hidden';actor.hidden=false;actor.src=paths.pick;actor.style.width=`${w*1.06}px`;actor.style.height=`${h*.88}px`;move(actor,x-w*.53,y-h*.32);actor.style.transform=`rotate(${Math.min(1,(t-450)/1050)*22}deg)`;
  if(t<1050)setStep('平地摔','Mano 脚下一滑，随身装备全部脱手！');
  for(let i=0;i<3;i++){const q=(t-launches[i])/500;if(q<0||q>=1)continue;const item=projectiles[i],size=[66,72,74][i];item.hidden=false;item.style.width=`${size}px`;item.style.height=`${size*1.2}px`;move(item,lerp(x+30,tx-w*.18,q)-size/2,lerp(y+30,ty+[-35,0,35][i],q)-Math.sin(q*Math.PI)*[90,120,100][i]-size*.6);item.style.transform=`rotate(${q*[540,-480,600][i]}deg)`;setStep('装备爆飞','电子烟、手机、钥匙爆飞，连续命中！');}
  if(t>=1500&&t<2050){const q=(t-1500)/550,p=q*q;actor.src=paths.fly;actor.style.width=`${w*1.25}px`;actor.style.height=`${h*.86}px`;const cx=lerp(x,tx-w*.3,p);move(actor,cx-w*.625,lerp(y,ty,q)-h*.43-Math.sin(q*Math.PI)*30);actor.style.transform=`rotate(${lerp(-8,12,q)}deg)`;trail.style.opacity='1';move(trail,cx-w*.7,ty);setStep('本人滑撞','装备先到，Mano 紧随其后撞了过去！');}
  const lastGear=lands.findLastIndex(v=>t>=v&&t-v<150);
  if(lastGear>=0){const q=(t-lands[lastGear])/150;hit.hidden=false;hit.style.width='128px';hit.style.height='128px';hit.src=hits[Math.min(6,Math.floor(q*7))];move(hit,tx-w*.18-64,ty+[-35,0,35][lastGear]-64);damage.hidden=false;damage.textContent='−6';damage.style.opacity='1';move(damage,tx+12,ty-h*.3-q*25);target.style.transform=`translate(${Math.sin(q*20)*8}px,0)`;defender.style.filter=q<.5?'brightness(4)':'';}
  if(t>=2050&&t<2450){const q=(t-2050)/400;actor.src=paths.fly;actor.style.width=`${w*1.25}px`;actor.style.height=`${h*.86}px`;move(actor,tx-w*.925-q*15,ty-h*.43+q*12);actor.style.transform=`rotate(${12+q*18}deg)`;hit.hidden=false;hit.style.width='192px';hit.style.height='192px';hit.src=hits[Math.min(6,Math.floor(q*7))];move(hit,tx-w*.15-96,ty-96);damage.hidden=false;damage.textContent='−24';damage.style.opacity=String(1-q*.5);move(damage,tx+18,ty-h*.35-q*40);target.style.transform=`translate(${Math.sin(q*30)*(1-q)*21}px,0)`;defender.style.filter=Math.floor(q*8)%2===0?'brightness(5)':'';stage.style.transform=`translate(${Math.sin(q*31)*(1-q)*5}px,${Math.cos(q*24)*(1-q)*2}px)`;setStep('重击命中','本人滑撞 −24！大招累计造成 42 点伤害。');}
  if(t>=2450&&t<3000){const q=(t-2450)/550,p=1-Math.pow(1-q,3);actor.src=paths.pick;actor.style.width=`${w*1.06}px`;actor.style.height=`${h*.88}px`;move(actor,lerp(tx-w*.925-15,x-w*.53,p),lerp(ty-h*.43+12,y-h*.32,p));actor.style.transform=`rotate(${lerp(30,0,p)}deg)`;setStep('大招收尾','装备三连击 + 本人滑撞 · 总伤害 42');}
  if(t>=3000){restore();setStep('演出结束','「大烟杆子出离愤怒」演出结束 · 通风橱剩余 58 HP');}
 }
 function healSound(){if(muted)return;try{const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;const ctx=audioCtx||(audioCtx=new AudioCtx());ctx.resume();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(420,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(840,ctx.currentTime+.2);gain.gain.setValueAtTime(.05,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.28);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.3);}catch{}}
 function renderHeal(t){
  const {x,y,w,h}=layout;
  projectiles.forEach(p=>p.hidden=true);trail.style.opacity='0';hit.hidden=true;damage.hidden=true;actor.hidden=true;
  const amount=Math.round(18*Math.max(0,Math.min(1,(t-1500)/400)));
  ownHp.textContent=`${60+amount} / 100`;ownBar.style.width=`${60+amount}%`;
  if(t<350){idle.style.visibility='';setStep('准备恢复','Mano 使用了「抽一口」！');return;}
  idle.style.visibility='hidden';actor.hidden=false;actor.src=paths.heal;actor.alt='Mano 把果汁盒电子烟举到嘴边';actor.style.width=`${w}px`;actor.style.height=`${h}px`;move(actor,x-w*.5,y-h*.5);actor.style.transform=`translateY(${-Math.sin(Math.min(1,(t-350)/1800)*Math.PI)*3}px)`;
  if(t<1500)setStep('抽一口','Mano 举起电子烟，抽了一口……');
  if(t>=900&&t<2300){const q=(t-900)/1400,phase=Math.floor(q*4),local=(q*4)%1;hit.hidden=false;hit.src=hits[Math.min(6,Math.floor(local*7))];hit.style.filter='hue-rotate(-65deg)';const positions=[[-.35,.12],[.17,-.25],[-.2,-.38],[.25,.06]];move(hit,x+w*positions[phase][0]-64,y+h*positions[phase][1]-64);}
  if(t>=1500){if(!sounded){sounded=true;healSound();}setStep('恢复生命','Mano 恢复了 18 HP！');damage.hidden=t>=2450;damage.textContent='+18';damage.style.color='#BDFF97';damage.style.opacity=String(1-Math.max(0,t-1800)/900);move(damage,x+w*.25,y-h*.18-(t-1500)*.045);}
  if(t>=2300&&t<2800){actor.hidden=true;idle.style.visibility='';setStep('恢复完成','Mano HP：60 → 78 / 100 · 回到待机');}
  if(t>=2800){restore();setStep('演出结束','「抽一口」演出结束 · Mano 恢复 18 HP，当前 78 / 100');}
 }
 function renderScatter(t){
  const {x,y,tx,ty,w,h}=layout;
  actor.hidden=true;hit.hidden=true;damage.hidden=true;trail.style.opacity='0';projectiles.forEach(p=>p.hidden=true);idle.style.visibility='';target.style.transform='';defender.style.filter='';stage.style.transform='';
  const launches=[350,800,1250],lands=launches.map(v=>v+600),names=['电子烟','手机','钥匙'];
  const landed=lands.filter(v=>t>=v).length;
  hp.textContent=`${100-landed*9} / 100`;bar.style.width=`${100-landed*9}%`;
  if(landed>hitCount){for(let i=hitCount;i<landed;i++)impactSound();hitCount=landed;}
  idle.style.transform=t<2150?`translateY(${Math.sin(t/110)*3}px) rotate(${Math.sin(t/170)*7}deg)`:'';
  if(t<350)setStep('手忙脚乱','Mano 使用了「怎么全掉了」！');
  for(let i=0;i<3;i++){
   const q=(t-launches[i])/600;if(q<0||q>=1)continue;
   const item=projectiles[i];item.hidden=false;
   const size=[52,58,62][i];item.style.width=`${size}px`;item.style.height=`${size*1.22}px`;
   const sx=x+28,sy=y+30+i*12,ex=tx-w*.18,ey=ty+[-30,15,45][i];
   move(item,lerp(sx,ex,q)-size/2,lerp(sy,ey,q)-Math.sin(q*Math.PI)*[70,100,85][i]-size*.61);
   item.style.transform=`rotate(${[-30,25,-45][i]+q*[420,-330,500][i]}deg)`;
   setStep(names[i]+'飞出',`${names[i]}脱手飞向通风橱！`);
  }
  const lastHit=lands.findLastIndex(v=>t>=v&&t-v<300);
  if(lastHit>=0){const q=(t-lands[lastHit])/300;hit.hidden=false;hit.src=hits[Math.min(6,Math.floor(q*7))];move(hit,tx-w*.18-64,ty+[-30,15,45][lastHit]-64);damage.hidden=false;damage.textContent='−9';damage.style.opacity=String(1-q*.65);move(damage,tx+15,ty-h*.35-q*30);target.style.transform=`translate(${Math.sin(q*24)*(1-q)*12}px,0)`;defender.style.filter=Math.floor(q*6)%2===0?'brightness(4)':'';setStep(`${lastHit+1} / 3 命中`,`${names[lastHit]}命中！−9 HP · 累计 ${landed*9} 点伤害`);}
  if(t>=2150&&t<2800)setStep('装备落了一地','三段命中，合计 27 点伤害 · Mano 稳住身形');
  if(t>=2800){restore();setStep('演出结束','「怎么全掉了」演出结束 · 通风橱剩余 73 HP · 可再次点击重播');}
 }
 function renderPreviewFrame(t){
  hit.style.filter='';damage.style.color='';
  if(activeSkill==='dj'){renderDJ(t);return;}
  if(activeSkill==='shove'){renderShove(t);return;}
  if(activeSkill==='eat'){renderEat(t);return;}
  if(activeSkill==='stab'){renderStab(t);return;}
  if(activeSkill==='ultimate'){renderUltimate(t);return;}
  if(activeSkill==='heal'){renderHeal(t);return;}
  if(activeSkill==='scatter'){renderScatter(t);return;}
  const {x,y,tx,ty,w,h}=layout;const floor=y+h*.43;
  actor.hidden=true;projectiles.forEach(p=>p.hidden=true);hit.hidden=true;damage.hidden=true;damage.textContent='−24';trail.style.opacity='0';target.style.transform='';defender.style.filter='';stage.style.transform='';
  vape.style.width='28px';vape.style.height='38px';
  if(t<300){setStep('掉烟','Mano 的电子烟掉了！');idle.style.visibility='';vape.hidden=false;move(vape,x+38,lerp(y+5,floor-28,t/300));vape.style.transform=`rotate(${t/5}deg)`;return;}
  if(t>=1600){hp.textContent='76 / 100';bar.style.width='76%';if(!sounded){sounded=true;impactSound();}}
  idle.style.visibility='hidden';actor.hidden=false;actor.style.width=`${w*1.06}px`;actor.style.height=`${h*.88}px`;
  if(t<950){setStep('低头捡','Mano 低头捡烟……脚下一滑！');actor.src=paths.pick;move(actor,x-w*.53,y-h*.32);actor.style.transform=`rotate(${lerp(0,9,(t-300)/650)}deg)`;return;}
  actor.src=paths.fly;actor.style.width=`${w*1.2}px`;actor.style.height=`${h*.85}px`;
  if(t<1600){setStep('扑飞','Mano 使用了「我烟呢？」！');const q=(t-950)/650,p=q*q;const cx=lerp(x,tx-w*.37,p),cy=lerp(y,ty,p)-Math.sin(q*Math.PI)*45;move(actor,cx-w*.6,cy-h*.43);actor.style.transform=`rotate(${lerp(-14,8,q)}deg)`;trail.style.opacity=String(Math.min(1,q*3));move(trail,cx-w*.65,cy);return;}
  if(t<2050){setStep('撞击','撞中了！通风橱受到 24 点伤害。');if(!sounded){sounded=true;impactSound();}const q=(t-1600)/450;move(actor,tx-w*.97-q*18,ty-h*.43+q*10);actor.style.transform=`rotate(${8+q*10}deg)`;target.style.transform=`translate(${Math.sin(q*Math.PI*7)*(1-q)*15}px,0)`;defender.style.filter=Math.floor(q*8)%2===0?'brightness(4)':'';stage.style.transform=`translate(${Math.sin(q*28)*(1-q)*3}px,0)`;hit.hidden=false;hit.src=hits[Math.min(6,Math.floor(q*7))];move(hit,tx-w*.24-64,ty-64);damage.hidden=false;move(damage,tx+12,ty-h*.4-q*45);damage.style.opacity=String(1-q*.5);hp.textContent='76 / 100';bar.style.width='76%';return;}
  if(t<2800){setStep('归位','通风橱 HP：76 / 100 · Mano 回到原位');const q=(t-2050)/750,p=1-Math.pow(1-q,3);actor.src=paths.pick;actor.style.width=`${w*1.06}px`;actor.style.height=`${h*.88}px`;move(actor,lerp(tx-w*.97-18,x-w*.53,p),lerp(ty-h*.43+10,y-h*.32,p));actor.style.transform=`rotate(${lerp(18,0,p)}deg)`;return;}
  restore();setStep('演出结束','「我烟呢？」演出结束 · 通风橱剩余 76 HP · 可再次点击重播');
 }
 function tick(now){if(!running)return;if(!paused)elapsed+=Math.min(now-last,80)*speed;last=now;const duration=externalEvent?.duration||(['ultimate','dj'].includes(activeSkill)?3000:2800);render(Math.min(elapsed,duration));if(elapsed>=duration){running=false;previewButtons[activeSkill].textContent='↻ 重播「'+previewCards[activeSkill].dataset.skill+'」';$('#play').textContent='▶ 预览待机';if(completion){const done=completion;completion=null;done({cancelled:false});}return;}raf=requestAnimationFrame(tick);}
 async function play(kind='trip',event=null,startAt=0){if(!previewButtons[kind])return;if(running){if(activeSkill===kind&&!event)return;reset();}if(!ready){const ok=await assetsReady;if(!ok){announce.textContent=error;return;}}reset();externalEvent=event;elapsed=Math.max(0,Math.min(startAt,event?.duration||0));activeSkill=kind;document.querySelectorAll('.fighter').forEach(n=>n.getAnimations().forEach(a=>a.cancel()));document.querySelectorAll('.selected').forEach(c=>c.classList.remove('selected'));previewCards[kind].classList.add('selected');layout=measure();layer.hidden=false;if(kind==='ultimate')layer.classList.add('ultimate');running=true;sounded=false;last=performance.now();previewButtons[kind].textContent='演出中…';$('#play').textContent='Ⅱ 暂停演出';render(elapsed);raf=requestAnimationFrame(tick);}
 start.onclick=()=>play('trip');scatterStart.onclick=()=>play('scatter');healStart.onclick=()=>play('heal');ultimateStart.onclick=()=>play('ultimate');stabStart.onclick=()=>play('stab');eatStart.onclick=()=>play('eat');shoveStart.onclick=()=>play('shove');djStart.onclick=()=>play('dj');$('#demo-reset').onclick=reset;
 skillCard.onclick=()=>{document.querySelectorAll('.selected').forEach(c=>c.classList.remove('selected'));skillCard.classList.add('selected');play();};
 scatterCard.onclick=()=>play('scatter');
 healCard.onclick=()=>play('heal');
 ultimateCard.onclick=()=>play('ultimate');
 stabCard.onclick=()=>play('stab');eatCard.onclick=()=>play('eat');shoveCard.onclick=()=>play('shove');djCard.onclick=()=>play('dj');
 document.querySelectorAll('.card').forEach(c=>{if(Object.values(previewCards).includes(c))return;const previous=c.onclick;c.onclick=()=>{if(running)reset();previous();};});
 document.querySelectorAll('.speed').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.speed').forEach(x=>x.classList.remove('active'));b.classList.add('active');speed=Number.parseFloat(b.textContent);if(!running)announce.textContent=`演出速度 ${speed}× · 点击已完成的技能观看`;};});
 function render(t){
  renderPreviewFrame(t);
  if(!externalEvent)return;
  const e=externalEvent,p=window.FriendsBattle.project(e,t);
  ownHp.textContent=`${p.hp[0]} / 100`;ownBar.style.width=`${p.hp[0]}%`;hp.textContent=`${p.hp[1]} / 100`;bar.style.width=`${p.hp[1]}%`;
  weakened=p.weakened[0];statusBadge.hidden=!p.weakened.some(Boolean);statusBadge.textContent='下次攻击伤害 −30%';
  const beat=e.beats.findLast(b=>b.at<=t),recent=beat&&t-beat.at<450;
  if(recent){damage.hidden=false;damage.style.opacity='1';damage.textContent=beat.kind==='miss'?'未命中':(beat.kind==='heal'?'+':'−')+beat.amount+(beat.critical?' 暴击':'');if(beat.kind==='heal')damage.style.color='#BDFF97';}
  else damage.hidden=true;
  if(!recent||beat.kind==='miss'){hit.hidden=true;idle.style.filter='';defender.style.filter='';}
  const who=e.before[e.owner].name;
  announce.textContent=`第 ${e.index+1} 次行动 · ${who} 使用了「${e.name}」！`+(beat?(beat.kind==='miss'?' 未命中':beat.kind==='heal'?` 恢复 ${e.recovered} HP`:` 累计伤害 ${e.beats.filter(b=>b.at<=t).reduce((n,b)=>n+b.amount,0)}${e.critical?' · 暴击':''}${e.reduced?' · 受减伤影响':''}`):'');
 }
 async function playBattle(event,options={}){
  if(!await assetsReady)throw new Error(error||'素材加载失败');
  await play(event.skill,event,options.startAt||0);
  return new Promise(resolve=>{completion=resolve;});
 }
 const previousPlay=$('#play').onclick;
 $('#play').onclick=function(){if(!running){previousPlay.call(this);return;}paused=!paused;this.textContent=paused?'▶ 继续演出':'Ⅱ 暂停演出';};
 $('#mute').textContent='预览音效：关';$('#mute').onclick=function(){muted=!muted;this.textContent='预览音效：'+(muted?'关':'开');};
 function equalize(){const cards=[...document.querySelectorAll('.card')];cards.forEach(c=>c.style.height='auto');const max=Math.ceil(Math.max(...cards.map(c=>c.offsetHeight)));cards.forEach(c=>c.style.height=`${max}px`);}
 let resizeFrame=0;function resize(){if(running){if(externalEvent)layout=measure();else reset();}cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(equalize);}
 window.addEventListener('resize',resize);document.fonts.ready.then(equalize);new MutationObserver(resize).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){paused=true;$('#play').textContent='▶ 继续演出';}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&running){if(externalEvent){paused=true;$('#play').textContent='▶ 继续对战';}else reset();}});
 const oldAuto=$('#auto').onclick;$('#auto').onclick=function(){oldAuto.call(this);if(this.classList.contains('active'))announce.textContent='完整赛事连播尚未接入 · 两位角色共八招的独立演出已接入，完整赛事连播待战斗引擎接入';};
 window.ManoSkillPreview={play,reset,playBattle,ready:assetsReady,finishBattle(){if(!running||!externalEvent)return;cancelAnimationFrame(raf);elapsed=externalEvent.duration;render(elapsed);running=false;if(completion){const done=completion;completion=null;done({cancelled:false});}},setPaused(value){paused=Boolean(value);last=performance.now();},setSpeed(value){speed=value;},get state(){return {running,paused,speed,elapsed,ready,activeSkill,hitCount,weakened,battle:!!externalEvent}}};
})();
