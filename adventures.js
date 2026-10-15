const Adventures=(()=>{
const {$,state,icon}=Island;let current=null,work=null,quizChoice=null,finishing=false,finishTimer,breathTimer,typingTimer,typing=false,fullText='',typed=0,currentSpeech=null,returnAlbum=false;
const art={kite:'kite',boat:'boat',windows:'home',basket:'sun',quilt:'moon',footsteps:'lantern',mood:'heart',shooting:'star',ribbon:'ring',rain:'cloud',greet:'heart',bridge:'boat',fence:'flower',tea:'cup',mist:'sun',hammock:'hammock',breath:'lantern',mirror:'sparkle',stones:'leaf',letter:'envelope',beam:'beam',bell:'home',pillow:'heart',seed:'flower',mask:'heart',water:'drop'};
const itemSlots={flower:0,heart:1,cup:2,drop:3,lantern:4,star:5,sparkle:5,boat:6,pillow:7,seed:8,leaf:8,cloud:9,sun:10,envelope:11};
function gameIcon(name){const source=PixelSprites.sizes[name]?PixelSprites.icon(name):null;return source?'<img class="quest-pixel" src="'+source+'" alt="" aria-hidden="true">':icon(name)}
function getProgress(q){const p=state.progress[q.id];return p&&Array.isArray(p.picked)?{picked:p.picked.filter(i=>Number.isInteger(i)&&i>=0&&i<6),val:Number.isFinite(p.val)?p.val:25,pipes:Array.isArray(p.pipes)?p.pipes:[0,0]}:{picked:[],val:25,pipes:[0,0]}}
function persist(){if(current&&work){state.progress[current.id]={picked:[...work.picked],val:work.val,pipes:[...work.pipes]};Island.save()}}
function feedback(text){$('#questFeedback').textContent=text}
function count(q){return q.type==='pick'?q.need:q.type==='range'||q.type==='hold'||q.type==='pipes'?1:q.items.length}
function open(q,replay=false){if(!q)return;Island.stop();current=q;quizChoice=null;work=replay?{picked:[],val:25,pipes:[0,0]}:getProgress(q);finishing=false;clearTimeout(finishTimer);clearTimeout(breathTimer);$('#questPreview').hidden=true;const f=FRIENDS[q.friend];$('#questAvatar').src=f.file;$('#questAvatar').alt=f.name;$('#questPlace').textContent=q.quiz?QUIZ_TOPICS[q.quiz.topic].subject+' · '+QUIZ_TOPICS[q.quiz.topic].label:q.place+' · '+f.name;$('#questTitle').textContent=q.quiz?q.quiz.title:q.title;$('#questInstruction').textContent=q.instruction;$('#questFeedback').textContent='';render();$('#questDialog').showModal()}
function render(){const q=current,root=$('#miniGame'),hadFocus=root.contains(document.activeElement),focusLabel=document.activeElement?.getAttribute('aria-label');if(hadFocus)queueMicrotask(()=>{const choices=[...root.querySelectorAll('button:not(:disabled),input')];(choices.find(b=>b.getAttribute('aria-label')===focusLabel)||choices[0])?.focus({preventScroll:true})});root.className='mini-game scene-'+q.scene;root.replaceChildren();if(q.type==='quiz'){renderQuiz(root,q);return}root.style.setProperty('--step',work.picked.length);$('#questProgress').textContent='Шаги: '+work.picked.length+' / '+count(q);
  if(q.type==='range'){renderRange(root,q);return}if(q.type==='hold'){renderBreath(root,q);return}if(q.type==='pipes'){renderPipes(root,q);return}
  const hero=document.createElement('div');hero.className='mini-hero';hero.innerHTML=gameIcon(art[q.scene]);root.append(hero);const options=document.createElement('div');options.className='game-options';
  q.items.forEach((item,i)=>{const done=work.picked.includes(i),b=document.createElement('button');b.className='game-option'+(done?' done':'');b.setAttribute('aria-label',item);b.disabled=done||finishing;b.dataset.item=String(i);const name=q.icons?.[i]||(q.scene==='mirror'?(done?'sparkle':'cloud'):done?'sun':'cloud');
    if(FRIENDS[name]){const img=document.createElement('img');img.src=FRIENDS[name].file;img.alt='';b.append(img)}else{const visual=document.createElement('span');visual.innerHTML=gameIcon(done&&(q.scene==='rain'||q.scene==='stones')?'flower':name);b.append(visual)}const label=document.createElement('span');label.textContent=done?(q.scene==='greet'?'Привет!':q.scene==='rain'?'Цветочек':q.scene==='stones'?'Росток':item):item;b.append(label);b.onclick=()=>act(i);if(q.type==='wipe'){b.onpointerenter=e=>{if(e.buttons&&!done)act(i)}}options.append(b)});root.append(options);
  if(q.type==='order'){const note=document.createElement('p');note.className='order-note';note.textContent=q.order.map((n,i)=>i<work.picked.length?'✓':q.items[n]).join(' → ');root.append(note)}const dots=document.createElement('div');dots.className='game-progress';for(let i=0;i<count(q);i++){const d=document.createElement('i');d.className=i<work.picked.length?'done':'';dots.append(d)}root.append(dots)
}
function act(index){if(finishing||!current||!$('#questDialog').open||work.picked.includes(index))return;const q=current;if(q.type==='order'){const next=q.order[work.picked.length];if(index!==next){feedback('Сначала: '+q.items[next].toLowerCase()+'. Ничего страшного, попробуем вместе.');return}}work.picked.push(index);persist();Island.sound(2+work.picked.length);render();feedback(q.type==='pick'?'Здесь нет неправильного выбора.':work.picked.length===count(q)?'Готово. Кое-кто хочет сказать тебе тёплые слова…':'Вот так. Можно никуда не спешить.');if(work.picked.length>=count(q))complete()}
function renderQuiz(root,q){
  const exercise=q.quiz,topic=QUIZ_TOPICS[exercise.topic];
  const meta=document.createElement('div');meta.className='quiz-meta';
  const badge=document.createElement('span');badge.className='quiz-subject '+(topic.subject==='Физика'?'physics':'math');badge.textContent=topic.subject;
  const stage=document.createElement('span');stage.textContent='Письмо '+String(q.id).padStart(2,'0')+' / '+ADVENTURES.length;meta.append(badge,stage);
  const level=document.createElement('div');level.className='quiz-level';
  const emblem=document.createElement('img');emblem.src=PixelSprites.icon('letter');emblem.alt='';emblem.width=20;emblem.height=16;
  const difficulty=document.createElement('span');difficulty.textContent=exercise.difficulty;
  level.append(emblem,difficulty);
  const prompt=document.createElement('p');prompt.className='quiz-prompt';prompt.id='quizPrompt';prompt.textContent=exercise.prompt;
  root.append(meta,level,prompt);
  if(exercise.diagram){
    const d=exercise.diagram,figure=document.createElement('figure');figure.className='quiz-diagram';
    figure.innerHTML='<svg viewBox="0 0 400 140" role="img" aria-label="Схема рычага: силы по разные стороны опоры; плечи указаны в условии"><path class="lever" d="M35 65H365"/><path class="pivot" d="M200 70l-16 30h32z"/><path d="M80 18v36m-5-7 5 7 5-7M320 18v36m-5-7 5 7 5-7"/><path class="dimension" d="M80 112H195M205 112H320"/><text x="80" y="15">'+d.left+'</text><text x="320" y="15">'+d.right+'</text><text x="133" y="133">'+d.leftArm+'</text><text x="265" y="133">'+d.rightArm+'</text></svg>';
    const caption=document.createElement('figcaption');caption.textContent='Схематично, не в масштабе';figure.append(caption);root.append(figure);
  }
  const options=document.createElement('div');options.className='quiz-options';options.setAttribute('role','group');options.setAttribute('aria-labelledby','quizPrompt');
  exercise.options.forEach((text,index)=>{
    const button=document.createElement('button'),letter='ABCD'[index];button.className='quiz-option';button.dataset.choice=letter;button.setAttribute('aria-label',letter+'. '+text);button.disabled=finishing;
    const key=document.createElement('span');key.className='answer-letter';key.textContent=letter;const label=document.createElement('span');label.textContent=text;button.append(key,label);
    if(index===quizChoice){button.classList.add(finishing?'correct':'incorrect');const status=document.createElement('span');status.className='answer-result';status.textContent=finishing?'✓':'×';status.setAttribute('aria-hidden','true');button.append(status)}
    button.onclick=()=>answerQuiz(index);options.append(button)
  });root.append(options);
  if(finishing){
    const solution=document.createElement('div');solution.className='quiz-solution';const heading=document.createElement('strong');heading.textContent='✓ Верно!';const explanation=document.createElement('p');explanation.textContent=exercise.explanation;solution.append(heading,explanation);root.append(solution);
    const next=document.createElement('button');next.className='primary quiz-next';next.textContent='Открыть письмо →';next.onclick=()=>{$('#questDialog').close();speak(q)};root.append(next)
  }
  $('#questProgress').textContent=finishing?'✓ Задача решена':'Один верный ответ из четырёх';
}
function answerQuiz(index){
  if(finishing||!current||!$('#questDialog').open)return;quizChoice=index;
  if(index!==current.quiz.answer){render();feedback('Ответ '+ 'ABCD'[index]+' пока не совпал. Попробуй ещё раз — письмо подождёт.');return}
  finishing=true;work.picked=[index];if(!state.done.includes(current.id))state.done.push(current.id);delete state.progress[current.id];Island.save();Island.update();Island.sound(2,true);render();feedback('Задача решена. Тёплые слова уже ждут тебя.');
}
function complete(){if(finishing)return;finishing=true;const q=current;if(!state.done.includes(q.id))state.done.push(q.id);delete state.progress[q.id];Island.save();Island.update();Island.sound(2,true);$('#questProgress').textContent='Послание найдено ♡';feedback('Маленькое дело сделано. А теперь — кое-что для тебя.');finishTimer=setTimeout(()=>{if(!$('#questDialog').open)return;$('#questDialog').close();speak(q)},800)}
function renderRange(root,q){
  const wrap=document.createElement('div');wrap.className='range-stage';wrap.style.setProperty('--range',work.val);
  const v=document.createElement('div');v.className='range-visual';v.innerHTML=icon(art[q.scene]);
  const track=document.createElement('div');track.className='range-track';track.style.setProperty('--goal',q.goal);
  const target=document.createElement('span');target.className='target-range';
  const range=document.createElement('input');range.type='range';range.min='0';range.max='100';range.step='1';range.value=work.val;
  range.setAttribute('aria-label',q.rangeLabel);range.setAttribute('aria-describedby','rangeHint');
  const label=document.createElement('span');label.className='range-label';label.id='rangeHint';label.setAttribute('aria-live','polite');
  const confirm=document.createElement('button');confirm.className='primary';confirm.textContent=q.action;
  const refresh=()=>{const near=Math.abs(work.val-q.goal)<=10;label.textContent=near?'Вот оно, самое уютное место.':'Передвинь ползунок в зелёную полоску: '+(q.goal-10)+'–'+(q.goal+10)+'.';range.setAttribute('aria-valuetext',work.val+(near?' — в зелёной полоске':''));confirm.disabled=!near;wrap.style.setProperty('--range',work.val);$('#questProgress').textContent=near?'Можешь продолжать':'Найди зелёную полоску'};
  range.oninput=()=>{work.val=Number(range.value);refresh();persist()};confirm.onclick=()=>{if(!confirm.disabled){work.picked=[0];complete();confirm.disabled=true}};
  track.append(target,range);wrap.append(v,track,label,confirm);root.append(wrap);refresh()
}
function renderBreath(root){const b=document.createElement('button');b.className='breathing-orb';b.setAttribute('aria-label','Наполнить круг спокойным светом');b.innerHTML=icon('sparkle');const label=document.createElement('span');label.className='breath-label';label.textContent='Коснись — и просто побудь здесь.';b.onclick=()=>{if(finishing||b.disabled)return;b.disabled=true;b.classList.add('growing');label.textContent='Плюш рядом. Ничего не нужно делать.';$('#questProgress').textContent='Тихая пауза…';breathTimer=setTimeout(()=>{if($('#questDialog').open){work.picked=[0];complete()}},Island.reduced.matches?1000:4000)};root.append(b,label);$('#questProgress').textContent='Один спокойный момент'}
function renderPipes(root){const row=document.createElement('div');row.className='pipes';const source=document.createElement('span');source.className='water-source';source.innerHTML=gameIcon('drop');row.append(source);work.pipes.forEach((rotation,i)=>{const b=document.createElement('button');b.className='pipe-button'+(rotation%2?' connected':'');b.setAttribute('aria-label','Повернуть '+(i===0?'первый':'второй')+' желобок');b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate('+rotation*90+'deg)"><path d="M12 2v20"/></svg>';b.onclick=()=>{if(finishing)return;work.pipes[i]=(rotation+1)%4;persist();Island.sound(3);render();if(work.pipes.every(n=>n%2===1)){work.picked=[0];complete()}};row.append(b)});const flower=document.createElement('span');flower.className='water-flower';flower.innerHTML=gameIcon('flower');row.append(flower);const p=document.createElement('p');p.className='pipes-note';p.textContent='Два горизонтальных желобка — и ручеёк снова течёт.';root.append(row,p);$('#questProgress').textContent=work.pipes.filter(n=>n%2===1).length+' / 2 желобка'}
function explore(mood='all'){$('#welcomeNote').hidden=true;renderExplore(mood);$('#exploreDialog').showModal();Island.stop()}
function renderExplore(mood){
  const filters=$('#moodFilters'),topics=typeof QUIZ_TOPICS!=='undefined'?{all:'Все письма · '+ADVENTURES.length,...Object.fromEntries(Object.entries(QUIZ_TOPICS).map(([key,t])=>[key,t.label+' · '+t.count]))}:MOODS;filters.replaceChildren();Object.entries(topics).forEach(([key,label])=>{const b=document.createElement('button');b.textContent=label;b.className=key===mood?'active':'';b.onclick=()=>renderExplore(key);filters.append(b)});
  const grid=$('#adventureGrid');grid.replaceChildren();
  ADVENTURES.filter(q=>mood==='all'||(q.quiz?q.quiz.topic===mood:q.mood===mood)).forEach(q=>{
    const done=state.done.includes(q.id),read=state.read.includes(q.id),b=document.createElement('button');b.className='adventure-card'+(read?' done':'');b.setAttribute('aria-label',q.title+(read?' — прочитано':''));b.dataset.adventure=String(q.id);
    const img=document.createElement('img');img.src=FRIENDS[q.friend].file;img.alt='';
    const no=document.createElement('span');no.className='card-number'+(read?' read-check':'');no.innerHTML=icon(read?'check':'envelope');
    const box=document.createElement('div'),name=document.createElement('strong'),place=document.createElement('small'),status=document.createElement('span');name.textContent=q.title;place.textContent=q.quiz?QUIZ_TOPICS[q.quiz.topic].subject+' · '+QUIZ_TOPICS[q.quiz.topic].label:q.place;status.className='card-status';status.textContent=read?'✓ Прочитано':done?'Письмо открыто — можно прочитать':q.quiz?QUIZ_TOPICS[q.quiz.topic].stage:MOODS[q.mood];box.append(name,place,status);b.append(img,no,box);
    b.onclick=()=>{$('#exploreDialog').close();Island.selectQuest(q)};grid.append(b)
  })
}
function updateFavorite(){if(!currentSpeech)return;const yes=state.hearts.includes(currentSpeech.id);$('#favoriteButton').innerHTML='<span>'+(yes?'♥':'♡')+'</span> '+(yes?'Осталось в сердце':'Оставить в сердце');$('#favoriteButton').classList.toggle('saved',yes);$('#favoriteButton').setAttribute('aria-pressed',String(yes))}
function speak(q,fromAlbum=false){
  if(!state.done.includes(q.id))return;currentSpeech=q;returnAlbum=fromAlbum;Island.stop();const f=FRIENDS[q.friend],m=messages.find(m=>m.id===q.id);
  $('#conversationPlace').textContent=q.place;$('#conversationTitle').textContent=q.title;$('#speakerName').textContent=f.name;$('#messageType').textContent=m.type;
  const source=$('#speechSource');source.replaceChildren();
  if(m.sourceUrl){const link=document.createElement('a');link.href=m.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';link.textContent=m.source;source.append(link)}else source.textContent=m.source||'';
  $('#conversationDialog').classList.toggle('long-letter',m.text.length>360);
  $('#accessibleSpeech').textContent=m.text;fullText=m.text;typed=0;typing=!Island.reduced.matches;$('#typedText').textContent=typing?'':fullText;$('.typing-cursor').hidden=!typing;
  $('#speechNext').textContent=typing?'Показать целиком ↓':state.read.includes(q.id)?'Вернуться в сад →':'Прочитано ✓';
  updateFavorite();$('#conversationDialog').showModal();$('#conversationDialog').scrollTop=0;
  clearInterval(typingTimer);if(typing)typingTimer=setInterval(()=>{typed=Math.min(fullText.length,typed+2);$('#typedText').textContent=fullText.slice(0,typed);if(typed>=fullText.length)finishTyping()},34)
}
function finishTyping(){clearInterval(typingTimer);typing=false;$('#typedText').textContent=fullText;$('.typing-cursor').hidden=true;$('#speechNext').textContent=state.read.includes(currentSpeech?.id)?'Вернуться в сад →':'Прочитано ✓'}
function markRead(){if(currentSpeech&&!state.read.includes(currentSpeech.id)){state.read.push(currentSpeech.id);Island.save();Island.update();Island.toast('✓ Письмо сохранено в архиве');Island.sound(4)}}
function drawPortrait(stamp){if(!$('#conversationDialog').open||!currentSpeech)return;PixelSprites.drawPortrait($('#portraitCanvas').getContext('2d'),currentSpeech.friend,Island.reduced.matches?0:stamp,typing&&!Island.reduced.matches)}
function album(filter='read'){$('#welcomeNote').hidden=true;Island.stop();renderAlbum(filter);$('#albumDialog').showModal()}
function renderAlbum(filter){
  $('#albumDescription').textContent='Прочитано '+state.read.length+' из '+ADVENTURES.length+' · Открыто '+state.done.length+'. Здесь письма остаются, чтобы перечитать их в любой момент.';
  document.querySelectorAll('[data-album]').forEach(b=>b.classList.toggle('active',b.dataset.album===filter));
  const ids=(filter==='read'?state.read:state.done).filter(id=>filter!=='hearts'||state.hearts.includes(id)),grid=$('#albumGrid');grid.replaceChildren();
  if(!ids.length){
    const e=document.createElement('div');e.className='empty-state';const img=document.createElement('img');img.src=FRIENDS.plush.file;img.alt='Плюш';
    const p=document.createElement('p');p.textContent=filter==='hearts'?'Когда слова отзовутся, оставь их в сердце. Они будут ждать тебя здесь.':filter==='read'?'Когда дочитаешь письмо, нажми «Прочитано ✓». Оно останется здесь с зелёной галочкой.':'Первое послание может быть любым. Плюш с радостью пойдёт с тобой.';
    const b=document.createElement('button');b.className='primary';b.textContent='Найти письмо';b.onclick=()=>{$('#albumDialog').close();explore()};e.append(img,p,b);grid.append(e);return
  }
  ids.slice().reverse().forEach(id=>{const q=ADVENTURES.find(q=>q.id===id),m=messages.find(m=>m.id===id),b=document.createElement('button');b.className='memory-card'+(state.read.includes(id)?' read':'');b.setAttribute('aria-label',q.title+(state.read.includes(id)?' — прочитано':' — открыто'));const type=document.createElement('small'),title=document.createElement('strong'),text=document.createElement('p'),place=document.createElement('span');type.textContent=m.type+(state.hearts.includes(id)?' · ♥':'');title.textContent=q.title;text.textContent=m.text;place.textContent=q.place;b.append(type,title,text,place);if(state.read.includes(id)){const badge=document.createElement('span');badge.className='archive-check';badge.textContent='✓ Прочитано';b.append(badge)}b.onclick=()=>{$('#albumDialog').close();speak(q,true)};grid.append(b)})
}
$('#speechNext').onclick=()=>{if(typing)finishTyping();else{markRead();$('#conversationDialog').close()}};$('#speechText').onclick=finishTyping;$('#favoriteButton').onclick=()=>{if(!currentSpeech)return;const i=state.hearts.indexOf(currentSpeech.id);if(i<0)state.hearts.push(currentSpeech.id);else state.hearts.splice(i,1);Island.save();updateFavorite();Island.sound(4)};$('#conversationDialog').addEventListener('close',()=>{clearInterval(typingTimer);typing=false;const back=returnAlbum;returnAlbum=false;if(back)album();else $('#worldCanvas').focus({preventScroll:true})});$('#questDialog').addEventListener('close',()=>{clearTimeout(breathTimer);clearTimeout(finishTimer);if(!finishing)persist();$('#worldCanvas').focus({preventScroll:true})});document.querySelectorAll('[data-album]').forEach(b=>b.onclick=()=>renderAlbum(b.dataset.album));
return{open,explore,speak,album,drawPortrait};
})();
window.Adventures=Adventures;
