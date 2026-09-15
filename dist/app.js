const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#navigation');
const conceptNotice=document.querySelector('#concept-notice');
const conceptNoticeButton=document.querySelector('.concept-notice-button');
if(conceptNotice&&conceptNoticeButton&&typeof conceptNotice.showModal==='function'){
  conceptNotice.showModal();
  document.body.style.overflow='hidden';
  conceptNoticeButton.addEventListener('click',()=>conceptNotice.close());
  conceptNotice.addEventListener('close',()=>{document.body.style.overflow='';});
}
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const dialog=document.querySelector('.video-dialog');
document.addEventListener('click',e=>{const trigger=e.target.closest('[data-video]');if(!trigger)return;const id=trigger.dataset.video;if(!/^[\w-]{11}$/.test(id))return;document.querySelector('#video-title').textContent=trigger.dataset.title;const iframe=document.createElement('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;iframe.title=trigger.dataset.title;iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;document.querySelector('#video-container').replaceChildren(iframe);document.querySelector('#youtube-fallback').href=`https://www.youtube.com/watch?v=${id}`;dialog.showModal();document.body.style.overflow='hidden';});
document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.querySelector('#video-container').replaceChildren();document.body.style.overflow='';});

// A galeria mantém todos os depoimentos acessíveis sem reprodução automática.
const gallery=document.querySelector('#story-gallery');
const cards=[...gallery.querySelectorAll('.story')];
const galleryControls=document.querySelector('.gallery-controls');
const previousStory=document.querySelector('#story-prev');
const nextStory=document.querySelector('#story-next');
const storyPosition=document.querySelector('#story-position');
const mobileView=window.matchMedia('(max-width: 740px)');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

// Expansões suaves mantêm o contexto visual sem esconder conteúdo de quem reduz movimento.
document.querySelectorAll('details').forEach(detail=>{
  const summary=detail.querySelector(':scope > summary');
  if(!summary)return;
  summary.addEventListener('click',event=>{
    if(reducedMotion.matches||typeof detail.animate!=='function')return;
    event.preventDefault();
    if(detail.classList.contains('is-animating'))return;
    const closing=detail.open;
    const startHeight=detail.offsetHeight;
    if(!closing)detail.open=true;
    const endHeight=closing?summary.offsetHeight:detail.offsetHeight;
    detail.classList.add('is-animating',closing?'is-closing':'is-opening');
    detail.style.height=`${startHeight}px`;
    detail.style.overflow='clip';
    const content=[...detail.children].filter(child=>child!==summary);
    content.forEach(child=>child.animate(
      closing
        ?[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}]
        :[{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:closing?170:240,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}
    ));
    const animation=detail.animate(
      [{height:`${startHeight}px`},{height:`${endHeight}px`}],
      {duration:closing?240:320,easing:'cubic-bezier(.22,1,.36,1)'}
    );
    animation.addEventListener('finish',()=>{
      if(closing)detail.open=false;
      detail.classList.remove('is-animating','is-closing','is-opening');
      detail.style.height='';
      detail.style.overflow='';
    },{once:true});
  });
});
function storyStep(){return cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:gallery.clientWidth;}
function currentStory(){return Math.max(0,Math.min(cards.length-1,Math.round(gallery.scrollLeft/Math.max(1,storyStep()))));}
function updateGallery(){
  galleryControls.hidden=!mobileView.matches;
  const index=currentStory();
  previousStory.disabled=index===0;
  nextStory.disabled=index===cards.length-1;
  const label=`${index+1} de ${cards.length}`;
  if(storyPosition.textContent!==label)storyPosition.textContent=label;
}
function goToStory(index){gallery.scrollTo({left:Math.max(0,Math.min(cards.length-1,index))*storyStep(),behavior:reducedMotion.matches?'instant':'smooth'});}
previousStory.addEventListener('click',()=>goToStory(currentStory()-1));
nextStory.addEventListener('click',()=>goToStory(currentStory()+1));
gallery.addEventListener('keydown',event=>{
  if(!mobileView.matches||event.target!==gallery)return;
  const targets={ArrowLeft:currentStory()-1,ArrowRight:currentStory()+1,Home:0,End:cards.length-1};
  if(Object.hasOwn(targets,event.key)){event.preventDefault();goToStory(targets[event.key]);}
});
let galleryScrollTimer;
gallery.addEventListener('scroll',()=>{clearTimeout(galleryScrollTimer);galleryScrollTimer=setTimeout(updateGallery,100);},{passive:true});
if('ResizeObserver' in window)new ResizeObserver(updateGallery).observe(gallery);
mobileView.addEventListener('change',updateGallery);
updateGallery();

// O atalho aparece apenas quando o visitante está longe dos botões principais.
const applicationBar=document.querySelector('.mobile-application');
const hero=document.querySelector('.hero');
const application=document.querySelector('#aplicacao');
const footer=document.querySelector('footer');
function inViewport(element){const r=element.getBoundingClientRect();return r.top<window.innerHeight&&r.bottom>80;}
function updateApplicationBar(){
  const visible=mobileView.matches&&hero.getBoundingClientRect().bottom<=80&&!inViewport(application)&&!inViewport(footer)&&!dialog.open&&menu.getAttribute('aria-expanded')!=='true';
  applicationBar.hidden=!visible;
  applicationBar.inert=!visible;
  document.body.classList.toggle('mobile-cta-active',visible);
}
if('IntersectionObserver' in window){
  const visibilityObserver=new IntersectionObserver(updateApplicationBar,{rootMargin:'-80px 0px 0px 0px',threshold:0});
  [hero,application,footer].forEach(section=>visibilityObserver.observe(section));
  mobileView.addEventListener('change',updateApplicationBar);
  menu.addEventListener('click',updateApplicationBar);
  nav.addEventListener('click',updateApplicationBar);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')updateApplicationBar();});
  document.addEventListener('click',event=>{if(event.target.closest('[data-video]'))updateApplicationBar();});
  dialog.addEventListener('close',updateApplicationBar);
  updateApplicationBar();
}
