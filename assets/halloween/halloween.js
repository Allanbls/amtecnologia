/* AM Tecnologia: corda do modo noite + tema Halloween (vídeo de fundo e invasão de fantasmas) */
(()=>{
const HW_ATIVO = true;               // false = desliga o vídeo e os fantasmas (a corda continua funcionando)

const body=document.body;
const calmo=matchMedia('(prefers-reduced-motion: reduce)');

/* ================= CORDA ================= */
const th=document.getElementById('theme');
const pull=document.getElementById('hw-pull');
const tip=document.getElementById('hw-tip');
if(th && pull){
  const MAX=70, LIMIAR=26;
  let y0=null, dist=0, moved=false, tipTimer;
  const set=v=>pull.style.setProperty('--p',v+'px');
  const jaPuxou=()=>{try{return localStorage.getItem('am-corda')==='1'}catch(e){return false}};
  const marcar=()=>{try{localStorage.setItem('am-corda','1')}catch(e){}};
  const tipTexto=on=>on?'Puxe de novo para voltar ao <em>modo dia</em>':'Puxe a corda para o <em>modo Halloween</em>';

  // balão só para quem nunca puxou
  if(tip && !jaPuxou()){
    tip.hidden=false;
    setTimeout(()=>tip.classList.add('show'),1200);
    setTimeout(()=>{ if(!jaPuxou()) esconderTip(0); },9000);   // não fica tapando o título
  }
  function esconderTip(depois){
    if(!tip||tip.hidden) return;
    clearTimeout(tipTimer);
    tipTimer=setTimeout(()=>{tip.classList.remove('show');setTimeout(()=>tip.hidden=true,300);},depois);
  }
  function sync(){
    const on=body.classList.contains('dark');
    pull.setAttribute('aria-pressed',on);
    pull.setAttribute('aria-label',on?'Puxe a corda para voltar ao modo dia':'Puxe a corda para o modo Halloween');
    if(tip) tip.querySelector('.t').innerHTML=tipTexto(on);
  }
  function alterna(){
    th.checked=!th.checked;
    th.dispatchEvent(new Event('change',{bubbles:true}));   // usa a troca de tema que o site já tem
    sync(); marcar(); esconderTip(2600);
    if(body.classList.contains('dark')) invasao();
  }
  function solta(){
    pull.classList.add('back'); set(0);
    setTimeout(()=>pull.classList.add('idle'),550);
  }
  function puxadinha(){ pull.classList.remove('back','idle'); set(34); setTimeout(()=>{alterna();solta();},130); }

  pull.addEventListener('pointerdown',e=>{y0=e.clientY;dist=0;moved=false;pull.setPointerCapture(e.pointerId);pull.classList.remove('back','idle');});
  pull.addEventListener('pointermove',e=>{
    if(y0===null) return;
    const d=Math.max(0,e.clientY-y0);
    if(d>4) moved=true;
    dist=d>MAX?MAX+(d-MAX)*.2:d;      // resistência no fim da corda
    set(dist);
  });
  pull.addEventListener('pointerup',()=>{
    if(y0===null) return; y0=null;
    if(!moved){ set(0); puxadinha(); return; }  // toque simples também funciona
    if(dist>=LIMIAR) alterna();
    solta();
  });
  pull.addEventListener('pointercancel',()=>{y0=null;solta();});
  pull.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();puxadinha();}});
  pull.addEventListener('click',e=>e.preventDefault());
  new MutationObserver(sync).observe(body,{attributes:true,attributeFilter:['class']});
  sync();
}

