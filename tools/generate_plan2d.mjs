// Genera el plano 2D desde la misma geometría, obstáculos y rutas de la maqueta 3D.
// node tools/generate_plan2d.mjs [--check]
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from '../assets/vendor/three/three.module.js';
import {buildGardenGeometry,BOUNDS} from '../assets/garden-geometry.js';
import {ACCESS_AREAS,STAND_LAYOUT,TOILET_LAYOUT,createWalkingSurface} from '../assets/garden-layout.js';
import {createGardenEnvironment} from '../assets/garden-environment.js';
import {createNavigation} from '../assets/visitor-navigation.js';
const sourceFiles=['tools/generate_plan2d.mjs','assets/garden-geometry.js','assets/garden-layout.js','assets/garden-environment.js','assets/garden-buildings.js','assets/visitor-navigation.js','assets/geo/jardin_osm.geojson'];
const hash=createHash('sha256');
for(const f of sourceFiles)hash.update(await readFile(new URL('../'+f,import.meta.url)));
const fingerprint=hash.digest('hex');
const context=new Proxy({},{get:()=>()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:512,height:512,getContext:()=>context})};
const graphics={...THREE,TextureLoader:class{load(){return new THREE.Texture();}}};
const geo=JSON.parse(await readFile(new URL('../assets/geo/jardin_osm.geojson',import.meta.url)));
const {paths,segments,ponds}=buildGardenGeometry(geo),sites=STAND_LAYOUT.map(s=>s.position),onSurface=createWalkingSurface(segments);
const trees=new THREE.Group();
const garden=createGardenEnvironment({THREE:graphics,scene:new THREE.Scene(),trees,ponds,paths,sites,bounds:BOUNDS,pathMaterial:new THREE.MeshStandardMaterial(),accessAreas:ACCESS_AREAS,onSurface});
const nav=createNavigation({paths,ponds,sites,bounds:BOUNDS,obstacles:garden.obstacles,onSurface});
const sector={xmin:-24,xmax:23,zmin:-30,zmax:35,scale:32},general={...BOUNDS,scale:14};
const norm=([x,z])=>[(x-sector.xmin)/(sector.xmax-sector.xmin),(z-sector.zmin)/(sector.zmax-sector.zmin)];
const arrivals=STAND_LAYOUT.map(({position:[x,z],yaw})=>[x+Math.sin(yaw)*2.5,z+Math.cos(yaw)*2.5]);
const entry=[-15,0],destinations=[entry,...arrivals,entry];
const legs=destinations.slice(1).map((to,i)=>{
 const route=nav.route(destinations[i],to);assert.ok(route,`Sin ruta al destino ${i+1}`);
 assert.ok(route.slice(1).every((b,j)=>nav.lineClear(route[j],b)),`La ruta ${i+1} cruza obstáculos`);
 return route.map(norm);
});
const plan={fingerprint,frames:{sector,general},stands:STAND_LAYOUT.map(s=>({...s,sx:norm(s.position)[0],sy:norm(s.position)[1]})),entry:norm(entry),arrivals:arrivals.map(norm),legs};
const n=v=>Number(v.toFixed(3)),points=p=>p.map(q=>q.map(n).join(',')).join(' ');
const poly=(p,fill,stroke='none',width=.1)=>`<polygon points="${points(p)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
function svg(frame){
 const {xmin,xmax,zmin,zmax,scale}=frame,w=xmax-xmin,h=zmax-zmin;
 const parts=[`<svg xmlns="http://www.w3.org/2000/svg" width="${w*scale}" height="${h*scale}" viewBox="${xmin} ${zmin} ${w} ${h}"><title>Plano del acceso · misma distribución que la maqueta 3D</title><desc>Esquema de propuesta. Norte arriba. Stands sobre explanadas, baños orientados hacia la laguna. Anchos y edificios interpretados de referencias; validar en terreno.</desc><defs><pattern id="grass" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#e3ead9"/><circle cx="1" cy="2" r=".045" fill="#abbc94"/><circle cx="3" cy=".7" r=".04" fill="#abbc94"/></pattern></defs><rect x="${xmin}" y="${zmin}" width="${w}" height="${h}" fill="url(#grass)"/>`];
 for(const {a,b,width} of segments)parts.push(`<path d="M${points([a])} L${points([b])}" stroke="#dccbb0" stroke-width="${width}" stroke-linecap="round"/>`);
 for(const a of ACCESS_AREAS)parts.push(poly(a.points,'#dccbb0'));
 parts.push(poly([[-16,4.8],[-7,4.8],[-7,15],[-13,14],[-17,8]],'#c3c4b5'));
 for(const p of ponds)parts.push(poly(p,'#8bbeb2','#6ba596',.22));
 // Las posiciones y escalas provienen de las instancias del entorno 3D.
 const matrix=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
 for(const group of [garden.root,trees])group.traverse(m=>{
  if(!m.isInstancedMesh||!['trunks','shrubs','shore','posts','fencePosts','waterPosts','lilies'].includes(m.name))return;
  for(let i=0;i<m.count;i++){
   m.getMatrixAt(i,matrix);matrix.decompose(p,q,s);
   if(p.x<xmin-4||p.x>xmax+4||p.z<zmin-4||p.z>zmax+4)continue;
   const tree=m.name==='trunks',r=tree?Math.max(1.2,s.y*.30):Math.max(s.x,s.z);
   const fill={trunks:'#a3b88b',shrubs:'#bdcba7',shore:'#d5d8c5',posts:'#6f5b3f',fencePosts:'#49644b',waterPosts:'#88714b',lilies:'#72a081'}[m.name];
   parts.push(`<circle cx="${n(p.x)}" cy="${n(p.z)}" r="${n(r)}" fill="${fill}"${tree?' stroke="#90a97b" stroke-width=".12"':''}/>`);
  }
 });
 for(const [a,b]of [[[-7,-62],[-7,-21]],[[-7,-21],[-7,-4.5]],[[-7,4.5],[-7,17]],[[-7,31],[-7,129]],[[6,13.5],[14,20]],[[14,20],[27,25]],[[27,25],[38,26]]])parts.push(`<path d="M${points([a])} L${points([b])}" stroke="#6c7251" stroke-width=".16"/>`);
 garden.buildings.children.filter(g=>g.userData.placeId).forEach(g=>{
  const id=g.userData.placeId,[w,d]=id==='house'?[5.8,8]:id==='toilets'?[9.2,4.4]:[2.6,2.3];
  const c=Math.cos(g.rotation.y),sn=Math.sin(g.rotation.y),world=([x,z])=>[g.position.x+c*x+sn*z,g.position.z-sn*x+c*z];
  parts.push(poly([[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(world),id==='house'?'#a58b6b':'#a9b5ad','#6b766b',.16));
  const front=[world([-w/2,d/2]),world([w/2,d/2])],a=world([0,d/2+.1]),b=world([0,d/2+1.4]),arrow=[world([-.35,d/2+1.05]),b,world([.35,d/2+1.05])];
  parts.push(`<path d="M${points([front[0]])} L${points([front[1]])}" stroke="#244e44" stroke-width=".35"/><path d="M${points([a])} L${points([b])} M${points([arrow[0]])} L${points([arrow[1]])} L${points([arrow[2]])}" fill="none" stroke="#244e44" stroke-width=".13"/>`);
 });
 parts.push(poly([[-5.65,-17.05],[2.35,-17.05],[2.35,-14.7],[-5.65,-14.7]],'#b4a085','#8f8168',.1));
 parts.push(poly([[-11.8,6],[-10.2,6],[-10.2,12],[-11.8,12]],'#6d6a58','#ede8d5',.12));
 const label=(x,z,text,size=.75)=>parts.push(`<text x="${x}" y="${z}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${size}" font-weight="600" fill="#34594a" stroke="#f1f3e7" stroke-width=".25" paint-order="stroke">${text}</text>`);
 label(-.8,-21,'Casa',.85);label(-16,-19.5,'Caseta',.7);label(-3.8,24,'Baños',.8);label(16,9,'Laguna',1.1);label(-17,11,'Letrero',.7);label(-17,1,'Entrada →',.8);
 if(frame===sector){
  parts.push(`<g transform="translate(19,-25)" fill="#34594a"><path d="M0,2 V-2 M-.5,-1.2 L0,-2 .5,-1.2" fill="none" stroke="currentColor" stroke-width=".14"/><text y="-3" text-anchor="middle" font-size=".9" font-family="system-ui">N</text></g><path d="M14,30 v.5 h5 v-.5" stroke="#34594a" stroke-width=".14" fill="none"/>`);label(16.5,32,'5 m',.7);
 }
 parts.push('</svg>');return parts.join('\n')+'\n';
}
const outputs={'assets/plan2d-data.js':`// Generado por tools/generate_plan2d.mjs. Editar garden-layout.js y regenerar.\nexport const PLAN2D=${JSON.stringify(plan,null,2)};\n`,'assets/plano-sector.svg':svg(sector),'assets/plano-general.svg':svg(general)};
for(const [file,content]of Object.entries(outputs)){
 const url=new URL('../'+file,import.meta.url);
 if(process.argv.includes('--check'))assert.equal(await readFile(url,'utf8'),content,`${file} desactualizado; ejecutar node tools/generate_plan2d.mjs`);
 else await writeFile(url,content);
}
assert.ok(STAND_LAYOUT.slice(3,6).every(s=>s.yaw===TOILET_LAYOUT.yaw));
console.log(`PASS: plano 2D ${process.argv.includes('--check')?'sincronizado':'generado'}: 7 huellas y orientaciones, 8 rutas transitables y geometría compartida con el 3D.`);
