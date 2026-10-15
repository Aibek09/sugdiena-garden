/* Original, deliberately small pixel artwork. No external images or fonts. */
const PixelSprites = (() => {
  const C = { ink:'#76536f', inkLight:'#ac829b', white:'#fffaf3', light:'#ffffff',
    shade:'#eadfe7', pink:'#f2c8d8', rose:'#e8a2bb', blush:'#e395ac', deep:'#cc7e9e',
    cream:'#fff0d9', sand:'#e6cebc', wood:'#bd91a0', woodDark:'#936c87',
    leaf:'#c9d9bd', leafDark:'#a5bda4', water:'#dbe9ed', fox:'#edc3a3', foxDark:'#cf9c91' };
  const sizes = { bunny:[32,40], letter:[20,16], 'letter-open':[20,20], sakura:[64,76],
    bush:[28,22], stone:[18,12], flower:[12,16], lantern:[14,28], house:[112,104],
    bench:[40,24], bridge:[64,32], torii:[64,64], fox:[32,32], cat:[28,30], bird:[24,24],
    'read-check':[12,12],mailbox:[26,40],picnic:[60,38],flowerbed:[48,23],bunting:[80,48],flowerpot:[22,28],
    teatable:[48,34],ema:[48,48],'ema-tag':[13,16],windchime:[18,42],
    flowercart:[64,54],'stone-lantern':[26,40],bamboo:[32,62],parasol:[58,60],
    cushion:[28,16],wateringcan:[24,22],signpost:[26,32],hydrangea:[38,30],
    'bunny-kimono':[32,40],'bunny-gardener':[32,40],bear:[32,36],hedgehog:[32,30] };
  const rect=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
  function oval(g,x,y,w,h,c) {
    g.fillStyle=c;
    for(let py=0;py<h;py++) {
      const v=(py+.5-h/2)/(h/2), span=Math.sqrt(Math.max(0,1-v*v))*w/2;
      const l=Math.ceil(x+w/2-span-.5), r=Math.floor(x+w/2+span-.5);
      if(r>=l)g.fillRect(l,y+py,r-l+1,1);
    }
  }
  function shell(g,x,y,w,h,fill,outline=C.ink) {
    oval(g,x,y,w,h,outline);oval(g,x+1,y+1,w-2,h-2,fill);
  }
  function line(g,x1,y1,x2,y2,c,width=1) {
    const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));
    for(let i=0;i<=n;i++)rect(g,x1+(x2-x1)*i/(n||1),y1+(y2-y1)*i/(n||1),width,width,c);
  }
  function star(g,x,y,c=C.cream) {rect(g,x+2,y,1,5,c);rect(g,x,y+2,5,1,c);}
  function heart(g,x,y,c=C.blush) {
    rect(g,x+1,y,2,1,c);rect(g,x+4,y,2,1,c);rect(g,x,y+1,7,2,c);
    rect(g,x+1,y+3,5,1,c);rect(g,x+2,y+4,3,1,c);rect(g,x+3,y+5,1,1,c);
  }
  function bunny(g,dir='down',frame=0,blink=false,talk=false) {
    const walk=frame>=0, f=walk?frame:0, bob=walk&&(f===1||f===3)?-1:0;
    const side=dir==='left'||dir==='right', up=dir==='up';
    g.save();g.translate(0,bob);
    // A real torso, rear pompom, and alternating little feet.
    if(side)shell(g,dir==='left'?22:4,27,7,7,C.white);
    shell(g,8,24,17,13,C.white);
    oval(g,18,27,5,8,C.shade);
    const step=walk?[0,-2,0,2][f]:0;
    shell(g,8+step,33,8,5,C.white);shell(g,18-step,33,8,5,C.white);
    rect(g,10+step,36,4,1,C.shade);rect(g,20-step,36,4,1,C.shade);
    // Two ears have different small poses rather than scaling the whole sprite.
    const ear=walk?[0,1,0,-1][f]:0;
    shell(g,7+ear,2,8,20,C.white);shell(g,19-ear,1,8,21,C.white);
    oval(g,9+ear,5,4,12,C.pink);oval(g,21-ear,4,4,13,C.pink);
    rect(g,10+ear,6,2,7,C.rose);rect(g,22-ear,5,2,8,C.rose);
    shell(g,4,14,25,17,C.white);oval(g,21,20,6,8,C.shade);
    rect(g,8,16,8,1,C.light);rect(g,6,18,3,2,C.light);
    if(up) {
      oval(g,8,16,17,11,C.white);shell(g,13,28,7,6,C.light,C.inkLight);
      rect(g,7,24,2,3,C.shade);rect(g,25,23,2,3,C.shade);
    } else if(side) {
      const eye=dir==='left'?9:23, nose=dir==='left'?4:28;
      if(blink)rect(g,eye-1,21,3,1,C.ink);else {rect(g,eye,19,2,3,C.ink);rect(g,eye,19,1,1,C.white);}
      oval(g,dir==='left'?7:21,24,4,2,C.pink);
      rect(g,nose,23,1,2,C.deep);rect(g,dir==='left'?6:25,26,talk?2:1,talk?2:1,C.ink);
      shell(g,dir==='left'?9:20,28,4,7,C.white);
    } else {
      if(blink) {rect(g,9,21,3,1,C.ink);rect(g,22,21,3,1,C.ink);}
      else {rect(g,10,19,2,3,C.ink);rect(g,22,19,2,3,C.ink);rect(g,10,19,1,1,C.white);rect(g,22,19,1,1,C.white);}
      oval(g,6,24,5,2,C.pink);oval(g,23,24,4,2,C.pink);
      rect(g,16,23,2,1,C.deep);rect(g,17,24,1,1,C.ink);
      if(talk){oval(g,15,25,4,3,C.ink);rect(g,16,27,2,1,C.rose);}
      else{rect(g,15,25,2,1,C.ink);rect(g,18,25,2,1,C.ink);}
      shell(g,7,29,4,6,C.white);shell(g,23,29,4,6,C.white);
    }
    g.restore();
  }
  function envelope(g,open=false) {
    if(open) {line(g,1,8,9,1,C.ink);line(g,9,1,18,8,C.ink);rect(g,4,5,12,12,C.white);rect(g,5,4,10,1,C.inkLight);rect(g,7,7,6,1,C.pink);rect(g,7,9,5,1,C.pink);}
    const y=open?9:3;
    rect(g,1,y+1,18,11,C.ink);rect(g,2,y,16,13,C.ink);
    rect(g,2,y+1,16,11,C.white);rect(g,3,y+2,14,9,C.cream);
    line(g,2,y+10,8,y+6,C.rose);line(g,17,y+10,11,y+6,C.rose);
    if(!open){line(g,2,y+1,9,y+6,C.inkLight);line(g,17,y+1,10,y+6,C.inkLight);heart(g,6,y+5,C.blush);}
    else {line(g,2,y+1,9,y+6,C.rose);line(g,17,y+1,10,y+6,C.rose);heart(g,6,y+4,C.blush);}
  }
  function sakura(g) {
    // Branches remain separate from the scalloped canopy, with one-pixel highlights.
    rect(g,29,36,8,38,C.woodDark);rect(g,30,36,4,36,C.wood);
    line(g,30,52,17,34,C.woodDark,3);line(g,35,45,47,28,C.woodDark,3);
    rect(g,25,72,17,3,C.woodDark);rect(g,24,75,19,1,C.inkLight);
    [[7,23,26,25],[30,23,28,25],[1,13,28,23],[34,9,28,26],[15,1,31,31],[16,26,32,26]].forEach(([x,y,w,h])=>shell(g,x,y,w,h,C.rose,C.inkLight));
    [[7,12,24,20],[19,3,24,23],[36,11,21,20],[4,24,23,16],[23,22,29,22]].forEach(([x,y,w,h])=>oval(g,x,y,w,h,C.pink));
    [[14,12],[30,8],[45,18],[10,31],[32,32],[46,36]].forEach(([x,y])=>{rect(g,x,y,3,2,C.white);rect(g,x+1,y-1,1,4,C.white);});
    rect(g,20,18,3,2,C.rose);rect(g,37,24,3,2,C.rose);rect(g,14,38,2,2,C.rose);
    rect(g,20,60,2,2,C.pink);rect(g,44,66,3,1,C.pink);rect(g,39,73,2,1,C.pink);
  }
  function bush(g) {
    shell(g,0,8,17,13,C.leaf,C.inkLight);shell(g,9,2,17,19,C.leaf,C.inkLight);shell(g,16,9,12,12,C.leaf,C.inkLight);
    oval(g,4,8,11,8,C.leaf);oval(g,11,4,11,12,C.leaf);rect(g,5,17,17,3,C.leafDark);
    [[6,11],[16,7],[22,14]].forEach(([x,y])=>{rect(g,x,y,3,3,C.pink);rect(g,x+1,y+1,1,1,C.white);});
  }
  function stone(g){shell(g,1,3,16,9,C.shade,C.inkLight);rect(g,5,3,6,2,C.white);rect(g,4,5,2,1,C.white);rect(g,11,9,4,1,C.pink);}
  function flower(g) {
    rect(g,5,6,2,9,C.leafDark);rect(g,2,11,3,2,C.leaf);rect(g,7,9,3,2,C.leaf);
    [[3,1],[6,1],[1,4],[7,4],[4,6]].forEach(([x,y])=>oval(g,x,y,4,4,C.rose));
    rect(g,4,3,4,4,C.pink);rect(g,5,4,2,2,C.cream);
  }
  function lantern(g) {
    rect(g,6,0,2,5,C.woodDark);rect(g,3,4,8,2,C.woodDark);
    shell(g,1,6,12,15,C.pink);rect(g,3,8,2,10,C.white);rect(g,7,8,1,11,C.rose);rect(g,10,9,1,8,C.rose);
    rect(g,4,20,6,2,C.woodDark);rect(g,6,22,2,4,C.deep);rect(g,4,26,6,2,C.rose);
    rect(g,5,11,5,1,C.deep);rect(g,7,10,1,5,C.deep);
  }
  function house(g) {
    rect(g,8,93,96,8,C.sand);rect(g,11,50,90,44,C.woodDark);rect(g,14,50,84,42,C.white);
    rect(g,18,53,3,36,C.wood);rect(g,91,53,3,36,C.wood);rect(g,14,86,84,5,C.wood);
    rect(g,44,59,27,33,C.woodDark);rect(g,47,61,21,31,C.pink);
    rect(g,49,63,17,12,C.cream);rect(g,56,63,2,12,C.wood);rect(g,49,68,17,2,C.wood);rect(g,63,80,2,3,C.deep);
    [[23,61],[76,61]].forEach(([x,y])=>{rect(g,x,y,15,18,C.woodDark);rect(g,x+2,y+2,11,14,C.water);rect(g,x+7,y+2,1,14,C.white);rect(g,x+2,y+8,11,1,C.white);});
    // Curved-looking Japanese eaves, assembled from intentional stepped rows.
    for(let i=0;i<27;i++) {const inset=Math.max(0,29-i);rect(g,8+inset,21+i,96-inset*2,1,C.inkLight);}
    for(let i=0;i<23;i++) {const inset=Math.max(0,27-i);rect(g,11+inset,23+i,90-inset*2,1,i%5===0?C.deep:C.rose);}
    rect(g,5,46,102,5,C.woodDark);rect(g,1,43,12,4,C.woodDark);rect(g,99,43,12,4,C.woodDark);
    rect(g,8,46,96,2,C.pink);rect(g,1,41,6,3,C.woodDark);rect(g,105,41,6,3,C.woodDark);
    rect(g,45,17,22,5,C.woodDark);rect(g,49,15,14,3,C.rose);
    // Little sign, flower pots and stone doorstep.
    rect(g,44,51,28,6,C.cream);heart(g,54,51,C.rose);
    rect(g,39,93,39,4,C.shade);rect(g,36,97,45,3,C.sand);
    [[18,85],[84,85]].forEach(([x,y])=>{rect(g,x,y,9,8,C.rose);rect(g,x-1,y,11,2,C.inkLight);oval(g,x-1,y-9,11,10,C.leaf);rect(g,x+3,y-8,3,3,C.pink);});
  }
  function bench(g) {
    rect(g,6,14,4,10,C.woodDark);rect(g,30,14,4,10,C.woodDark);
    rect(g,2,0,36,3,C.woodDark);rect(g,3,1,34,3,C.pink);
    rect(g,3,5,34,4,C.woodDark);rect(g,4,5,32,2,C.pink);
    rect(g,4,1,2,15,C.woodDark);rect(g,34,1,2,15,C.woodDark);
    rect(g,0,12,40,6,C.woodDark);rect(g,1,12,38,3,C.cream);rect(g,2,15,36,1,C.rose);
  }
  function bridge(g) {
    for(let i=0;i<8;i++){rect(g,i*8,7,8,20,C.woodDark);rect(g,i*8+1,8,6,18,C.cream);rect(g,i*8+2,9,1,16,C.sand);}
    for(const yy of [1,26]) {rect(g,0,yy+3,64,3,C.woodDark);rect(g,0,yy+3,64,1,C.rose);
      [0,20,41,61].forEach(x=>{rect(g,x,yy,3,6,C.woodDark);rect(g,x,yy,2,2,C.pink);});}
  }
  function torii(g) {
    rect(g,12,13,6,49,C.woodDark);rect(g,46,13,6,49,C.woodDark);
    rect(g,13,16,3,43,C.rose);rect(g,47,16,3,43,C.rose);
    rect(g,9,59,12,5,C.inkLight);rect(g,43,59,12,5,C.inkLight);
    rect(g,7,23,50,6,C.woodDark);rect(g,8,23,48,3,C.pink);
    rect(g,29,12,6,15,C.woodDark);rect(g,30,13,4,12,C.rose);
    rect(g,2,6,60,7,C.woodDark);rect(g,0,2,6,7,C.woodDark);rect(g,58,2,6,7,C.woodDark);
    rect(g,4,6,56,3,C.rose);rect(g,2,4,5,3,C.pink);rect(g,57,4,5,3,C.pink);
  }
  function animal(g,kind,blink=false,talk=false) {
    if(kind==='fox') {
      shell(g,19,19,13,11,C.fox);oval(g,25,21,6,7,C.white);
      shell(g,7,17,18,13,C.fox);oval(g,12,20,8,9,C.white);
      // Upright triangular ears drawn in horizontal pixel bands.
      [[5,1],[22,1]].forEach(([x,y])=>{for(let r=0;r<12;r++)rect(g,x+Math.floor((11-r)/3),y+r,2+Math.floor(r/3)*2,1,C.ink);for(let r=3;r<10;r++)rect(g,x+3,y+r,3,1,C.rose);});
      shell(g,2,8,28,17,C.fox);oval(g,5,17,22,8,C.white);
      rect(g,7,14,2,blink?1:3,C.ink);rect(g,23,14,2,blink?1:3,C.ink);
      oval(g,4,19,4,2,C.pink);oval(g,25,19,3,2,C.pink);rect(g,15,18,2,2,C.ink);
      rect(g,15,21,talk?3:2,talk?3:1,C.ink);rect(g,8,29,6,2,C.ink);rect(g,20,29,6,2,C.ink);
    } else if(kind==='cat') {
      shell(g,5,17,18,12,C.cream);shell(g,21,17,6,9,C.cream);
      [[3,2],[18,2]].forEach(([x,y])=>{for(let r=0;r<12;r++)rect(g,x+Math.floor((11-r)/3),y+r,2+Math.floor(r/3)*2,1,C.ink);rect(g,x+3,y+5,3,5,C.pink);});
      shell(g,1,9,26,16,C.cream);oval(g,8,16,14,9,C.white);
      rect(g,7,14,2,blink?1:3,C.ink);rect(g,20,14,2,blink?1:3,C.ink);
      rect(g,13,19,2,1,C.deep);rect(g,12,21,talk?4:1,talk?3:1,C.ink);if(!talk)rect(g,15,21,1,1,C.ink);
      rect(g,3,20,3,1,C.rose);rect(g,23,20,3,1,C.rose);rect(g,9,10,2,3,C.sand);rect(g,13,10,2,3,C.sand);
      rect(g,6,28,6,2,C.ink);rect(g,17,28,6,2,C.ink);
    } else {
      rect(g,7,21,3,3,C.woodDark);rect(g,15,21,3,3,C.woodDark);
      shell(g,2,5,20,18,C.pink);oval(g,6,12,13,10,C.white);
      shell(g,1,12,6,8,C.rose,C.inkLight);rect(g,7,3,2,3,C.rose);rect(g,9,2,2,4,C.rose);
      rect(g,8,10,2,blink?1:2,C.ink);rect(g,17,10,2,blink?1:2,C.ink);
      rect(g,12,13,4,talk?3:2,C.foxDark);rect(g,13,15,2,1,C.cream);
      rect(g,5,14,3,2,C.rose);rect(g,19,14,2,2,C.rose);
    }
  }
  function readCheck(g) {
    rect(g,2,0,8,12,'#74966c');rect(g,0,2,12,8,'#74966c');rect(g,2,1,8,10,'#a8c49a');rect(g,1,2,10,8,'#a8c49a');
    line(g,3,6,5,8,C.white,2);line(g,5,8,9,4,C.white,2);
  }
  function mailbox(g) {
    rect(g,11,22,5,17,C.woodDark);rect(g,8,38,11,2,C.inkLight);
    rect(g,3,5,20,22,C.inkLight);rect(g,1,9,24,15,C.inkLight);rect(g,4,6,18,19,C.pink);rect(g,2,10,22,13,C.pink);
    rect(g,5,6,15,2,C.white);rect(g,7,10,12,3,C.woodDark);rect(g,7,11,12,1,C.deep);heart(g,9,17,C.deep);
    rect(g,21,0,2,13,C.woodDark);rect(g,23,1,3,6,C.rose);
  }
  function picnic(g) {
    rect(g,1,4,58,32,C.inkLight);rect(g,2,5,56,29,C.white);
    for(let y=0;y<4;y++)for(let x=0;x<8;x++)if((x+y)%2===0)rect(g,2+x*7,5+y*7,7,7,C.pink);
    [5,14,23,32,41,50].forEach(x=>rect(g,x,34,3,3,C.rose));
    oval(g,17,12,25,14,C.cream);rect(g,22,8,16,13,C.woodDark);rect(g,23,9,14,11,C.cream);
    rect(g,36,10,5,7,C.woodDark);rect(g,37,11,3,5,C.cream);rect(g,21,9,18,3,C.pink);
    [[10,17],[44,18]].forEach(([x,y])=>{rect(g,x,y,7,7,C.woodDark);rect(g,x+1,y+1,5,5,C.white);rect(g,x+2,y+1,3,2,C.fox);rect(g,x+7,y+1,2,4,C.woodDark);});
    oval(g,28,26,9,5,C.white);rect(g,30,25,4,3,C.rose);
  }
  function flowerbed(g) {
    rect(g,0,14,48,7,C.woodDark);rect(g,1,14,46,5,C.cream);rect(g,2,19,44,3,C.sand);
    for(let i=0;i<6;i++){const x=3+i*7;rect(g,x+2,8,1,8,C.leafDark);rect(g,x,11,3,2,C.leaf);rect(g,x+3,9,3,2,C.leaf);const c=i%2?C.white:C.rose;rect(g,x,3,5,6,c);rect(g,x-1,5,7,2,c);rect(g,x+2,5,2,2,C.cream);}
  }
  function bunting(g) {
    rect(g,1,5,3,42,C.woodDark);rect(g,76,5,3,42,C.woodDark);rect(g,0,44,7,3,C.inkLight);rect(g,73,44,7,3,C.inkLight);
    for(let x=4;x<76;x++){const y=5+Math.round(Math.sin((x-4)/72*Math.PI)*7);rect(g,x,y,1,1,C.inkLight);}
    for(let i=0;i<7;i++){const x=8+i*9,y=7+Math.round(Math.sin((x-4)/72*Math.PI)*7);for(let row=0;row<8;row++){rect(g,x+Math.floor(row/2),y+row,8-Math.floor(row/2)*2,1,i%2?C.white:C.rose);}}
    rect(g,0,1,5,5,C.pink);rect(g,75,1,5,5,C.pink);
  }
  function flowerpot(g) {
    rect(g,3,16,16,3,C.inkLight);rect(g,5,19,12,8,C.rose);rect(g,7,25,8,3,C.woodDark);rect(g,6,19,3,5,C.pink);
    oval(g,2,6,18,12,C.leaf);rect(g,6,9,3,3,C.white);rect(g,14,11,3,3,C.pink);rect(g,9,3,5,8,C.rose);rect(g,7,5,9,4,C.rose);rect(g,10,6,3,2,C.cream);
  }
  function teatable(g) {
    oval(g,2,29,44,4,C.shade);
    rect(g,6,20,5,11,C.woodDark);rect(g,37,20,5,11,C.woodDark);
    rect(g,2,16,44,7,C.woodDark);rect(g,3,15,42,6,C.wood);rect(g,4,16,40,2,C.cream);
    rect(g,17,18,15,6,C.pink);rect(g,18,23,2,2,C.rose);rect(g,29,23,2,2,C.rose);
    shell(g,18,4,14,12,C.white,C.inkLight);rect(g,21,2,8,3,C.inkLight);rect(g,23,1,4,2,C.rose);
    line(g,31,8,36,5,C.inkLight,2);line(g,34,6,35,10,C.inkLight,2);
    shell(g,13,6,6,7,C.cream,C.inkLight);rect(g,16,6,3,7,C.white);
    [[7,10],[37,11]].forEach(([x,y])=>{rect(g,x,y,6,5,C.inkLight);rect(g,x+1,y,4,4,C.white);rect(g,x+1,y,4,1,C.leafDark);});
    rect(g,23,7,4,1,C.pink);rect(g,25,5,1,5,C.pink);
  }
  function ema(g) {
    rect(g,4,7,4,39,C.woodDark);rect(g,40,7,4,39,C.woodDark);
    rect(g,1,6,46,5,C.woodDark);rect(g,3,3,42,4,C.rose);rect(g,6,1,36,3,C.pink);rect(g,7,4,34,1,C.white);
    rect(g,2,44,8,3,C.inkLight);rect(g,38,44,8,3,C.inkLight);
    rect(g,7,31,34,3,C.woodDark);
  }
  function emaTag(g) {
    rect(g,6,0,1,5,C.deep);rect(g,4,4,5,1,C.inkLight);rect(g,2,5,9,2,C.inkLight);rect(g,0,7,13,9,C.inkLight);
    rect(g,2,7,9,7,C.cream);heart(g,3,8,C.pink);
  }
  function windchime(g) {
    rect(g,8,0,1,8,C.inkLight);shell(g,2,7,14,13,C.white,C.inkLight);
    rect(g,3,13,12,6,'#e4edf0');rect(g,5,11,3,2,C.light);rect(g,4,18,10,2,C.rose);
    rect(g,8,20,1,7,C.woodDark);rect(g,5,27,8,13,C.inkLight);rect(g,6,28,6,11,C.pink);
    rect(g,8,30,2,5,C.white);rect(g,6,39,2,2,C.rose);
  }
  function flowercart(g) {
    shell(g,10,44,10,10,C.woodDark,C.inkLight);shell(g,44,44,10,10,C.woodDark,C.inkLight);
    rect(g,14,47,2,4,C.cream);rect(g,48,47,2,4,C.cream);
    rect(g,6,28,52,18,C.woodDark);rect(g,8,30,48,14,C.cream);rect(g,9,32,46,2,C.sand);
    rect(g,5,10,3,27,C.woodDark);rect(g,55,10,3,27,C.woodDark);
    rect(g,2,7,60,7,C.inkLight);rect(g,5,3,54,5,C.inkLight);rect(g,9,0,46,4,C.inkLight);
    for(let i=0;i<7;i++){const x=4+i*8,c=i%2?C.white:C.pink;rect(g,x,7,8,6,c);rect(g,x+2,4,6,4,c);rect(g,x+4,1,4,3,c);rect(g,x,13,7,3,c);}
    [13,27,42].forEach((x,i)=>{rect(g,x,25,10,6,C.rose);rect(g,x+2,20,2,6,C.leafDark);rect(g,x+4,18,2,8,C.leafDark);oval(g,x-1,18,6,5,C.leaf);oval(g,x+4,17,7,5,C.leaf);shell(g,x,14,6,6,i%2?C.white:C.pink,C.inkLight);rect(g,x+2,16,2,2,C.cream);});
    rect(g,26,35,14,7,C.pink);heart(g,29,36,C.white);line(g,57,34,63,31,C.woodDark,2);
  }
  function stoneLantern(g) {
    rect(g,6,36,14,4,C.inkLight);rect(g,8,34,10,3,C.shade);rect(g,10,23,6,12,C.inkLight);rect(g,11,24,3,10,C.white);
    rect(g,5,13,16,12,C.inkLight);rect(g,7,15,12,8,C.cream);rect(g,11,14,3,10,C.wood);rect(g,6,19,14,2,C.wood);
    rect(g,2,10,22,4,C.inkLight);rect(g,5,7,16,4,C.shade);rect(g,8,4,10,4,C.white);rect(g,11,1,4,4,C.pink);rect(g,4,10,18,1,C.white);
  }
  function bamboo(g) {
    [[8,9],[20,2],[14,22]].forEach(([x,y],i)=>{rect(g,x,y,4,60-y,C.leafDark);rect(g,x+1,y,2,60-y,C.leaf);for(let n=y+7;n<59;n+=11)rect(g,x,n,4,2,C.inkLight);});
    [[8,17,-1],[21,12,1],[20,31,1],[8,36,-1],[16,44,1]].forEach(([x,y,d])=>{line(g,x,y,x+d*10,y-7,C.leafDark);oval(g,x+d*6-4,y-8,9,4,C.leaf);oval(g,x+d*10-3,y-5,7,3,C.leafDark);});
    oval(g,4,58,24,4,C.shade);
  }
  function parasol(g) {
    oval(g,12,55,34,4,C.shade);rect(g,28,16,3,42,C.woodDark);rect(g,29,20,1,34,C.cream);
    for(let y=0;y<24;y++){const inset=Math.max(0,Math.ceil((23-y)*1.16));rect(g,inset,y+3,58-inset*2,1,C.inkLight);}
    for(let y=1;y<22;y++){const inset=Math.max(1,Math.ceil((23-y)*1.16));rect(g,inset+1,y+3,56-inset*2,1,C.pink);}
    line(g,29,4,5,25,C.white);line(g,29,4,18,25,C.rose);line(g,29,4,42,25,C.white);line(g,29,4,54,25,C.rose);rect(g,28,0,3,6,C.woodDark);
    [5,17,29,41,53].forEach(x=>rect(g,x,25,2,3,C.rose));
  }
  function cushion(g) {
    rect(g,2,5,24,10,C.inkLight);rect(g,0,7,28,6,C.inkLight);rect(g,2,4,24,9,C.pink);rect(g,4,3,20,2,C.white);rect(g,3,12,22,2,C.rose);
    line(g,4,6,9,10,C.white);line(g,23,6,18,10,C.white);heart(g,10,5,C.white);
  }
  function wateringcan(g) {
    shell(g,8,8,14,13,C.pink,C.inkLight);shell(g,17,4,7,11,C.white,C.inkLight);rect(g,17,8,3,10,C.pink);
    line(g,9,15,3,8,C.inkLight,3);line(g,9,14,3,7,C.cream,2);rect(g,0,5,6,3,C.inkLight);rect(g,1,5,4,1,C.white);
    rect(g,11,6,7,3,C.inkLight);rect(g,12,7,5,1,C.cream);heart(g,11,12,C.white);
  }
  function signpost(g) {
    rect(g,11,12,4,19,C.woodDark);rect(g,12,14,1,16,C.cream);rect(g,8,30,10,2,C.shade);
    rect(g,1,3,20,13,C.inkLight);rect(g,0,6,25,7,C.inkLight);rect(g,2,4,18,11,C.cream);rect(g,20,7,4,5,C.cream);
    heart(g,6,6,C.rose);line(g,15,9,20,9,C.woodDark);line(g,18,7,20,9,C.woodDark);line(g,18,11,20,9,C.woodDark);
  }
  function hydrangea(g) {
    oval(g,1,20,36,9,C.leafDark);oval(g,2,18,18,8,C.leaf);oval(g,20,19,16,8,C.leaf);
    [[5,10],[17,6],[24,13],[12,16]].forEach(([x,y],i)=>{shell(g,x,y,13,12,i%2?C.pink:C.shade,C.inkLight);[[3,3],[8,4],[5,8]].forEach(([dx,dy])=>{rect(g,x+dx,y+dy,3,1,C.white);rect(g,x+dx+1,y+dy-1,1,3,C.white);});});
  }
  function dressedBunny(g,kind,blink=false) {
    bunny(g,'down',-1,blink);
    const kimono=kind==='bunny-kimono';
    rect(g,10,29,14,7,C.ink);rect(g,11,29,12,6,kimono?C.pink:C.leaf);
    rect(g,7,29,5,4,kimono?C.rose:C.leafDark);rect(g,23,29,4,4,kimono?C.rose:C.leafDark);
    if(kimono){
      line(g,12,29,18,33,C.white);line(g,22,29,18,33,C.white);
      rect(g,11,33,13,2,C.deep);rect(g,16,32,4,3,C.cream);
      rect(g,24,12,5,2,C.rose);rect(g,25,11,3,4,C.pink);rect(g,26,12,1,1,C.cream);
    }else{
      rect(g,13,29,2,3,C.cream);rect(g,20,29,2,3,C.cream);
      rect(g,14,32,8,4,C.cream);rect(g,16,33,4,2,C.wood);
      rect(g,5,13,25,2,C.woodDark);rect(g,7,11,21,2,C.cream);rect(g,10,9,15,3,C.sand);
      rect(g,9,12,17,1,C.rose);
    }
  }
  function woodland(g,kind,blink=false) {
    const bear=kind==='bear';
    if(bear){
      shell(g,5,2,9,9,C.sand);shell(g,21,2,9,9,C.sand);
      oval(g,8,4,4,4,C.pink);oval(g,23,4,4,4,C.pink);
      shell(g,7,21,20,13,C.sand);shell(g,6,30,9,5,C.sand);shell(g,21,30,9,5,C.sand);
      shell(g,3,7,28,21,C.sand);oval(g,10,17,16,9,C.cream);
      rect(g,8,27,20,3,C.pink);rect(g,22,29,4,5,C.rose);
      shell(g,3,25,6,7,C.sand);shell(g,26,25,5,7,C.sand);
    }else{
      for(let i=0;i<7;i++){rect(g,4+i*4,8+Math.abs(i-3)*2,3,13,C.woodDark);}
      shell(g,2,9,29,19,C.wood);shell(g,7,13,23,14,C.cream);
      shell(g,7,23,7,5,C.sand);shell(g,23,23,7,5,C.sand);
      rect(g,3,20,5,3,C.rose);rect(g,4,23,3,4,C.pink);
      rect(g,13,7,5,2,C.leafDark);rect(g,15,5,6,2,C.leaf);
    }
    const y=bear?15:18;
    [11,23].forEach(x=>{rect(g,x,y,2,blink?1:3,C.ink);if(!blink)rect(g,x,y,1,1,C.white);});
    rect(g,17,y+5,3,2,C.ink);rect(g,18,y+7,1,1,C.ink);
    oval(g,7,y+5,4,2,C.pink);oval(g,25,y+5,4,2,C.pink);
  }
  const painters={letter:g=>envelope(g), 'letter-open':g=>envelope(g,true),sakura,bush,stone,flower,lantern,house,bench,bridge,torii,
    'read-check':readCheck,mailbox,picnic,flowerbed,bunting,flowerpot,teatable,ema,'ema-tag':emaTag,windchime,
    flowercart,'stone-lantern':stoneLantern,bamboo,parasol,cushion,wateringcan,signpost,hydrangea,
    fox:g=>animal(g,'fox'),cat:g=>animal(g,'cat'),bird:g=>animal(g,'bird')};
  for(const kind of ['bunny-kimono','bunny-gardener','bear','hedgehog']){
    const paint=kind.startsWith('bunny')?dressedBunny:woodland;
    painters[kind]=g=>paint(g,kind,false);
    sizes[kind+'-blink']=sizes[kind];painters[kind+'-blink']=g=>paint(g,kind,true);
  }
  function build(scene) {
    Object.entries(painters).forEach(([key,paint])=>{
      if(scene.textures.exists(key))return;
      const [w,h]=sizes[key], texture=scene.textures.createCanvas(key,w,h),g=texture.getContext();
      g.imageSmoothingEnabled=false;paint(g);texture.refresh();
    });
    if(!scene.textures.exists('bunny')) {
      const texture=scene.textures.createCanvas('bunny',32*18,40),g=texture.getContext();g.imageSmoothingEnabled=false;
      ['down','left','right','up'].forEach((dir,d)=>{for(let f=0;f<4;f++){g.save();g.translate((d*4+f)*32,0);bunny(g,dir,f);g.restore();texture.add(d*4+f,0,(d*4+f)*32,0,32,40);}});
      for(let n=16;n<18;n++){g.save();g.translate(n*32,0);bunny(g,'down',-1,n===17);g.restore();texture.add(n,0,n*32,0,32,40);}texture.refresh();
    }
    ['down','left','right','up'].forEach((dir,d)=>{
      const key='bunny-walk-'+dir;if(!scene.anims.exists(key))scene.anims.create({key,frames:[0,1,2,3].map(f=>({key:'bunny',frame:d*4+f})),frameRate:9,repeat:-1});
    });
    if(!scene.anims.exists('bunny-idle'))scene.anims.create({key:'bunny-idle',frames:[{key:'bunny',frame:16,duration:2400},{key:'bunny',frame:17,duration:130},{key:'bunny',frame:16,duration:1900}],repeat:-1});
    for(const kind of ['bunny-kimono','bunny-gardener','cat','fox','bird','bear','hedgehog']){
      const texture=scene.textures.createCanvas('hero-'+kind,32*6,40),g=texture.getContext();
      g.imageSmoothingEnabled=false;
      for(let f=0;f<6;f++){
        g.save();const [w,h]=sizes[kind];g.translate(f*32+(32-w)/2,38-h-(f<4&&f%2?2:0));
        if(kind.startsWith('bunny'))dressedBunny(g,kind,f===5);
        else if(kind==='bear'||kind==='hedgehog')woodland(g,kind,f===5);
        else animal(g,kind,f===5);
        g.restore();texture.add(f,0,f*32,0,32,40);
      }texture.refresh();
    }
    return sizes;
  }
  const cache={};
  function portraitCanvas(friendId,talking=false,stamp=0) {
    const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    // Solid, quiet portrait tile. No faux vector badge or glow.
    rect(g,3,0,58,64,C.cream);rect(g,0,3,64,58,C.cream);
    rect(g,4,57,56,4,C.pink);rect(g,8,61,48,3,C.pink);
    const blink=Math.floor((Number(stamp)||0)/130)%29===28;
    const mouth=talking&&(Math.floor((Number(stamp)||0)/150)%2===0);
    g.save();
    if(friendId==='plush'||friendId==='bunny'||!friendId){g.scale(2,2);bunny(g,'down',-1,blink,mouth);}
    else{const kind=friendId==='mira'?'fox':friendId==='tisha'?'cat':'bird', [w,h]=sizes[kind];g.translate((64-w*2)/2,64-h*2);g.scale(2,2);animal(g,kind,blink,mouth);}
    g.restore();return c;
  }
  function portrait(friendId='plush',talking=false) {
    const key=friendId+':'+talking;if(!cache[key])cache[key]=portraitCanvas(friendId,talking,0).toDataURL();return cache[key];
  }
  function drawPortrait(ctx,friendId='plush',stamp=0,talking=false) {
    const canvas=portraitCanvas(friendId,talking,stamp),w=ctx.canvas.width,h=ctx.canvas.height;
    ctx.save();ctx.imageSmoothingEnabled=false;const s=Math.min(w,h)/64;
    ctx.clearRect(0,0,w,h);ctx.drawImage(canvas,Math.floor((w-64*s)/2),Math.floor((h-64*s)/2),64*s,64*s);ctx.restore();
  }
  function canvasFor(name) {
    if(!sizes[name])throw new Error('Unknown pixel sprite: '+name);
    const canvas=document.createElement('canvas'),[w,h]=sizes[name];canvas.width=name==='bunny'?32*18:w;canvas.height=h;
    const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
    if(name==='bunny') {
      ['down','left','right','up'].forEach((dir,d)=>{for(let f=0;f<4;f++){g.save();g.translate((d*4+f)*32,0);bunny(g,dir,f);g.restore();}});
      for(let n=16;n<18;n++){g.save();g.translate(n*32,0);bunny(g,'down',-1,n===17);g.restore();}
    } else painters[name](g);
    return canvas;
  }
  function icon(name) {return canvasFor(name).toDataURL();}
  function exportAtlas() {
    // Each source is independently exportable; the bunny sheet uses Phaser's usual
    // untrimmed spritesheet frame format. This object is usable by other engines.
    const images=Object.fromEntries(Object.keys(sizes).map(name=>[name,icon(name)]));
    return {images,sizes,frameWidth:32,frameHeight:40,frames:18,
      animations:{down:[0,1,2,3],left:[4,5,6,7],right:[8,9,10,11],up:[12,13,14,15],idle:[16],blink:[17]},palette:C};
  }
  return {build,portrait,drawPortrait,icon,canvasFor,exportAtlas,palette:C,sizes,drawBunny:bunny,drawAnimal:animal};
})();
globalThis.PixelSprites=PixelSprites;
