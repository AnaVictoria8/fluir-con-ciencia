// Interpretación del acceso a partir del tour UTalca y la foto aportada el 15-10-2026.
// Coordenadas locales en metros; anchos y contornos aproximados, sin levantamiento.
export const ACCESS_AREAS = [
 {name:'Explanada exterior',points:[[-43,-16],[-18,-15],[-9,-11],[-6,-4.5],[-6,4.5],[-9,17],[-24,20],[-43,17]]},
 {name:'Explanada frente a la casa',points:[[-6.5,-14],[-3,-14],[4,-13.5],[9.5,-12.5],[13,-8],[12,-3],[7,2.5],[1.8,4.5],[-6.5,4.5]]},
 {name:'Explanada hacia los baños',points:[[-6.5,3],[-.5,2],[4,5],[3.8,11],[5,17],[6,20],[2,20],[-1.5,19.2],[-6.5,19.2]]},
 {name:'Acceso a la caseta',points:[[-22,-24],[-9,-25],[-9,-10],[-22,-9]]},
 {name:'Paso lateral de la casa',points:[[-6.5,-16],[3.5,-16],[3.5,-12],[-4,-7],[-6.5,-9]]},
 {name:'Frente de los baños hacia la laguna',points:[[-1.5,18.8],[4,18.8],[5.5,24],[5,29.5],[-1.5,29.5]]},
 {name:'Paso hacia los baños',points:[[-7.8,14],[-4.8,10],[-2.8,11],[-6,18],[-6,29],[-7.8,29]]}
];

// Tres stands frente a la casa, uno al borde del ramal izquierdo y tres antes de los baños.
// yaw: el frente del stand mira hacia el espacio de circulación que le corresponde.
export const STAND_LAYOUT = [
 {id:1,position:[-3,-9.5],yaw:0,area:'Frente a la casa'},
 {id:2,position:[1.5,-9.5],yaw:0,area:'Frente a la casa'},
 {id:3,position:[6,-9.5],yaw:0,area:'Frente a la casa'},
 {id:4,position:[-2.5,6],yaw:Math.PI/2,area:'Antes de los baños · frente hacia la laguna'},
 {id:5,position:[-2.5,11.5],yaw:Math.PI/2,area:'Antes de los baños · frente hacia la laguna'},
 {id:6,position:[-2.5,17],yaw:Math.PI/2,area:'Antes de los baños · frente hacia la laguna'},
 {id:7,position:[9.3,-18],yaw:Math.PI/2,area:'Borde del camino lateral izquierdo'}
];

export const TOILET_LAYOUT={position:[-3.8,24],yaw:Math.PI/2,arrival:[1.1,24]};

export function pathWidth(osmWay,a,b){
 const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
 if(osmWay===44768721&&Math.hypot(x,z)<45)return 7;
 if(osmWay===725221067&&Math.min(Math.hypot(...a),Math.hypot(...b))<32)return 8;
 if(osmWay===725218720&&Math.hypot(x,z)<32)return 6;
 return 4.5;
}

export function segmentDistance(p,a,b){
 const dx=b[0]-a[0],dz=b[1]-a[1],d=dx*dx+dz*dz,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/d)):0;
 return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);
}
export function insidePolygon(p,poly){
 let yes=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;
 }
 return yes;
}
// Una misma superficie alimenta el suelo visible, la vegetación y las rutas del visitante.
export function createWalkingSurface(segments,areas=ACCESS_AREAS){
 return (x,z,margin=0)=>areas.some(({points})=>insidePolygon([x,z],points)||margin>0&&points.some((a,i)=>segmentDistance([x,z],a,points[(i+1)%points.length])<=margin))||segments.some(({a,b,width})=>segmentDistance([x,z],a,b)<=width/2+margin);
}
