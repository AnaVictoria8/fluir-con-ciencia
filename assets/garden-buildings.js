import { TOILET_LAYOUT } from './garden-layout.js?v=20261015-7';
// Volúmenes interpretados de fotografías y del tour 360°, sin medidas de terreno.
export function createGardenBuildings({THREE,parent,obstacles}){
 const root=new THREE.Group();root.name='Casa, caseta y baños del acceso';parent.add(root);
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.86});
 const timber=mat('#855b39'),darkWood=mat('#58412e'),white=mat('#e4e2d6'),grey=mat('#8e9697'),roofMat=mat('#6d787b'),glass=mat('#526b65'),concrete=mat('#b9b6a7'),dark=mat('#354640');
 const boxGeo=new THREE.BoxGeometry(1,1,1);
 function box(g,w,h,d,x,y,z,m){const o=new THREE.Mesh(boxGeo,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function body(id,name,x,z,w,d,yaw=-Math.PI/2){const g=new THREE.Group();g.name=name;g.userData.placeId=id;g.position.set(x,0,z);g.rotation.y=yaw;root.add(g);
  const c=Math.cos(yaw),sn=Math.sin(yaw);obstacles.push([[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([xx,zz])=>[x+c*xx+sn*zz,z-sn*xx+c*zz]));return g;}
 function roof(g,w,d,eave,ridge,color='#7d8585'){
  const positions=[-w/2,eave,d/2,w/2,eave,d/2,-w/2,ridge,0,w/2,eave,d/2,w/2,ridge,0,-w/2,ridge,0,-w/2,ridge,0,w/2,ridge,0,-w/2,eave,-d/2,w/2,ridge,0,w/2,eave,-d/2,-w/2,eave,-d/2];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.75,side:THREE.DoubleSide}));m.castShadow=true;m.receiveShadow=true;g.add(m);
  const slope=Math.atan2(ridge-eave,d/2),length=Math.hypot(d/2,ridge-eave);
  for(let x=-w/2;x<=w/2;x+=.42)for(const s of [-1,1]){const rib=box(g,.025,.025,length,x,(eave+ridge)/2+.02,s*d/4,roofMat);rib.rotation.x=s*slope;}
 }
 function window(g,x,y,z,w=1.2,h=.95){box(g,w+.14,h+.14,.09,x,y,z,white);box(g,w,h,.10,x,y,z+.02,glass);box(g,.045,h,.035,x,y,z+.08,white);box(g,w,.045,.035,x,y,z+.08,white);}
 function plaque(g,text,x,y,z,w){const c=document.createElement('canvas');c.width=768;c.height=180;const ctx=c.getContext('2d');ctx.fillStyle='#244a42';ctx.fillRect(0,0,768,180);ctx.fillStyle='#fff9e9';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 78px Arial';ctx.fillText(text,384,95,720);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,w*180/768),new THREE.MeshBasicMaterial({map:t}));o.position.set(x,y,z);g.add(o);}
 // Casa de la referencia aportada: frente hacia la explanada interior (+z).
 // La fachada con puerta, porche y frontón se ve al entrar y mirar a la izquierda.
 const house=body('house','Casa junto al acceso',-.8,-21,5.8,8,0);
 box(house,5.8,2.6,8,0,1.55,0,timber);
 for(let y=.4;y<2.82;y+=.20){
  box(house,5.78,.024,.026,0,y,4.016,darkWood);
  for(const x of [-2.916,2.916])box(house,.026,.024,8,x,y,0,darkWood);
 }
 const houseRoof=new THREE.Group();houseRoof.rotation.y=Math.PI/2;house.add(houseRoof);roof(houseRoof,9.0,6.5,2.97,4.05,'#60513f');
 for(const z of [-4.02,4.02]){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-2.9,2.84,z,2.9,2.84,z,0,4.0,z],3));geo.computeVertexNormals();const fronton=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#785131',roughness:.95,side:THREE.DoubleSide}));fronton.castShadow=true;house.add(fronton);
  for(let x=-2.7;x<2.8;x+=.18){const h=(1-Math.abs(x)/2.9)*1.16;if(h>0)box(house,.018,h,.023,x,2.84+h/2,z+(z>0?.012:-.012),darkWood);}
 }
 window(house,-1.8,1.82,4.05,1.05,1.1);window(house,1.8,1.82,4.05,1.05,1.1);
 for(const center of [-1.8,1.8])for(let x=center-.44;x<center+.5;x+=.18)box(house,.024,1.12,.032,x,1.82,4.15,dark);
 box(house,.95,2.06,.12,0,1.30,4.07,mat('#b18a35'));box(house,.13,.24,.025,0,1.85,4.14,mat('#41633a'));box(house,.07,.07,.07,.34,1.24,4.16,white);
 const side=new THREE.Group();side.position.x=2.94;side.rotation.y=Math.PI/2;house.add(side);window(side,-1.6,1.82,.01,1.05,1.1);window(side,1.3,1.82,.01,1.05,1.1);
 // Porche de madera, peldaños centrales y barandas con cruces.
 box(house,6.2,.17,1.9,0,.25,4.85,darkWood);box(house,1.3,.14,.62,0,.12,6.0,darkWood);
 function beam(a,b){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),mid=start.clone().add(end).multiplyScalar(.5),v=end.sub(start);const m=box(house,.075,v.length(),.075,...mid.toArray(),darkWood);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());}
 for(const x of [-2.9,-.65,.65,2.9])box(house,.10,1.03,.10,x,.78,5.7,darkWood);
 for(const [left,right]of [[-2.9,-.65],[.65,2.9]]){
  box(house,right-left,.09,.10,(left+right)/2,1.25,5.7,darkWood);
  beam([left,.37,5.7],[right,1.21,5.7]);beam([left,1.21,5.7],[right,.37,5.7]);
 }
 // Estructura abierta del emparrado junto al lado izquierdo del porche.
 for(const x of [-4.75,-2.9])for(const z of [4.05,5.7])box(house,.11,2.7,.11,x,1.6,z,darkWood);
 for(const z of [4.05,5.7])box(house,2.05,.12,.12,-3.82,2.94,z,darkWood);
 for(let x=-4.8;x< -2.8;x+=.48)box(house,.075,.09,2.05,x,3.0,4.85,darkWood);
 obstacles.push([[-5.65,-17.05],[2.35,-17.05],[2.35,-14.7],[-5.65,-14.7]]);
 // Caseta de atención observada en el tour, próxima a la explanada exterior.
 const booth=body('booth','Caseta de acceso',-14,-17,2.6,2.3);
 box(booth,2.6,1.0,2.3,0,.5,0,darkWood);box(booth,2.6,.35,2.3,0,2.2,0,darkWood);
 for(const x of [-1.23,1.23])for(const z of [-1.08,1.08])box(booth,.12,1.25,.12,x,1.55,z,timber);
 window(booth,0,1.55,1.10,2.24,.96);const sideWindow=box(booth,.04,.96,1.8,-1.3,1.55,0,glass);sideWindow.receiveShadow=false;
 roof(booth,3.25,2.95,2.42,2.62);for(let y=.1;y<.95;y+=.14)box(booth,2.63,.025,.03,0,y,1.16,timber);
 // Pabellón de baños: cubierta gris, paños de madera vertical y centro blanco.
 const toilets=body('toilets','Baños del jardín',...TOILET_LAYOUT.position,9.2,4.4,TOILET_LAYOUT.yaw);
 box(toilets,9.2,2.6,4.4,0,1.42,0,darkWood);box(toilets,10,.18,6.2,0,.09,.55,concrete);roof(toilets,10.2,5.8,2.88,3.45);
 box(toilets,4.5,2.57,.13,0,1.42,2.25,white);
 for(const x of [-3.5,3.5]){box(toilets,2.18,2.5,.15,x,1.4,2.25,darkWood);for(let xx=x-.98;xx<x+1.05;xx+=.25)box(toilets,.095,2.5,.11,xx,1.4,2.37,timber);}
 for(const [x,text]of [[-1.4,'WC'],[0,'WC'],[1.4,'♿']]){box(toilets,.9,2,.08,x,1.18,2.35,grey);box(toilets,.05,.1,.05,x+.32,1.13,2.41,dark);plaque(toilets,text,x,1.8,2.41,.47);}
 plaque(toilets,'BAÑOS',0,2.57,2.41,1.5);
 // Rampa frontal representativa; la pendiente es de visualización, no una cota certificada.
 const ramp=box(toilets,2.1,.12,2.0,3.1,.08,3.8,concrete);ramp.rotation.x=-.08;
 for(const x of [2.1,4.1]){
  const points=[[-.06,3.15],[.06,3.15],[.06,4.72],[-.06,4.72]].map(([dx,z])=>{const xx=x+dx,c=Math.cos(TOILET_LAYOUT.yaw),sn=Math.sin(TOILET_LAYOUT.yaw);return [TOILET_LAYOUT.position[0]+c*xx+sn*z,TOILET_LAYOUT.position[1]-sn*xx+c*z];});obstacles.push(points);
  box(toilets,.045,.8,.045,x,.44,3.25,dark);box(toilets,.045,.7,.045,x,.35,4.6,dark);const rail=box(toilets,.045,.045,1.5,x,.78,3.9,dark);rail.rotation.x=-.08;}
 // Papeleros y bolardos de hormigón del entorno del acceso.
 for(const [x,z]of [[-3,-5],[-5,15],[-13,-14]]){const g=new THREE.Group();g.position.set(x,0,z);root.add(g);box(g,.55,.85,.5,0,.43,0,dark);box(g,.69,.1,.63,0,.92,0,concrete);box(g,.11,1,.55,-.34,.5,0,concrete);box(g,.11,1,.55,.34,.5,0,concrete);obstacles.push([[x-.42,z-.35],[x+.42,z-.35],[x+.42,z+.35],[x-.42,z+.35]]);}
 return {root,places:[
  {id:'house',name:'Casa del acceso',icon:'⌂',position:[-.8,4.7,-20],target:[-.8,1.5,-19.3],camera:[10,5.5,-7]},
  {id:'booth',name:'Caseta',icon:'▣',position:[-14,3.4,-17],target:[-14,1.2,-17],camera:[-25,6,-10]},
  {id:'toilets',name:'Baños',icon:'WC',position:[-3.8,4,24],target:[-2.5,1.4,24],camera:[13,6.5,29]}
 ]};
}
