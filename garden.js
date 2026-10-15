/* The garden is a game world: every tree, letter and character shares one pixel grid. */
const Island = (() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const W = 1536, H = 1152, CELL = 16, COLS = W / CELL, ROWS = H / CELL;
  // Shared geometry keeps the painted paths, planting clearance and map aligned.
  const ROADS=[[220,232,1096,66],[208,536,1128,76],[220,852,1096,68],
    [220,232,66,688],[722,232,76,814],[1250,232,66,776],
    [422,380,376,48],[466,380,48,372],[466,704,332,48],
    [916,232,48,688],[722,946,594,62],[536,984,262,48]];
  const JUNCTIONS=[[253,265,54],[760,574,65],[1283,574,54],[760,886,57],
    [1080,574,50],[490,404,28],[490,728,28],[760,404,42],[760,728,42],
    [940,265,37],[940,574,42],[940,886,38],[1283,977,32],[760,977,39],[760,1008,38]];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cameraZoom = () => innerWidth < 760 ? 1.5 : 2;
  // A new course starts with 50 sealed letters. Earlier progress is left intact
  // under pixelGarden.v4, rather than being erased or bypassing these exercises.
  const storageKey = 'pixelGarden.school.v1';
  const positions = [[808,588],[588,560],[936,566],[762,376],[254,286],[470,400],
    [286,728],[1234,218],[1094,386],[938,926],[1086,564],[504,718],
    [1162,870],[1280,730],[932,258],[754,752],[1330,516],[244,924],
    [416,568],[576,242],[1300,974],[1156,264],[754,966],[1062,1010],
    [1294,864],[578,1006]];
  ADVENTURES.forEach((q, i) => { if(positions[i]){q.x = positions[i][0]; q.y = positions[i][1];} });
  const valid = id => ADVENTURES.some(q => q.id === id);
  const CHARACTERS=[{key:'bunny',name:'Плюш',detail:'зайчик-путешественник'},
    {key:'bunny-kimono',name:'Хана',detail:'зайчик в кимоно'},
    {key:'bunny-gardener',name:'Моти',detail:'зайчик-садовник'},
    {key:'cat',name:'Тиша',detail:'сонная кошечка'},
    {key:'bird',name:'Фини',detail:'маленькая птичка'},
    {key:'fox',name:'Мира',detail:'добрая лисичка'},
    {key:'bear',name:'Кума',detail:'мишка в шарфике'},
    {key:'hedgehog',name:'Ёся',detail:'ёжик с листочком'}];
  let state = { done: [], read: [], hearts: [], progress: {}, sound: false, pos: { x: 280, y: 264 } };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    const old = saved;
    if (old) {
      state.done = [...new Set((Array.isArray(old.done) ? old.done : []).filter(valid))];
      state.read = [...new Set((Array.isArray(old.read) ? old.read : []).filter(id=>state.done.includes(id)))];
      state.hearts = (Array.isArray(old.hearts) ? old.hearts : []).filter(id => state.done.includes(id));
      state.progress = old.progress && typeof old.progress === 'object' ? old.progress : {};
      state.sound = !!old.sound;
      state.character=CHARACTERS.some(c=>c.key===old.character)?old.character:'bunny';
      if (saved && Number.isFinite(saved.pos?.x) && Number.isFinite(saved.pos?.y)) state.pos = saved.pos;
    }
  } catch (_) { /* A private browser still supports an unsaved visit. */ }
  const images = {};
  for (const [id, friend] of Object.entries(FRIENDS)) {
    friend.file = PixelSprites.portrait(id, false);
    const image = new Image(); image.src = friend.file; images[id] = image;
  }
  document.querySelectorAll('img[src="assets/plush.png"]').forEach(img => { img.src = FRIENDS.plush.file; });
  document.querySelectorAll('img[data-pixel]').forEach(img => { img.src = PixelSprites.portrait(img.dataset.pixel); });
  const shapes = {
    envelope: 'M3 5h18v14H3z M3 6l9 7 9-7', heart: 'M12 20S2 14 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 6-10 12-10 12z',
    compass: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M16 8l-3 5-5 3 3-5z',
    map: 'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16 M15 5v16',
    locate: 'M12 2v4 M12 18v4 M2 12h4 M18 12h4 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10',
    sound: 'M3 9h4l5-4v14l-5-4H3z M16 8a6 6 0 0 1 0 8', check: 'M4 12l5 5L21 5',
    sparkle: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z', star: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
    flower: 'M12 9c-6-10-12 0-5 3-8 4 0 12 5 3 5 9 13 1 5-3 7-3 1-13-5-3z M10 11h4 M12 16v7',
    leaf: 'M3 20C3 5 12 2 21 3c1 12-7 17-15 15 M3 21L16 8',
    sun: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12 M12 1v2 M12 21v2 M1 12h2 M21 12h2',
    drop: 'M12 2C8 8 4 11 4 15a8 8 0 0 0 16 0c0-4-4-7-8-13z',
    cup: 'M3 8h14v9c0 6-14 6-14 0z M17 9h3c5 0 3 9-3 7 M5 3v2 M10 2v3',
    moon: 'M20 15A10 10 0 0 1 9 3 10 10 0 1 0 20 15z',
    cloud: 'M6 18a6 6 0 1 1 2-11c5-9 14-3 12 3 6 2 4 8 0 8z',
    home: 'M2 11L12 2l10 9 M5 9v12h14V9 M10 21v-7h4v7',
    lantern: 'M7 5h10v14H7z M5 5h14 M6 19h12 M10 5V3h4v2',
    ring: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
    paw: 'M8 13c-4 5-3 8 1 7l3-1 3 1c5 1 5-3 1-7-2-3-6-3-8 0 M4 7v3 M9 3v4 M15 3v4 M20 7v3',
    plank: 'M3 5h18v14H3z M6 8h10 M8 12h12 M5 16h12',
    stone: 'M3 17l2-9 6-4 8 3 4 10-6 4H8z',
    fence: 'M3 21V5l2-3 2 3v16 M10 21V5l2-3 2 3v16 M17 21V5l2-3 2 3v16 M1 10h22 M1 16h22',
    pillow: 'M3 4c6 2 12 2 18 0-2 6-2 10 0 16-6-2-12-2-18 0 2-6 2-10 0-16z',
    mask: 'M2 6c6 3 14 3 20 0v7c-1 10-19 10-20 0z M6 11l3 2 M18 11l-3 2 M9 17h6',
    dot: 'M10 12h4', bell: 'M4 17h16l-3-4V8c0-7-10-7-10 0v5z M9 21h6',
    boat: 'M2 14h20l-5 7H7z M12 2v12 M12 2l8 9h-8',
    kite: 'M12 2l8 8-8 10-8-10z M12 2v18 M4 10h16 M12 20c9 0-7 5 2 8',
    window: 'M4 22V9a8 8 0 0 1 16 0v13z M4 10h16 M12 2v20',
    wind: 'M2 8h12c6 0 4-7 1-5 M2 12h17c5 0 3 7 0 5 M2 16h8',
    seed: 'M8 17C0 6 12 0 18 3c4 9-2 17-10 14 M7 22L15 7',
    honey: 'M6 7h12l2 14H4z M6 3h12v4H6z',
    beam: 'M7 3l10 18 M2 12h7 M16 12h7',
    hammock: 'M2 4v18 M22 4v18 M2 7c4 15 16 15 20 0'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (shapes[name] || shapes.sparkle) + '"/></svg>'; }
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  let scene = null, toastTimer = 0;
  const hero = { x: state.pos.x, y: state.pos.y };
  function save() {
    if (scene?.player) state.pos = { x: scene.player.x, y: scene.player.y };
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) { /* Keep the visit playable. */ }
  }
  function sound(note = 0, finish = false) {
    if (state.sound) window.GardenMusic?.effect(note,finish);
  }
  function toast(message) {
    const el = $('#toast'); if (!el) return;
    clearTimeout(toastTimer); el.textContent = message; el.classList.add('visible');
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
  }
  function update() {
    if ($('#collectedCount')) $('#collectedCount').textContent = state.read.length + ' / ' + ADVENTURES.length;
    $('#albumButton')?.setAttribute('aria-label','Архив писем: прочитано '+state.read.length+' из '+ADVENTURES.length);
    $('#soundButton')?.setAttribute('aria-pressed', String(state.sound));
    $('#soundButton')?.setAttribute('aria-label', state.sound ? 'Выключить музыку' : 'Включить музыку');
    if ($('#soundLabel')) $('#soundLabel').textContent = state.sound ? 'Музыка включена ♫' : 'Включить музыку';
    if (scene) {
      for (const letter of scene.letters) {letter.sprite.setTexture(state.done.includes(letter.q.id) ? 'letter-open' : 'letter');letter.check.setVisible(state.read.includes(letter.q.id));}
      scene.drawMini(); scene.refreshNearby();
    }
  }
  function stop() { if (scene) { scene.route = []; scene.pending = null; scene.player?.body.stop(); } }
  function selectQuest(q) { if (scene && q) { scene.walkTo(q.x + 40, q.y + 16, q); toast('Пойдём к письму: «' + q.title + '»'); } }
  const blockedGrid = new Uint8Array(COLS * ROWS);
  const footprints = [];
  function reserve(x, y, width, height) {
    footprints.push({ x, y, width, height });
    const pad = 7;
    const left = Math.max(0, Math.floor((x - width / 2 - pad) / CELL));
    const right = Math.min(COLS - 1, Math.floor((x + width / 2 + pad) / CELL));
    const top = Math.max(0, Math.floor((y - height / 2 - pad) / CELL));
    const bottom = Math.min(ROWS - 1, Math.floor((y + height / 2 + pad) / CELL));
    for (let yy = top; yy <= bottom; yy++) for (let xx = left; xx <= right; xx++) blockedGrid[yy * COLS + xx] = 1;
  }
  function free(x, y) { return x >= 2 && y >= 2 && x < COLS - 2 && y < ROWS - 2 && !blockedGrid[y * COLS + x]; }
  function nearestFree(x, y) {
    x = Phaser.Math.Clamp(Math.floor(x / CELL), 2, COLS - 3); y = Phaser.Math.Clamp(Math.floor(y / CELL), 2, ROWS - 3);
    if (free(x, y)) return { x, y };
    for (let radius = 1; radius < 15; radius++) for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      if ((Math.abs(dx) === radius || Math.abs(dy) === radius) && free(x + dx, y + dy)) return { x: x + dx, y: y + dy };
    }
    return null;
  }
  function findPath(fromX, fromY, toX, toY) {
    const from = nearestFree(fromX, fromY), to = nearestFree(toX, toY); if (!from || !to) return [];
    const origin = from.y * COLS + from.x, goal = to.y * COLS + to.x;
    const g = new Float32Array(COLS * ROWS).fill(Infinity), previous = new Int32Array(COLS * ROWS).fill(-1);
    const closed = new Uint8Array(COLS * ROWS), open = [origin]; g[origin] = 0;
    const heuristic = id => Math.hypot(id % COLS - to.x, Math.floor(id / COLS) - to.y);
    while (open.length) {
      let best = 0;
      for (let i = 1; i < open.length; i++) if (g[open[i]] + heuristic(open[i]) < g[open[best]] + heuristic(open[best])) best = i;
      const at = open.splice(best, 1)[0]; if (at === goal) {
        const out = []; let cursor = goal;
        while (cursor !== origin && cursor !== -1) { out.push({ x: (cursor % COLS + 0.5) * CELL, y: (Math.floor(cursor / COLS) + 0.5) * CELL }); cursor = previous[cursor]; }
        return out.reverse();
      }
      closed[at] = 1; const x = at % COLS, y = Math.floor(at / COLS);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if ((!dx && !dy) || !free(x + dx, y + dy) || (dx && dy && (!free(x + dx, y) || !free(x, y + dy)))) continue;
        const next = (y + dy) * COLS + x + dx; if (closed[next]) continue;
        const score = g[at] + (dx && dy ? 1.4142 : 1);
        if (score < g[next]) { previous[next] = at; g[next] = score; if (!open.includes(next)) open.push(next); }
      }
    }
    return [];
  }
  class Garden extends Phaser.Scene {
    constructor() { super('Garden'); this.letters = []; this.ambient = []; this.route = []; this.pending = null; this.facing = 'down'; this.keysHeld = new Set(); this.lastSaved = 0; this.lastMini = 0; this.lastProgress = ''; }
    create() {
      scene = this; PixelSprites.build(this);
      this.physics.world.setBounds(28, 28, W - 56, H - 56);
      this.makeGround(); this.solids = this.physics.add.staticGroup(); this.makeScenery();
      footprints.forEach(p => {
        const body = this.add.zone(p.x, p.y, p.width, p.height); this.physics.add.existing(body, true); this.solids.add(body);
      });
      const spawn = nearestFree(state.pos.x, state.pos.y) || { x: 18, y: 17 };
      this.shadow = this.add.ellipse(0, 0, 21, 7, 0x8e6b82, 0.16).setDepth(1);
      this.player = this.physics.add.sprite((spawn.x + 0.5) * CELL, (spawn.y + 0.5) * CELL, 'bunny', 16).setOrigin(0.5, 1);
      this.player.body.setSize(14, 8).setOffset(9, 31); this.player.setCollideWorldBounds(true);
      this.physics.add.collider(this.player, this.solids);
      for (const [dir, start] of Object.entries({ down: 0, left: 4, right: 8, up: 12 })) this.anims.create({ key: 'walk-' + dir, frames: this.anims.generateFrameNumbers('bunny', { start, end: start + 3 }), frameRate: 9, repeat: -1 });
      this.cameras.main.setBounds(0, 0, W, H).setZoom(cameraZoom());
      // Keep nearest-neighbour artwork, but allow subpixel camera interpolation.
      this.cameras.main.startFollow(this.player, false, 0.12, 0.12);
      this.cameras.main.setFollowOffset(0, 30);
      this.cameras.main.setBackgroundColor('#f4dde5');
      this.makeLetters(); this.makePetals(); this.makeInput();
      this.destination = this.add.graphics().setDepth(3).setVisible(false);
      this.nearby = this.add.graphics().setDepth(10000);
      const canvas = this.game.canvas; canvas.id = 'worldCanvas'; canvas.tabIndex = 0;
      canvas.setAttribute('aria-label', 'Розовый сад. Гуляй стрелками или WASD, касайся земли. Рядом с письмом нажми E или «Открыть письмо».');
      canvas.style.touchAction = 'none';
      this.scale.on('resize', () => { this.cameras.main.setZoom(cameraZoom()); });
      $('#questPreview')?.setAttribute('hidden', ''); $('#welcomeNote')?.setAttribute('hidden', '');
      const loading = $('#loading'); if (loading) { loading.classList.add('loaded'); setTimeout(() => { loading.hidden = true; }, 300); }
      update(); save(); canvas.focus({ preventScroll: true });
      this.events.once('shutdown', () => { this.input.keyboard?.removeAllListeners(); });
    }
    makeGround() {
      const ground = this.add.graphics(); ground.fillStyle(0xf5dfe6).fillRect(0, 0, W, H);
      // A quiet pink lawn, wide cream paths and clearings. No decorative backdrop image.
      ground.fillStyle(0xefcfdc);
      [[44,44,W-88,12],[44,H-56,W-88,12],[44,44,12,H-88],[W-56,44,12,H-88]].forEach(r => ground.fillRect(...r));
      // Paint the entire shadow first, then the entire surface: no internal seams.
      for(const shadow of [true,false]){
        const pad=shadow?3:0,dy=shadow?3:0;
        ground.fillStyle(shadow?0xeacdd5:0xfff5e9);
        ROADS.forEach(([x,y,w,h])=>ground.fillRoundedRect(x-pad,y+dy-pad,w+pad*2,h+pad*2,Math.min(w,h)/2+pad));
        JUNCTIONS.forEach(([x,y,r])=>ground.fillCircle(x,y+dy,r+pad));
      }
      let seed = 41; const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      for (let i=0;i<2200;i++) { const x=Math.floor(random()*W/2)*2,y=Math.floor(random()*H/2)*2; ground.fillStyle(i%4===0?0xfff3ee:0xeecedb,0.58).fillRect(x,y,2+(i%2)*2,1); }
      // A stepped little pond. Its collision is inset from the shore.
      ground.fillStyle(0xd5b5cc).fillRoundedRect(296,630,138,111,21);
      ground.fillStyle(0xfff7ed).fillRoundedRect(301,625,128,111,20);
      ground.fillStyle(0xbddcde).fillRoundedRect(308,632,114,96,17);
      ground.fillStyle(0xd9eeee).fillRoundedRect(314,636,102,78,14);
      ground.generateTexture('garden-ground',W,H); ground.destroy(); this.add.image(0,0,'garden-ground').setOrigin(0).setDepth(-20);
      reserve(365,679,104,86);
      this.water = this.add.graphics().setDepth(-10);
    }
    makeScenery() {
      const sceneryBounds=[];
      const put = (key,x,y,scale=1,collider=null) => {
        const s=this.add.image(x,y,key).setOrigin(0.5,1).setScale(scale).setDepth(y);
        if(!['flower','stone','cushion'].includes(key)){
          const [w,h]=PixelSprites.sizes[key]||[32,32];sceneryBounds.push({left:x-w*scale/2,right:x+w*scale/2,top:y-h*scale,bottom:y});
        }
        // Only artwork moves. Collision footprints and letter targets stay fixed.
        if(key==='windchime')s.setOrigin(0.5,0).setPosition(x,y-42);
        if(['windchime','flower','bird','bamboo'].includes(key))this.ambient.push({sprite:s,kind:key==='bamboo'?'flower':key,x,y:key==='windchime'?y-42:y,phase:x*.017+y*.013});
        if(key==='lantern'){
          const glow=this.add.ellipse(x,y-16,23,22,0xffe9ba,0.1).setDepth(y-1);
          this.ambient.push({sprite:glow,kind:'glow',x,y:y-16,phase:x*.017});
        }
        if(key==='ema')[[16,10],[31,10],[24,29]].forEach(([ox,oy],i)=>{
          const tag=this.add.image(x-24+ox,y-48+oy,'ema-tag').setOrigin(.5,0).setDepth(y+.1);
          this.ambient.push({sprite:tag,kind:'tag',x:x-24+ox,y:y-48+oy,phase:x*.017+i*1.8});
        });
        if(collider) reserve(x,y-collider[2],collider[0],collider[1]); return s;
      };
      const trees=[[106,188],[166,140],[330,128],[484,136],[660,130],[840,134],[1030,126],[1194,144],[1396,158],
        [104,360],[366,360],[592,354],[1046,348],[1412,356],[110,530],[626,500],[1184,490],[1432,542],
        [134,694],[608,714],[844,698],[1156,700],[1434,710],[110,900],[424,916],[628,894],[1438,924],
        [158,1078],[342,1064],[462,1066],[852,1082],[978,1070],[1198,1078],[1384,1084]];
      trees.forEach(([x,y])=>put('sakura',x,y,1,[18,14,8]));
      // A few landmarks make the big map easy to remember.
      put('house',266,238,1,[82,27,17]); put('house',1280,680,1,[82,27,17]);
      put('torii',754,204,1,null); put('bench',676,650,1,[32,10,5]); put('bench',1180,782,1,[32,10,5]);
      put('bridge',487,677,1,null);
      [[204,344],[306,356],[668,244],[834,244],[1162,566],[1332,794],[700,886],[818,886]].forEach(([x,y])=>put('lantern',x,y,1,[8,7,4]));
      [[146,260],[360,244],[364,818],[578,852],[1020,748],[1104,924],[1374,632],[1188,1026],[686,1024],[578,178]].forEach(([x,y],i)=>put(i%3?'bush':'stone',x,y,1,i%3?[19,10,5]:[13,6,3]));
      for(let i=0;i<135;i++) {
        const x=90+(i*173%1350),y=90+(i*269%980);
        if(ADVENTURES.some(q=>Math.hypot(q.x-x,q.y-y)<34) || footprints.some(p=>Math.abs(p.x-x)<p.width/2+10&&Math.abs(p.y-y)<p.height/2+10)) continue;
        put('flower',x,y,1);
      }
      put('cat',348,272); put('fox',1190,398); put('bird',906,226);
      [['bunny-kimono',1306,700],['bunny-gardener',548,906],['bear',668,690],['hedgehog',1050,800]].forEach(([key,x,y])=>{
        const sprite=put(key,x,y);this.ambient.push({sprite,kind:'friend',key,x,y,phase:x*.017});
      });
      // Small lily pads stay below all actors.
      this.add.rectangle(330,660,12,5,0xaec7b2).setDepth(-5);
      this.add.rectangle(394,702,13,5,0xaec7b2).setDepth(-5);
      this.add.image(397,702,'flower').setScale(0.5).setOrigin(0.5,1).setDepth(-4);
      // Small handmade garden corners, all off the routes and away from letters.
      const decorate=(key,x,y)=>{
        if(ADVENTURES.some(q=>Math.hypot(q.x-x,q.y-y)<44))return;
        put(key,x,y);
        if(key==='mailbox')reserve(x,y-3,12,6);
        if(key==='flowerpot')reserve(x,y-3,12,6);
        if(key==='teatable')reserve(x,y-5,40,8);
        if(key==='ema')reserve(x,y-3,42,6);
        if(key==='flowerbed')reserve(x,y-3,44,6);
        if(key==='bunting'){reserve(x-37,y-3,4,6);reserve(x+37,y-3,4,6);}
      };
      [[190,292],[710,340],[1090,866]].forEach(([x,y])=>decorate('mailbox',x,y));
      [[445,228],[1082,180],[1160,812]].forEach(([x,y])=>decorate('bunting',x,y));
      [[540,330],[820,820],[1130,1052]].forEach(([x,y])=>decorate('picnic',x,y));
      [[380,220],[155,420],[415,500],[665,360],[860,360],[1050,325],[1170,510],[1350,740],[1080,1060],[320,850],[720,1030]].forEach(([x,y])=>decorate('flowerbed',x,y));
      [[190,230],[345,230],[660,196],[810,205],[1120,318],[1220,664],[1340,666],[695,642],[1208,784],[490,962]].forEach(([x,y])=>decorate('flowerpot',x,y));
      [[380,294],[1118,748],[612,974]].forEach(([x,y])=>decorate('teatable',x,y));
      [[850,202],[1080,498],[1360,1000]].forEach(([x,y])=>decorate('ema',x,y));
      // Wind bells hang at the eaves; they never obstruct walking.
      put('windchime',310,212);put('windchime',1324,654);
      // Fill empty clearings, not the already furnished corners. Every candidate
      // is checked against full artwork bounds, letters and the cream main paths.
      this.newDecor=[];
      const roads=ROADS;
      const intersects=(a,b,pad=0)=>a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;
      const fillClearing=(key,cx,cy,region,nature=false)=>{
        const [w,h]=PixelSprites.sizes[key];let best=null;
        for(let oy=-96;oy<=96;oy+=16)for(let ox=-128;ox<=128;ox+=16){
          const x=cx+ox,y=cy+oy,box={left:x-w/2,right:x+w/2,top:y-h,bottom:y};
          if(box.left<52||box.right>W-52||box.top<54||y>H-44)continue;
          if(sceneryBounds.some(b=>intersects(box,b,nature?8:18)))continue;
          if(intersects(box,{left:300,right:430,top:625,bottom:737},8))continue;
          if(ADVENTURES.some(q=>intersects(box,{left:q.x-24,right:q.x+24,top:q.y-30,bottom:q.y+22},10)))continue;
          const feet={left:x-w/2,right:x+w/2,top:y-8,bottom:y+8};
          if(roads.some(([rx,ry,rw,rh])=>intersects(feet,{left:rx,right:rx+rw,top:ry,bottom:ry+rh},8)))continue;
          if(JUNCTIONS.some(([jx,jy,r])=>Math.hypot(x-jx,y-jy)<r+w/2+8))continue;
          const distance=Math.hypot(ox,oy);
          if(!best||distance<best.distance)best={x,y,distance};
        }
        if(!best)return;
        const {x,y}=best;put(key,x,y);
        if(key==='sakura')reserve(x,y-8,18,14);
        if(key==='bush')reserve(x,y-4,18,8);
        if(['flowercart','stone-lantern','bamboo','parasol','signpost','teatable'].includes(key))reserve(x,y-4,key==='flowercart'?46:key==='teatable'?36:key==='bamboo'?16:12,8);
        if(key==='cushion')sceneryBounds.push({left:x-w/2,right:x+w/2,top:y-h,bottom:y});
        this.newDecor.push({key,x,y,region});
      };
      const clearings=[
        [270,165,['signpost','hydrangea']], [550,220,['flowercart','wateringcan']],
        [980,180,['parasol','cushion','teatable']], [1330,270,['bamboo','stone-lantern']],
        [220,460,['flowercart','hydrangea']], [570,540,['stone-lantern','hydrangea']],
        [1070,470,['bamboo','stone-lantern']], [1330,520,['parasol','cushion']],
        [230,790,['parasol','teatable','cushion']], [600,820,['flowercart','wateringcan']],
        [1040,790,['hydrangea','stone-lantern']], [1360,850,['bamboo','signpost']],
        [260,1030,['flowercart','hydrangea']], [580,1060,['bamboo','stone-lantern']],
        [1050,1030,['parasol','teatable','cushion']], [1320,1040,['hydrangea','signpost']]
      ];
      clearings.forEach(([x,y,keys],region)=>keys.forEach(key=>fillClearing(key,x,y,region)));
      // A second, evenly spread planting pass fills the remaining open lawns.
      // Full canopy bounds protect letters; trunks alone participate in collisions.
      const plantedFrom=this.newDecor.length;
      for(let row=0;row<5;row++)for(let col=0;col<7;col++){
        fillClearing('sakura',105+col*220,180+row*215,row*7+col,true);
      }
      for(let row=0;row<4;row++)for(let col=0;col<6;col++){
        const x=120+col*250,y=220+row*270,region=row*6+col;
        fillClearing('bush',x+42,y+32,region,true);
        fillClearing((row+col)%2?'hydrangea':'flowerpot',x-42,y+40,region,true);
      }
      this.newPlantings=this.newDecor.slice(plantedFrom);
    }
    makeLetters() {
      this.letters=ADVENTURES.map(q=>{
        const shadow=this.add.ellipse(q.x,q.y+1,17,5,0xa67391,0.12).setDepth(q.y-2);
        const sprite=this.add.image(q.x,q.y,state.done.includes(q.id)?'letter-open':'letter').setOrigin(0.5,0.9).setDepth(q.y+1);
        const check=this.add.image(q.x+10,q.y-12,'read-check').setDepth(q.y+2).setVisible(state.read.includes(q.id));
        sprite.setInteractive(new Phaser.Geom.Rectangle(-7,-7,34,32),Phaser.Geom.Rectangle.Contains);
        sprite.on('pointerdown',(pointer,lx,ly,event)=>{event.stopPropagation();if(Phaser.Math.Distance.Between(this.player.x,this.player.y,q.x,q.y)<57)this.interact(q);else this.walkTo(q.x+40,q.y+16,q);});
        return {q,sprite,shadow,check};
      });
    }
    makePetals() {
      this.petals=[];
      if(reduced.matches)return;
      for(let i=0;i<20;i++)this.petals.push(this.add.rectangle((i*251)%W,(i*173)%H,3,2,i%2?0xfff7f0:0xe8afc5,0.6).setDepth(9000));
    }
    makeInput() {
      this.input.on('pointerdown',pointer=>{
        if(document.querySelector('dialog[open]'))return;
        const p=pointer.positionToCamera(this.cameras.main);this.walkTo(p.x,p.y);
      });
      this.input.keyboard.on('keydown',e=>{
        if(document.querySelector('dialog[open]')||/^(INPUT|TEXTAREA|BUTTON|A)$/.test(e.target?.tagName||''))return;
        const key=({KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyE:'e',Space:' '})[e.code]||e.key.toLowerCase();
        if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','e',' '].includes(key)){e.preventDefault();this.keysHeld.add(key);}
        if((key==='e'||key===' ')&&!e.repeat)this.interact();
      });
      this.input.keyboard.on('keyup',e=>this.keysHeld.delete(({KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyE:'e',Space:' '})[e.code]||e.key.toLowerCase()));
      window.addEventListener('blur',()=>{this.keysHeld.clear();stop();save();});
      document.addEventListener('visibilitychange',()=>{if(document.hidden){this.keysHeld.clear();stop();save();}});
    }
    walkTo(x,y,q=null) {
      if(document.querySelector('dialog[open]'))return;
      const target=nearestFree(x,y);if(!target)return;
      this.route=findPath(this.player.x,this.player.y,x,y);this.pending=q;
      if(!this.route.length) { if(q&&Phaser.Math.Distance.Between(this.player.x,this.player.y,q.x,q.y)<55)this.interact(q);else this.pending=null;return; }
      this.destination.clear().lineStyle(1,0xd19bb4,0.7).strokeCircle((target.x+0.5)*CELL,(target.y+0.5)*CELL,5).setVisible(true);
      if($('#walkingText'))$('#walkingText').textContent=q?'Идём к письму. Можно никуда не спешить.':'Плюш идёт за тобой';
      this.game.canvas.focus({preventScroll:true});
    }
    interact(q=this.closest?.q) {
      if(!q||document.querySelector('dialog[open]')||Phaser.Math.Distance.Between(this.player.x,this.player.y,q.x,q.y)>57)return;
      stop();this.keysHeld.clear();this.destination.setVisible(false);sound(1);
      if(state.done.includes(q.id))window.Adventures?.speak(q);else window.Adventures?.open(q);
    }
    refreshNearby() {
      if(!this.player)return;
      let closest=null,distance=Infinity;
      for(const letter of this.letters){const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,letter.q.x,letter.q.y);if(d<distance){distance=d;closest=letter;}}
      this.closest=distance<57?closest:null;
      const button=$('#interactButton');if(button){button.hidden=!this.closest;button.disabled=!this.closest;}
      if($('#nearbyPanel'))$('#nearbyPanel').hidden=!this.closest;
      if($('#nearbyTitle'))$('#nearbyTitle').textContent=this.closest?this.closest.q.title:'';
      if(button){const text=this.closest&&state.done.includes(this.closest.q.id)?'Перечитать письмо':'Открыть письмо';button.setAttribute('aria-label',text);if(button.lastChild?.nodeType===Node.TEXT_NODE)button.lastChild.textContent=' '+text;}
      if($('#locationName'))$('#locationName').textContent=closest?.q.place||'Розовая поляна';
      const host=$('#game');if(host){host.dataset.x=this.player.x.toFixed(1);host.dataset.y=this.player.y.toFixed(1);host.dataset.nearest=String(this.closest?.q.id||'');}
    }
    drawMini() {
      const canvas=$('#miniCanvas');if(!canvas||!this.player)return;const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
      c.clearRect(0,0,w,h);c.fillStyle='#f3dce5';c.fillRect(0,0,w,h);c.strokeStyle='#fff5e9';c.lineWidth=6;
      c.fillStyle='#fff5e9';ROADS.forEach(([x,y,rw,rh])=>c.fillRect(x/W*w,y/H*h,rw/W*w,rh/H*h));
      for(const letter of this.letters){c.fillStyle=state.read.includes(letter.q.id)?'#739b69':state.done.includes(letter.q.id)?'#d8b4c4':'#a76b91';c.fillRect(letter.q.x/W*w-1,letter.q.y/H*h-1,3,2);}
      const camera=this.cameras.main;c.strokeStyle='#b986a0';c.lineWidth=1;c.strokeRect(camera.worldView.x/W*w,camera.worldView.y/H*h,camera.worldView.width/W*w,camera.worldView.height/H*h);
      c.fillStyle='#fffaf3';c.strokeStyle='#805a7b';c.lineWidth=1.5;c.beginPath();c.arc(this.player.x/W*w,this.player.y/H*h,3,0,Math.PI*2);c.fill();c.stroke();
    }
    animateAmbient(time) {
      const still=reduced.matches,t=still?0:time/1000*3.6;
      for(const item of this.ambient){
        const {sprite,kind,phase,x,y}=item;
        if(kind==='friend'){
          sprite.setTexture(item.key+(!still&&(time/1000+phase)%4.7>4.5?'-blink':''));
          sprite.setRotation(still?0:Math.sin(time/1000*1.8+phase)*.025);continue;
        }
        if(kind==='glow'){sprite.setAlpha(still?.1:.09+.035*(1+Math.sin(t*1.4+phase)));continue;}
        if(kind==='windchime'||kind==='tag'||kind==='flower'){
          const amplitude=kind==='flower'?.045:kind==='tag'?.09:.075;
          sprite.setRotation(still?0:Math.sin(t*(kind==='flower'?1.25:1.65)+phase)*amplitude);
        }
        if(kind==='bird'){
          // One short hop, then a long rest; no constantly bouncing NPCs.
          // Faster repeats, with a complete eased hop rather than a rushed twitch.
          const cycle=(time/1000+phase)%2.4,hop=!still&&cycle<.5?Math.sin(cycle/.5*Math.PI)**2*4:0;
          sprite.setPosition(x,y-hop);
        }
      }
      for(const letter of this.letters){
        const read=state.read.includes(letter.q.id),bob=still||read?0:Math.sin(t*1.7+letter.q.id*1.3)*1.6;
        letter.sprite.setPosition(letter.q.x,letter.q.y+bob);
        letter.shadow.setAlpha(still||read?1:.85-bob*.08);
      }
      this.water.clear();this.water.fillStyle(0xf1fbf5,.8);
      for(let i=0;i<5;i++){
        const drift=(i*19+t*2)%78,x=322+drift,y=648+i*14;
        this.water.fillStyle(0xf1fbf5,.8*Math.sin(drift/78*Math.PI));
        this.water.fillRect(x,y,9+i%3*3,1);
      }
      this.petals.forEach((p,i)=>{
        p.setVisible(!still);
        if(!still){p.x=(i*251+t*5+Math.sin(t*.65+i)*5)%W;p.y=(i*173+t*9)%H;}
      });
    }
    update(time,delta) {
      const player=this.player;if(!player)return;const modal=!!document.querySelector('dialog[open]');let dx=0,dy=0;
      if(modal){player.body.stop();this.keysHeld.clear();}
      else {
        const k=this.keysHeld;dx=Number(k.has('d')||k.has('arrowright'))-Number(k.has('a')||k.has('arrowleft'));dy=Number(k.has('s')||k.has('arrowdown'))-Number(k.has('w')||k.has('arrowup'));
        if(dx||dy){this.route=[];this.pending=null;this.destination.setVisible(false);}
        else if(this.route.length){let p=this.route[0],dist=Math.hypot(p.x-player.x,p.y-player.y);if(dist<Math.max(3,100*delta/1000)){this.route.shift();p=this.route[0];}if(p){dx=p.x-player.x;dy=p.y-player.y;}}
        const length=Math.hypot(dx,dy);player.setVelocity(length?dx/length*100:0,length?dy/length*100:0);
        if(!this.route.length&&!length){this.destination.setVisible(false);if(this.pending){const q=this.pending;this.pending=null;this.interact(q);}if($('#walkingText'))$('#walkingText').textContent='Касайся земли или гуляй стрелками';}
      }
      const moving=!modal&&Math.hypot(player.body.velocity.x,player.body.velocity.y)>1;
      const skin=CHARACTERS.some(c=>c.key===state.character)?state.character:'bunny';
      if(moving){if(Math.abs(dx)>Math.abs(dy))this.facing=dx<0?'left':'right';else this.facing=dy<0?'up':'down';}
      if(skin==='bunny'){
        if(player.texture.key!=='bunny'){player.anims.stop();player.setTexture('bunny',16);}
        player.setFlipX(false);
        if(moving)player.anims.play('walk-'+this.facing,true);
        else {player.anims.stop();const frames={down:16,left:4,right:8,up:12};player.setFrame(this.facing==='down'&&time%5400>5180?17:frames[this.facing]);}
      }else{
        player.anims.stop();player.setTexture('hero-'+skin,moving?Math.floor(time/110)%4:time%4700>4500?5:4);
        player.setFlipX(this.facing==='left');
      }
      player.setDepth(player.y);this.shadow.setPosition(player.x,player.y-2).setDepth(player.y-1);
      hero.x=player.x;hero.y=player.y;
      this.refreshNearby();this.nearby.clear();
      if(this.closest&&!modal){const {x,y}=this.closest.q;this.nearby.lineStyle(1,0xcb8aa8,0.75).strokeEllipse(x,y+1,29,12);this.nearby.fillStyle(0xfff7ef).fillRoundedRect(x-8,y-33,16,12,3);this.nearby.lineStyle(1,0xaf7898).strokeRoundedRect(x-8,y-33,16,12,3);this.nearby.lineBetween(x-3,y-30,x+3,y-30);this.nearby.lineBetween(x-3,y-27,x+1,y-27);}
      this.animateAmbient(time);
      if(time-this.lastMini>300){this.lastMini=time;this.drawMini();}
      if(time-this.lastSaved>1800){this.lastSaved=time;save();}
      window.Adventures?.drawPortrait(time);
    }
  }
  const host=$('#game');
  const game=new Phaser.Game({type:Phaser.AUTO,parent:host||'worldShell',backgroundColor:'#f4dde5',pixelArt:true,roundPixels:false,banner:false,
    physics:{default:'arcade',arcade:{gravity:{x:0,y:0},debug:false}},
    scale:{mode:Phaser.Scale.RESIZE,width:host?.clientWidth||innerWidth,height:host?.clientHeight||innerHeight,autoCenter:Phaser.Scale.CENTER_BOTH},scene:Garden});
  window.GardenGame=game;
  window.GardenDebug=()=>({ready:!!scene?.player,width:W,height:H,hero:{...hero},letters:ADVENTURES.map(q=>({id:q.id,x:q.x,y:q.y,done:state.done.includes(q.id)})),colliders:footprints.map(p=>({...p})),route:scene?.route.map(p=>({...p}))||[]});
  $('#interactButton')?.addEventListener('click',()=>scene?.interact());
  $('#homeButton')?.addEventListener('click',e=>{e.preventDefault();game.canvas?.focus({preventScroll:true});});
  $('#exploreButton')?.addEventListener('click',()=>window.Adventures?.explore());
  $('#moodButton')?.addEventListener('click',()=>window.Adventures?.explore());
  $('#albumButton')?.addEventListener('click',()=>window.Adventures?.album());
  $('#helpButton')?.addEventListener('click',()=>{stop();$('#helpDialog')?.showModal();});
  $('#characterButton')?.addEventListener('click',()=>{
    stop();const grid=$('#characterGrid');grid.replaceChildren();
    CHARACTERS.forEach(c=>{
      const button=document.createElement('button');button.className='character-choice';button.type='button';
      button.setAttribute('aria-pressed',String(c.key===(state.character||'bunny')));
      const img=document.createElement('img');img.alt='';
      img.src=c.key==='bunny'?PixelSprites.portrait('plush'):PixelSprites.icon(c.key);
      const title=document.createElement('strong');title.textContent=c.name;
      const description=document.createElement('small');description.textContent=c.detail;
      button.append(img,title,description);button.onclick=()=>{
        state.character=c.key;save();scene.facing='down';
        $('#characterDialog').close();$('#game').focus();
      };grid.append(button);
    });$('#characterDialog').showModal();
  });
  $('#soundButton')?.addEventListener('click',async()=>{
    state.sound=!state.sound;
    if(window.GardenMusic&&!await window.GardenMusic.unlock(state.sound)){state.sound=false;toast('Браузер пока не разрешил звук. Можно попробовать ещё раз.');}
    update();save();
  });
  // A saved music preference may resume only after the next actual gesture.
  const resumeMusic=()=>{if(state.sound)window.GardenMusic?.unlock(true);};
  document.addEventListener('pointerdown',resumeMusic,{once:true});
  document.addEventListener('keydown',resumeMusic,{once:true});
  function showMap(){stop();if($('#mapDialog')){$('#mapDialog').showModal();scene?.drawMini();}else window.Adventures?.explore();}
  $('#mapButton')?.addEventListener('click',showMap);$('#minimapButton')?.addEventListener('click',showMap);
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog')?.close()));
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.addEventListener('close',()=>{scene?.keysHeld.clear();game.canvas?.focus({preventScroll:true});});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  });
  update();
  return {$,state,hero,images,reduced,icon,save,sound,toast,update,stop,selectQuest,overview:showMap};
})();
