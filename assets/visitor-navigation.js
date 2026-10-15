// Navegación en metros locales: evita el agua y las huellas de los stands.
export function createNavigation({paths,ponds,sites,bounds,obstacles=[],onSurface=()=>true,step=1}){
 const clearance=.38,barriers=[...ponds,...obstacles];
 function segmentDistance(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],d=dx*dx+dz*dz,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/d)):0;return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);}
 function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;
 }return yes;}
 function walkable(x,z){
  if(!onSurface(x,z))return false;
  if(x<bounds.xmin+.5||x>bounds.xmax-.5||z<bounds.zmin+.5||z>bounds.zmax-.5)return false;
  if(sites.some(([sx,sz])=>Math.abs(x-sx)<1.25+clearance&&Math.abs(z-sz)<1.25+clearance))return false;
  for(const poly of barriers){if(inside([x,z],poly))return false;for(let i=0;i<poly.length;i++)if(segmentDistance([x,z],poly[i],poly[(i+1)%poly.length])<clearance)return false;}
  return true;
 }
 function lineClear(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.25);for(let i=0;i<=n;i++){const t=n?i/n:0;if(!walkable(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t))return false;}return true;}
 const nx=Math.floor((bounds.xmax-bounds.xmin)/step)+1,nz=Math.floor((bounds.zmax-bounds.zmin)/step)+1;
 const valid=new Uint8Array(nx*nz),cost=new Float32Array(nx*nz);
 const point=id=>[bounds.xmin+(id%nx)*step,bounds.zmin+Math.floor(id/nx)*step];
 const segments=paths.flatMap(p=>p.slice(1).map((b,i)=>[p[i],b]));
 for(let id=0;id<valid.length;id++){
  const p=point(id);valid[id]=walkable(...p)?1:0;
  if(valid[id]){let d=Infinity;for(const[a,b]of segments)d=Math.min(d,segmentDistance(p,a,b));cost[id]=d<=1.1?1:1.5;}
 }
 function nearest(p){let best=-1,d=Infinity;for(let id=0;id<valid.length;id++)if(valid[id]){const q=point(id),n=Math.hypot(p[0]-q[0],p[1]-q[1]);if(n<d&&n<=3&&lineClear(p,q)){best=id;d=n;}}return best;}
 function route(from,to){
  if(!walkable(...from)||!walkable(...to))return null;
  const start=nearest(from),goal=nearest(to);if(start<0||goal<0)return null;
  const score=new Float64Array(valid.length).fill(Infinity),parent=new Int32Array(valid.length).fill(-1),closed=new Uint8Array(valid.length),heap=[];
  const heuristic=id=>{const p=point(id);return Math.hypot(p[0]-to[0],p[1]-to[1]);};
  function push(id,f){const n={id,f};heap.push(n);let i=heap.length-1;while(i){const j=(i-1)>>1;if(heap[j].f<=f)break;heap[i]=heap[j];i=j;}heap[i]=n;}
  function pop(){const n=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(last.f<=heap[c].f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return n.id;}
  score[start]=0;push(start,heuristic(start));
  while(heap.length){
   const id=pop();if(closed[id])continue;closed[id]=1;
   if(id===goal){
    const raw=[to];let at=goal;while(at!==-1){raw.push(point(at));at=parent[at];}raw.push(from);raw.reverse();
    const smooth=[raw[0]];let i=0;while(i<raw.length-1){let j=raw.length-1;while(j>i+1&&!lineClear(raw[i],raw[j]))j--;smooth.push(raw[j]);i=j;}return smooth;
   }
   const x=id%nx,z=Math.floor(id/nx);
   for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dz)continue;const xx=x+dx,zz=z+dz;if(xx<0||xx>=nx||zz<0||zz>=nz)continue;const next=zz*nx+xx;
    if(!valid[next]||closed[next]||(dx&&dz&&(!valid[z*nx+xx]||!valid[zz*nx+x])))continue;
    if(!lineClear(point(id),point(next)))continue;
    const s=score[id]+Math.hypot(dx,dz)*step*(cost[id]+cost[next])/2;
    if(s<score[next]){score[next]=s;parent[next]=id;push(next,s+heuristic(next));}
   }
  }return null;
 }
 return {walkable,route,lineClear};
}
