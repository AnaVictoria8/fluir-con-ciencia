// En móvil, el mismo contenido pasa a una tarjeta fija; no se duplican controles ni estados.
export const MOBILE_QUERY='(max-width:800px), (max-height:500px) and (max-width:1100px)';
export function createMobileNavigation({container,onRead=()=>{}}){
 const media=matchMedia(MOBILE_QUERY),panel=document.getElementById('infoPanel'),main=panel.parentElement;
 const dock=document.getElementById('moduleDock'),details=document.getElementById('moduleDetails'),toggle=document.getElementById('toggleModule'),backdrop=document.getElementById('moduleBackdrop');
 const menu=document.querySelector('.more-views'),menuBody=menu.querySelector(':scope > div');
 const extras=document.getElementById('mobileExtras');
 const slots={stations:document.getElementById('mobileStations'),actions:document.getElementById('mobileActions')};
 const transfers=[
  ['stationRail',slots.stations],['quickAudio',slots.actions],['tour3d',slots.actions],['stopWalk',slots.actions],
  ['overview',menuBody],['.tools',menuBody],['.manual-controls',menuBody],['.place-card',extras],['.settings',extras],['.measure-card',extras],['.sources',extras],['.caption',extras],['.attribution',extras]
 ].map(([selector,target])=>{
  const node=selector.startsWith('.')?document.querySelector(selector):document.getElementById(selector),marker=document.createComment('Posición de escritorio');
  node.before(marker);return {node,marker,target};
 });
 let expanded=false,timer=0;
 function sizeDock(){
  if(!media.matches||expanded)return;
  main.style.setProperty('--mobile-dock-height',Math.ceil(panel.getBoundingClientRect().height)+'px');
 }
 function setExpanded(on){
  const wasExpanded=expanded;expanded=media.matches&&on;
  if(!expanded&&details.contains(document.activeElement))toggle.focus({preventScroll:true});
  panel.classList.toggle('module-open',expanded);main.classList.toggle('module-open',expanded);
  details.hidden=media.matches&&!expanded;backdrop.hidden=!expanded;container.inert=expanded;
  toggle.setAttribute('aria-expanded',String(expanded));toggle.textContent=expanded?'Volver ↓':'Leer stand ↑';
  toggle.setAttribute('aria-label',expanded?'Cerrar ficha y volver al mapa':'Leer información del stand');
  if(expanded){menu.open=false;details.scrollTop=0;if(!wasExpanded)onRead();}else sizeDock();
 }
 function apply(){
  document.body.classList.toggle('mobile-nav',media.matches);
  for(const {node,marker,target}of transfers){if(media.matches)target.appendChild(node);else marker.after(node);}
  // La vista de conjunto se ofrece con el resto de las vistas dentro del menú.
  if(media.matches){menuBody.prepend(document.getElementById('overview'));menuBody.append(document.getElementById('mobileSiteDetails'));}
  setExpanded(false);menu.open=false;
  if(!media.matches)container.classList.remove('status-visible');
 }
 function close(){setExpanded(false);menu.open=false;}
 toggle.onclick=()=>setExpanded(!expanded);backdrop.onclick=close;
 menu.addEventListener('toggle',()=>{if(menu.open)container.classList.remove('status-visible');});
 document.addEventListener('pointerdown',event=>{
  if(!media.matches||!menu.open)return;
  if(!menu.contains(event.target))menu.open=false;
 });
 container.querySelector('#canvasHost').addEventListener('pointerdown',()=>container.classList.remove('status-visible'));
 new ResizeObserver(sizeDock).observe(dock);
 media.addEventListener('change',apply);apply();
 return {
  get matches(){return media.matches;},close,
  dismiss(){if(expanded){close();return true;}if(menu.open){menu.open=false;return true;}return false;},
  notice(){
   if(!media.matches)return;clearTimeout(timer);container.classList.add('status-visible');
   timer=setTimeout(()=>container.classList.remove('status-visible'),4500);
  }
 };
}
