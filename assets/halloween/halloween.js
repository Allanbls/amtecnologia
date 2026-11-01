/* Tema Halloween da AM Tecnologia: no modo escuro o fundo vira um vídeo */
(()=>{
const HW_ATIVO = true;               // false = desliga o tema de Halloween
if(!HW_ATIVO) return;

const VIDEO='assets/halloween/fundo-halloween.mp4';
const body=document.body, bg=document.getElementById('hw-bg');
if(!bg) return;
const video=bg.querySelector('video');
const calmo=matchMedia('(prefers-reduced-motion: reduce)');
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
  pausa=setTimeout(()=>video.pause(),300);         // pausa depois do fade de saída
}

// acompanha a troca de tema que o site já faz (classe .dark no body)
const ver=()=>body.classList.contains('dark')?ligar():desligar();
new MutationObserver(ver).observe(body,{attributes:true,attributeFilter:['class']});
ver();

// não gasta bateria com a aba escondida
document.addEventListener('visibilitychange',()=>{ if(!ligado) return; document.hidden?video.pause():tocar(); });
})();
