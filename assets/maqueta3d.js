import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { createNavigation } from './visitor-navigation.js?v=20261015-5';
import { ACCESS_AREAS, STAND_LAYOUT, pathWidth, createWalkingSurface } from './garden-layout.js?v=20261015-5';
import { createAudioGuide } from './audio-guide.js';
import { stationFrame } from './station-framing.js?v=20261015-5';
import { createGardenMaterials, createGardenEnvironment } from './garden-environment.js?v=20261015-5';

const {MODULES}=window.WATER_MAP_DATA;
const host=document.getElementById('canvasHost'),container=document.getElementById('scene');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const scene=new THREE.Scene();scene.background=new THREE.Color('#dce7e4');scene.fog=new THREE.Fog('#dce7e4',180,340);
const camera=new THREE.PerspectiveCamera(43,1,.08,400);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Vista 3D: toca para caminar, arrastra para mirar, rueda o pellizco para acercar. Flechas o WASD para caminar.');renderer.domElement.tabIndex=0;renderer.domElement.style.cursor='grab';
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('fallback').hidden=false;});
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.10;controls.panSpeed=.9;controls.rotateSpeed=.65;controls.screenSpacePanning=false;controls.zoomToCursor=false;
controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
controls.minDistance=3.8;controls.maxDistance=320;controls.maxPolarAngle=Math.PI/2-.025;controls.minPolarAngle=.03;controls.autoRotateSpeed=.35;
controls.target.set(12,0,-2);camera.position.set(57,57,70);controls.update();
scene.add(new THREE.HemisphereLight('#e9f1ff','#68764d',1.9));
const sun=new THREE.DirectionalLight('#fff1d5',2.6);sun.position.set(-35,95,30);sun.castShadow=true;
sun.target.position.set(25,0,35);scene.add(sun.target);
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-100,right:100,top:110,bottom:-110,near:1,far:250});sun.shadow.bias=-.0005;sun.shadow.normalBias=.03;scene.add(sun);
const gardenMaterials=createGardenMaterials(THREE,renderer);
const material=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:.84,...opts});
const mat={wood:material('#bd9870'),ivory:material('#fff9eb'),post:material('#e4dac4'),dark:material('#173e38'),sand:material('#b6a686'),water:material('#47b7bd',{roughness:.25,metalness:.12}),glass:material('#76d4dc',{transparent:true,opacity:.65,roughness:.2})};
function mesh(geometry,mat,parent=scene){const m=new THREE.Mesh(geometry,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,x,y,z,mat,parent){const m=mesh(new THREE.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;}
function cylinder(rt,rb,h,x,y,z,mat,parent,segments=12){const m=mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat,parent);m.position.set(x,y,z);return m;}
function sphere(r,x,y,z,mat,parent){const m=mesh(new THREE.SphereGeometry(r,12,8),mat,parent);m.position.set(x,y,z);return m;}
// Metros locales: este (+x), sur (+z), origen en una intersección de senderos OSM.
const ORIGIN={lat:-35.4058339,lon:-71.631515},R=6371008.8;
const project=([lon,lat])=>[(lon-ORIGIN.lon)*Math.PI/180*R*Math.cos(ORIGIN.lat*Math.PI/180),-(lat-ORIGIN.lat)*Math.PI/180*R];
const BOUNDS={xmin:-45,xmax:108,zmin:-68,zmax:138};
const groundWidth=BOUNDS.xmax-BOUNDS.xmin,groundCenter=(BOUNDS.xmax+BOUNDS.xmin)/2;
const ground=box(groundWidth,.65,206,groundCenter,-.365,35,material('#7d8265'));
const floor=box(groundWidth-.2,.03,205.8,groundCenter,-.022,35,gardenMaterials.ground);
floor.castShadow=false;
const backdrop=mesh(new THREE.PlaneGeometry(1200,1200),material('#eaf0e5'));backdrop.rotation.x=-Math.PI/2;backdrop.position.y=-.72;backdrop.castShadow=false;
const paths=new THREE.Group(),waters=new THREE.Group(),trees=new THREE.Group(),people=new THREE.Group(),staff=new THREE.Group(),standRoot=new THREE.Group();scene.add(paths,waters,trees,people,staff,standRoot);
const pathMat=gardenMaterials.path;
function clipSegment(a,b){
 let t0=0,t1=1;const dx=b[0]-a[0],dz=b[1]-a[1];
 for(const [p,q] of [[-dx,a[0]-BOUNDS.xmin],[dx,BOUNDS.xmax-a[0]],[-dz,a[1]-BOUNDS.zmin],[dz,BOUNDS.zmax-a[1]]]){
  if(p===0){if(q<0)return null;continue;}const t=q/p;
  if(p<0)t0=Math.max(t0,t);else t1=Math.min(t1,t);if(t0>t1)return null;
 }return [[a[0]+t0*dx,a[1]+t0*dz],[a[0]+t1*dx,a[1]+t1*dz]];
}
function clipPolygon(points){
 let p=points.slice();
 for(const [axis,value,sign] of [[0,BOUNDS.xmin,1],[0,BOUNDS.xmax,-1],[1,BOUNDS.zmin,1],[1,BOUNDS.zmax,-1]]){
  const out=[];for(let i=0;i<p.length;i++){
   const a=p[i],b=p[(i+1)%p.length],ina=(a[axis]-value)*sign>=0,inb=(b[axis]-value)*sign>=0;
   if(ina)out.push(a);if(ina!==inb){const t=(value-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
  }p=out;if(!p.length)break;
 }return p;
}
const geo=await fetch('assets/geo/jardin_osm.geojson').then(r=>{if(!r.ok)throw Error('No se pudo cargar la cartografía');return r.json();});
const localPaths=[],pathSegments=[],pondPolygons=[];
for(const f of geo.features){
 const g=f.geometry;
 if(g.type==='LineString'){
  const pts=g.coordinates.map(project);localPaths.push(pts);
  for(let i=0;i<pts.length-1;i++){
   const clipped=clipSegment(pts[i],pts[i+1]);if(!clipped)continue;const[a,b]=clipped,dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
   const width=pathWidth(f.properties.osmWay,a,b);pathSegments.push({a,b,width,osmWay:f.properties.osmWay});
   const strip=box(width,.045,len,(a[0]+b[0])/2,.014,(a[1]+b[1])/2,pathMat,paths);strip.rotation.y=Math.atan2(dx,dz);strip.castShadow=false;
   for(const [x,z]of [a,b]){const join=cylinder(width/2,width/2,.045,x,.014,z,pathMat,paths,24);join.castShadow=false;}
  }
 }else if(f.properties.natural==='water'){
  const p=clipPolygon(g.coordinates[0].map(project));if(p.length<3)continue;pondPolygons.push(p);
  const shape=new THREE.Shape(p.map(([x,z])=>new THREE.Vector2(x,-z)));
  const pond=mesh(new THREE.ShapeGeometry(shape),gardenMaterials.water,waters);pond.rotation.x=-Math.PI/2;pond.position.y=.065;pond.castShadow=false;
  const outline=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(p.map(([x,z])=>new THREE.Vector3(x,.072,z))),new THREE.LineBasicMaterial({color:'#7e9273'}));waters.add(outline);
 }
}
// Diseño alternativo en coordenadas locales. No son posiciones levantadas en terreno.
const SITES=STAND_LAYOUT.map(s=>s.position);
const onSurface=createWalkingSurface(pathSegments);
const standGroups=[],labelNodes=[],animatedWater=[];
// La marca ocupa casi todo el ancho del pecho y de la espalda.
const dtcCanvas=document.createElement('canvas');dtcCanvas.width=1024;dtcCanvas.height=640;
const dtcContext=dtcCanvas.getContext('2d');
dtcContext.fillStyle='#ffffff';dtcContext.textAlign='center';dtcContext.textBaseline='middle';
dtcContext.font='800 86px Arial, sans-serif';dtcContext.fillText('ESPACIO',512,112);
dtcContext.font='900 360px Arial, sans-serif';dtcContext.fillText('DTC+',512,368,994);
const dtcTexture=new THREE.CanvasTexture(dtcCanvas);dtcTexture.colorSpace=THREE.SRGBColorSpace;dtcTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
const dtcMaterial=new THREE.MeshBasicMaterial({map:dtcTexture,transparent:true,depthWrite:false});
function person(x,z,{monitor=false,variant=0}={}){
 const g=new THREE.Group();(monitor?staff:people).add(g);g.position.set(x,monitor ? .14 : .04,z);
 const shirt=material(monitor?'#ff6805':'#df9b39'),skin=material(monitor?(variant?'#b98159':'#dfb38d'):'#d9b28a'),pants=material(monitor?'#263f43':'#36574e');
 sphere(.14,0,1.56,0,skin,g);box(monitor ? .40 : .34,.54,.21,0,1.15,0,shirt,g);
 if(monitor){
  const front=mesh(new THREE.PlaneGeometry(.395,.29),dtcMaterial,g);front.position.set(0,1.155,.109);front.castShadow=false;front.receiveShadow=false;front.userData.dtcLogo='front';
  const back=mesh(new THREE.PlaneGeometry(.395,.29),dtcMaterial,g);back.position.set(0,1.155,-.109);back.rotation.y=Math.PI;back.castShadow=false;back.receiveShadow=false;back.userData.dtcLogo='back';
  const collar=material('#df5304');const l=box(.08,.05,.025,-.055,1.40,.12,collar,g),r=box(.08,.05,.025,.055,1.40,.12,collar,g);l.rotation.z=-.35;r.rotation.z=.35;
  // Casquete por fuera de la cabeza: evita que la piel atraviese el pelo en la coronilla.
  const hair=mesh(new THREE.SphereGeometry(.149,16,10,0,Math.PI*2,0,Math.PI*.39),material(variant?'#493629':'#302f29'),g);hair.position.set(0,1.56,0);
  if(variant)sphere(.075,0,1.60,-.13,material('#493629'),g);
 }else box(.29,.35,.09,0,1.16,-.16,mat.dark,g);
 sphere(.017,-.055,1.585,.126,mat.dark,g);sphere(.017,.055,1.585,.126,mat.dark,g);
 const limbs={};
 for(const [side,x]of [['left',-.105],['right',.105]]){
  const leg=new THREE.Group();leg.position.set(x,.88,0);g.add(leg);box(.12,.76,.14,0,-.38,0,pants,leg);box(.14,.12,.25,0,-.82,.055,mat.dark,leg);limbs[side+'Leg']=leg;
  const arm=new THREE.Group();arm.position.set(x<0?-.23:.23,1.37,0);g.add(arm);box(.095,.46,.105,0,-.23,0,shirt,arm);sphere(.058,0,-.49,0,skin,arm);limbs[side+'Arm']=arm;
 }
 g.userData.rig=limbs;g.userData.monitor=monitor;return g;
}
function boardTexture(m){
 const c=document.createElement('canvas');c.width=768;c.height=384;const ctx=c.getContext('2d');
 ctx.fillStyle='#f7f6e9';ctx.fillRect(0,0,768,384);ctx.fillStyle=m.color;ctx.fillRect(0,0,768,14);
 ctx.font='700 30px sans-serif';ctx.fillStyle='#587265';ctx.fillText('FLUIR CON-CIENCIA',40,69);
 ctx.font='800 67px sans-serif';ctx.fillStyle=m.color;ctx.fillText(String(m.id).padStart(2,'0'),40,162);
 ctx.font='700 40px sans-serif';ctx.fillStyle='#143d36';let y=240,line='';
 for(const word of m.nombre.split(' ')){const next=line+word+' ';if(ctx.measureText(next).width>675){ctx.fillText(line,40,y);y+=48;line=word+' ';}else line=next;}ctx.fillText(line,40,y);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function equipment(m,g){
 const blue=mat.water,white=mat.ivory,sand=mat.sand;const Y=1.02;
 if(m.id===1){
  box(1.35,.09,.39,-.15,Y,0,blue,g);const mountain=mesh(new THREE.ConeGeometry(.25,.5,4),sand,g);mountain.position.set(-.55,Y+.27,-.02);mountain.rotation.y=.7;
  const mountain2=mesh(new THREE.ConeGeometry(.15,.27,4),white,g);mountain2.position.set(-.2,Y+.16,-.08);
 }else if(m.id===2){
  box(1.5,.08,.13,0,Y,0,blue,g);[-.5,0,.5].forEach((x,i)=>{box(.12,.08,.4,x,Y,.12,blue,g);box(.2,.17,.07,x,Y+.12,.09,material(['#8db366','#eda84c','#d18ca2'][i]),g);});
 }else if(m.id===3){
  [-.5,0,.5].forEach((x,i)=>{cylinder(.10,.14,.27,x,Y+.12,0,mat.glass,g);cylinder(.09,.12,.12+i*.035,x,Y+.07,0,material(['#73c5cf','#8dc4a0','#d8bc7e'][i]),g);});
 }else if(m.id===4){
  box(1.35,.06,.4,0,Y,0,mat.dark,g);for(let i=0;i<6;i++)sphere(.075,-.53+i*.2,Y+.09,0,material(i%2?'#c98b3c':'#bd5950'),g);
 }else if(m.id===5){
  [-.5,0,.5].forEach((x,i)=>{cylinder(.15,.15,.65,x,Y+.30,0,mat.glass,g);cylinder(.135,.135,.18,x,Y+.12,0,[sand,mat.dark,blue][i],g);});
 }else if(m.id===6){
  [-.45,.45].forEach(x=>{cylinder(.22,.22,.39,x,Y+.18,0,mat.glass,g);cylinder(.20,.20,.24,x,Y+.10,0,blue,g);});box(.7,.07,.07,0,Y+.30,0,blue,g);
 }else{
  box(.8,.48,.05,0,Y+.39,-.09,mat.dark,g);[-.48,0,.48].forEach((x,i)=>cylinder(.1,.1,.16,x,Y+.08,.15,material(['#4c9f7b','#dba84a','#6d9ac4'][i]),g));
 }
 const droplet=sphere(.045,-.8,Y+.1,.1,material('#6ae4e1'),g);animatedWater.push({mesh:droplet,offset:m.id*.7});
}
MODULES.forEach((m,i)=>{
 const g=new THREE.Group();g.userData.moduleId=m.id;g.position.set(SITES[i][0],.04,SITES[i][1]);g.rotation.y=STAND_LAYOUT[i].yaw;standRoot.add(g);standGroups.push(g);
 box(2.5,.10,2.5,0,.05,0,mat.ivory,g);
 for(const x of [-1.13,1.13])for(const z of [-1.13,1.13])box(.075,2.27,.075,x,1.235,z,mat.post,g);
 const col=material(m.color),roofGeo=new THREE.BufferGeometry();
 const points=[-1.25,2.40,-1.25,1.25,2.40,-1.25,0,2.70,-1.25,-1.25,2.40,1.25,1.25,2.40,1.25,0,2.70,1.25];
 roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));roofGeo.setIndex([0,3,2,3,5,2,2,5,1,5,4,1,0,2,1,3,4,5]);roofGeo.computeVertexNormals();
 mesh(roofGeo,material(m.color,{side:THREE.DoubleSide}),g);
 box(2.5,.13,.07,0,2.38,1.215,col,g);box(2.5,.13,.07,0,2.38,-1.215,col,g);
 const board=mesh(new THREE.PlaneGeometry(1.82,.91),new THREE.MeshStandardMaterial({map:boardTexture(m),roughness:1,side:THREE.DoubleSide}),g);board.position.set(0,1.75,-1.05);
 box(1.9,.08,.65,0,.91,0,mat.wood,g);box(1.7,.68,.45,0,.53,-.06,mat.ivory,g);box(1.73,.16,.47,0,.74,-.04,col,g);
 equipment(m,g);
 for(let j=0;j<2;j++){
  const local=new THREE.Vector3(j ? .78 : -.78,0,.78).applyAxisAngle(new THREE.Vector3(0,1,0),g.rotation.y);
  const monitor=person(g.position.x+local.x,g.position.z+local.z,{monitor:true,variant:j});
  monitor.userData.moduleId=m.id;monitor.userData.baseYaw=g.rotation.y+(j?-.25:.25);monitor.rotation.y=monitor.userData.baseYaw;
  const rig=monitor.userData.rig,gesture=j?rig.leftArm:rig.rightArm;
  gesture.rotation.x=j?-.72:.90;gesture.rotation.z=j?-.55:.58;
  monitor.userData.gesture=gesture;monitor.userData.baseGesture=gesture.rotation.x;
 }
 const label=document.createElement('button');label.className='stand-label';label.textContent=m.id;label.style.setProperty('--c',m.color);label.dataset.name=m.lbl;
 label.setAttribute('aria-label',`Explorar en 3D el módulo ${m.id}: ${m.nombre}`);label.onclick=()=>select(m.id,true);document.getElementById('labels').appendChild(label);labelNodes.push(label);
 const nav=document.createElement('button');nav.type='button';nav.textContent=m.id;nav.style.setProperty('--c',m.color);nav.dataset.id=m.id;nav.setAttribute('aria-label',`Módulo ${m.id}: ${m.nombre}`);nav.onclick=()=>select(m.id,true);document.getElementById('stationRail').appendChild(nav);
});
const garden=createGardenEnvironment({THREE,scene,trees,ponds:pondPolygons,paths:localPaths,sites:SITES,bounds:BOUNDS,pathMaterial:pathMat,accessAreas:ACCESS_AREAS,onSurface});
const selection=mesh(new THREE.RingGeometry(1.85,1.94,64),new THREE.MeshBasicMaterial({color:'#fff8d9',side:THREE.DoubleSide}));selection.rotation.x=-Math.PI/2;selection.position.y=.105;selection.castShadow=false;
const avatar=person(-15,0),rig=avatar.userData.rig;
const navigator=createNavigation({paths:localPaths,ponds:pondPolygons,sites:SITES,bounds:BOUNDS,obstacles:garden.obstacles,onSurface});
const audio=createAudioGuide(MODULES);
let selected=1,tween=null,tour=false,tourPaused=false,tourIndex=0,tourElapsed=0,tourPhase='travel',measureMode=false,measurePoints=[],lastTime=0;
let stationFocus=null;
let journey=null,follow=false,followSettling=false,cameraInteracting=false,walkPhase=0,lastNear=0,manualWalking=false;
const keys=new Set(),padKeys=new Map(),followOffset=new THREE.Vector3(7,6,9),gestureTarget=new THREE.Vector3(),gesturePosition=new THREE.Vector3();
let panGesture=false;
const measureRoot=new THREE.Group(),routeRoot=new THREE.Group();scene.add(measureRoot,routeRoot);
const formatter=new Intl.NumberFormat('es-CL',{maximumFractionDigits:1});
const FRONT=STAND_LAYOUT.map(({position:[x,z],yaw})=>[x+Math.sin(yaw)*2.5,z+Math.cos(yaw)*2.5]);
const status=text=>document.getElementById('sceneStatus').textContent=text;
function clearRoute(){routeRoot.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});routeRoot.clear();}
function cancelWalking(){journey=null;manualWalking=false;keys.clear();padKeys.clear();document.querySelectorAll('[data-walk]').forEach(b=>b.classList.remove('pressed'));clearRoute();}
function setMode(mode){container.classList.toggle('station-view',mode==='station');container.classList.toggle('inspection-view',mode==='station'||mode==='exteriorView');if(mode!=='station')stationFocus=null;document.querySelector('.more-views').open=false;['overview','entranceView','exteriorView','topView','centerVisitor'].forEach(id=>{const on=id===mode;document.getElementById(id).classList.toggle('on',on);document.getElementById(id).setAttribute('aria-pressed',on);});}
function stopCameraMomentum(){
 const position=camera.position.clone(),target=controls.target.clone(),damping=controls.enableDamping;
 controls.enableDamping=false;controls.update();controls.enableDamping=damping;
 camera.position.copy(position);controls.target.copy(target);controls.update();
}
function moveCamera(position,target,duration=1400){
 stopCameraMomentum();
 controls.autoRotate=false;document.getElementById('autoOrbit').checked=false;
 if(reduced.matches){camera.position.copy(position);controls.target.copy(target);controls.update();return;}
 tween={start:performance.now(),duration,from:camera.position.clone(),to:position.clone(),targetFrom:controls.target.clone(),targetTo:target.clone()};
}
function showModule(id){
 selected=id;const m=MODULES[id-1],p=standGroups[id-1].position;
 selection.position.x=p.x;selection.position.z=p.z;
 document.getElementById('moduleNumber').textContent=String(id).padStart(2,'0');document.getElementById('moduleNumber').style.background=m.color;
 document.getElementById('moduleTitle').textContent=m.nombre;document.getElementById('moduleLocation').textContent=STAND_LAYOUT[id-1].area;document.getElementById('moduleQuestion').textContent=m.pregunta;
 document.getElementById('moduleInteraction').textContent=m.interaccion;document.getElementById('moduleSheet').href=`index.html?mod=${id}`;
 labelNodes.forEach((el,i)=>{el.classList.toggle('active',i===id-1);el.setAttribute('aria-pressed',i===id-1);});
 document.querySelectorAll('#stationRail button').forEach(el=>el.setAttribute('aria-pressed',+el.dataset.id===id));audio.select(id);
}
// La cámara acompaña al caminar y conserva el ángulo elegido al mirar alrededor.
function setFollow(on,recenter=false){
 follow=on;document.getElementById('centerVisitor').setAttribute('aria-pressed',on);
 document.getElementById('centerVisitor').classList.toggle('on',on);
 if(!on)followSettling=false;
 else if(recenter){tween=null;controls.autoRotate=false;stopCameraMomentum();followSettling=true;setMode('centerVisitor');document.getElementById('autoOrbit').checked=false;}
}
function followVisitor(){setFollow(true,true);}
function frameStand(id,duration=1000){
 setFollow(false);setMode('station');stationFocus=id;scene.updateMatrixWorld(true);
 const frame=stationFrame({THREE,camera,stand:standGroups[id-1],visitor:avatar.position,width:container.clientWidth,height:container.clientHeight,occluders:[...standGroups.filter((_,i)=>i!==id-1),garden.buildings,trees]});
 moveCamera(frame.position,frame.target,duration);
}
function arrived(id,frame=false){
 if(id){showModule(id);lastNear=id;avatar.rotation.y=Math.atan2(SITES[id-1][0]-avatar.position.x,SITES[id-1][1]-avatar.position.z);
  status(`Llegaste al stand ${id} · ${MODULES[id-1].nombre}`);if(frame)frameStand(id);if(audio.automatic)audio.read(id);
 }else status('Llegaste. Elige otro punto o un stand para continuar.');
 if(tour){tourPhase='dwell';tourElapsed=0;}
}
function walkTo(to,id=null){
 const points=navigator.route([avatar.position.x,avatar.position.z],to);
 if(!points){status('Elige un punto del camino: el personaje evita áreas verdes, agua y obstáculos.');return false;}
 cancelWalking();tween=null;controls.autoRotate=false;document.getElementById('autoOrbit').checked=false;
 journey={points,index:1,moduleId:id};followVisitor();if(id)container.classList.add('station-view','inspection-view');
 const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(([x,z])=>new THREE.Vector3(x,.12,z))),new THREE.LineDashedMaterial({color:'#e2a236',dashSize:.5,gapSize:.35,transparent:true,opacity:.85}));line.computeLineDistances();routeRoot.add(line);
 status(id?`Caminando al stand ${id} · ${MODULES[id-1].nombre}`:'Caminando al punto que elegiste…');
 if(innerWidth<=800&&scrollY>container.offsetTop)container.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
 return true;
}
function select(id){stopTour();setMeasureMode(false);showModule(id);walkTo(FRONT[id-1],id);}
function stopTour(){
 const wasTour=tour;tour=false;tourPaused=false;tourElapsed=0;
 if(wasTour){cancelWalking();audio.cancel();}
 document.getElementById('tour3d').textContent='▶ Visita animada';document.getElementById('tour3d').setAttribute('aria-pressed','false');
}
function overview(){stopTour();cancelWalking();setMeasureMode(false);setFollow(false);setMode('overview');status('Toca un lugar o un stand para caminar');const narrow=container.clientWidth<600;moveCamera(new THREE.Vector3(narrow?-59:-38,narrow?65:34,narrow?68:40),new THREE.Vector3(0,0,1));}
function entranceView(){stopTour();cancelWalking();setMeasureMode(false);setFollow(false);setMode('entranceView');const narrow=container.clientWidth<600;moveCamera(new THREE.Vector3(narrow?-72:-49,narrow?32:22,narrow?3:4),new THREE.Vector3(0,0,0));status('Acceso · casa a la izquierda y baños a la derecha');}
function exteriorView(){stopTour();cancelWalking();setMeasureMode(false);setFollow(false);setMode('exteriorView');const narrow=container.clientWidth<600;moveCamera(new THREE.Vector3(narrow?-40:-29,narrow?4.8:3.8,narrow?-4:-2),new THREE.Vector3(-7,1,5));status('Entrada exterior · placa de piedra, zócalos y empalizada de madera');}
function focusPlace(id){
 const p=garden.places.find(p=>p.id===id);if(!p)return;
 stopTour();cancelWalking();setMeasureMode(false);setFollow(false);setMode('place');
 const position=new THREE.Vector3(...p.camera),target=new THREE.Vector3(...p.target);
 if(container.clientWidth<600)position.sub(target).multiplyScalar(1.6).add(target);
 moveCamera(position,target);status(p.name+' · referencia del acceso');
 if(innerWidth<=800)container.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
}
const placeNodes=garden.places.map(p=>{
 const button=document.createElement('button');button.className='place-label';button.dataset.place=p.id;button.textContent=p.icon+' '+p.name;button.setAttribute('aria-label','Ver '+p.name);button.onclick=()=>focusPlace(p.id);document.getElementById('placeLabels').appendChild(button);
 const shortcut=document.createElement('button');shortcut.textContent=p.icon+' '+p.name;shortcut.dataset.place=p.id;shortcut.onclick=()=>focusPlace(p.id);document.getElementById('placeShortcuts').appendChild(shortcut);return button;
});
document.getElementById('centerVisitor').onclick=()=>{setMeasureMode(false);followVisitor();status('Toca un lugar para caminar · arrastra para mirar alrededor');};
function topView(){stopTour();cancelWalking();setMeasureMode(false);setFollow(false);setMode('topView');status('Vista superior · toca un lugar para caminar');moveCamera(new THREE.Vector3(3,container.clientWidth<600?115:85,1.01),new THREE.Vector3(3,0,1));}
function tourStep(){
 tourPhase='travel';tourElapsed=0;showModule(tourIndex+1);
 if(!walkTo(FRONT[tourIndex],tourIndex+1)){stopTour();status('No se encontró un camino libre. Puedes mover el personaje manualmente.');}
}
function toggleTour(){
 if(tour){tourPaused=!tourPaused;document.getElementById('tour3d').textContent=tourPaused?'▶ Continuar':'Ⅱ Pausar';document.getElementById('tour3d').setAttribute('aria-pressed',!tourPaused);
  if(tourPaused){tween=null;audio.pause();status('Recorrido y personaje en pausa.');}else{audio.resume();if(tourPhase==='dwell')frameStand(tourIndex+1);status(tourPhase==='travel'?`Caminando al stand ${tourIndex+1}…`:`Visitando el stand ${tourIndex+1}.`);}return;
 }
 setMeasureMode(false);audio.cancel();cancelWalking();tour=true;tourPaused=false;tourIndex=0;tourElapsed=0;tourStep();
 if(tour){document.getElementById('tour3d').textContent='Ⅱ Pausar';document.getElementById('tour3d').setAttribute('aria-pressed','true');}
}
controls.addEventListener('start',()=>{
 if(!cameraInteracting){gestureTarget.copy(controls.target);gesturePosition.copy(camera.position);}
 stationFocus=null;cameraInteracting=true;followSettling=false;tween=null;controls.autoRotate=false;document.getElementById('autoOrbit').checked=false;
});
controls.addEventListener('end',()=>{
 const changed=camera.position.distanceToSquared(gesturePosition)>.0001||controls.target.distanceToSquared(gestureTarget)>.0001;
 stopCameraMomentum();
 if(panGesture&&controls.target.distanceToSquared(gestureTarget)>.04)setFollow(false);
 if(changed){
  if(follow)followOffset.copy(camera.position).sub(controls.target);
  else if(!panGesture){const distance=followOffset.length();followOffset.copy(camera.position).sub(controls.target).setLength(distance);}
 }
 if(follow)followSettling=true;
 cameraInteracting=false;panGesture=false;
});
document.getElementById('overview').onclick=overview;document.getElementById('reset').onclick=overview;document.getElementById('topView').onclick=topView;document.getElementById('entranceView').onclick=entranceView;document.getElementById('exteriorView').onclick=exteriorView;
document.getElementById('approach').onclick=()=>select(selected);document.getElementById('tour3d').onclick=toggleTour;
function zoom(f){stationFocus=null;tween=null;const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*f,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);if(follow)followOffset.copy(offset);controls.update();}
document.getElementById('zoomIn').onclick=()=>zoom(.78);document.getElementById('zoomOut').onclick=()=>zoom(1.28);
document.getElementById('showTrees').onchange=e=>trees.visible=e.target.checked;document.getElementById('showRoutes').onchange=e=>paths.visible=e.target.checked;
document.getElementById('autoOrbit').onchange=e=>{stopTour();stationFocus=null;tween=null;setFollow(false);controls.autoRotate=e.target.checked&&!reduced.matches;};
document.getElementById('stopWalk').onclick=()=>{stopTour();cancelWalking();audio.pause();status('Personaje detenido.');};
function beginManual(){if(!manualWalking){stopTour();cancelWalking();manualWalking=true;tween=null;followVisitor();status('Caminando · suelta las flechas para detenerte');}controls.autoRotate=false;document.getElementById('autoOrbit').checked=false;}
for(const button of document.querySelectorAll('[data-walk]')){
 button.addEventListener('pointerdown',e=>{e.preventDefault();setMeasureMode(false);beginManual();button.setPointerCapture(e.pointerId);padKeys.set(e.pointerId,button.dataset.walk);button.classList.add('pressed');});
 const release=e=>{padKeys.delete(e.pointerId);button.classList.remove('pressed');};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
}
const keyDirections={ArrowUp:'forward',w:'forward',W:'forward',ArrowDown:'back',s:'back',S:'back',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
window.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,select,textarea,[contenteditable=true]'))return;
 const direction=keyDirections[e.key];if(direction&&!measureMode){e.preventDefault();beginManual();keys.add(e.key);}
 if(e.key==='Escape'){setMeasureMode(false);stopTour();cancelWalking();audio.cancel();status('Personaje detenido · toca un lugar para continuar');}
});
window.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>{keys.clear();padKeys.clear();manualWalking=false;});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-.09);let pointerDown=null;
function rayAt(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);}
const cameraPointers=new Set();
renderer.domElement.addEventListener('pointerdown',e=>{
 cameraPointers.add(e.pointerId);panGesture=cameraPointers.size>1||e.button===2||e.shiftKey||e.ctrlKey||e.metaKey;pointerDown=cameraPointers.size===1&&e.button===0&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey?{id:e.pointerId,x:e.clientX,y:e.clientY,dragged:false}:null;
 if(!measureMode)renderer.domElement.style.cursor='grabbing';
});
renderer.domElement.addEventListener('pointermove',e=>{if(pointerDown&&pointerDown.id===e.pointerId&&Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>6){pointerDown.dragged=true;}});

