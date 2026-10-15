import { createGardenBuildings } from './garden-buildings.js?v=20261015-5';
// Interpretación visual del tour 360° UTalca; posiciones del mobiliario aproximadas.
// Senderos y agua conservan la cartografía OSM. Ver MEDIDAS_Y_FUENTES.md.
export function createGardenMaterials(THREE,renderer){
 let seed=147;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 function texture(base,colors,count){
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,512,512);
  for(let i=0;i<count;i++){ctx.fillStyle=colors[i%colors.length];const r=.4+random()*2;ctx.beginPath();ctx.ellipse(random()*512,random()*512,r,r*.55,random()*6.28,0,6.28);ctx.fill();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
 }
 const grass=texture('#829365',['#738759','#9ba475','#657c4e','#a2aa7e'],22000);grass.repeat.set(28,40);
 const gravel=texture('#bca88a',['#ae997c','#d4c4a5','#9e8d76','#c6b394'],12000);gravel.repeat.set(1,8);
 return {ground:new THREE.MeshStandardMaterial({map:grass,roughness:1}),path:new THREE.MeshStandardMaterial({map:gravel,roughness:1}),water:new THREE.MeshStandardMaterial({color:'#527f72',roughness:.23,metalness:.27}),gravel};
}
export function createGardenEnvironment({THREE,scene,trees,ponds,paths,sites,bounds,pathMaterial,accessAreas,onSurface}){
 const root=new THREE.Group();root.name='Entorno del Jardín Botánico UTalca';scene.add(root);
 const obstacles=[],landmarks=[];let seed=904;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.94});
 const concrete=mat('#b4b0a0'),wood=mat('#5b4d36'),metal=mat('#344f40'),ivory=mat('#d4d5c7');
 const sphere=new THREE.SphereGeometry(1,12,9),trunkGeo=new THREE.CylinderGeometry(.7,1,1,7),boxGeo=new THREE.BoxGeometry(1,1,1),leafGeo=new THREE.SphereGeometry(1,7,5);
 const batches=new Map(),dummy=new THREE.Object3D();
 function instance(key,geometry,material,p,s,rotation=[0,0,0],parent=root){
  if(!batches.has(key))batches.set(key,{geometry,material,parent,items:[]});batches.get(key).items.push({p,s,rotation});
 }
 function cube(w,h,d,x,y,z,material,parent=root){const m=new THREE.Mesh(boxGeo,material);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function barrier(x,z,w,d){obstacles.push([[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]]);}
 function polygon(points,material,y=.045){const s=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),m=new THREE.Mesh(new THREE.ShapeGeometry(s),material);m.rotation.x=-Math.PI/2;m.position.y=y;m.receiveShadow=true;root.add(m);return m;}
 function distance(p,a,b){const x=b[0]-a[0],z=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*z)/(x*x+z*z||1)));return Math.hypot(p[0]-a[0]-x*t,p[1]-a[1]-z*t);}
 function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
 function free(x,z,margin=2){return x>bounds.xmin+2&&x<bounds.xmax-2&&z>bounds.zmin+2&&z<bounds.zmax-2&&!sites.some(p=>Math.hypot(x-p[0],z-p[1])<margin+3)&&![...ponds,...obstacles].some(poly=>inside([x,z],poly)||poly.some((a,i)=>distance([x,z],a,poly[(i+1)%poly.length])<margin))&&!onSurface(x,z,margin)&&!(x<5&&Math.abs(z)<20);}
 // Explanada de tierra, acceso libre y franja de losa junto al letrero.
 for(const area of accessAreas){const surface=polygon(area.points,pathMaterial,.048);surface.name=area.name;}
 polygon([[-16,4.8],[-7,4.8],[-7,15],[-13,14],[-17,8]],concrete,.065);
 const entrance=new THREE.Group();entrance.name='Acceso · letrero y postes';entrance.position.set(-11,0,9);entrance.rotation.y=-Math.PI/2;root.add(entrance);
 // Zócalo trapezoidal y faldón inclinado, como la placa del acceso exterior.
 const base=new THREE.BufferGeometry();base.setAttribute('position',new THREE.Float32BufferAttribute([-3,0,-.85,3,0,-.85,-3,.42,-.65,3,.42,-.65,-3,0,1.35,3,0,1.35],3));base.setIndex([0,2,1,1,2,3,2,4,3,3,4,5,0,4,2,1,3,5,0,1,4,1,5,4]);base.computeVertexNormals();
 const plinth=new THREE.Mesh(base,concrete);plinth.castShadow=true;plinth.receiveShadow=true;entrance.add(plinth);
 cube(4.2,1.22,.20,0,1.02,-.54,mat('#514e43'),entrance);
 const c=document.createElement('canvas');c.width=1536;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#514e43';ctx.fillRect(0,0,1536,512);ctx.fillStyle='#f0eddd';
 // Flor simplificada como marca referencial del letrero existente.
 ctx.save();ctx.translate(768,95);for(const angle of [-.7,0,.7]){ctx.save();ctx.rotate(angle);ctx.beginPath();ctx.ellipse(0,-18,24,55,0,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.restore();
 ctx.textAlign='center';ctx.font='600 112px Arial';ctx.fillText('JARDÍN BOTÁNICO',768,319);ctx.font='500 48px Arial';ctx.fillText('UNIVERSIDAD DE TALCA',768,405);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const signMat=new THREE.MeshBasicMaterial({map:t});
 for(const side of [-1,1]){const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.1,1.2),signMat);sign.position.set(0,1.02,-.54+side*.106);if(side<0)sign.rotation.y=Math.PI;entrance.add(sign);}
 barrier(-11,9,2.8,6.2);landmarks.push({name:'Acceso Jardín Botánico',position:[-11,2.3,9]});
 // Empalizada de alturas irregulares, visible en la entrada del tour institucional.
 for(const [start,end]of [[-21,-4.5],[4.5,17]])for(let z=start;z<end;z+=.48){const h=1.4+random()*1.5;instance('posts',trunkGeo,wood,[-7,h/2,z],[.095,h,.095]);}
 barrier(-7,-12.75,.45,16.5);barrier(-7,10.75,.45,12.5);
 for(const [a,b]of [[-21,-4.5],[4.5,17]])cube(.48,.28,b-a,-7,.14,(a+b)/2,concrete);
 function curb(a,b){const length=Math.hypot(b[0]-a[0],b[1]-a[1]),m=cube(.25,.20,length,(a[0]+b[0])/2,.10,(a[1]+b[1])/2,concrete);m.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);}
 curb([-29,-8],[-7,-4.5]);curb([-29,8],[-17,6]);
 // Cerco verde lateral; el paso central queda entre z=-4,5 y z=4,5.
 function fence(a,b){const length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length,yaw=Math.atan2(dx,dz);
  for(let n=0;n<=length;n+=2.7){instance('fencePosts',boxGeo,metal,[a[0]+dx*n,1.05,a[1]+dz*n],[.07,2.1,.07]);}
  for(let n=0;n<=length;n+=.30)instance('fenceWire',boxGeo,metal,[a[0]+dx*n,1,a[1]+dz*n],[.012,1.9,.012]);
  for(const y of [.15,.7,1.3,1.95])instance('fenceRails',boxGeo,metal,[(a[0]+b[0])/2,y,(a[1]+b[1])/2],[.018,.018,length],[0,yaw,0]);
  const pad=.08;obstacles.push([[Math.min(a[0],b[0])-pad,Math.min(a[1],b[1])-pad],[Math.max(a[0],b[0])+pad,Math.min(a[1],b[1])-pad],[Math.max(a[0],b[0])+pad,Math.max(a[1],b[1])+pad],[Math.min(a[0],b[0])-pad,Math.max(a[1],b[1])+pad]]);
 }
 fence([-7,-62],[-7,-21]);fence([-7,31],[-7,129]);
 const buildings=createGardenBuildings({THREE,parent:root,obstacles});
 function bench(x,z,yaw){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;root.add(g);cube(2.1,.13,.55,0,.52,0,ivory,g);for(const xx of [-.92,.92])cube(.18,.5,.55,xx,.25,0,ivory,g);barrier(x,z,Math.abs(Math.cos(yaw))*2.1+.6,Math.abs(Math.sin(yaw))*2.1+.6);}
 bench(-13,-7,0);bench(3,-5,Math.PI/2);bench(7,34,0);bench(45,48,Math.PI/2);
 // Atril amarillo de orientación del acceso, sin atribuirle un plano métrico.
 const orient=new THREE.Group();orient.position.set(-7.35,0,6.0);orient.rotation.y=-Math.PI/2;root.add(orient);cube(.08,1.5,.08,-.80,.75,0,metal,orient);cube(.08,1.5,.08,.80,.75,0,metal,orient);
 const board=cube(1.9,1.16,.07,0,1.25,0,mat('#c7b84a'),orient);board.rotation.x=-.12;
 const mapTexture=new THREE.TextureLoader().load('assets/mapa_general.jpg');mapTexture.colorSpace=THREE.SRGBColorSpace;
 const mapBoard=new THREE.Mesh(new THREE.PlaneGeometry(1.72,.98),new THREE.MeshBasicMaterial({map:mapTexture}));mapBoard.position.set(0,1.25,.05);mapBoard.rotation.x=-.12;orient.add(mapBoard);barrier(-7.35,6,.6,2.1);
 // Bancas y baranda baja junto a la primera laguna.
 const bank=[[6,13.5],[14,20],[27,25],[38,26]];
 for(let i=1;i<bank.length;i++){
  const a=bank[i-1],b=bank[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);
  for(let d=0;d<=length;d+=2)instance('waterPosts',boxGeo,wood,[a[0]+(b[0]-a[0])*d/length,.43,a[1]+(b[1]-a[1])*d/length],[.14,.86,.14]);
  for(const y of [.38,.72])instance('waterRails',boxGeo,wood,[(a[0]+b[0])/2,y,(a[1]+b[1])/2],[.10,.10,length],[0,yaw,0]);
  const nx=(b[1]-a[1])/length*.07,nz=-(b[0]-a[0])/length*.07;obstacles.push([[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]]);
 }
 // Árboles con tronco ramificado, copas irregulares y álamos altos del acceso.
 const leafMats=['#426140','#526e41','#678046','#7b8b50'].map(mat),bark=mat('#71634c');
 function tree(x,z,h,poplar=false){
  const r=poplar?.28:.28+h*.018;instance('trunks',trunkGeo,bark,[x,h*.32,z],[r,h*.64,r],[0,random()*6.28,.03*(random()-.5)],trees);
  if(poplar){for(let i=0;i<6;i++)instance('leaf'+i%4,sphere,leafMats[i%4],[x+(random()-.5)*.7,h*.32+i*h*.11,z+(random()-.5)*.6],[.7+i*.08,h*.22,.65+i*.08],[0,random()*6.28,0],trees);}
  else for(let j=0;j<7;j++){const a=j*2.4,spread=h*.18;instance('leaf'+j%4,sphere,leafMats[j%4],[x+Math.cos(a)*spread,h*(.65+random()*.2),z+Math.sin(a)*spread],[h*(.16+random()*.08),h*.18,h*.21],[0,a,0],trees);
   if(j<3)instance('branches',trunkGeo,bark,[x+Math.cos(a)*h*.08,h*.47,z+Math.sin(a)*h*.08],[.13,h*.32,.13],[Math.sin(a)*.6,0,Math.cos(a)*.6],trees);
  }
  barrier(x,z,r*2,r*2);
 }
 for(const [x,z,h]of [[-9,-28,12],[-10,34,15],[-3,-24,15],[3,-30,17],[7,-36,16],[10,-42,18],[-4,21,14],[-3,33,15]])if(free(x,z,.6))tree(x,z,h,true);
 for(const [x,z,h]of [[4,-11,12],[8,-20,11],[-1,9,12],[43,-29,12],[58,-10,11],[67,35,10],[24,135,13],[82,119,12]])if(free(x,z,.8))tree(x,z,h);
 let planted=0;for(let n=0;n<500&&planted<65;n++){
  const x=-5+random()*105,z=-65+random()*195;
  if((z< -30||x>85||z>127)&&free(x,z,2)){tree(x,z,7+random()*7,random()<.2);planted++;}
 }
 // Arbustos bajos y rocas de borde: siempre fuera del paso y de los módulos.
 const shrub=mat('#5c7446'),rock=mat('#9b9b85'),reeds=mat('#6f7c42');
 for(let n=0;n<500;n++){const x=-5+random()*108,z=-61+random()*193;if(free(x,z,.4)&&!sites.some(p=>Math.hypot(x-p[0],z-p[1])<6))instance('shrubs',leafGeo,shrub,[x,.35,z],[.5+random(),.35+random()*.3,.6+random()],[0,random()*6.28,0],trees);}
 for(const poly of ponds)for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(a[0]>=bounds.xmax-.2&&b[0]>=bounds.xmax-.2||a[1]>=bounds.zmax-.2&&b[1]>=bounds.zmax-.2)continue;
  for(let d=0;d<len;d+=.85){const x=a[0]+(b[0]-a[0])*d/len,z=a[1]+(b[1]-a[1])*d/len;
   instance('shore',sphere,rock,[x,.12,z],[.35+random()*.2,.16+random()*.1,.3+random()*.15],[0,random()*6.28,0]);
   if(random()<.14)for(let j=0;j<5;j++)instance('reeds',trunkGeo,reeds,[x+(random()-.5)*.6,.45,z+(random()-.5)*.6],[.018,.7+random()*.5,.018],[0,0,(random()-.5)*.4],trees);
  }
 }
 const lily=mat('#547b47'),flower=mat('#d6aaa8');
 for(const poly of ponds){const xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]);for(let i=0;i<70;i++){const x=Math.min(...xs)+random()*(Math.max(...xs)-Math.min(...xs)),z=Math.min(...zs)+random()*(Math.max(...zs)-Math.min(...zs));if(!inside([x,z],poly))continue;
  instance('lilies',new THREE.CylinderGeometry(1,1,1,10,1,false,0,Math.PI*1.84),lily,[x,.07,z],[.22+random()*.23,.025,.3],[0,random()*6.28,0]);
  if(i%8===0)instance('flowers',sphere,flower,[x,.14,z],[.10,.09,.10]);
 }}
 for(const {geometry,material,parent,items}of batches.values()){
  const m=new THREE.InstancedMesh(geometry,material,items.length);items.forEach((o,i)=>{dummy.position.set(...o.p);dummy.scale.set(...o.s);dummy.rotation.set(...o.rotation);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.castShadow=true;m.receiveShadow=true;m.computeBoundingSphere();parent.add(m);
 }
 root.userData.landmarks=landmarks;return {root,obstacles,landmarks,places:buildings.places,buildings:buildings.root,treeCount:planted};
}