/* ============ INVASÃO DE FANTASMAS ============ */
// um único desenho reaproveitado por todos os fantasmas (leve mesmo com 200)
const GHOST_SRC='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 58"><path d="M28 4c11 0 18 9 18 21v26l-5-4-5 5-5-5-5 5-5-5-5 4V25C10 13 17 4 28 4z" fill="#fff" stroke="#2B2A2A" stroke-width="2.5"/><ellipse cx="22" cy="23" rx="3" ry="4" fill="#2B2A2A"/><ellipse cx="34" cy="23" rx="3" ry="4" fill="#2B2A2A"/><ellipse cx="28" cy="33" rx="3.5" ry="4.5" fill="#2B2A2A"/></svg>');
const INVASAO_MS=20000;            // duração total da invasão
let invadindo=false;
function invasao(){
  if(!HW_ATIVO || calmo.matches || invadindo) return;
  invadindo=true;
  const box=document.createElement('div');box.id='hw-invasao';box.setAttribute('aria-hidden','true');
  document.body.appendChild(box);
  const vw=innerWidth, vh=innerHeight, mob=vw<700;
  const qtd=mob?120:200, R=(a,b)=>a+Math.random()*(b-a);
  const anims=[];
  for(let i=0;i<qtd;i++){
    const s=R(mob?.45:.5, mob?1.2:1.7);
    const el=new Image();el.src=GHOST_SRC;el.alt='';el.decoding='async';
    el.style.width=(56*s)+'px';el.style.opacity=R(.65,1).toFixed(2);
    box.appendChild(el);
    const ladoE=Math.random()<.5;
    const x0=ladoE?-110:vw+30, x1=ladoE?vw+110:-160;
    const pts=5+Math.floor(R(0,3)), flip=ladoE?1:-1;
    const kf=[];
    for(let k=0;k<=pts;k++){
      const t=k/pts;
      kf.push({transform:`translate(${x0+(x1-x0)*t+R(-70,70)}px,${R(vh*.02,vh*.9)}px) rotate(${R(-25,25)}deg) scaleX(${flip})`,offset:t});
    }
    const dur=R(5000,7500);
    const delay=R(0,INVASAO_MS-dur-300);   // vão chegando ao longo dos 20 s
    anims.push(el.animate(kf,{duration:dur,delay,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'both'}));
  }
  // entrada/saída suave da invasão como um todo
  box.animate([{opacity:0},{opacity:1,offset:.03},{opacity:1,offset:.95},{opacity:0}],{duration:INVASAO_MS,fill:'both'});
  const acabar=()=>{anims.forEach(a=>a.cancel());box.remove();invadindo=false;};
  const t=setTimeout(acabar,INVASAO_MS+100);
  // se a pessoa voltar para o modo dia, os fantasmas vão embora
  const obs=new MutationObserver(()=>{ if(!body.classList.contains('dark')){clearTimeout(t);obs.disconnect();box.animate([{opacity:1},{opacity:0}],{duration:250,fill:'forwards'}).onfinish=acabar;} });
  obs.observe(body,{attributes:true,attributeFilter:['class']});
}

/* ============ VÍDEO DE FUNDO ============ */
if(!HW_ATIVO) return;
const VIDEO='assets/halloween/fundo-halloween.mp4';
const bg=document.getElementById('hw-bg');
if(!bg) return;
const video=bg.querySelector('video');
let ligado=false, pausa;
function tocar(){
  if(calmo.matches || document.hidden) return;   // movimento reduzido: fica só a imagem
  const p=video.play(); if(p&&p.catch) p.catch(()=>{});
}
function ligar(){
  if(ligado) return; ligado=true;
  clearTimeout(pausa);
  if(!video.src){ video.src=VIDEO; video.load(); } // só baixa o vídeo quando o modo noite é usado
  body.classList.add('hw');
  tocar();
}
function desligar(){
  if(!ligado) return; ligado=false;
  body.classList.remove('hw');
  pausa=setTimeout(()=>video.pause(),300);
}
const ver=()=>body.classList.contains('dark')?ligar():desligar();
new MutationObserver(ver).observe(body,{attributes:true,attributeFilter:['class']});
ver();
document.addEventListener('visibilitychange',()=>{ if(!ligado) return; document.hidden?video.pause():tocar(); });
})();
