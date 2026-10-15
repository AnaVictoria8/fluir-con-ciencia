// Comprobación geométrica sin navegador: node tools/check_garden_layout.mjs
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../assets/vendor/three/three.module.js';
import {ACCESS_AREAS,STAND_LAYOUT,TOILET_LAYOUT,pathWidth,createWalkingSurface,insidePolygon,segmentDistance} from '../assets/garden-layout.js';
import {createGardenEnvironment} from '../assets/garden-environment.js';
import {createNavigation} from '../assets/visitor-navigation.js';

// Las etiquetas y texturas no participan en la comprobación de geometría.
const context=new Proxy({},{get:()=>()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:512,height:512,getContext:()=>context})};
const graphics={...THREE,TextureLoader:class{load(){return new THREE.Texture();}}};
const geo=JSON.parse(await readFile(new URL('../assets/geo/jardin_osm.geojson',import.meta.url)));
const origin={lat:-35.4058339,lon:-71.631515},bounds={xmin:-45,xmax:108,zmin:-68,zmax:138};
const project=([lon,lat])=>[(lon-origin.lon)*Math.PI/180*6371008.8*Math.cos(origin.lat*Math.PI/180),-(lat-origin.lat)*Math.PI/180*6371008.8];
const paths=geo.features.filter(f=>f.geometry.type==='LineString').map(f=>({osmWay:f.properties.osmWay,points:f.geometry.coordinates.map(project)}));
const ponds=geo.features.filter(f=>f.properties.natural==='water').map(f=>f.geometry.coordinates[0].map(project));
const segments=paths.flatMap(({osmWay,points})=>points.slice(1).map((b,i)=>({a:points[i],b,width:pathWidth(osmWay,points[i],b)})));
const sites=STAND_LAYOUT.map(s=>s.position),onSurface=createWalkingSurface(segments);
const garden=createGardenEnvironment({THREE:graphics,scene:new THREE.Scene(),trees:new THREE.Group(),ponds,paths:paths.map(p=>p.points),sites,bounds,pathMaterial:new THREE.MeshStandardMaterial(),accessAreas:ACCESS_AREAS,onSurface});
const nav=createNavigation({paths:paths.map(p=>p.points),ponds,sites,bounds,obstacles:garden.obstacles,onSurface});
const fronts=STAND_LAYOUT.map(({position:[x,z],yaw})=>[x+Math.sin(yaw)*2.5,z+Math.cos(yaw)*2.5]);
for(const [i,[x,z]] of sites.entries()){
 // Toda la huella, no solo el centro, debe caber sobre la tierra representada.
 for(let dx=-1.25;dx<=1.25;dx+=.25)for(let dz=-1.25;dz<=1.25;dz+=.25){
  const p=[x+dx,z+dz];assert.ok(onSurface(...p),`Stand ${i+1}: huella fuera del camino ${p}`);
  for(const poly of [...ponds,...garden.obstacles]){
   assert.ok(!insidePolygon(p,poly),`Stand ${i+1}: invade agua o un obstáculo`);
   assert.ok(poly.every((a,j)=>segmentDistance(p,a,poly[(j+1)%poly.length])>.38),`Stand ${i+1}: sin separación de un obstáculo`);
  }
 }
 assert.ok(nav.walkable(...fronts[i]),`Llegada del stand ${i+1} bloqueada`);
}
for(const from of [[-15,0],...fronts])for(const [i,to]of fronts.entries()){
 const route=nav.route(from,to);assert.ok(route,`Stand ${i+1} inaccesible desde ${from}`);
 assert.ok(route.slice(1).every((b,j)=>nav.lineClear(route[j],b)),`Ruta ${from} → ${i+1} cruza una zona bloqueada`);
}
// Paso central y franja continua de cuatro metros frente a los stands de la laguna.
for(let x=-15;x<=6;x+=.5)for(const z of [-1.5,0,1.5])assert.ok(nav.walkable(x,z),`Acceso central bloqueado: ${x},${z}`);
for(let z=3;z<=19;z+=.25)for(let x=-.8;x<=3.2;x+=.25)assert.ok(nav.walkable(x,z),`Franja de 4 m bloqueada: ${x},${z}`);
for(const stand of STAND_LAYOUT.filter(s=>s.id>=4&&s.id<=6))assert.ok(Math.sin(stand.yaw)>.999,'Los stands 4–6 deben mirar al este, hacia la laguna');
assert.ok(Math.sin(TOILET_LAYOUT.yaw)>.999,'El frente de los baños debe mirar a la laguna');
assert.ok(nav.route([-15,0],TOILET_LAYOUT.arrival),'El acceso frontal a los baños debe seguir conectado');
assert.ok(nav.route([-15,0],[-.8,-13.5]),'El frente de la casa debe seguir conectado');
assert.ok(!nav.walkable(16,-8),'La antigua posición en área verde debe quedar fuera de la circulación');
assert.equal(STAND_LAYOUT.filter(s=>s.area==='Frente a la casa').length,3);
assert.ok(STAND_LAYOUT.filter(s=>s.id>=4&&s.id<=6).every(s=>s.position[1]<19));
console.log('PASS: las siete huellas están sobre caminos/explanadas y separadas del agua y obstáculos.');
console.log('PASS: 56 rutas desde el acceso y entre estaciones, sin cruzar áreas verdes.');
console.log('PASS: orientación hacia la laguna, 3 m entre stands 4–6 y franja frontal de 4 m libre en el modelo.');
for(let i=3;i<5;i++)assert.ok(sites[i+1][1]-sites[i][1]-2.5>=3,'Separación libre entre stands 4–6');
