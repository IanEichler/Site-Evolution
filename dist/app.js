const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const dialog=document.querySelector('.video-dialog');
document.addEventListener('click',e=>{const trigger=e.target.closest('[data-video]');if(!trigger)return;const id=trigger.dataset.video;if(!/^[\w-]{11}$/.test(id))return;document.querySelector('#video-title').textContent=trigger.dataset.title;const iframe=document.createElement('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;iframe.title=trigger.dataset.title;iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;document.querySelector('#video-container').replaceChildren(iframe);document.querySelector('#youtube-fallback').href=`https://www.youtube.com/watch?v=${id}`;dialog.showModal();document.body.style.overflow='hidden';});
document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.querySelector('#video-container').replaceChildren();document.body.style.overflow='';});
