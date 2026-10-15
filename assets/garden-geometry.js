import { pathWidth } from './garden-layout.js?v=20261015-7';

// Metros locales: este (+x), sur (+z), origen en una intersección de senderos OSM.
export const ORIGIN={lat:-35.4058339,lon:-71.631515},R=6371008.8;
export const project=([lon,lat])=>[(lon-ORIGIN.lon)*Math.PI/180*R*Math.cos(ORIGIN.lat*Math.PI/180),-(lat-ORIGIN.lat)*Math.PI/180*R];
export const BOUNDS={xmin:-45,xmax:108,zmin:-68,zmax:138};

export function clipSegment(a,b){
 let t0=0,t1=1;const dx=b[0]-a[0],dz=b[1]-a[1];
 for(const [p,q] of [[-dx,a[0]-BOUNDS.xmin],[dx,BOUNDS.xmax-a[0]],[-dz,a[1]-BOUNDS.zmin],[dz,BOUNDS.zmax-a[1]]]){
  if(p===0){if(q<0)return null;continue;}const t=q/p;
  if(p<0)t0=Math.max(t0,t);else t1=Math.min(t1,t);if(t0>t1)return null;
 }return [[a[0]+t0*dx,a[1]+t0*dz],[a[0]+t1*dx,a[1]+t1*dz]];
}
export function clipPolygon(points){
 let p=points.slice();
 for(const [axis,value,sign] of [[0,BOUNDS.xmin,1],[0,BOUNDS.xmax,-1],[1,BOUNDS.zmin,1],[1,BOUNDS.zmax,-1]]){
  const out=[];for(let i=0;i<p.length;i++){
   const a=p[i],b=p[(i+1)%p.length],ina=(a[axis]-value)*sign>=0,inb=(b[axis]-value)*sign>=0;
   if(ina)out.push(a);if(ina!==inb){const t=(value-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
  }p=out;if(!p.length)break;
 }return p;
}

export function buildGardenGeometry(geo){
 const paths=[],segments=[],ponds=[];
 for(const f of geo.features){const g=f.geometry;
  if(g.type==='LineString'){
   const points=g.coordinates.map(project);paths.push(points);
   for(let i=1;i<points.length;i++){const clipped=clipSegment(points[i-1],points[i]);if(!clipped)continue;const[a,b]=clipped;segments.push({a,b,width:pathWidth(f.properties.osmWay,a,b),osmWay:f.properties.osmWay});}
  }else if(f.properties.natural==='water'){
   const points=clipPolygon(g.coordinates[0].map(project));if(points.length>=3)ponds.push(points);
  }
 }
 return {paths,segments,ponds};
}
