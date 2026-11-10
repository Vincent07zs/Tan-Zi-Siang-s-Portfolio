(()=>{
const $=s=>document.querySelector(s),rnd=(a,b)=>a+Math.random()*(b-a),ss=x=>x*x*(3-2*x);
const hero=$('.hero'),por=$('.portrait'),ghost=$('#ghost'),rv=$('#reveal'),bg=$('#bg');
const rctx=rv.getContext('2d'),bctx=bg.getContext('2d'),off=document.createElement('canvas'),octx=off.getContext('2d');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,touch=matchMedia('(hover: none)').matches;
const LIFE=1350;
let vw,vh,dpr,rect,W,dabs=[],last=null,lastDab=0,inside=false,mouseIn=false,lastReal=-1e9,cur={x:0,y:0},tBg=0,prevT=performance.now(),acc=0,wasAlive=false,intro=null;

const wet=(d,now)=>{const a=(now-d.t)/LIFE;if(a>=1)return null;const k=a<.26?0:ss((a-.26)/.74);return{w:1-k,s:1-.42*k}};
function addDab(x,y){const now=performance.now();dabs.push({x:x+rnd(-.014,.014)*W,y:y+rnd(-.01,.01)*W,rx:rnd(.17,.30)*W,ry:rnd(.021,.047)*W,rot:rnd(-.22,.22),p:[rnd(0,6.28),rnd(0,6.28),rnd(0,6.28)],t:now});if(dabs.length>56)dabs.shift();lastDab=now}

// Round, silky closed curve: 24 samples, low harmonics only, quadratic curves through midpoints
function shape(c,d,s,now){const n=24,P=[],T=now*.0006,co=Math.cos(d.rot),si=Math.sin(d.rot);
 for(let i=0;i<n;i++){const a=i/n*6.2832,r=1+.155*Math.sin(2*a+d.p[0]+T)+.085*Math.sin(3*a+d.p[1]-T*.8)+.04*Math.sin(5*a+d.p[2]+T*.6),
  x=Math.cos(a)*d.rx*s*r,y=Math.sin(a)*d.ry*s*r;P.push([d.x+x*co-y*si,d.y+x*si+y*co])}
 c.beginPath();c.moveTo((P[n-1][0]+P[0][0])/2,(P[n-1][1]+P[0][1])/2);
 for(let i=0;i<n;i++){const p=P[i],q=P[(i+1)%n];c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}
 c.closePath()}

function drawReveal(){const now=performance.now();let any=false;
 rctx.setTransform(1,0,0,1,0,0);rctx.globalCompositeOperation='source-over';rctx.globalAlpha=1;rctx.clearRect(0,0,rv.width,rv.height);
 rctx.setTransform(dpr,0,0,dpr,-rect.left*dpr,-rect.top*dpr);rctx.fillStyle='#000';
 for(const d of dabs){const q=wet(d,now);if(!q)continue;any=true;rctx.globalAlpha=q.w;shape(rctx,d,q.s,now);rctx.fill()}
 if(any&&ghost.naturalWidth){rctx.setTransform(1,0,0,1,0,0);rctx.globalAlpha=1;rctx.globalCompositeOperation='source-in';rctx.drawImage(ghost,0,0,rv.width,rv.height);rctx.globalCompositeOperation='source-over'}}

function strongest(now){let b=null;for(const d of dabs){const q=wet(d,now);if(q&&(!b||q.w>=b.w))b={x:d.x,y:d.y,w:q.w}}return b}

// Contour field
const CL=[{x:.16,y:.28,n:8,s:1,ph:0},{x:.86,y:.24,n:8,s:.95,ph:2},{x:.62,y:.88,n:8,s:1.1,ph:4}],RATE=[.18,-.13,.11],HK=[2,3,4],HW=[.5,.3,.2];
function paintBg(){const now=performance.now(),m=Math.min(vw,vh),R=.23*m,b=strongest(now);
 // imprint buffer: saturating mask, composited once
 octx.setTransform(1,0,0,1,0,0);octx.clearRect(0,0,off.width,off.height);octx.setTransform(dpr,0,0,dpr,0,0);octx.fillStyle='#3B3320';
 for(const d of dabs){const q=wet(d,now);if(!q)continue;octx.globalAlpha=q.w;shape(octx,d,q.s,now);octx.fill()}
 bctx.setTransform(dpr,0,0,dpr,0,0);bctx.globalAlpha=1;bctx.fillStyle='#F4EFE3';bctx.fillRect(0,0,vw,vh);
 bctx.globalAlpha=.15;bctx.drawImage(off,0,0,vw,vh);bctx.globalAlpha=1;
 const P=[new Path2D(),new Path2D(),new Path2D()];
 for(const c of CL){const cx=(c.x+Math.sin(tBg*.05+c.ph)*.03)*vw,cy=(c.y+Math.cos(tBg*.04+c.ph)*.03)*vh,sp=.055*m*c.s;
  for(let i=0;i<c.n;i++){const r0=.05*m+i*sp,amp=Math.min(.4*sp,.3*r0),N=90;let px=0,py=0;
   for(let j=0;j<=N;j++){const a=j/N*6.2832;let r=r0;
    for(let k=0;k<3;k++)r+=amp*HW[k]*Math.sin(HK[k]*a+tBg*RATE[k]+c.ph*(k+1)+i*.2*(k+1));
    let x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r,mode=0;
    if(b){const dx=x-b.x,dy=y-b.y,d=Math.hypot(dx,dy)||1;
     if(d<R){const f=1-d/R,push=22*f*f*b.w;x+=dx/d*push;y+=dy/d*push;if(b.w>.04)mode=(d<.3*R&&b.w>.25)?2:1}}
    if(j){P[mode].moveTo(px,py);P[mode].lineTo(x,y)}px=x;py=y}}}
 bctx.lineWidth=1.25;bctx.lineCap='round';bctx.lineJoin='round';
 bctx.strokeStyle='#D8D0BF';bctx.stroke(P[0]);bctx.strokeStyle='rgba(252,250,243,.95)';bctx.stroke(P[1]);bctx.strokeStyle='#B4E600';bctx.stroke(P[2])}

function sync(){drawReveal();paintBg()}
function brush(x,y){const step=.028*W;
 if(!last){last={x,y};addDab(x,y)}else{const dx=x-last.x,dy=y-last.y,dist=Math.hypot(dx,dy);
  if(dist>=step){const n=Math.min(14,Math.floor(dist/step));
   for(let i=1;i<=n;i++){const px=last.x+dx/dist*step*i,py=last.y+dy/dist*step*i;addDab(px,py);if(Math.random()<.5)addDab(px,py)}
   last={x:last.x+dx/dist*step*n,y:last.y+dy/dist*step*n}}}
 cur={x,y};inside=true;sync()}

function resize(){dpr=Math.min(devicePixelRatio||1,2);vw=hero.clientWidth;vh=hero.clientHeight;
 bg.width=off.width=Math.round(vw*dpr);bg.height=off.height=Math.round(vh*dpr);
 rect=por.getBoundingClientRect();W=rect.width;rv.width=Math.round(rect.width*dpr);rv.height=Math.round(rect.height*dpr);sync()}

function real(e){lastReal=performance.now();mouseIn=true;brush(e.clientX,e.clientY)}
addEventListener('pointermove',real,{passive:true});addEventListener('pointerdown',real,{passive:true});
const up=e=>{if(e.pointerType==='touch'){mouseIn=inside=false;last=null}};
addEventListener('pointerup',up);addEventListener('pointercancel',up);
document.documentElement.addEventListener('mouseleave',()=>{mouseIn=inside=false;last=null});
addEventListener('resize',resize);ghost.addEventListener('load',drawReveal);

function tick(now){requestAnimationFrame(tick);const dt=Math.min((now-prevT)/1000,.1);prevT=now;
 if(intro){const p=(now-intro)/2400;if(p>=1){intro=null;last=null;inside=mouseIn}else brush(rect.left+W*(.08+.84*ss(p)),rect.top+rect.height*(.36+.05*Math.sin(p*6.28)))}
 else if(touch&&now-lastReal>2000)brush(rect.left+W*(.5+.34*Math.sin(now*.00045)),rect.top+rect.height*(.36+.22*Math.sin(now*.0007+1.3)));
 if(inside&&now-lastDab>130)addDab(cur.x,cur.y);
 dabs=dabs.filter(d=>wet(d,now));const alive=dabs.length>0;
 if(alive||wasAlive)drawReveal();
 acc+=dt;if(acc>=1/30){if(!reduce)tBg+=acc;if(!reduce||alive||wasAlive)paintBg();acc=0}
 wasAlive=alive}

// Resting flicker: irregular bursts of 1–3 quick flashes
function flicker(){const burst=1+Math.floor(Math.random()*3);let i=0;
 (function f(){if(i++>=burst){ghost.style.opacity=.022;setTimeout(flicker,rnd(2200,6400));return}
  ghost.style.opacity=rnd(.07,.12);setTimeout(()=>{ghost.style.opacity=.022;setTimeout(f,rnd(50,150))},80)})()}
if(!reduce)setTimeout(flicker,rnd(2200,6400));

resize();requestAnimationFrame(tick);
setTimeout(()=>{intro=performance.now()},900);
})();
