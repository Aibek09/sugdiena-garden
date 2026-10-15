/* «Письма под сакурой» — original instrumental miniature for this garden.
   No recordings, remote streams or third-party musical works. 58 BPM, D pentatonic.
   Audio is created only after a user gesture; silence is the default. */
const GardenMusic=(()=>{
  'use strict';
  const beat=60/58,bars=16,loopLength=bars*4*beat;
  const harmony=[[50,57,61,66],[47,54,57,62],[43,50,54,59],[45,52,55,59]];
  // [beat offset, MIDI pitch, duration in beats]. Rests leave room to read.
  const phrases=[
    [[0,74,1.5],[2,76,1],[3,78,.75]],
    [[0,81,2],[2.5,78,1]],
    [[.5,76,1],[2,74,1.5]],
    [[0,71,1.5],[2,69,1.5]],
    [[0,74,1],[1.5,78,1],[3,81,.75]],
    [[0,83,2],[2.5,81,1]],
    [[.5,78,1.5],[2.5,76,1]],
    [[0,74,3]],
    [[0,69,1],[1.5,74,1],[3,76,.75]],
    [[0,78,2],[2.5,76,1]],
    [[0,74,1.5],[2,71,1.5]],
    [[.5,69,2.5]],
    [[0,74,1],[1.5,76,1],[3,78,.75]],
    [[0,81,1.5],[2,78,1]],
    [[.5,76,1],[2,74,1]],
    [[0,74,2.5]]
  ];
  const score=[];
  for(let bar=0;bar<bars;bar++){
    const chord=harmony[bar%4];
    // Sparse low strings answer the melody rather than a constant music-box pulse.
    chord.forEach((pitch,i)=>score.push({at:(bar*4+i*.045)*beat,pitch,duration:3.9*beat,volume:.055,voice:'pad',pan:(i-1.5)*.12}));
    [[0,chord[0],.12],[2.6,chord[2],.06]].forEach(([offset,pitch,volume])=>score.push({at:(bar*4+offset)*beat,pitch,duration:3*beat,volume,voice:'koto',pan:-.25}));
    phrases[bar].filter((_,i)=>i<2).forEach(([offset,pitch,duration])=>score.push({at:(bar*4+offset+.12)*beat,pitch:pitch-12,duration:(duration+.5)*beat,volume:.13,voice:'koto',pan:.2}));
    [0,2.12].forEach(offset=>score.push({at:(bar*4+offset)*beat,pitch:33,duration:.24,volume:.075,voice:'kick',pan:0}));
  }
  score.sort((a,b)=>a.at-b.at);
  let context=null,master=null,bus=null,enabled=false,started=false,clock=null,cursor=0,cycleStart=0,volume=.55;
  const cache=new Map();
  const frequency=pitch=>440*2**((pitch-69)/12);
  function pluck(pitch,duration,sampleRate){
    const length=Math.ceil(duration*sampleRate),samples=new Float32Array(length),period=Math.round(sampleRate/frequency(pitch));
    const ring=new Float32Array(period);let seed=pitch*7919+17;
    for(let i=0;i<period;i++){seed=(seed*16807)%2147483647;ring[i]=(seed/2147483647*2-1)*.65;}
    let last=0;
    for(let i=0;i<length;i++){
      const at=i%period,next=(at+1)%period,value=(ring[at]+ring[next])*.497;
      ring[at]=value;last=last*.15+value*.85;
      const attack=Math.min(1,i/(sampleRate*.006)),tail=Math.min(1,(length-i)/(sampleRate*.1));
      samples[i]=(last*.8+Math.sin(2*Math.PI*frequency(pitch)*i/sampleRate)*.12*Math.exp(-i/sampleRate*2.5))*attack*tail;
    }
    return samples;
  }
  function init(){
    if(context)return;
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Audio unavailable');
    context=new Audio();master=context.createGain();master.gain.value=0;
    const compressor=context.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=3;
    bus=context.createGain();bus.gain.value=.8;
    const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2100;filter.Q.value=.35;
    bus.connect(filter);filter.connect(master);master.connect(compressor);compressor.connect(context.destination);
    const delay=context.createDelay(2),feedback=context.createGain(),wet=context.createGain();
    delay.delayTime.value=beat*.75;feedback.gain.value=.26;wet.gain.value=.24;
    filter.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(master);
  }
  function play(event,when){
    const gain=context.createGain(),pan=context.createStereoPanner();pan.pan.value=event.pan;
    gain.gain.value=event.volume;gain.connect(pan);pan.connect(bus);
    if(event.voice==='kick'){
      const oscillator=context.createOscillator();oscillator.type='sine';
      oscillator.frequency.setValueAtTime(90,when);oscillator.frequency.exponentialRampToValueAtTime(42,when+.16);
      gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(event.volume,when+.012);gain.gain.exponentialRampToValueAtTime(.0001,when+event.duration);
      oscillator.connect(gain);oscillator.start(when);oscillator.stop(when+event.duration);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();pan.disconnect();};
    }else if(event.voice==='koto'){
      const key=event.pitch+':'+event.duration;
      if(!cache.has(key)){const data=pluck(event.pitch,event.duration,context.sampleRate),buffer=context.createBuffer(1,data.length,context.sampleRate);buffer.copyToChannel(data,0);cache.set(key,buffer);}
      const source=context.createBufferSource();source.buffer=cache.get(key);source.connect(gain);source.start(when);source.onended=()=>{source.disconnect();gain.disconnect();pan.disconnect();};
    }else{
      const oscillator=context.createOscillator(),air=context.createOscillator(),airGain=context.createGain();
      oscillator.type='sine';oscillator.frequency.value=frequency(event.pitch);
      const vibrato=context.createOscillator(),vibratoGain=context.createGain();vibrato.frequency.value=4.1;vibratoGain.gain.value=frequency(event.pitch)*.002;
      vibrato.connect(vibratoGain);vibratoGain.connect(oscillator.frequency);
      air.type='sine';air.frequency.value=frequency(event.pitch)*2;airGain.gain.value=.055;air.connect(airGain);airGain.connect(gain);
      gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(event.volume,when+(event.voice==='pad'?.65:.16));
      gain.gain.setValueAtTime(event.volume*.8,when+Math.max(.17,event.duration-.24));gain.gain.linearRampToValueAtTime(0,when+event.duration);
      oscillator.connect(gain);[oscillator,air,vibrato].forEach(o=>{o.start(when);o.stop(when+event.duration+.03)});
      oscillator.onended=()=>{[oscillator,air,vibrato,vibratoGain,airGain,gain,pan].forEach(n=>n.disconnect());};
    }
  }
  function tick(){
    if(!context||!enabled||document.hidden)return;
    while(cycleStart+score[cursor].at<context.currentTime+.32){
      const when=cycleStart+score[cursor].at;
      if(when>=context.currentTime-.02)play(score[cursor],Math.max(when,context.currentTime));
      if(++cursor===score.length){cursor=0;cycleStart+=loopLength;}
    }
  }
  function fade(){if(!master)return;const t=context.currentTime;master.gain.cancelScheduledValues(t);master.gain.setTargetAtTime(enabled&&!document.hidden?volume*.55:0,t,.18);}
  async function unlock(value=enabled){
    const wasEnabled=enabled;enabled=!!value;if(!enabled){fade();return true;}
    try{init();await context.resume();if(!started||!wasEnabled){cursor=0;cycleStart=context.currentTime+.12;}if(!started){started=true;clock=setInterval(tick,120);}fade();tick();return true;}catch(_){enabled=false;fade();return false;}
  }
  function setVolume(value){volume=Math.min(1,Math.max(0,Number(value)||0));fade();}
  function effect(note=0,finish=false){
    if(!enabled||!context||context.state!=='running'||document.hidden)return;
    (finish?[0,4,7]:[0]).forEach((n,i)=>play({voice:'koto',pitch:74+note+n,duration:.7,volume:.1,pan:0},context.currentTime+i*.12));
  }
  if(typeof document!=='undefined'){
    document.addEventListener('visibilitychange',()=>{
      if(!context)return;
      if(!document.hidden&&enabled){cursor=0;cycleStart=context.currentTime+.15;context.resume().catch(()=>{});}
      fade();
    });
    window.addEventListener('pagehide',()=>{enabled=false;fade();clearInterval(clock);});
  }
  return {unlock,setVolume,effect,score,loopLength,pluck,frequency,title:'Письма под сакурой'};
})();
globalThis.GardenMusic=GardenMusic;