renderer.domElement.addEventListener('pointercancel',e=>{cameraPointers.delete(e.pointerId);pointerDown=null;renderer.domElement.style.cursor=measureMode?'crosshair':'grab';});
renderer.domElement.addEventListener('pointerup',e=>{
 cameraPointers.delete(e.pointerId);if(!cameraPointers.size)renderer.domElement.style.cursor=measureMode?'crosshair':'grab';
 if(cameraPointers.size||!pointerDown||pointerDown.id!==e.pointerId||pointerDown.dragged){pointerDown=null;return;}pointerDown=null;rayAt(e);
 if(measureMode){const p=raycaster.ray.intersectPlane(groundPlane,new THREE.Vector3());if(p&&p.x>=BOUNDS.xmin&&p.x<=BOUNDS.xmax&&p.z>=BOUNDS.zmin&&p.z<=BOUNDS.zmax)addMeasurePoint(p);return;}
 const hit=raycaster.intersectObjects([...standRoot.children,...staff.children,...garden.buildings.children],true)[0];
 if(hit){let obj=hit.object;while(obj&&!obj.userData.moduleId&&!obj.userData.placeId)obj=obj.parent;if(obj?.userData.placeId){focusPlace(obj.userData.placeId);return;}if(obj?.userData.moduleId){select(obj.userData.moduleId);return;}}
 const p=raycaster.ray.intersectPlane(groundPlane,new THREE.Vector3());if(p){stopTour();walkTo([p.x,p.z]);}
});
function setMeasureMode(on){
 measureMode=on;document.getElementById('exitMeasure').hidden=!on;if(on&&innerWidth<=800)container.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
 if(!on&&!measurePoints.length)document.getElementById('measureResult').textContent='Marca dos puntos del suelo para estimar su separación horizontal.';
 document.getElementById('measure').setAttribute('aria-pressed',on);renderer.domElement.style.cursor=on?'crosshair':'grab';controls.enableRotate=!on;controls.enablePan=!on;
 if(on){stopTour();cancelWalking();setFollow(false);clearMeasurement();status('Medición: elige dos puntos del suelo');}
}
function clearMeasurement(){measureRoot.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});measureRoot.clear();measurePoints=[];document.getElementById('measureResult').textContent=measureMode?'Elige el primer punto del suelo.':'Marca dos puntos del suelo para estimar su separación horizontal.';document.getElementById('clearMeasure').hidden=true;}
function addMeasurePoint(p){
 if(measurePoints.length===2)clearMeasurement();measurePoints.push(p.clone());const pin=cylinder(.25,.25,.06,p.x,.13,p.z,material('#e2962c'),measureRoot,24);pin.castShadow=false;
 if(measurePoints.length===1){document.getElementById('measureResult').textContent='Ahora elige el segundo punto.';status('Medición: ahora elige el segundo punto.');}
 else{const[a,b]=measurePoints,line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:'#dc8d1e',depthTest:false}));line.renderOrder=10;measureRoot.add(line);const d=Math.hypot(a.x-b.x,a.z-b.z);document.getElementById('measureResult').textContent=`≈ ${formatter.format(d)} m en horizontal · estimación sobre cartografía, sin pendiente.`;document.getElementById('clearMeasure').hidden=false;status(`≈ ${formatter.format(d)} m en horizontal · estimación cartográfica`);}
}
document.getElementById('exitMeasure').onclick=()=>setMeasureMode(false);document.getElementById('measure').onclick=()=>setMeasureMode(!measureMode);document.getElementById('clearMeasure').onclick=clearMeasurement;
renderer.domElement.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){e.preventDefault();zoom(.85);}if(e.key==='-'){e.preventDefault();zoom(1.15);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();padKeys.clear();manualWalking=false;audio.pause();if(tour){tourPaused=true;tween=null;document.getElementById('tour3d').textContent='▶ Continuar';document.getElementById('tour3d').setAttribute('aria-pressed','false');}}});
window.addEventListener('pagehide',()=>audio.cancel());
function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(stationFocus&&!journey&&!cameraInteracting)frameStand(stationFocus,300);}
new ResizeObserver(resize).observe(container);resize();showModule(1);overview();
function moveVisitor(delta){
 let moved=0,dx=0,dz=0;
 if(document.hidden||(tour&&tourPaused))return 0;
 if(journey){
  let remaining=delta/1000*2.6;
  while(journey&&remaining>0){
   const target=journey.points[journey.index],x=target[0]-avatar.position.x,z=target[1]-avatar.position.z,d=Math.hypot(x,z),amount=Math.min(d,remaining);
   if(d>.0001){avatar.position.x+=x/d*amount;avatar.position.z+=z/d*amount;avatar.rotation.y=Math.atan2(x,z);moved+=amount;}remaining-=amount;
   if(d<=amount+.0001){journey.index++;if(journey.index===journey.points.length){const id=journey.moduleId;journey=null;clearRoute();arrived(id,!!id);}}else break;
  }
 }else{
  const directions=[...keys].map(k=>keyDirections[k]).concat([...padKeys.values()]);
  for(const dir of directions){if(dir==='forward')dz-=1;if(dir==='back')dz+=1;if(dir==='left')dx-=1;if(dir==='right')dx+=1;}
  if(dx||dz){
   const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();const right=new THREE.Vector3(-forward.z,0,forward.x);
   const direction=forward.multiplyScalar(-dz).addScaledVector(right,dx).normalize(),amount=delta/1000*2.6;
   const x=avatar.position.x+direction.x*amount,z=avatar.position.z+direction.z*amount;
   if(navigator.walkable(x,z)){avatar.position.x=x;avatar.position.z=z;moved=amount;}
   else if(navigator.walkable(x,avatar.position.z)){moved=Math.abs(x-avatar.position.x);avatar.position.x=x;}
   else if(navigator.walkable(avatar.position.x,z)){moved=Math.abs(z-avatar.position.z);avatar.position.z=z;}
   if(moved)avatar.rotation.y=Math.atan2(direction.x,direction.z);
   if(!moved)status('Sigue por el camino o la explanada; ese paso está fuera de la circulación.');
  }else if(manualWalking){manualWalking=false;status('Toca un lugar o un stand para seguir caminando');}
 }
 if(moved){
  walkPhase+=moved*6;
  if(!reduced.matches){const a=Math.sin(walkPhase)*.46;rig.leftLeg.rotation.x=a;rig.rightLeg.rotation.x=-a;rig.leftArm.rotation.x=-a*.75;rig.rightArm.rotation.x=a*.75;avatar.position.y=.04+Math.abs(Math.sin(walkPhase))*.025;}
  if(!journey){const nearby=FRONT.findIndex(p=>Math.hypot(p[0]-avatar.position.x,p[1]-avatar.position.z)<1.6);if(nearby>=0&&nearby+1!==lastNear)arrived(nearby+1);else if(nearby<0)lastNear=0;}
 }else{rig.leftLeg.rotation.x=rig.rightLeg.rotation.x=rig.leftArm.rotation.x=rig.rightArm.rotation.x=0;avatar.position.y=.04;}
 return moved;
}
function draw(now){
 requestAnimationFrame(draw);const delta=Math.min(80,lastTime?now-lastTime:0);lastTime=now;
 const moving=moveVisitor(delta);
 document.getElementById('stopWalk').hidden=(!journey&&!manualWalking)||tour;
 if(follow&&moving&&!cameraInteracting)followSettling=true;
 if(tween){const t=Math.min(1,(now-tween.start)/tween.duration),e=t*t*(3-2*t);camera.position.lerpVectors(tween.from,tween.to,e);controls.target.lerpVectors(tween.targetFrom,tween.targetTo,e);if(t===1)tween=null;}
 else if(follow&&followSettling&&!cameraInteracting&&!(tour&&tourPaused)){
  const target=avatar.position.clone().add(new THREE.Vector3(0,1,0)),position=target.clone().add(followOffset),blend=reduced.matches?1:1-Math.exp(-delta/300);
  camera.position.lerp(position,blend);controls.target.lerp(target,blend);
  if(!moving&&camera.position.distanceToSquared(position)<.0001&&controls.target.distanceToSquared(target)<.0001){camera.position.copy(position);controls.target.copy(target);followSettling=false;}
 }
 controls.update(delta/1000);
 if(tour&&!tourPaused&&tourPhase==='dwell'){tourElapsed+=delta;if(tourElapsed>=8000&&!audio.busy){tourIndex++;if(tourIndex===7){stopTour();status('Recorrido completo. Puedes seguir explorando con tu personaje.');}else tourStep();}}
 if(!reduced.matches)for(const monitor of staff.children){
  const phase=now*.0018+monitor.userData.moduleId*.7,explaining=audio.readingId===monitor.userData.moduleId&&audio.state==='playing'?1:.35;
  monitor.userData.gesture.rotation.x=monitor.userData.baseGesture+Math.sin(phase)*.10*explaining;
  monitor.rotation.y=monitor.userData.baseYaw+Math.sin(phase*.65)*.025*explaining;
 }
 if(!reduced.matches)for(const{mesh,offset}of animatedWater){mesh.position.x=-.8+((now*.0002+offset)%1)*1.6;mesh.position.y=1.11+Math.sin(now*.002+offset)*.035;}
 const vw=container.clientWidth,vh=container.clientHeight,projected=[];
 standGroups.forEach((g,i)=>{const p=new THREE.Vector3(g.position.x,3.9,g.position.z).project(camera),x=(p.x*.5+.5)*vw,y=(-p.y*.5+.5)*vh,on=p.z>-1&&p.z<1&&x>15&&x<vw-15&&y>15&&y<vh-70;labelNodes[i].hidden=!on;labelNodes[i].style.left=x+'px';labelNodes[i].style.top=y+'px';if(on)projected.push({id:i,x,y});});
 projected.sort((a,b)=>(b.id===selected-1)-(a.id===selected-1));const placed=[];for(const p of projected){if(placed.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<30))labelNodes[p.id].hidden=true;else placed.push(p);}
 garden.places.forEach((p,i)=>{const point=new THREE.Vector3(...p.position).project(camera),el=placeNodes[i];el.hidden=point.z< -1||point.z>1||Math.abs(point.x)>.95||Math.abs(point.y)>.85;el.style.left=(point.x*.5+.5)*vw+'px';el.style.top=(-point.y*.5+.5)*vh+'px';});
 const pin=avatar.position.clone().add(new THREE.Vector3(0,2.1,0)).project(camera),el=document.getElementById('avatarLabel');el.hidden=pin.z< -1||pin.z>1||Math.abs(pin.x)>1||Math.abs(pin.y)>1;el.style.left=(pin.x*.5+.5)*vw+'px';el.style.top=(-pin.y*.5+.5)*vh+'px';
 renderer.render(scene,camera);
}
requestAnimationFrame(draw);document.getElementById('loading').hidden=true;
window.WATER_3D={THREE,scene,camera,controls,renderer,standGroups,people,staff,paths,waters,trees,garden,project,ORIGIN,BOUNDS,SITES,FRONT,pathSegments,onSurface,standLayout:STAND_LAYOUT,avatar,navigation:navigator,audio,get framedStation(){return stationFocus;},get following(){return follow;},get selected(){return selected;},get tour(){return tour;},get phase(){return tourPhase;},get paused(){return tourPaused;},get walking(){return!!journey||manualWalking;},get route(){return journey?.points.map(p=>[...p])||[];},get measurePoints(){return measurePoints.map(p=>p.clone());}};
