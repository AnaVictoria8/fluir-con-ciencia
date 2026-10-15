// node tools/check_station_framing.mjs
import assert from 'node:assert/strict';
import * as THREE from '../assets/vendor/three/three.module.js';
import {STAND_LAYOUT} from '../assets/garden-layout.js';
import {stationFrame} from '../assets/station-framing.js';
import {createGardenBuildings} from '../assets/garden-buildings.js';
const context=new Proxy({},{get:()=>()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:768,height:180,getContext:()=>context})};
const scene=new THREE.Scene(),buildings=createGardenBuildings({THREE,parent:scene,obstacles:[]});
const stands=STAND_LAYOUT.map(({position:[x,z],yaw})=>{const g=new THREE.Group();g.position.set(x,.04,z);g.rotation.y=yaw;const body=new THREE.Mesh(new THREE.BoxGeometry(2.5,2.7,2.5),new THREE.MeshBasicMaterial());body.position.y=1.35;g.add(body);scene.add(g);return g;});
scene.updateMatrixWorld(true);
let count=0;
for(const [width,height,mobile]of [[320,560],[390,642],[724,698],[1095,930],[1703,1130],[320,263,true],[320,354,true],[390,628,true],[430,716,true],[574,342,true]])for(const [i,stand]of stands.entries()){
 const camera=new THREE.PerspectiveCamera(43,width/height,.08,400),yaw=stand.rotation.y;
 const visitor=stand.position.clone().add(new THREE.Vector3(Math.sin(yaw)*2.5,0,Math.cos(yaw)*2.5));
 const frame=stationFrame({THREE,camera,stand,visitor,width,height,padding:mobile?{left:18,right:18,top:92,bottom:24}:undefined,occluders:[buildings.root,...stands.filter((_,j)=>i!==j)]});
 camera.position.copy(frame.position);camera.lookAt(frame.target);camera.updateMatrixWorld(true);
 const check=p=>{const q=p.clone().project(camera);assert.ok(q.z>-1&&q.z<1);assert.ok(q.x>=frame.safe.left-.002&&q.x<=frame.safe.right+.002&&q.y>=frame.safe.bottom-.002&&q.y<=frame.safe.top+.002,`Estación ${i+1}, ${width}×${height}: objeto recortado o tapado por los controles: ${q.toArray()}`);};
 // Cubierta, base y cuerpo completo del visitante: requisitos independientes del encuadre.
 for(const x of [-1.25,1.25])for(const z of [-1.25,1.25])for(const y of [0,2.7])check(new THREE.Vector3(x,y,z).applyAxisAngle(new THREE.Vector3(0,1,0),yaw).add(stand.position));
 for(const x of [-.28,.28])for(const y of [0,1.75])check(visitor.clone().add(new THREE.Vector3(x,y,0)));
 const facing=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));assert.ok(frame.position.clone().sub(stand.position).dot(facing)>0,'La toma debe mostrar el frente del stand');
 assert.equal(frame.blocked,0,`Estación ${i+1}: otra estación o edificio tapa la toma`);count++;
}
console.log(`PASS: ${count} encuadres en móvil, tablet y escritorio muestran completos stand y visitante, fuera de los controles.`);
console.log('PASS: todas las tomas miran al frente del stand sin edificios ni otras estaciones por delante.');
