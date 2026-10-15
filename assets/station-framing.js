// Encuadre frontal de una estación y su visitante, con espacio para los controles.
export function stationFrame({THREE,camera,stand,visitor,width,height,occluders=[]}){
 const yaw=stand.rotation.y,front=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
 const points=[];
 for(const x of [-1.4,1.4])for(const z of [-1.4,1.4])for(const y of [0,2.85])points.push(new THREE.Vector3(x,y,z).applyAxisAngle(new THREE.Vector3(0,1,0),yaw).add(stand.position));
 for(const x of [-.4,.4])for(const z of [-.4,.4])for(const y of [0,2.25])points.push(visitor.clone().add(new THREE.Vector3(x,y,z)));
 const center=stand.position.clone().lerp(visitor,.5);center.y=1.3;
 const padding={left:20,right:20,top:Math.min(118,height*.22),bottom:Math.min(168,height*.29)};
 const safe={left:padding.left/width*2-1,right:1-padding.right/width*2,top:1-padding.top/height*2,bottom:padding.bottom/height*2-1};
 const safeCenter=new THREE.Vector2((safe.left+safe.right)/2,(safe.top+safe.bottom)/2);
 const trial=camera.clone();trial.clearViewOffset();trial.aspect=width/height;trial.updateProjectionMatrix();
 const tan=Math.tan(THREE.MathUtils.degToRad(trial.fov)/2),ray=new THREE.Raycaster();
 const probes=[stand.position.clone().add(new THREE.Vector3(0,1.6,0)),visitor.clone().add(new THREE.Vector3(0,1.2,0))];
 let best=null;
 for(const [index,side]of [3.6,-3.6,0,5.5,-5.5].entries()){
  let scale=1,bounds,position,target;
  for(let attempt=0;attempt<50;attempt++){
   position=center.clone().addScaledVector(front,6*scale).addScaledVector(right,side*scale).add(new THREE.Vector3(0,1.7*scale,0));target=center.clone();
   for(let correction=0;correction<5;correction++){
    trial.position.copy(position);trial.lookAt(target);trial.updateMatrixWorld(true);
    const projected=points.map(p=>p.clone().project(trial));
    bounds={left:Math.min(...projected.map(p=>p.x)),right:Math.max(...projected.map(p=>p.x)),top:Math.max(...projected.map(p=>p.y)),bottom:Math.min(...projected.map(p=>p.y))};
    if(correction===4)break;
    const distance=position.distanceTo(target),dx=((bounds.left+bounds.right)/2-safeCenter.x)*distance*tan*trial.aspect,dy=((bounds.top+bounds.bottom)/2-safeCenter.y)*distance*tan;
    const shift=new THREE.Vector3(dx,dy,0).applyQuaternion(trial.quaternion);position.add(shift);target.add(shift);
   }
   if(bounds.left>=safe.left&&bounds.right<=safe.right&&bounds.bottom>=safe.bottom&&bounds.top<=safe.top)break;
   scale*=1.07;
  }
  let blocked=0;
  for(const probe of probes){const direction=probe.clone().sub(position),distance=direction.length();ray.set(position,direction.normalize());ray.far=distance-.25;if(ray.intersectObjects(occluders,true).length)blocked++;}
  const score=blocked*100+scale+index*.015;
  if(!best||score<best.score)best={position,target,safe,bounds,score,blocked};
 }
 return best;
}
