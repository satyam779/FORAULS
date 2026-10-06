async function e(e,t={}){let n=t,r=[],i=(e,t,n,i)=>{e.addEventListener(t,n,i),r.push(()=>e.removeEventListener(t,n,i))};function a(e){n.onToast?.(e)}let o={add:(e,t)=>[e[0]+t[0],e[1]+t[1],e[2]+t[2]],sub:(e,t)=>[e[0]-t[0],e[1]-t[1],e[2]-t[2]],scale:(e,t)=>[e[0]*t,e[1]*t,e[2]*t],dot:(e,t)=>e[0]*t[0]+e[1]*t[1]+e[2]*t[2],cross:(e,t)=>[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],len:e=>Math.hypot(e[0],e[1],e[2]),norm:e=>{let t=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/t,e[1]/t,e[2]/t]},lerp:(e,t,n)=>[e[0]+(t[0]-e[0])*n,e[1]+(t[1]-e[1])*n,e[2]+(t[2]-e[2])*n]},s={perspective(e,t,n,r){let i=1/Math.tan(e/2),a=1/(n-r);return new Float32Array([i/t,0,0,0,0,i,0,0,0,0,r*a,-1,0,0,r*n*a,0])},ortho(e,t,n,r,i,a){return new Float32Array([2/(t-e),0,0,0,0,2/(r-n),0,0,0,0,1/(i-a),0,(e+t)/(e-t),(r+n)/(n-r),i/(i-a),1])},lookAt(e,t,n){let r=o.norm(o.sub(e,t)),i=o.norm(o.cross(n,r)),a=o.cross(r,i);return new Float32Array([i[0],a[0],r[0],0,i[1],a[1],r[1],0,i[2],a[2],r[2],0,-o.dot(i,e),-o.dot(a,e),-o.dot(r,e),1])},mul(e,t){let n=new Float32Array(16);for(let r=0;r<4;r++)for(let i=0;i<4;i++){let a=0;for(let n=0;n<4;n++)a+=e[n*4+i]*t[r*4+n];n[r*4+i]=a}return n},invert(e){let t=e,n=new Float32Array(16),r=t[0]*t[5]-t[1]*t[4],i=t[0]*t[6]-t[2]*t[4],a=t[0]*t[7]-t[3]*t[4],o=t[1]*t[6]-t[2]*t[5],s=t[1]*t[7]-t[3]*t[5],c=t[2]*t[7]-t[3]*t[6],l=t[8]*t[13]-t[9]*t[12],u=t[8]*t[14]-t[10]*t[12],d=t[8]*t[15]-t[11]*t[12],f=t[9]*t[14]-t[10]*t[13],p=t[9]*t[15]-t[11]*t[13],m=t[10]*t[15]-t[11]*t[14],h=1/(r*m-i*p+a*f+o*d-s*u+c*l);return n[0]=(t[5]*m-t[6]*p+t[7]*f)*h,n[1]=(t[2]*p-t[1]*m-t[3]*f)*h,n[2]=(t[13]*c-t[14]*s+t[15]*o)*h,n[3]=(t[10]*s-t[9]*c-t[11]*o)*h,n[4]=(t[6]*d-t[4]*m-t[7]*u)*h,n[5]=(t[0]*m-t[2]*d+t[3]*u)*h,n[6]=(t[14]*a-t[12]*c-t[15]*i)*h,n[7]=(t[8]*c-t[10]*a+t[11]*i)*h,n[8]=(t[4]*p-t[5]*d+t[7]*l)*h,n[9]=(t[1]*d-t[0]*p-t[3]*l)*h,n[10]=(t[12]*s-t[13]*a+t[15]*r)*h,n[11]=(t[9]*a-t[8]*s-t[11]*r)*h,n[12]=(t[5]*u-t[4]*f-t[6]*l)*h,n[13]=(t[0]*f-t[1]*u+t[2]*l)*h,n[14]=(t[13]*i-t[12]*o-t[14]*r)*h,n[15]=(t[8]*o-t[9]*i+t[10]*r)*h,n}},c=(e,t,n)=>Math.min(n,Math.max(t,e)),l=(e,t,n)=>{let r=c((n-e)/(t-e),0,1);return r*r*(3-2*r)},u={W:.31,Hs:.705,Hn:.745,Nw:.1,dropF:.085,dropB:.024,nC:40,nR:46,jA:28,nk:15,theta:28*Math.PI/180,Ltop:.24,cuffW:.21,collarW:.026,hemW:.026,cuffB:.024,zOff:.014};function d(e,t){let n=Math.abs(e);if(n<u.Nw){let e=n/u.Nw;return u.Hn-t*Math.max(0,1-e*e)**.75}return u.Hn+(u.Hs-u.Hn)*(n-u.Nw)/(u.W-u.Nw)}function f(e,t,n,r,i,a){let o=i-n,s=a-r,l=o*o+s*s,u=l>0?c(((e-n)*o+(t-r)*s)/l,0,1):0;return{d:Math.hypot(e-n-o*u,t-r-s*u),t:u}}function p(){let e=u,t=e.nR-e.jA,n=e.Hs*e.jA/e.nR,r=[Math.cos(e.theta),-Math.sin(e.theta)],i=[Math.sin(e.theta),Math.cos(e.theta)],a=[e.W,e.Hs],o=[e.W,n],s=[a[0]+e.Ltop*r[0],a[1]+e.Ltop*r[1]],c=[s[0]-e.cuffW*i[0],s[1]-e.cuffW*i[1]],l=[],p=[],m=[],h=[],g=[[],[]],_=[[[],[]],[[],[]]],v=(e,t,n,r)=>(l.push(e),p.push(t),m.push(n),h.push(r),l.length-1);for(let n=0;n<2;n++){let r=n?e.dropB:e.dropF;for(let t=0;t<=e.nC;t++){let i=-e.W+2*e.W*t/e.nC,a=d(i,r),o=[];for(let t=0;t<=e.nR;t++)o.push(v(i,a*t/e.nR,n,0));g[n].push(o)}for(let r=0;r<2;r++){let i=r?-1:1,l=_[n][r];l.push([]);for(let i=0;i<=t;i++)l[0].push(g[n][r?0:e.nC][e.jA+i]);for(let r=1;r<=e.nk;r++){let u=r/e.nk,d=[],f=o[0]+(c[0]-o[0])*u,p=o[1]+(c[1]-o[1])*u,m=a[0]+(s[0]-a[0])*u,h=a[1]+(s[1]-a[1])*u;for(let e=0;e<=t;e++){let r=e/t;d.push(v(i*(f+(m-f)*r),p+(h-p)*r,n,1))}l.push(d)}}}let y=l.length,b=[];for(let t of[1,-1])b.push([t*e.W,0,t*e.W,n],[t*e.W,n,t*e.W,e.Hs],[t*e.Nw,e.Hn,t*e.W,e.Hs],[t*e.W,e.Hs,t*s[0],s[1]],[t*e.W,n,t*c[0],c[1]]);let x=[0,1].map(t=>{let n=[],r=t?e.dropB:e.dropF;for(let t=0;t<=48;t++){let i=-e.Nw+2*e.Nw*t/48;n.push([i,d(i,r)])}let i=[0];for(let e=1;e<n.length;e++)i.push(i[e-1]+Math.hypot(n[e][0]-n[e-1][0],n[e][1]-n[e-1][1]));return{pts:n,cum:i}}),S=new Float32Array(y),C=new Float32Array(y),w=new Float32Array(y),T=new Float32Array(y);for(let e=0;e<y;e++){let t=l[e],n=p[e],a=1e9;for(let e of b)a=Math.min(a,f(t,n,e[0],e[1],e[2],e[3]).d);if(S[e]=a,h[e]===0){C[e]=n;let r=x[m[e]],i=1e9,a=0;for(let e=0;e<r.pts.length-1;e++){let o=r.pts[e],s=r.pts[e+1],c=f(t,n,o[0],o[1],s[0],s[1]);c.d<i&&(i=c.d,a=r.cum[e]+c.t*(r.cum[e+1]-r.cum[e]))}w[e]=i,T[e]=i<.08?a:t}else{let a=Math.abs(t);C[e]=Math.abs((a-s[0])*r[0]+(n-s[1])*r[1]),w[e]=1,T[e]=(a-s[0])*i[0]+(n-s[1])*i[1]}}let E=new Float32Array(y),D=new Float32Array(y),O=new Float32Array(y),k=new Float32Array(y);for(let t=0;t<y;t++){let n=1,r=1,i=1,a=1;h[t]===1&&(n=.72,r=1.45,i=.55),w[t]<e.collarW?(n=1.5,i=7,a=2.5,r=.8):h[t]===0&&C[t]<e.hemW?(n=1.3,i=3.5,a=1.6):h[t]===1&&C[t]<e.cuffB&&(n=1,i=2.4,a=1.4),E[t]=1/n,D[t]=r,O[t]=i,k[t]=a}let A=new Map,j=(e,t)=>Math.hypot(l[e]-l[t],p[e]-p[t]),M=(e,t,n)=>{if(e===t||e===void 0||t===void 0)return;let r=e<t?e*y+t:t*y+e,i=A.get(r);if(i!==void 0&&i.type<=n)return;let a=n===2?(O[e]+O[t])*.5:n<=1?(k[e]+k[t])*.5:1;A.set(r,{a:e,b:t,type:n,rest:n===4?0:j(e,t),mul:a})},N=[],P=[],F=(e,t,n,r,i)=>{for(let a=0;a<=t;a++)for(let o=0;o<=n;o++){let s=e[a][o];a<t&&M(s,e[a+1][o],0),o<n&&M(s,e[a][o+1],0),a<t&&o<n&&(M(s,e[a+1][o+1],1),M(e[a+1][o],e[a][o+1],1),P.push([s,e[a+1][o],e[a+1][o+1],e[a][o+1],a+o&1])),a+2<=t&&M(s,e[a+2][o],2),o+2<=n&&M(s,e[a][o+2],2);for(let c of[r,i])c&&(a+c<=t&&M(s,e[a+c][o],3),o+c<=n&&M(s,e[a][o+c],3));let c=r;a+c<=t&&o+c<=n&&M(s,e[a+c][o+c],3),a+c<=t&&o-c>=0&&M(s,e[a+c][o-c],3)}};for(let n=0;n<2;n++){F(g[n],e.nC,e.nR,4,12);for(let r=0;r<2;r++){F(_[n][r],e.nk,t,4,0);let i=r?4:e.nC-4;for(let a=0;a<=t;a+=2)M(_[n][r][4][a],g[n][i][e.jA+a],3)}}let I=new Int32Array(y).fill(-1),L=(e,t)=>{I[e]>=0||(I[e]=t,I[t]=e,M(e,t,4))};for(let t=0;t<=e.jA;t++)for(let n of[0,e.nC])L(g[0][n][t],g[1][n][t]);for(let t=0;t<=e.nC;t++)Math.abs(l[g[0][t][e.nR]])>=e.Nw-1e-6&&L(g[0][t][e.nR],g[1][t][e.nR]);for(let n=0;n<2;n++)for(let r=1;r<=e.nk;r++)L(_[0][n][r][t],_[1][n][r][t]),L(_[0][n][r][0],_[1][n][r][0]);let R=Array.from({length:y},()=>[]);for(let e of A.values())R[e.a].push([e.b,e.rest,e.type,e.mul]),R[e.b].push([e.a,e.rest,e.type,e.mul]);let z=new Uint32Array(y*2),B=0;for(let e=0;e<y;e++)B+=R[e].length;let V=new ArrayBuffer(B*16),H=new Uint32Array(V),ee=new Float32Array(V),U=0;for(let e=0;e<y;e++){z[e*2]=U,z[e*2+1]=R[e].length;for(let[t,n,r,i]of R[e])H[U*4]=t,ee[U*4+1]=n,H[U*4+2]=r,ee[U*4+3]=i,U++}for(let[e,t,n,r,i]of P){let a=(l[t]-l[e])*(p[n]-p[e])-(p[t]-p[e])*(l[n]-l[e])<0==(m[e]===1)?[e,t,n,r]:[e,r,n,t];i?N.push(a[0],a[1],a[2],a[0],a[2],a[3]):N.push(a[0],a[1],a[3],a[1],a[2],a[3])}let W=new Uint32Array(y*4),G=new Float32Array(y*4),K=(e,t,n,r,i)=>{(l[n]-l[t])*(p[i]-p[r])-(p[n]-p[t])*(l[i]-l[r])<0&&([t,n]=[n,t]),W.set([t,n,r,i],e*4),G.set([E[e],D[e],j(t,n)||.001,j(r,i)||.001],e*4)};for(let n=0;n<2;n++){let r=g[n];for(let t=0;t<=e.nC;t++)for(let n=0;n<=e.nR;n++)K(r[t][n],r[Math.max(t-1,0)][n],r[Math.min(t+1,e.nC)][n],r[t][Math.max(n-1,0)],r[t][Math.min(n+1,e.nR)]);for(let r=0;r<2;r++){let i=_[n][r];for(let n=1;n<=e.nk;n++)for(let r=0;r<=t;r++)K(i[n][r],i[n-1][r],i[Math.min(n+1,e.nk)][r],i[n][Math.max(r-1,0)],i[n][Math.min(r+1,t)])}}let q=new Float32Array(y*8),te=new Float32Array(y*4);for(let e=0;e<y;e++)q.set([l[e],p[e],S[e],C[e],w[e],T[e],h[e],m[e]],e*8),te.set([l[e],p[e],S[e],m[e]],e*4);let ne=[];for(let t=0;t<2;t++)for(let n=0;n<=e.nC;n++){let r=g[t][n][e.nR],i=Math.abs(l[r]);i>=e.Nw-1e-6&&i<=.235&&ne.push(r)}return{N:y,px:l,py:p,panelOf:m,seamDist:S,partner:I,adjRange:z,adjBuf:V,adjCount:B,indices:new Uint32Array(N),nbr:W,phys:G,attr:q,meta:te,hangerPins:ne,spacing:2*e.W/e.nC}}function m(e,t){let n=new Float32Array(e.N*4),r=t===`free`?-1.05:0,i=t===`free`?.45:0,a=Math.cos(r),o=Math.sin(r),s=Math.cos(i),c=Math.sin(i);for(let r=0;r<e.N;r++){let i=e.px[r],d=e.py[r],f=(e.panelOf[r]?-1:1)*u.zOff*l(0,.045,e.seamDist[r]);if(t===`free`){d-=.4;let e=d*a-f*o,t=d*o+f*a;d=e,f=t;let n=i*s+f*c,r=-i*c+f*s;i=n,f=r,d+=.95}else d+=.27;n.set([i,d,f,1],r*4)}return n}let h=`
struct Cam {
  viewProj: mat4x4f,
  invViewProj: mat4x4f,
  lightVP: mat4x4f,
  aoVP: mat4x4f,
  eye: vec4f,
  fabric: vec4f,     // rgb linear base colour, w wash strength
  fuzz: vec4f,       // rgb fuzz/sheen colour, w thread lightness
  frontRect: vec4f,  // print placement in pattern metres: cx, cy, w, h
  backRect: vec4f,
  misc: vec4f,       // x time, y shadow texel, z exposure, w floor y
  res: vec4f,        // width, height, 1/width, 1/height
  keyDir: vec4f,
  fillDir: vec4f,
  rimL: vec4f,
  rimR: vec4f,
  ao: vec4f,         // x eye y of AO camera, y depth range, z texture size, w world half-size
};
@group(0) @binding(0) var<uniform> cam: Cam;

fn aces(x: vec3f) -> vec3f {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), vec3f(0.0), vec3f(1.0));
}
fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 45.32);
  return fract(q.x * q.y);
}
// Backdrop: soft product-photo gradient with a gentle vignette (linear colour)
fn backdrop(uv: vec2f) -> vec3f {
  var c = mix(vec3f(0.80, 0.805, 0.82), vec3f(0.62, 0.625, 0.645), smoothstep(0.0, 1.0, uv.y));
  let d = length((uv - vec2f(0.5, 0.4)) * vec2f(cam.res.x * cam.res.w, 1.0));
  c *= 1.0 - 0.2 * smoothstep(0.35, 1.25, d);
  return c;
}
fn dither(fc: vec2f) -> f32 { return (hash21(fc) - 0.5) / 255.0; }

@group(0) @binding(6) var shadowMap: texture_depth_2d;
@group(0) @binding(7) var shadowSamp: sampler_comparison;

var<private> POISSON: array<vec2f, 12> = array<vec2f, 12>(
  vec2f(-0.326, -0.406), vec2f(-0.840, -0.074), vec2f(-0.696, 0.457), vec2f(-0.203, 0.621),
  vec2f(0.962, -0.195), vec2f(0.473, -0.480), vec2f(0.519, 0.767), vec2f(0.185, -0.893),
  vec2f(0.507, 0.064), vec2f(0.896, 0.412), vec2f(-0.322, -0.933), vec2f(-0.792, -0.598));

fn shadowAt(world: vec3f, N: vec3f, soft: f32, taps: i32) -> f32 {
  let lp = cam.lightVP * vec4f(world + N * 0.006, 1.0);
  let uv = lp.xy * vec2f(0.5, -0.5) + 0.5;
  if (any(uv < vec2f(0.0)) || any(uv > vec2f(1.0)) || lp.z > 1.0) { return 1.0; }
  let z = lp.z - 0.0012;
  let r = cam.misc.y * soft;
  var s = 0.0;
  for (var i = 0; i < taps; i++) { s += textureSampleCompareLevel(shadowMap, shadowSamp, uv + POISSON[i] * r, z); }
  return s / f32(taps);
}

fn ggx(NdH: f32, a: f32) -> f32 {
  let a2 = a * a; let d = NdH * NdH * (a2 - 1.0) + 1.0;
  return a2 / (3.14159 * d * d);
}
// Charlie sheen distribution: the soft fibre glow of brushed cotton
fn charlie(NdH: f32, r: f32) -> f32 {
  let inv = 1.0 / r; let s2 = max(1.0 - NdH * NdH, 0.0078125);
  return (2.0 + inv) * pow(s2, inv * 0.5) / 6.2831;
}
fn oneLight(N: vec3f, V: vec3f, L: vec3f, col: vec3f, alb: vec3f, rough: f32, f0: f32, sheen: vec3f, wrap: f32) -> vec3f {
  let NdL = dot(N, L);
  let nl = max(NdL, 0.0);
  let NdV = max(dot(N, V), 1e-3);
  let H = normalize(L + V);
  let NdH = max(dot(N, H), 0.0);
  let VdH = max(dot(V, H), 0.0);
  let diff = max((NdL + wrap) / (1.0 + wrap), 0.0);
  let F = f0 + (1.0 - f0) * pow(1.0 - VdH, 5.0);
  let spec = ggx(NdH, rough * rough) * F * 0.25 / max(NdV, 0.15) * nl;
  let sh = sheen * charlie(NdH, 0.55) / (4.0 * (nl + NdV - nl * NdV) + 1e-3) * nl;
  return col * (alb * diff + spec + sh);
}
// Full studio rig. Rims are placed behind the subject relative to the camera,
// so the black fabric always separates from the backdrop.
fn studio(N: vec3f, V: vec3f, alb: vec3f, rough: f32, f0: f32, sheen: vec3f, sh: f32, ao: f32) -> vec3f {
  var c = oneLight(N, V, cam.keyDir.xyz, vec3f(1.0, 0.965, 0.92) * 1.75 * sh, alb, rough, f0, sheen, 0.25);
  c += oneLight(N, V, cam.fillDir.xyz, vec3f(0.85, 0.9, 1.0) * 0.42, alb, rough, f0, sheen, 0.5) * mix(0.6, 1.0, ao);
  c += oneLight(N, V, cam.rimL.xyz, vec3f(1.0) * 2.1, alb, rough, f0, sheen, 0.0) * mix(0.5, 1.0, ao);
  c += oneLight(N, V, cam.rimR.xyz, vec3f(0.95, 0.97, 1.0) * 1.7, alb, rough, f0, sheen, 0.0) * mix(0.5, 1.0, ao);
  // hemisphere ambient (bright studio sweep above, darker floor bounce below)
  let hemi = mix(vec3f(0.42, 0.42, 0.43), vec3f(0.95, 0.96, 0.98), N.y * 0.5 + 0.5);
  c += hemi * alb * ao * 0.42;
  // fibre fuzz: soft light caught by the nap at grazing angles
  let fz = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  c += sheen * fz * ao * (0.3 + 0.9 * max(dot(-V, cam.rimL.xyz), 0.0) + 0.6 * max(dot(-V, cam.rimR.xyz), 0.0));
  return c;
}

@group(0) @binding(1) var<storage, read> rnd: array<vec4f>;
@group(0) @binding(2) var<storage, read> attr: array<vec4f>;
@group(0) @binding(3) var frontTex: texture_2d<f32>;
@group(0) @binding(4) var backTex: texture_2d<f32>;
@group(0) @binding(5) var linSamp: sampler;
@group(0) @binding(8) var detailTex: texture_2d<f32>;   // baked wash / streak / slub / crack cells
@group(0) @binding(9) var repSamp: sampler;

const COLLAR_W: f32 = ${u.collarW};
const HEM_W: f32 = ${u.hemW};
const CUFF_W: f32 = ${u.cuffB};

struct VOut {
  @builtin(position) pos: vec4f,
  @location(0) world: vec3f,
  @location(1) n: vec3f,
  @location(2) a0: vec4f,   // pattern x, y, seam distance, hem/cuff distance
  @location(3) a1: vec4f,   // neck distance, rib coordinate, region, panel
  @location(4) ex: vec2f,   // fold cavity, stretch
};
@vertex fn vs(@builtin(vertex_index) vi: u32) -> VOut {
  let p = rnd[2u * vi]; let n = rnd[2u * vi + 1u];
  var o: VOut;
  o.pos = cam.viewProj * vec4f(p.xyz, 1.0);
  o.world = p.xyz; o.n = n.xyz;
  o.a0 = attr[2u * vi]; o.a1 = attr[2u * vi + 1u];
  o.ex = vec2f(p.w, n.w);
  return o;
}

fn ridge(d: f32, c: f32, w: f32, fw: f32) -> vec2f {   // thread profile + derivative, anti-aliased
  let we = max(w, fw * 0.7);
  let x = (d - c) / we; let e = exp(-x * x) * (w / we);
  return vec2f(e, -2.0 * x / we * e);
}
fn knitH(q: vec2f) -> f32 {     // jersey: columns of interlocking V loops
  return 0.5 + 0.5 * sin(6.2831 * (q.y + abs(fract(q.x) - 0.5))) * (0.65 + 0.35 * sin(6.2831 * q.x));
}
fn inRect(t: vec2f) -> f32 { return f32(all(t >= vec2f(0.0)) && all(t <= vec2f(1.0))); }

@fragment fn fs(in: VOut, @builtin(front_facing) ff: bool) -> @location(0) vec4f {
  let uv = in.a0.xy;
  let seamD = in.a0.z; let edgeD = in.a0.w; let neckD = in.a1.x; let ribC = in.a1.y;
  let sleeve = in.a1.z > 0.5; let back = in.a1.w > 0.5;

  // derivatives first (must be in uniform control flow)
  let dPdx = dpdx(in.world); let dPdy = dpdy(in.world);
  let duvdx = dpdx(uv); let duvdy = dpdy(uv);
  let fwS = fwidth(seamD); let fwE = fwidth(edgeD); let fwN = fwidth(neckD); let fwR = fwidth(ribC);
  let dsx = dpdx(seamD); let dsy = dpdy(seamD); let dex = dpdx(edgeD); let dey = dpdy(edgeD);
  let dnx = dpdx(neckD); let dny = dpdy(neckD); let drx = dpdx(ribC); let dry = dpdy(ribC);
  let pxm = max(length(duvdx), length(duvdy)); // metres of cloth per pixel

  // ---- prints (sampled unconditionally, masked afterwards)
  let fr = cam.frontRect; let br = cam.backRect;
  let fuv = vec2f((uv.x - fr.x) / fr.z + 0.5, 0.5 - (uv.y - fr.y) / fr.w);
  let buv = vec2f(0.5 - (uv.x - br.x) / br.z, 0.5 - (uv.y - br.y) / br.w);
  let fgx = dpdx(fuv); let fgy = dpdy(fuv); let bgx = dpdx(buv); let bgy = dpdy(buv);
  // baked detail lookups (uniform control flow)
  let dW = textureSample(detailTex, repSamp, uv * 0.55 + select(vec2f(0.0), vec2f(0.37, 0.61), back));
  let dS = textureSample(detailTex, repSamp, uv * vec2f(1.15, 3.8));
  let dL = textureSample(detailTex, repSamp, uv * vec2f(2.2, 9.4));
  let dC = textureSample(detailTex, repSamp, uv * 13.0);
  let outside = f32(ff) * f32(!sleeve);
  let mF = inRect(fuv) * f32(!back) * outside;
  let mB = inRect(buv) * f32(back) * outside;
  var pa = 0.0; var pc = vec3f(0.0); var g = vec2f(0.0);
  if (mF > 0.5) {
    let fd = 1.5 / vec2f(textureDimensions(frontTex));
    let c = textureSampleGrad(frontTex, linSamp, fuv, fgx, fgy);
    let ax = textureSampleGrad(frontTex, linSamp, fuv + vec2f(fd.x, 0.0), fgx, fgy).a;
    let ay = textureSampleGrad(frontTex, linSamp, fuv + vec2f(0.0, fd.y), fgx, fgy).a;
    pa = c.a; pc = c.rgb;
    g = vec2f((ax - c.a) / fd.x / fr.z, -(ay - c.a) / fd.y / fr.w);
  } else if (mB > 0.5) {
    let bd = 1.5 / vec2f(textureDimensions(backTex));
    let c = textureSampleGrad(backTex, linSamp, buv, bgx, bgy);
    let ax = textureSampleGrad(backTex, linSamp, buv + vec2f(bd.x, 0.0), bgx, bgy).a;
    let ay = textureSampleGrad(backTex, linSamp, buv + vec2f(0.0, bd.y), bgx, bgy).a;
    pa = c.a; pc = c.rgb;
    g = vec2f(-(ax - c.a) / bd.x / br.z, -(ay - c.a) / bd.y / br.w);
  }
  g *= 0.00018;   // the ink layer is raised ~0.18 mm
  var hx = 0.0; var hy = 0.0;

  // ---- cotton: vintage wash, slub, knit
  var alb = cam.fabric.rgb;
  let wash = dW.r;
  let streak = dS.g;
  alb *= 1.0 + cam.fabric.w * ((wash - 0.5) * 0.85 + (streak - 0.5) * 0.4);
  let wear = max(max(1.0 - smoothstep(0.0, 0.014, seamD), 1.0 - smoothstep(0.0, 0.01, edgeD)), 1.0 - smoothstep(0.0, 0.007, neckD));
  alb = mix(alb, min(alb * 1.55 + 0.006, vec3f(1.0)), clamp(wear * cam.fabric.w * (0.4 + streak), 0.0, 1.0));
  alb *= 0.965 + 0.07 * dL.b;                                             // horizontal slub yarn
  let kf = 1.0 - smoothstep(0.0005, 0.0012, pxm);                        // knit only when zoomed in
  var k0 = 0.5;
  if (kf > 0.0) {
    let ks = vec2f(1.0 / 0.0022, 1.0 / 0.0017);
    let kq = uv * ks;
    k0 = knitH(kq);
    g += vec2f((knitH(kq + vec2f(0.04, 0.0)) - k0) / 0.04 * ks.x, (knitH(kq + vec2f(0.0, 0.04)) - k0) / 0.04 * ks.y) * 0.00010 * kf;
    alb *= 1.0 + (k0 - 0.5) * 0.14 * kf;
  }

  // Detail below is only evaluated near seams, bands and edges (most pixels skip it).
  let dashC = uv.x + uv.y;
  let dash = mix(0.8, 0.55 + 0.45 * smoothstep(-0.2, 0.4, sin(dashC * 6.2831 / 0.0034)), 1.0 - smoothstep(0.3, 0.7, fwidth(dashC) / 0.0034));
  let th = 0.00035 * dash;
  var thread = 0.0;

  // ---- ribbed crew neck + collar join (double-needle neck tape)
  if (!sleeve && neckD < COLLAR_W + 0.014) {
    let collar = 1.0 - smoothstep(COLLAR_W - 0.001, COLLAR_W + 0.0005, neckD);
    let ribP = 0.0046;
    let rf = 1.0 - smoothstep(0.3, 0.65, fwR / ribP);
    let rph = ribC * 6.2831 / ribP;
    let ribH = 0.5 + 0.5 * cos(rph);
    let ribD = -0.5 * sin(rph) * 6.2831 / ribP * 0.0007 * collar * rf;
    hx += ribD * drx; hy += ribD * dry;
    alb *= mix(1.0, 0.78 + 0.34 * ribH, collar * mix(0.35, 1.0, rf));
    let cs = ridge(neckD, COLLAR_W, 0.0016, fwN);                         // band sits proud of the body
    let c1 = ridge(neckD, COLLAR_W + 0.0035, 0.0006, fwN); let c2 = ridge(neckD, COLLAR_W + 0.0095, 0.0006, fwN);
    thread += c1.x + c2.x;
    let k = cs.y * 0.0006 + (c1.y + c2.y) * th;
    hx += k * dnx; hy += k * dny;
  }

  // ---- folded hem / cuff band with twin-needle coverstitch
  let bandW = select(HEM_W, CUFF_W, sleeve);
  if (edgeD < bandW + 0.006) {
    let hb = ridge(edgeD, bandW, 0.0018, fwE);
    let edgeRoll = ridge(edgeD, 0.0, 0.003, fwE);                        // rolled fold at the very edge
    let h1 = ridge(edgeD, bandW - 0.0045, 0.0006, fwE); let h2 = ridge(edgeD, bandW + 0.0018, 0.0006, fwE);
    thread += h1.x + h2.x;
    let k = hb.y * 0.0005 + edgeRoll.y * 0.0008 + (h1.y + h2.y) * th;
    hx += k * dex; hy += k * dey;
  }

  // ---- double-needle seams (shoulders, sides, armholes, sleeves)
  var seamShadow = 1.0;
  if (seamD < 0.016) {
    let s1 = ridge(seamD, 0.0055, 0.0006, fwS); let s2 = ridge(seamD, 0.0115, 0.0006, fwS);
    thread += s1.x + s2.x;
    let k = (s1.y + s2.y) * th;
    hx += k * dsx; hy += k * dsy;
    seamShadow = 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.003 + fwS, seamD));
  }
  thread = clamp(thread * dash, 0.0, 1.0);
  alb = mix(alb, alb * 1.25 + cam.fuzz.w, thread * 0.85) * seamShadow;

  // ---- print: soft-hand ink that cracks under stretch
  let stretch = in.ex.y;
  let crackLine = (1.0 - smoothstep(0.04, 0.14, dC.a)) * (1.0 - smoothstep(0.0007, 0.002, pxm));
  let crackAmt = 0.12 + 0.85 * smoothstep(1.03, 1.16, stretch);
  pa *= 1.0 - crackLine * crackAmt;
  g *= 1.0 - crackLine * 0.6;
  let ink = pc * (0.93 + 0.07 * k0) * mix(1.0, 0.94, wash);              // ink takes on the knit & wash
  let albedo = mix(alb, ink, pa);

  // ---- perturbed normal (surface-gradient bump mapping, no tangents needed)
  var N = normalize(in.n);
  if (!ff) { N = -N; }
  let dhdx = dot(g, duvdx) + hx; let dhdy = dot(g, duvdy) + hy;
  let R1 = cross(dPdy, N); let R2 = cross(N, dPdx); let det = dot(dPdx, R1);
  if (abs(det) > 1e-14) { N = normalize(abs(det) * N - sign(det) * (dhdx * R1 + dhdy * R2)); }

  // ---- lighting
  let V = normalize(cam.eye.xyz - in.world);
  let fold = clamp(1.0 - max(in.ex.x, 0.0) * 0.6, 0.3, 1.0) * clamp(1.0 + min(in.ex.x, 0.0) * 0.15, 0.85, 1.0);
  let ao = fold * select(0.32, 1.0, ff);                                  // inside of the shirt is dark
  let sh = shadowAt(in.world, N, 1.3, 5);
  let rough = mix(0.86, 0.52, pa);
  let f0 = mix(0.03, 0.05, pa);
  let sheen = cam.fuzz.rgb * mix(1.0, 0.35, pa) * select(0.5, 1.0, ff);
  let col = studio(N, V, albedo, rough, f0, sheen, sh, ao);
  return vec4f(pow(aces(col * cam.misc.z), vec3f(1.0 / 2.2)) + dither(in.pos.xy), 1.0);
}
`,g=matchMedia(`(pointer: coarse)`).matches||Math.min(screen.width,screen.height)<700,_={substeps:6,iterations:5,selfPasses:2,shadowSize:g?1024:2048,aoSize:256,maxDpr:2,msaa:4,hashSize:32768,maxPins:256},v={black:{name:`Washed Black`,base:[.016,.016,.0175],wash:.7,fuzz:[.075,.075,.08],thread:.008,exposure:1},bone:{name:`Bone White`,base:[.72,.66,.55],wash:.12,fuzz:[.2,.19,.17],thread:0,exposure:.78},olive:{name:`Olive`,base:[.092,.098,.047],wash:.4,fuzz:[.16,.17,.11],thread:.01,exposure:1},jet:{name:`Jet Black`,base:[.011,.011,.012],wash:.16,fuzz:[.06,.06,.065],thread:.006,exposure:1},burgundy:{name:`Burgundy`,base:[.15,.027,.036],wash:.4,fuzz:[.21,.1,.11],thread:.01,exposure:1}},y={mode:`hanger`,paused:!1,wind:!1,colour:`black`,weight:240,stiffness:55,stretch:25,damping:30,windStrength:55,manqGrow:1,time:0,shakeAmp:0,shakePhase:0,shakeDir:[1,0,0],grab:null,userPinPos:new Map,modePinPos:new Map,frontAspect:.2,backAspect:1.36,frontRect:null,backRect:null,autoSpin:0,userActive:!1},b,x,S,C,w={},T=null,E=!1,D=0;async function O(){if(!navigator.gpu)throw Error(`This browser does not expose navigator.gpu.`);let t=await navigator.gpu.requestAdapter({powerPreference:`high-performance`});if(!t)throw Error(`No compatible GPU adapter was found.`);b=await t.requestDevice(),b.lost.then(e=>{e.reason!==`destroyed`&&n.onError?.(Error(`The GPU device was lost (`+e.message+`).`))}),b.addEventListener(`uncapturederror`,e=>console.error(`[WebGPU]`,e.error.message)),x=e.getContext(`webgpu`),S=navigator.gpu.getPreferredCanvasFormat(),x.configure({device:b,format:S,alphaMode:`opaque`})}function k(e,t,n){let r=b.createBuffer({size:Math.max(16,Math.ceil((n??e.byteLength)/4)*4),usage:t|GPUBufferUsage.COPY_DST});return e&&b.queue.writeBuffer(r,0,e),r}function A(){let e=C.N,t=GPUBufferUsage.STORAGE,n=GPUBufferUsage.COPY_SRC,r=new Float32Array(e*8);for(let t=0;t<e;t++)r.set(C.phys.subarray(t*4,t*4+4),t*8),r.set(C.meta.subarray(t*4,t*4+4),t*8+4);let i=C.attr;w.pos=[k(null,t|n,e*16),k(null,t|n,e*16)],w.prev=k(null,t,e*16),w.stat=k(r,t),w.ctrlData=new Float32Array(e*8),w.ctrl=k(w.ctrlData,t),w.adjRange=k(C.adjRange,t),w.adj=k(new Uint8Array(C.adjBuf),t),w.nbr=k(C.nbr,t),w.partner=k(C.partner,t),w.rnd=k(null,t|n,e*32),w.attr=k(i,t),w.hashCount=k(null,t,_.hashSize*4),w.hashCells=k(null,t,_.hashSize*8*4),w.index=k(C.indices,GPUBufferUsage.INDEX),w.simUBO=k(null,GPUBufferUsage.UNIFORM,176),w.camUBO=k(null,GPUBufferUsage.UNIFORM,448),w.keyUBO=k(null,GPUBufferUsage.UNIFORM,64),w.aoUBO=k(null,GPUBufferUsage.UNIFORM,64),w.pinList=k(null,t,_.maxPins*4),w.staging=b.createBuffer({size:e*32,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),T=new Float32Array(e*8)}function j(e,t){let n=b.createShaderModule({code:e,label:t});return b.createComputePipeline({layout:`auto`,compute:{module:n,entryPoint:`main`},label:t})}function M(e,t){return b.createBindGroup({layout:e.getBindGroupLayout(0),entries:t.map((e,t)=>({binding:e.binding??t,resource:e.res??{buffer:e}}))})}function N(){let e=w.pipes={integrate:j(`
struct Sim {
  dt: f32, time: f32, gravity: f32, drag: f32,
  kStretch: f32, kShear: f32, kBend: f32, kTether: f32,
  wind: vec4f,      // xyz wind velocity (m/s), w extra gust
  grab: vec4f,      // xyz hand target, w active
  grabQ: vec4f,     // twist quaternion applied to grabbed offsets
  impulse: vec4f,   // xyz shake acceleration, w phase
  manq: vec4f,      // x enabled, y growth 0..1
  hanger: vec4f,    // x enabled
  floorY: f32, friction: f32, radius: f32, count: u32,
  omega: f32, selfK: f32, cell: f32, hashMask: u32,
  massScale: f32, damping: f32, selfRadius: f32, skipDist: f32,
};
@group(0) @binding(0) var<uniform> sim: Sim;
const SLOTS: u32 = 8u;

fn cellHash(c: vec3i) -> u32 {
  let h = (bitcast<u32>(c.x) * 73856093u) ^ (bitcast<u32>(c.y) * 19349663u) ^ (bitcast<u32>(c.z) * 83492791u);
  return h & sim.hashMask;
}
fn qrot(q: vec4f, v: vec3f) -> vec3f {
  let t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

@group(0) @binding(1) var<storage, read_write> pos: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> prev: array<vec4f>;
@group(0) @binding(3) var<storage, read> stat: array<vec4f>;
@group(0) @binding(4) var<storage, read> ctrl: array<vec4f>;
@group(0) @binding(5) var<storage, read> rnd: array<vec4f>;

fn turb(p: vec3f, t: f32) -> vec3f {
  return vec3f(sin(p.y * 5.1 + t * 2.3) + sin(p.z * 7.3 - t * 3.1),
               sin(p.x * 6.2 - t * 1.7) * 0.6,
               sin(p.x * 4.7 + t * 2.9) + sin(p.y * 6.9 + t * 1.3)) * 0.5;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= sim.count) { return; }
  let pin = ctrl[2u * i];
  if (pin.w > 0.5) {                       // pinned: kinematic
    pos[i] = vec4f(pin.xyz, 0.0);
    prev[i] = vec4f(pin.xyz, 0.0);
    return;
  }
  let ph = stat[2u * i];
  let w = ph.x / sim.massScale;            // inverse mass (fabric weight slider)
  var p = pos[i].xyz;
  var v = (p - prev[i].xyz) / sim.dt;
  v *= exp(-sim.damping * sim.dt);

  var a = vec3f(0.0, -sim.gravity, 0.0);
  // relative air velocity, with gusty wind that travels across the cloth
  var air = sim.wind.xyz;
  let ws = length(air);
  if (ws > 0.0) {
    let wave = sin(dot(p, vec3f(3.1, 1.3, 2.2)) - sim.time * 6.0) * sin(sim.time * 0.83 + p.y * 1.7);
    air = air * (0.7 + 0.45 * wave + sim.wind.w) + turb(p * 1.3, sim.time) * ws * 0.45;
  }
  let rel = air - v;
  let n = normalize(rnd[2u * i + 1u].xyz + vec3f(0.0, 1e-5, 0.0));
  let vn = dot(rel, n);
  a += n * (vn * abs(vn)) * sim.drag * ph.y * w;   // quadratic pressure drag on the surface
  a += rel * 0.06 * ph.y * w;                       // light skin friction
  // shake: oscillating push that travels down the garment so it flaps
  a += sim.impulse.xyz * sin(sim.impulse.w + p.y * 8.0 + p.x * 5.0) * ph.y;

  v += a * sim.dt;
  prev[i] = vec4f(p, 0.0);
  p += v * sim.dt;
  pos[i] = vec4f(p, w);
}
`,`integrate`),solve:j(`
struct Sim {
  dt: f32, time: f32, gravity: f32, drag: f32,
  kStretch: f32, kShear: f32, kBend: f32, kTether: f32,
  wind: vec4f,      // xyz wind velocity (m/s), w extra gust
  grab: vec4f,      // xyz hand target, w active
  grabQ: vec4f,     // twist quaternion applied to grabbed offsets
  impulse: vec4f,   // xyz shake acceleration, w phase
  manq: vec4f,      // x enabled, y growth 0..1
  hanger: vec4f,    // x enabled
  floorY: f32, friction: f32, radius: f32, count: u32,
  omega: f32, selfK: f32, cell: f32, hashMask: u32,
  massScale: f32, damping: f32, selfRadius: f32, skipDist: f32,
};
@group(0) @binding(0) var<uniform> sim: Sim;
const SLOTS: u32 = 8u;

fn cellHash(c: vec3i) -> u32 {
  let h = (bitcast<u32>(c.x) * 73856093u) ^ (bitcast<u32>(c.y) * 19349663u) ^ (bitcast<u32>(c.z) * 83492791u);
  return h & sim.hashMask;
}
fn qrot(q: vec4f, v: vec3f) -> vec3f {
  let t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

fn sdEllipsoid(p: vec3f, r: vec3f) -> f32 {
  let k0 = length(p / r);
  let k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / max(k1, 1e-6);
}
fn sdCapsule(p: vec3f, a: vec3f, b: vec3f, r: f32) -> f32 {
  let pa = p - a; let ba = b - a;
  let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}
fn smin(a: f32, b: f32, k: f32) -> f32 {
  let h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
// Invisible mannequin torso. The depth axis "inflates" on entry so the
// flat-laid shirt is gently filled out instead of exploding outward.
fn torso(p0: vec3f) -> f32 {
  let g = mix(0.12, 1.0, sim.manq.y);
  let p = vec3f(p0.x, p0.y, p0.z / g);
  let chest = sdEllipsoid(p - vec3f(0.0, 0.70, 0.0), vec3f(0.178, 0.25, 0.115));
  let waist = sdEllipsoid(p - vec3f(0.0, 0.42, 0.0), vec3f(0.152, 0.26, 0.098));
  let hips  = sdEllipsoid(p - vec3f(0.0, 0.16, 0.0), vec3f(0.168, 0.22, 0.108));
  // sloping shoulders (left/right) so the dropped shoulder seam drapes naturally
  let sh    = min(sdCapsule(p, vec3f(-0.05, 0.93, 0.0), vec3f(-0.178, 0.884, 0.0), 0.058),
                  sdCapsule(p, vec3f(0.05, 0.93, 0.0), vec3f(0.178, 0.884, 0.0), 0.058));
  let neck  = sdCapsule(p, vec3f(0.0, 0.93, -0.012), vec3f(0.0, 1.16, -0.012), 0.056);
  var d = smin(chest, waist, 0.10);
  d = smin(d, hips, 0.10);
  d = smin(d, sh, 0.08);
  d = smin(d, neck, 0.03);
  return d * g;
}
fn hangerSDF(p: vec3f) -> f32 {
  let c = vec3f(0.0, 1.006, 0.0);
  let a = sdCapsule(p, c, vec3f(0.232, 0.968, 0.0), 0.011);
  let b = sdCapsule(p, c, vec3f(-0.232, 0.968, 0.0), 0.011);
  return min(a, b);
}

fn collide(p0: vec3f, pp: vec3f) -> vec3f {
  var p = p0;
  let r = sim.radius;

  if (sim.manq.x > 0.5) {
    let d = torso(p);
    if (d < r) {
      let e = vec2f(1.0, -1.0) * 0.0015;
      let n = normalize(e.xyy * torso(p + e.xyy) + e.yyx * torso(p + e.yyx) + e.yxy * torso(p + e.yxy) + e.xxx * torso(p + e.xxx));
      let pen = r - d;
      p += n * pen;
      let dx = p - pp; let tang = dx - n * dot(dx, n); let tl = length(tang);
      if (tl > 1e-9) { p -= tang * min(1.0, 0.6 * pen / tl); }
    }
  }
  if (sim.hanger.x > 0.5) {
    let d = hangerSDF(p);
    if (d < r) {
      let e = vec2f(1.0, -1.0) * 0.001;
      let n = normalize(e.xyy * hangerSDF(p + e.xyy) + e.yyx * hangerSDF(p + e.yyx) + e.yxy * hangerSDF(p + e.yxy) + e.xxx * hangerSDF(p + e.xxx));
      p += n * (r - d);
    }
  }
  // floor with Coulomb friction: tangential motion is limited by mu * penetration
  let fy = sim.floorY + r;
  if (p.y < fy) {
    let pen = fy - p.y;
    p.y = fy;
    let dx = vec3f(p.x - pp.x, 0.0, p.z - pp.z);
    let tl = length(dx);
    if (tl > 1e-9) { p -= dx * min(1.0, sim.friction * pen / tl); }
  }
  return p;
}

@group(0) @binding(1) var<storage, read> posIn: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> posOut: array<vec4f>;
@group(0) @binding(3) var<storage, read> adjRange: array<vec2u>;
@group(0) @binding(4) var<storage, read> adj: array<vec4u>;
@group(0) @binding(5) var<storage, read> ctrl: array<vec4f>;
@group(0) @binding(6) var<storage, read> prev: array<vec4f>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= sim.count) { return; }
  let me = posIn[i];
  let wi = me.w;
  if (wi == 0.0) { posOut[i] = me; return; }
  var p = me.xyz;
  let r = adjRange[i];
  var corr = vec3f(0.0);
  var ksum = 0.0;
  for (var e = r.x; e < r.x + r.y; e++) {
    let c = adj[e];
    let o = posIn[c.x];
    let d = p - o.xyz;
    let len = length(d);
    let rest = bitcast<f32>(c.y);
    let C = len - rest;
    if (len < 1e-7 || (c.z == 3u && C <= 0.0)) { continue; } // tethers only resist stretch
    var comp = sim.kStretch;
    if (c.z == 1u) { comp = sim.kShear; }
    else if (c.z == 2u) { comp = sim.kBend; }
    else if (c.z == 3u) { comp = sim.kTether; }
    else if (c.z == 4u) { comp = 0.0; }
    comp = comp / bitcast<f32>(c.w);
    let wsum = wi + o.w;
    let denom = wsum + comp;
    corr -= (wi * C / denom) * (d / len);
    ksum += wsum / denom;
  }
  p += corr * (sim.omega / max(ksum, 1.0));

  // grabbed patch follows the hand (soft, so the rest of the cloth lags behind)
  if (sim.grab.w > 0.5) {
    let g = ctrl[2u * i + 1u];
    if (g.w > 0.0) {
      let tgt = sim.grab.xyz + qrot(sim.grabQ, g.xyz);
      p = mix(p, tgt, g.w);
    }
  }
  posOut[i] = vec4f(collide(p, prev[i].xyz), wi);
}
`,`solve`),clear:j(`
struct Sim {
  dt: f32, time: f32, gravity: f32, drag: f32,
  kStretch: f32, kShear: f32, kBend: f32, kTether: f32,
  wind: vec4f,      // xyz wind velocity (m/s), w extra gust
  grab: vec4f,      // xyz hand target, w active
  grabQ: vec4f,     // twist quaternion applied to grabbed offsets
  impulse: vec4f,   // xyz shake acceleration, w phase
  manq: vec4f,      // x enabled, y growth 0..1
  hanger: vec4f,    // x enabled
  floorY: f32, friction: f32, radius: f32, count: u32,
  omega: f32, selfK: f32, cell: f32, hashMask: u32,
  massScale: f32, damping: f32, selfRadius: f32, skipDist: f32,
};
@group(0) @binding(0) var<uniform> sim: Sim;
const SLOTS: u32 = 8u;

fn cellHash(c: vec3i) -> u32 {
  let h = (bitcast<u32>(c.x) * 73856093u) ^ (bitcast<u32>(c.y) * 19349663u) ^ (bitcast<u32>(c.z) * 83492791u);
  return h & sim.hashMask;
}
fn qrot(q: vec4f, v: vec3f) -> vec3f {
  let t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

@group(0) @binding(1) var<storage, read_write> hashCount: array<u32>;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  if (gid.x <= sim.hashMask) { hashCount[gid.x] = 0u; }
}
`,`hash-clear`),insert:j(`
struct Sim {
  dt: f32, time: f32, gravity: f32, drag: f32,
  kStretch: f32, kShear: f32, kBend: f32, kTether: f32,
  wind: vec4f,      // xyz wind velocity (m/s), w extra gust
  grab: vec4f,      // xyz hand target, w active
  grabQ: vec4f,     // twist quaternion applied to grabbed offsets
  impulse: vec4f,   // xyz shake acceleration, w phase
  manq: vec4f,      // x enabled, y growth 0..1
  hanger: vec4f,    // x enabled
  floorY: f32, friction: f32, radius: f32, count: u32,
  omega: f32, selfK: f32, cell: f32, hashMask: u32,
  massScale: f32, damping: f32, selfRadius: f32, skipDist: f32,
};
@group(0) @binding(0) var<uniform> sim: Sim;
const SLOTS: u32 = 8u;

fn cellHash(c: vec3i) -> u32 {
  let h = (bitcast<u32>(c.x) * 73856093u) ^ (bitcast<u32>(c.y) * 19349663u) ^ (bitcast<u32>(c.z) * 83492791u);
  return h & sim.hashMask;
}
fn qrot(q: vec4f, v: vec3f) -> vec3f {
  let t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

@group(0) @binding(1) var<storage, read> pos: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> hashCount: array<atomic<u32>>;
@group(0) @binding(3) var<storage, read_write> hashCells: array<u32>;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= sim.count) { return; }
  let h = cellHash(vec3i(floor(pos[i].xyz / sim.cell)));
  let slot = atomicAdd(&hashCount[h], 1u);
  if (slot < SLOTS) { hashCells[h * SLOTS + slot] = i; }
}
`,`hash-insert`),self:j(`
struct Sim {
  dt: f32, time: f32, gravity: f32, drag: f32,
  kStretch: f32, kShear: f32, kBend: f32, kTether: f32,
  wind: vec4f,      // xyz wind velocity (m/s), w extra gust
  grab: vec4f,      // xyz hand target, w active
  grabQ: vec4f,     // twist quaternion applied to grabbed offsets
  impulse: vec4f,   // xyz shake acceleration, w phase
  manq: vec4f,      // x enabled, y growth 0..1
  hanger: vec4f,    // x enabled
  floorY: f32, friction: f32, radius: f32, count: u32,
  omega: f32, selfK: f32, cell: f32, hashMask: u32,
  massScale: f32, damping: f32, selfRadius: f32, skipDist: f32,
};
@group(0) @binding(0) var<uniform> sim: Sim;
const SLOTS: u32 = 8u;

fn cellHash(c: vec3i) -> u32 {
  let h = (bitcast<u32>(c.x) * 73856093u) ^ (bitcast<u32>(c.y) * 19349663u) ^ (bitcast<u32>(c.z) * 83492791u);
  return h & sim.hashMask;
}
fn qrot(q: vec4f, v: vec3f) -> vec3f {
  let t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

@group(0) @binding(1) var<storage, read> posIn: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> posOut: array<vec4f>;
@group(0) @binding(3) var<storage, read> stat: array<vec4f>;
@group(0) @binding(4) var<storage, read> hashCount: array<u32>;
@group(0) @binding(5) var<storage, read> hashCells: array<u32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= sim.count) { return; }
  let me = posIn[i];
  if (me.w == 0.0) { posOut[i] = me; return; }
  let p = me.xyz;
  let mi = stat[2u * i + 1u];            // pattern x, y, seam distance, panel
  let c0 = vec3i(floor(p / sim.cell));
  let diam = 2.0 * sim.selfRadius;
  var corr = vec3f(0.0);
  var cnt = 0.0;
  for (var z = -1; z <= 1; z++) {
    for (var y = -1; y <= 1; y++) {
      for (var x = -1; x <= 1; x++) {
        let h = cellHash(c0 + vec3i(x, y, z));
        let n = min(hashCount[h], SLOTS);
        for (var s = 0u; s < n; s++) {
          let j = hashCells[h * SLOTS + s];
          if (j == i) { continue; }
          let d = p - posIn[j].xyz;
          let d2 = dot(d, d);
          if (d2 >= diam * diam || d2 < 1e-14) { continue; }
          // skip particles that are neighbours along the cloth surface
          let mj = stat[2u * j + 1u];
          var geo = distance(mi.xy, mj.xy);
          if (mi.w != mj.w) { geo += mi.z + mj.z; }
          if (geo < sim.skipDist) { continue; }
          let dist = sqrt(d2);
          corr += d * ((diam - dist) * 0.5 / dist);
          cnt += 1.0;
        }
      }
    }
  }
  posOut[i] = vec4f(p + corr * (sim.selfK / max(cnt * 0.5, 1.0)), me.w);
}
`,`self-collide`),normals:j(`
struct Sim {
  dt: f32, time: f32, gravity: f32, drag: f32,
  kStretch: f32, kShear: f32, kBend: f32, kTether: f32,
  wind: vec4f,      // xyz wind velocity (m/s), w extra gust
  grab: vec4f,      // xyz hand target, w active
  grabQ: vec4f,     // twist quaternion applied to grabbed offsets
  impulse: vec4f,   // xyz shake acceleration, w phase
  manq: vec4f,      // x enabled, y growth 0..1
  hanger: vec4f,    // x enabled
  floorY: f32, friction: f32, radius: f32, count: u32,
  omega: f32, selfK: f32, cell: f32, hashMask: u32,
  massScale: f32, damping: f32, selfRadius: f32, skipDist: f32,
};
@group(0) @binding(0) var<uniform> sim: Sim;
const SLOTS: u32 = 8u;

fn cellHash(c: vec3i) -> u32 {
  let h = (bitcast<u32>(c.x) * 73856093u) ^ (bitcast<u32>(c.y) * 19349663u) ^ (bitcast<u32>(c.z) * 83492791u);
  return h & sim.hashMask;
}
fn qrot(q: vec4f, v: vec3f) -> vec3f {
  let t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

@group(0) @binding(1) var<storage, read> pos: array<vec4f>;
@group(0) @binding(2) var<storage, read> stat: array<vec4f>;
@group(0) @binding(3) var<storage, read> nbr: array<vec4u>;
@group(0) @binding(4) var<storage, read> partner: array<i32>;
@group(0) @binding(5) var<storage, read_write> rnd: array<vec4f>;

fn P(i: u32) -> vec3f {
  let q = partner[i];
  if (q >= 0) { return 0.5 * (pos[i].xyz + pos[u32(q)].xyz); } // seams render watertight
  return pos[i].xyz;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= sim.count) { return; }
  let nb = nbr[i];
  let p = P(i);
  let l = P(nb.x); let r = P(nb.y); let d = P(nb.z); let u = P(nb.w);
  let ph = stat[2u * i];
  let panel = stat[2u * i + 1u].w;
  var n = cross(r - l, u - d);
  if (panel > 0.5) { n = -n; }
  n = normalize(n + vec3f(0.0, 0.0, 1e-9));
  let stretch = max(length(r - l) / ph.z, length(u - d) / ph.w);
  // two-scale cavity: how far the neighbourhood sits "above" the surface (folds/creases)
  let ll = P(nbr[nb.x].x); let rr = P(nbr[nb.y].y); let dd = P(nbr[nb.z].z); let uu = P(nbr[nb.w].w);
  let c1 = dot(0.25 * (l + r + d + u) - p, n) / (0.25 * (ph.z + ph.w));
  let c2 = dot(0.25 * (ll + rr + dd + uu) - p, n) / (0.5 * (ph.z + ph.w));
  rnd[2u * i] = vec4f(p, c1 * 0.6 + c2 * 0.8);
  rnd[2u * i + 1u] = vec4f(n, stretch);
}
`,`normals`)},t=w.simUBO,n=w.pos;w.bg={integrate:[],solve:[],insert:[],self:[],normals:[]};for(let r=0;r<2;r++)w.bg.integrate[r]=M(e.integrate,[t,n[r],w.prev,w.stat,w.ctrl,w.rnd]),w.bg.solve[r]=M(e.solve,[t,n[r],n[1-r],w.adjRange,w.adj,w.ctrl,w.prev]),w.bg.insert[r]=M(e.insert,[t,n[r],w.hashCount,w.hashCells]),w.bg.self[r]=M(e.self,[t,n[r],n[1-r],w.stat,w.hashCount,w.hashCells]),w.bg.normals[r]=M(e.normals,[t,n[r],w.stat,w.nbr,w.partner,w.rnd]);w.bg.clear=M(e.clear,[t,w.hashCount])}function P(e){return new Promise((t,n)=>{let r=new Image;r.onload=()=>t(r),r.onerror=n,r.src=e})}function F(e){let t=document.createElement(`canvas`),n=t.getContext(`2d`);return e===`front`?(t.width=760,t.height=150,n.fillStyle=`#fff`,n.textBaseline=`middle`,n.textAlign=`center`,n.font=`500 120px "Century Gothic", Futura, "Avenir Next", Montserrat, "Helvetica Neue", Arial, sans-serif`,`letterSpacing`in n&&(n.letterSpacing=`14px`),n.fillText(`FORAULS`,380,80)):(t.width=720,t.height=980,n.strokeStyle=`#f0e9dc`,n.fillStyle=`#f0e9dc`,n.lineWidth=10,n.beginPath(),n.arc(360,420,260,0,Math.PI*2),n.stroke(),n.textAlign=`center`,n.font=`600 64px "Century Gothic", Arial, sans-serif`,n.fillText(`BACK PRINT`,360,410),n.font=`400 30px Arial, sans-serif`,n.fillText(`drop your PNG here`,360,470)),t}function I(e){let t=Math.min(b.limits.maxTextureDimension2D,2048),n=e.naturalWidth||e.width,r=e.naturalHeight||e.height,i=Math.min(1,t/Math.max(n,r));n=Math.max(1,Math.round(n*i)),r=Math.max(1,Math.round(r*i));let a=Math.floor(Math.log2(Math.max(n,r)))+1,o=b.createTexture({size:[n,r],format:`rgba8unorm-srgb`,mipLevelCount:a,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT}),s=document.createElement(`canvas`),c=s.getContext(`2d`);for(let t=0,i=n,l=r;t<a;t++,i=Math.max(1,i>>1),l=Math.max(1,l>>1))s.width=i,s.height=l,c.clearRect(0,0,i,l),c.imageSmoothingEnabled=!0,c.imageSmoothingQuality=`high`,c.drawImage(e,0,0,i,l),b.queue.copyExternalImageToTexture({source:s},{texture:o,mipLevel:t,premultipliedAlpha:!1},[i,l]);return{tex:o,aspect:r/n}}async function L(e,t){let n;try{n=t?await P(t):F(e)}catch{n=F(e),a(`Could not read that image, using a placeholder`)}let{tex:r,aspect:i}=I(n),o=e===`front`?`frontTex`:`backTex`;if(w[o]){let e=w[o];setTimeout(()=>e.destroy(),500)}w[o]=r,y[e===`front`?`frontAspect`:`backAspect`]=i,w.pipes?.shirt&&U()}function R(){let e=.105,t=e*y.frontAspect,n=.46,r=n*y.backAspect;return r>.6&&(r=.6,n=r/y.backAspect),{front:y.frontRect||[.135,.545,e,t],back:y.backRect||[0,.675-r/2,n,r]}}function z(){let e=new Uint8Array(262144),t=(e,t,n,r)=>{e=(e%n+n)%n,t=(t%n+n)%n;let i=e*374761393+t*668265263+r*1442695041|0;return i=Math.imul(i^i>>>13,1274126177),((i^i>>>16)>>>0)/4294967295},n=(e,n,r,i)=>{let a=e*r,o=n*r,s=Math.floor(a),c=Math.floor(o),l=a-s,u=o-c,d=l*l*(3-2*l),f=u*u*(3-2*u),p=t(s,c,r,i),m=t(s+1,c,r,i),h=t(s,c+1,r,i),g=t(s+1,c+1,r,i);return p+(m-p)*d+(h-p)*f+(p-m-h+g)*d*f},r=(e,t,r,i,a)=>{let o=0,s=.5,c=0;for(let l=0;l<i;l++)o+=s*n(e,t,r<<l,a+l),c+=s,s*=.5;return o/c},i=[];for(let e=0;e<24;e++)for(let n=0;n<24;n++)i.push([(n+.15+.7*t(n,e,24,91))/24,(e+.15+.7*t(n,e,24,57))/24]);for(let t=0;t<256;t++)for(let a=0;a<256;a++){let o=a/256,s=t/256,c=(t*256+a)*4;e[c]=r(o,s,4,4,1)*255,e[c+1]=r(o,s,8,3,7)*255,e[c+2]=n(o,s,32,13)*255;let l=Math.floor(o*24),u=Math.floor(s*24),d=9,f=9;for(let e=-1;e<=1;e++)for(let t=-1;t<=1;t++){let n=l+t,r=u+e,a=i[(r+24)%24*24+(n+24)%24],c=a[0]+(n<0?-1:+(n>=24)),p=a[1]+(r<0?-1:+(r>=24)),m=Math.hypot((c-o)*24,(p-s)*24);m<d?(f=d,d=m):m<f&&(f=m)}e[c+3]=Math.min(255,(f-d)*255)}let a=Math.log2(256)+1,o=b.createTexture({size:[256,256],format:`rgba8unorm`,mipLevelCount:a,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),s=e,c=256;for(let e=0;e<a&&(b.queue.writeTexture({texture:o,mipLevel:e},s,{bytesPerRow:c*4},[c,c]),c!==1);e++){let e=c>>1,t=new Uint8Array(e*e*4);for(let n=0;n<e;n++)for(let r=0;r<e;r++)for(let i=0;i<4;i++){let a=(e,t)=>s[((n*2+t)*c+(r*2+e))*4+i];t[(n*e+r)*4+i]=a(0,0)+a(1,0)+a(0,1)+a(1,1)>>2}s=t,c=e}w.detailTex=o,w.repSamp=b.createSampler({magFilter:`linear`,minFilter:`linear`,mipmapFilter:`linear`,addressModeU:`repeat`,addressModeV:`repeat`,maxAnisotropy:4})}function B(e){let t=[],n=[];for(let{pts:r,r:i,col:a,metal:s}of e){let e=t.length/10,c=null;for(let e=0;e<r.length;e++){let n=o.norm(o.sub(r[Math.min(e+1,r.length-1)],r[Math.max(e-1,0)])),l=c?o.norm(o.sub(c,o.scale(n,o.dot(c,n)))):o.norm(o.cross(n,Math.abs(n[2])<.9?[0,0,1]:[1,0,0]));c=l;let u=o.cross(n,l),d=typeof i==`function`?i(e/(r.length-1)):i;for(let n=0;n<=12;n++){let i=n/12*Math.PI*2,c=o.add(o.scale(l,Math.cos(i)),o.scale(u,Math.sin(i))),f=o.add(r[e],o.scale(c,d));t.push(...f,...c,...a,s)}}for(let t=0;t<r.length-1;t++)for(let r=0;r<12;r++){let i=e+t*13+r,a=i+12+1;n.push(i,a,i+1,i+1,a,a+1)}}return{verts:new Float32Array(t),idx:new Uint32Array(n)}}function V(){let e=[],t=[],n=[-.232,.968,0],r=[0,1.006,0],i=[.232,.968,0];for(let t=0;t<=40;t++){let a=t/40,s=a<.5?o.lerp(n,r,a*2):o.lerp(r,i,a*2-1);s[1]+=.006*Math.sin(a*Math.PI),e.push(s)}for(let e=0;e<=8;e++)t.push([0,1.006+.064*e/8,0]);for(let e=1;e<=26;e++){let n=Math.PI-e/26*Math.PI*1.25;t.push([.024+.024*Math.cos(n),1.07+.024*Math.sin(n),0])}let a=B([{pts:e,r:e=>.0115*Math.sqrt(Math.max(0,1-(Math.max(0,Math.abs(e-.5)*2-.94)/.06)**2)),col:[.42,.26,.13],metal:0},{pts:t,r:.0032,col:[.9,.9,.92],metal:1}]);w.hangerVB=k(a.verts,GPUBufferUsage.VERTEX),w.hangerIB=k(a.idx,GPUBufferUsage.INDEX),w.hangerCount=a.idx.length}function H(e,t){let n=b.createShaderModule({code:e,label:t.label});return b.createRenderPipeline({label:t.label,layout:`auto`,vertex:{module:n,entryPoint:`vs`,buffers:t.buffers||[]},fragment:t.depthOnly?void 0:{module:n,entryPoint:`fs`,targets:[{format:S}]},primitive:{topology:`triangle-list`,cullMode:t.cull||`none`},depthStencil:{format:`depth32float`,depthWriteEnabled:t.depthWrite??!0,depthCompare:t.depthCompare||`less`},multisample:{count:t.depthOnly?1:_.msaa}})}function ee(){let e=w.pipes;e.bgPipe=H(`
struct Cam {
  viewProj: mat4x4f,
  invViewProj: mat4x4f,
  lightVP: mat4x4f,
  aoVP: mat4x4f,
  eye: vec4f,
  fabric: vec4f,     // rgb linear base colour, w wash strength
  fuzz: vec4f,       // rgb fuzz/sheen colour, w thread lightness
  frontRect: vec4f,  // print placement in pattern metres: cx, cy, w, h
  backRect: vec4f,
  misc: vec4f,       // x time, y shadow texel, z exposure, w floor y
  res: vec4f,        // width, height, 1/width, 1/height
  keyDir: vec4f,
  fillDir: vec4f,
  rimL: vec4f,
  rimR: vec4f,
  ao: vec4f,         // x eye y of AO camera, y depth range, z texture size, w world half-size
};
@group(0) @binding(0) var<uniform> cam: Cam;

fn aces(x: vec3f) -> vec3f {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), vec3f(0.0), vec3f(1.0));
}
fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 45.32);
  return fract(q.x * q.y);
}
// Backdrop: soft product-photo gradient with a gentle vignette (linear colour)
fn backdrop(uv: vec2f) -> vec3f {
  var c = mix(vec3f(0.80, 0.805, 0.82), vec3f(0.62, 0.625, 0.645), smoothstep(0.0, 1.0, uv.y));
  let d = length((uv - vec2f(0.5, 0.4)) * vec2f(cam.res.x * cam.res.w, 1.0));
  c *= 1.0 - 0.2 * smoothstep(0.35, 1.25, d);
  return c;
}
fn dither(fc: vec2f) -> f32 { return (hash21(fc) - 0.5) / 255.0; }

@group(0) @binding(6) var shadowMap: texture_depth_2d;
@group(0) @binding(7) var shadowSamp: sampler_comparison;

var<private> POISSON: array<vec2f, 12> = array<vec2f, 12>(
  vec2f(-0.326, -0.406), vec2f(-0.840, -0.074), vec2f(-0.696, 0.457), vec2f(-0.203, 0.621),
  vec2f(0.962, -0.195), vec2f(0.473, -0.480), vec2f(0.519, 0.767), vec2f(0.185, -0.893),
  vec2f(0.507, 0.064), vec2f(0.896, 0.412), vec2f(-0.322, -0.933), vec2f(-0.792, -0.598));

fn shadowAt(world: vec3f, N: vec3f, soft: f32, taps: i32) -> f32 {
  let lp = cam.lightVP * vec4f(world + N * 0.006, 1.0);
  let uv = lp.xy * vec2f(0.5, -0.5) + 0.5;
  if (any(uv < vec2f(0.0)) || any(uv > vec2f(1.0)) || lp.z > 1.0) { return 1.0; }
  let z = lp.z - 0.0012;
  let r = cam.misc.y * soft;
  var s = 0.0;
  for (var i = 0; i < taps; i++) { s += textureSampleCompareLevel(shadowMap, shadowSamp, uv + POISSON[i] * r, z); }
  return s / f32(taps);
}

fn ggx(NdH: f32, a: f32) -> f32 {
  let a2 = a * a; let d = NdH * NdH * (a2 - 1.0) + 1.0;
  return a2 / (3.14159 * d * d);
}
// Charlie sheen distribution: the soft fibre glow of brushed cotton
fn charlie(NdH: f32, r: f32) -> f32 {
  let inv = 1.0 / r; let s2 = max(1.0 - NdH * NdH, 0.0078125);
  return (2.0 + inv) * pow(s2, inv * 0.5) / 6.2831;
}
fn oneLight(N: vec3f, V: vec3f, L: vec3f, col: vec3f, alb: vec3f, rough: f32, f0: f32, sheen: vec3f, wrap: f32) -> vec3f {
  let NdL = dot(N, L);
  let nl = max(NdL, 0.0);
  let NdV = max(dot(N, V), 1e-3);
  let H = normalize(L + V);
  let NdH = max(dot(N, H), 0.0);
  let VdH = max(dot(V, H), 0.0);
  let diff = max((NdL + wrap) / (1.0 + wrap), 0.0);
  let F = f0 + (1.0 - f0) * pow(1.0 - VdH, 5.0);
  let spec = ggx(NdH, rough * rough) * F * 0.25 / max(NdV, 0.15) * nl;
  let sh = sheen * charlie(NdH, 0.55) / (4.0 * (nl + NdV - nl * NdV) + 1e-3) * nl;
  return col * (alb * diff + spec + sh);
}
// Full studio rig. Rims are placed behind the subject relative to the camera,
// so the black fabric always separates from the backdrop.
fn studio(N: vec3f, V: vec3f, alb: vec3f, rough: f32, f0: f32, sheen: vec3f, sh: f32, ao: f32) -> vec3f {
  var c = oneLight(N, V, cam.keyDir.xyz, vec3f(1.0, 0.965, 0.92) * 1.75 * sh, alb, rough, f0, sheen, 0.25);
  c += oneLight(N, V, cam.fillDir.xyz, vec3f(0.85, 0.9, 1.0) * 0.42, alb, rough, f0, sheen, 0.5) * mix(0.6, 1.0, ao);
  c += oneLight(N, V, cam.rimL.xyz, vec3f(1.0) * 2.1, alb, rough, f0, sheen, 0.0) * mix(0.5, 1.0, ao);
  c += oneLight(N, V, cam.rimR.xyz, vec3f(0.95, 0.97, 1.0) * 1.7, alb, rough, f0, sheen, 0.0) * mix(0.5, 1.0, ao);
  // hemisphere ambient (bright studio sweep above, darker floor bounce below)
  let hemi = mix(vec3f(0.42, 0.42, 0.43), vec3f(0.95, 0.96, 0.98), N.y * 0.5 + 0.5);
  c += hemi * alb * ao * 0.42;
  // fibre fuzz: soft light caught by the nap at grazing angles
  let fz = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  c += sheen * fz * ao * (0.3 + 0.9 * max(dot(-V, cam.rimL.xyz), 0.0) + 0.6 * max(dot(-V, cam.rimR.xyz), 0.0));
  return c;
}

@group(0) @binding(1) var aoMap: texture_depth_2d;
struct BOut { @builtin(position) pos: vec4f, @location(0) ndc: vec2f };
@vertex fn vs(@builtin(vertex_index) i: u32) -> BOut {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u)) * 2.0 - 1.0;
  var o: BOut; o.pos = vec4f(p, 1.0, 1.0); o.ndc = p;
  return o;
}
fn clothHeight(xz: vec2f) -> f32 {        // lowest cloth height above the floor at xz
  let hs = cam.ao.w; let size = cam.ao.z;
  let t = (xz / hs) * vec2f(0.5, -0.5) + 0.5;
  if (any(t < vec2f(0.0)) || any(t > vec2f(1.0))) { return 9.0; }
  let d = textureLoad(aoMap, vec2i(t * (size - 1.0)), 0);
  if (d >= 0.9999) { return 9.0; }
  return cam.ao.x + d * cam.ao.y - cam.misc.w;
}
fn floorShadow(world: vec3f) -> f32 {
  let lp = cam.lightVP * vec4f(world, 1.0);
  let uv = lp.xy * vec2f(0.5, -0.5) + 0.5;
  if (any(uv < vec2f(0.0)) || any(uv > vec2f(1.0)) || lp.z > 1.0) { return 1.0; }
  let z = lp.z - 0.002; let r = cam.misc.y * 7.0;
  var s = 0.0;
  for (var i = 0; i < 4; i++) { s += textureSampleCompareLevel(shadowMap, shadowSamp, uv + POISSON[i * 3] * r * 1.15, z); }
  if (s > 3.99) { return 1.0; }
  for (var i = 0; i < 12; i++) { s += textureSampleCompareLevel(shadowMap, shadowSamp, uv + POISSON[i] * r, z); }
  return s / 16.0;
}
@fragment fn fs(in: BOut) -> @location(0) vec4f {
  let uv = in.pos.xy * cam.res.zw;
  var col = backdrop(uv);
  let a = cam.invViewProj * vec4f(in.ndc, 0.0, 1.0);
  let b = cam.invViewProj * vec4f(in.ndc, 1.0, 1.0);
  let o = a.xyz / a.w; let d = normalize(b.xyz / b.w - o);
  if (d.y < -1e-4) {
    let w = o + d * ((cam.misc.w - o.y) / d.y);
    let rr = length(w.xz);
    if (rr < 3.2) {
      let sh = floorShadow(w);
      // contact occlusion: darker where cloth hovers just above the floor, softer as it rises
      var occ = 0.0;
      let probe = min(min(clothHeight(w.xz + vec2f(0.06, 0.0)), clothHeight(w.xz - vec2f(0.06, 0.0))),
                      min(clothHeight(w.xz + vec2f(0.0, 0.06)), clothHeight(w.xz - vec2f(0.0, 0.06))));
      if (min(probe, clothHeight(w.xz)) < 0.6) {
        for (var i = 0; i < 8; i++) { occ += exp(-max(clothHeight(w.xz + POISSON[i] * 0.045), 0.0) / 0.07); }
        occ /= 8.0;
      }
      let fade = 1.0 - smoothstep(1.6, 3.2, rr);
      col *= mix(1.0, mix(0.8, 1.0, sh) * (1.0 - 0.5 * occ), fade);
    }
  }
  return vec4f(pow(col, vec3f(1.0 / 2.2)) + dither(in.pos.xy), 1.0);
}
`,{label:`backdrop`,depthWrite:!1,depthCompare:`always`}),e.shirt=H(h,{label:`shirt`}),e.depth=H(`
@group(0) @binding(0) var<uniform> lvp: mat4x4f;
@group(0) @binding(1) var<storage, read> rnd: array<vec4f>;
@vertex fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  return lvp * vec4f(rnd[2u * vi].xyz, 1.0);
}
`,{label:`depth`,depthOnly:!0}),e.hanger=H(`
struct Cam {
  viewProj: mat4x4f,
  invViewProj: mat4x4f,
  lightVP: mat4x4f,
  aoVP: mat4x4f,
  eye: vec4f,
  fabric: vec4f,     // rgb linear base colour, w wash strength
  fuzz: vec4f,       // rgb fuzz/sheen colour, w thread lightness
  frontRect: vec4f,  // print placement in pattern metres: cx, cy, w, h
  backRect: vec4f,
  misc: vec4f,       // x time, y shadow texel, z exposure, w floor y
  res: vec4f,        // width, height, 1/width, 1/height
  keyDir: vec4f,
  fillDir: vec4f,
  rimL: vec4f,
  rimR: vec4f,
  ao: vec4f,         // x eye y of AO camera, y depth range, z texture size, w world half-size
};
@group(0) @binding(0) var<uniform> cam: Cam;

fn aces(x: vec3f) -> vec3f {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), vec3f(0.0), vec3f(1.0));
}
fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 45.32);
  return fract(q.x * q.y);
}
// Backdrop: soft product-photo gradient with a gentle vignette (linear colour)
fn backdrop(uv: vec2f) -> vec3f {
  var c = mix(vec3f(0.80, 0.805, 0.82), vec3f(0.62, 0.625, 0.645), smoothstep(0.0, 1.0, uv.y));
  let d = length((uv - vec2f(0.5, 0.4)) * vec2f(cam.res.x * cam.res.w, 1.0));
  c *= 1.0 - 0.2 * smoothstep(0.35, 1.25, d);
  return c;
}
fn dither(fc: vec2f) -> f32 { return (hash21(fc) - 0.5) / 255.0; }

@group(0) @binding(6) var shadowMap: texture_depth_2d;
@group(0) @binding(7) var shadowSamp: sampler_comparison;

var<private> POISSON: array<vec2f, 12> = array<vec2f, 12>(
  vec2f(-0.326, -0.406), vec2f(-0.840, -0.074), vec2f(-0.696, 0.457), vec2f(-0.203, 0.621),
  vec2f(0.962, -0.195), vec2f(0.473, -0.480), vec2f(0.519, 0.767), vec2f(0.185, -0.893),
  vec2f(0.507, 0.064), vec2f(0.896, 0.412), vec2f(-0.322, -0.933), vec2f(-0.792, -0.598));

fn shadowAt(world: vec3f, N: vec3f, soft: f32, taps: i32) -> f32 {
  let lp = cam.lightVP * vec4f(world + N * 0.006, 1.0);
  let uv = lp.xy * vec2f(0.5, -0.5) + 0.5;
  if (any(uv < vec2f(0.0)) || any(uv > vec2f(1.0)) || lp.z > 1.0) { return 1.0; }
  let z = lp.z - 0.0012;
  let r = cam.misc.y * soft;
  var s = 0.0;
  for (var i = 0; i < taps; i++) { s += textureSampleCompareLevel(shadowMap, shadowSamp, uv + POISSON[i] * r, z); }
  return s / f32(taps);
}

fn ggx(NdH: f32, a: f32) -> f32 {
  let a2 = a * a; let d = NdH * NdH * (a2 - 1.0) + 1.0;
  return a2 / (3.14159 * d * d);
}
// Charlie sheen distribution: the soft fibre glow of brushed cotton
fn charlie(NdH: f32, r: f32) -> f32 {
  let inv = 1.0 / r; let s2 = max(1.0 - NdH * NdH, 0.0078125);
  return (2.0 + inv) * pow(s2, inv * 0.5) / 6.2831;
}
fn oneLight(N: vec3f, V: vec3f, L: vec3f, col: vec3f, alb: vec3f, rough: f32, f0: f32, sheen: vec3f, wrap: f32) -> vec3f {
  let NdL = dot(N, L);
  let nl = max(NdL, 0.0);
  let NdV = max(dot(N, V), 1e-3);
  let H = normalize(L + V);
  let NdH = max(dot(N, H), 0.0);
  let VdH = max(dot(V, H), 0.0);
  let diff = max((NdL + wrap) / (1.0 + wrap), 0.0);
  let F = f0 + (1.0 - f0) * pow(1.0 - VdH, 5.0);
  let spec = ggx(NdH, rough * rough) * F * 0.25 / max(NdV, 0.15) * nl;
  let sh = sheen * charlie(NdH, 0.55) / (4.0 * (nl + NdV - nl * NdV) + 1e-3) * nl;
  return col * (alb * diff + spec + sh);
}
// Full studio rig. Rims are placed behind the subject relative to the camera,
// so the black fabric always separates from the backdrop.
fn studio(N: vec3f, V: vec3f, alb: vec3f, rough: f32, f0: f32, sheen: vec3f, sh: f32, ao: f32) -> vec3f {
  var c = oneLight(N, V, cam.keyDir.xyz, vec3f(1.0, 0.965, 0.92) * 1.75 * sh, alb, rough, f0, sheen, 0.25);
  c += oneLight(N, V, cam.fillDir.xyz, vec3f(0.85, 0.9, 1.0) * 0.42, alb, rough, f0, sheen, 0.5) * mix(0.6, 1.0, ao);
  c += oneLight(N, V, cam.rimL.xyz, vec3f(1.0) * 2.1, alb, rough, f0, sheen, 0.0) * mix(0.5, 1.0, ao);
  c += oneLight(N, V, cam.rimR.xyz, vec3f(0.95, 0.97, 1.0) * 1.7, alb, rough, f0, sheen, 0.0) * mix(0.5, 1.0, ao);
  // hemisphere ambient (bright studio sweep above, darker floor bounce below)
  let hemi = mix(vec3f(0.42, 0.42, 0.43), vec3f(0.95, 0.96, 0.98), N.y * 0.5 + 0.5);
  c += hemi * alb * ao * 0.42;
  // fibre fuzz: soft light caught by the nap at grazing angles
  let fz = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  c += sheen * fz * ao * (0.3 + 0.9 * max(dot(-V, cam.rimL.xyz), 0.0) + 0.6 * max(dot(-V, cam.rimR.xyz), 0.0));
  return c;
}

struct HIn { @location(0) p: vec3f, @location(1) n: vec3f, @location(2) c: vec4f };
struct HOut { @builtin(position) pos: vec4f, @location(0) world: vec3f, @location(1) n: vec3f, @location(2) c: vec4f };
@vertex fn vs(v: HIn) -> HOut {
  var o: HOut; o.pos = cam.viewProj * vec4f(v.p, 1.0); o.world = v.p; o.n = v.n; o.c = v.c;
  return o;
}
@fragment fn fs(in: HOut) -> @location(0) vec4f {
  let N = normalize(in.n); let V = normalize(cam.eye.xyz - in.world);
  let metal = in.c.a;
  let grain = 0.92 + 0.08 * sin(in.world.x * 420.0 + sin(in.world.y * 90.0) * 3.0);
  let alb = in.c.rgb * mix(grain, 1.0, metal);
  let sh = shadowAt(in.world, N, 1.0, 4);
  var col = studio(N, V, alb * (1.0 - metal * 0.7), mix(0.42, 0.22, metal), mix(0.04, 0.75, metal), vec3f(0.0), sh, 1.0);
  let R = reflect(-V, N);
  col += metal * alb * mix(vec3f(0.35), vec3f(1.1), smoothstep(-0.2, 0.8, R.y));   // studio reflection
  return vec4f(pow(aces(col * cam.misc.z), vec3f(1.0 / 2.2)), 1.0);
}
`,{label:`hanger`,cull:`back`,buffers:[{arrayStride:40,attributes:[{shaderLocation:0,offset:0,format:`float32x3`},{shaderLocation:1,offset:12,format:`float32x3`},{shaderLocation:2,offset:24,format:`float32x4`}]}]}),e.pins=H(`
struct Cam {
  viewProj: mat4x4f,
  invViewProj: mat4x4f,
  lightVP: mat4x4f,
  aoVP: mat4x4f,
  eye: vec4f,
  fabric: vec4f,     // rgb linear base colour, w wash strength
  fuzz: vec4f,       // rgb fuzz/sheen colour, w thread lightness
  frontRect: vec4f,  // print placement in pattern metres: cx, cy, w, h
  backRect: vec4f,
  misc: vec4f,       // x time, y shadow texel, z exposure, w floor y
  res: vec4f,        // width, height, 1/width, 1/height
  keyDir: vec4f,
  fillDir: vec4f,
  rimL: vec4f,
  rimR: vec4f,
  ao: vec4f,         // x eye y of AO camera, y depth range, z texture size, w world half-size
};
@group(0) @binding(0) var<uniform> cam: Cam;

fn aces(x: vec3f) -> vec3f {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), vec3f(0.0), vec3f(1.0));
}
fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 45.32);
  return fract(q.x * q.y);
}
// Backdrop: soft product-photo gradient with a gentle vignette (linear colour)
fn backdrop(uv: vec2f) -> vec3f {
  var c = mix(vec3f(0.80, 0.805, 0.82), vec3f(0.62, 0.625, 0.645), smoothstep(0.0, 1.0, uv.y));
  let d = length((uv - vec2f(0.5, 0.4)) * vec2f(cam.res.x * cam.res.w, 1.0));
  c *= 1.0 - 0.2 * smoothstep(0.35, 1.25, d);
  return c;
}
fn dither(fc: vec2f) -> f32 { return (hash21(fc) - 0.5) / 255.0; }

@group(0) @binding(1) var<storage, read> rnd: array<vec4f>;
@group(0) @binding(2) var<storage, read> pins: array<u32>;
struct POut { @builtin(position) pos: vec4f, @location(0) q: vec2f };
@vertex fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> POut {
  var corners = array<vec2f, 6>(vec2f(-1, -1), vec2f(1, -1), vec2f(1, 1), vec2f(-1, -1), vec2f(1, 1), vec2f(-1, 1));
  let k = pins[ii];
  let c = rnd[2u * k].xyz + rnd[2u * k + 1u].xyz * 0.008;
  var clip = cam.viewProj * vec4f(c, 1.0);
  let q = corners[vi];
  clip = vec4f(clip.xy + q * vec2f(cam.res.y * cam.res.z, 1.0) * 0.011 * 2.2, clip.z - 0.002 * clip.w, clip.w);
  var o: POut; o.pos = clip; o.q = q;
  return o;
}
@fragment fn fs(in: POut) -> @location(0) vec4f {
  let r = length(in.q);
  if (r > 1.0) { discard; }
  let n = vec3f(in.q, sqrt(1.0 - r * r));
  let l = max(dot(n, normalize(vec3f(-0.4, 0.6, 0.7))), 0.0);
  let spec = pow(max(dot(reflect(-normalize(vec3f(-0.4, 0.6, 0.7)), n), vec3f(0, 0, 1)), 0.0), 40.0);
  var c = vec3f(0.85, 0.12, 0.14) * (0.25 + 0.85 * l) + spec * 0.8;
  c = mix(c, vec3f(0.98), smoothstep(0.82, 0.9, r));
  return vec4f(pow(c, vec3f(1.0 / 2.2)), 1.0);
}
`,{label:`pins`}),w.shadowTex=b.createTexture({size:[_.shadowSize,_.shadowSize],format:`depth32float`,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),w.aoTex=b.createTexture({size:[_.aoSize,_.aoSize],format:`depth32float`,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),z(),w.linSamp=b.createSampler({magFilter:`linear`,minFilter:`linear`,mipmapFilter:`linear`,addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`,maxAnisotropy:8}),w.cmpSamp=b.createSampler({compare:`less`,magFilter:`linear`,minFilter:`linear`});let t=w.shadowTex.createView(),n=w.camUBO;w.bg.bgPipe=M(e.bgPipe,[n,{binding:1,res:w.aoTex.createView()},{binding:6,res:t},{binding:7,res:w.cmpSamp}]),w.bg.key=M(e.depth,[w.keyUBO,w.rnd]),w.bg.ao=M(e.depth,[w.aoUBO,w.rnd]),w.bg.hanger=M(e.hanger,[n,{binding:6,res:t},{binding:7,res:w.cmpSamp}]),w.bg.pins=M(e.pins,[n,w.rnd,w.pinList]),U()}function U(){w.frontTex&&w.backTex&&w.shadowTex&&w.detailTex&&(w.bg.shirt=M(w.pipes.shirt,[w.camUBO,w.rnd,w.attr,{binding:3,res:w.frontTex.createView()},{binding:4,res:w.backTex.createView()},{binding:5,res:w.linSamp},{binding:6,res:w.shadowTex.createView()},{binding:7,res:w.cmpSamp},{binding:8,res:w.detailTex.createView()},{binding:9,res:w.repSamp}]))}let W=1,G=[{substeps:6,iterations:5,scale:1},{substeps:5,iterations:5,scale:1},{substeps:5,iterations:4,scale:.85},{substeps:4,iterations:4,scale:.72},{substeps:4,iterations:4,scale:.6}],K=0;function q(e){K=c(e,0,G.length-1);let t=G[K];_.substeps=t.substeps,_.iterations=t.iterations,W=t.scale}function te(){let t=Math.max(.6,Math.min(window.devicePixelRatio||1,_.maxDpr)*W),n=Math.max(1,Math.floor(e.clientWidth*t)),r=Math.max(1,Math.floor(e.clientHeight*t));e.width===n&&e.height===r&&w.msaaTex||(e.width=n,e.height=r,w.msaaTex?.destroy(),w.depthTex?.destroy(),w.msaaTex=b.createTexture({size:[n,r],format:S,sampleCount:_.msaa,usage:GPUTextureUsage.RENDER_ATTACHMENT}),w.depthTex=b.createTexture({size:[n,r],format:`depth32float`,sampleCount:_.msaa,usage:GPUTextureUsage.RENDER_ATTACHMENT}))}function ne(e){b.queue.writeBuffer(w.pos[0],0,e),b.queue.writeBuffer(w.pos[1],0,e),b.queue.writeBuffer(w.prev,0,e),D=0;for(let t=0;t<C.N;t++)T[t*8]=e[t*4],T[t*8+1]=e[t*4+1],T[t*8+2]=e[t*4+2]}function re(){let e=w.ctrlData;for(let t=0;t<C.N;t++)e[t*8+3]=0;let t=(t,n)=>{e[t*8]=n[0],e[t*8+1]=n[1],e[t*8+2]=n[2],e[t*8+3]=1};for(let[e,n]of y.modePinPos||[])t(e,n);for(let[e,n]of y.userPinPos)t(e,n);b.queue.writeBuffer(w.ctrl,0,e);let n=new Uint32Array(_.maxPins),r=0;for(let e of y.userPinPos.keys())r<_.maxPins&&(n[r++]=e);w.pinCount=r,b.queue.writeBuffer(w.pinList,0,n)}function ie(){let e=w.ctrlData;for(let t=0;t<C.N;t++)e[t*8+7]=0}let ae=new Float32Array(44),oe=new Uint32Array(ae.buffer);function se(){let e=y,t=1/60/_.substeps,n=e.stretch/100,r=e.stiffness/100,i=5*n*n,a=400*(2.5/400)**r,s=e.wind?5.2*e.windStrength/100:0,c=o.norm([.85,.08,-.55]),l=e.wind?.35*Math.sin(e.time*.61)*Math.sin(e.time*1.73+1.3)+.25*Math.max(0,Math.sin(e.time*.29)):0,u=e.grab;ae.set([t,e.time,9.81,1.9,i,i+.5,a,.003+1.5*n*n,c[0]*s,c[1]*s,c[2]*s,l,u?u.target[0]:0,u?u.target[1]:0,u?u.target[2]:0,+!!u,...u?u.q:[0,0,0,1],e.shakeDir[0]*e.shakeAmp,e.shakeDir[1]*e.shakeAmp,e.shakeDir[2]*e.shakeAmp,e.shakePhase,+(e.mode===`mannequin`),e.manqGrow,0,0,+(e.mode===`hanger`),0,0,0,0,.55,.006,0,1.35,.85,.017,0,e.weight/240,.05+3*(e.damping/100)**2,.0085,C.spacing*1.9]),oe[35]=C.N,oe[39]=_.hashSize-1,b.queue.writeBuffer(w.simUBO,0,ae)}let J=new Float32Array(112);function ce(t){let n=v[y.colour],r=R(),i=t.lights;J.set(t.viewProj,0),J.set(s.invert(t.viewProj),16),J.set(t.keyVP,32),J.set(t.aoVP,48),J.set([...t.eye,1,...n.base,n.wash,...n.fuzz,n.thread,...r.front,...r.back,y.time,1/_.shadowSize,n.exposure,0,e.width,e.height,1/e.width,1/e.height,...i.key,0,...i.fill,0,...i.rimL,0,...i.rimR,0,t.aoEyeY,t.aoRange,_.aoSize,t.aoHalf],64),b.queue.writeBuffer(w.camUBO,0,J),b.queue.writeBuffer(w.keyUBO,0,t.keyVP),b.queue.writeBuffer(w.aoUBO,0,t.aoVP)}function le(e){let t=Math.ceil(C.N/64),n=w.bg,r=w.pipes;for(let i=0;i<_.substeps;i++){e.setPipeline(r.integrate),e.setBindGroup(0,n.integrate[D]),e.dispatchWorkgroups(t),e.setPipeline(r.solve);for(let r=0;r<_.iterations;r++)e.setBindGroup(0,n.solve[D]),e.dispatchWorkgroups(t),D^=1;let a=Math.max(1,Math.round(_.substeps/_.selfPasses));i%a===a-1&&(e.setPipeline(r.clear),e.setBindGroup(0,n.clear),e.dispatchWorkgroups(Math.ceil(_.hashSize/64)),e.setPipeline(r.insert),e.setBindGroup(0,n.insert[D]),e.dispatchWorkgroups(t),e.setPipeline(r.self),e.setBindGroup(0,n.self[D]),e.dispatchWorkgroups(t),D^=1)}}function ue(e){e.setPipeline(w.pipes.normals),e.setBindGroup(0,w.bg.normals[D]),e.dispatchWorkgroups(Math.ceil(C.N/64))}function de(e,t,n){let r=e.beginRenderPass({colorAttachments:[],depthStencilAttachment:{view:t.createView(),depthClearValue:1,depthLoadOp:`clear`,depthStoreOp:`store`}});r.setPipeline(w.pipes.depth),r.setBindGroup(0,n),r.setIndexBuffer(w.index,`uint32`),r.drawIndexed(C.indices.length),r.end()}function fe(e){let t=w.pipes,n=w.bg,r=e.beginRenderPass({colorAttachments:[{view:w.msaaTex.createView(),resolveTarget:x.getCurrentTexture().createView(),loadOp:`clear`,storeOp:`discard`,clearValue:[.9,.9,.91,1]}],depthStencilAttachment:{view:w.depthTex.createView(),depthClearValue:1,depthLoadOp:`clear`,depthStoreOp:`discard`}});r.setPipeline(t.bgPipe),r.setBindGroup(0,n.bgPipe),r.draw(3),y.mode===`hanger`&&(r.setPipeline(t.hanger),r.setBindGroup(0,n.hanger),r.setVertexBuffer(0,w.hangerVB),r.setIndexBuffer(w.hangerIB,`uint32`),r.drawIndexed(w.hangerCount)),r.setPipeline(t.shirt),r.setBindGroup(0,n.shirt),r.setIndexBuffer(w.index,`uint32`),r.drawIndexed(C.indices.length),w.pinCount&&(r.setPipeline(t.pins),r.setBindGroup(0,n.pins),r.draw(6,w.pinCount)),r.end()}let pe=0;function me(e){return E||pe++&1?!1:(e.copyBufferToBuffer(w.rnd,0,w.staging,0,C.N*32),!0)}function he(){E=!0,w.staging.mapAsync(GPUMapMode.READ).then(()=>{T.set(new Float32Array(w.staging.getMappedRange())),w.staging.unmap(),E=!1}).catch(()=>{E=!1})}let Y={yaw:0,pitch:.06,dist:2.45,target:[0,.62,0],fov:34*Math.PI/180,goal:{yaw:0,pitch:.06,dist:2.45,target:[0,.62,0]}},X=null;function ge(e){let t=1-Math.exp(-e*8),n=Y,r=n.goal;n.yaw+=(r.yaw-n.yaw)*t,n.pitch+=(r.pitch-n.pitch)*t,n.dist+=(r.dist-n.dist)*t,n.target=o.lerp(n.target,r.target,t)}function _e(){let e=[1e9,1e9,1e9],t=[-1e9,-1e9,-1e9];for(let n=0;n<C.N;n+=3)for(let r=0;r<3;r++){let i=T[n*8+r];i<e[r]&&(e[r]=i),i>t[r]&&(t[r]=i)}return[(e[0]+t[0])/2,c((e[1]+t[1])/2,.2,1.5),(e[2]+t[2])/2]}function ve(){let t=Y,n=Math.cos(t.pitch),r=[t.target[0]+t.dist*Math.sin(t.yaw)*n,t.target[1]+t.dist*Math.sin(t.pitch),t.target[2]+t.dist*Math.cos(t.yaw)*n],i=e.width/e.height,a=i<.9?2*Math.atan(Math.tan(t.fov/2)*.74/Math.max(i,.45)):t.fov,c=s.mul(s.perspective(a,i,.03,60),s.lookAt(r,t.target,[0,1,0])),l=Math.sin(t.yaw),u=Math.cos(t.yaw),d=e=>{let t=o.norm(e);return[t[0]*u+t[2]*l,t[1],-t[0]*l+t[2]*u]},f={key:d([-.55,.8,.62]),fill:d([.85,.2,.6]),rimL:d([-.8,.42,-.8]),rimR:d([.85,.5,-.75])},p=_e(),m=s.mul(s.ortho(-1.3,1.3,-1.3,1.3,.3,7),s.lookAt(o.add(p,o.scale(f.key,3.2)),p,[0,1,0])),h=-.05,g=2.5,_=1.6;return{eye:r,viewProj:c,lights:f,keyVP:m,aoVP:s.mul(s.ortho(-1.6,_,-1.6,_,0,g),s.lookAt([0,h,0],[0,1,0],[0,0,1])),aoEyeY:h,aoRange:g,aoHalf:_,fov:a}}function ye(e){Object.assign(Y.goal,e)}function Z(t,n){let r=e.getBoundingClientRect(),i=(t-r.left)/r.width*2-1,a=1-(n-r.top)/r.height*2,c=s.invert(X.viewProj),l=e=>{let t=[0,0,0,0];for(let n=0;n<4;n++)t[n]=c[n]*i+c[4+n]*a+c[8+n]*e+c[12+n];return[t[0]/t[3],t[1]/t[3],t[2]/t[3]]},u=l(0),d=l(1);return{o:u,d:o.norm(o.sub(d,u))}}function be(e){let t=T,n=C.indices,[r,i,a]=e.o,[s,c,l]=e.d,u=1/0,d=-1,f=0,p=0;for(let e=0;e<n.length;e+=3){let o=n[e]*8,m=n[e+1]*8,h=n[e+2]*8,g=t[m]-t[o],_=t[m+1]-t[o+1],v=t[m+2]-t[o+2],y=t[h]-t[o],b=t[h+1]-t[o+1],x=t[h+2]-t[o+2],S=c*x-l*b,C=l*y-s*x,w=s*b-c*y,T=g*S+_*C+v*w;if(Math.abs(T)<1e-12)continue;let E=1/T,D=r-t[o],O=i-t[o+1],k=a-t[o+2],A=(D*S+O*C+k*w)*E;if(A<0||A>1)continue;let j=O*v-k*_,M=k*g-D*v,N=D*_-O*g,P=(s*j+c*M+l*N)*E;if(P<0||A+P>1)continue;let F=(y*j+b*M+x*N)*E;F>0&&F<u&&(u=F,d=e,f=A,p=P)}if(d<0)return null;let m=[1-f-p,f,p],h=m.indexOf(Math.max(...m));return{vertex:n[d+h],point:o.add(e.o,o.scale(e.d,u))}}function xe(t){ie();let n=t.vertex,r=C.panelOf[n],i=w.ctrlData,a=.03;for(let e=0;e<C.N;e++){if(C.panelOf[e]!==r)continue;let o=Math.hypot(C.px[e]-C.px[n],C.py[e]-C.py[n]);o>.075||(i[e*8+4]=T[e*8]-t.point[0],i[e*8+5]=T[e*8+1]-t.point[1],i[e*8+6]=T[e*8+2]-t.point[2],i[e*8+7]=.6*Math.exp(-o*o/(2*a*a)))}b.queue.writeBuffer(w.ctrl,0,i),y.grab={target:t.point.slice(),anchor:t.point.slice(),normal:o.norm(o.sub(Y.target,X.eye)),q:[0,0,0,1],twist:0,last:null,lastDir:null,flips:[]},e.classList.add(`grabbing`)}function Se(e,t){let n=y.grab,r=Z(e,t),i=o.dot(r.d,n.normal);if(Math.abs(i)<1e-4)return;let a=o.dot(o.sub(n.anchor,r.o),n.normal)/i,s=o.add(r.o,o.scale(r.d,a));s[1]=Math.max(s[1],.02);let c=performance.now();if(n.last){let r=Math.max(1,c-n.last.t),i=[e-n.last.x,t-n.last.y],a=Math.hypot(i[0],i[1])/r;if(a>.9){let e=[i[0]/(a*r),i[1]/(a*r)];n.lastDir&&e[0]*n.lastDir[0]+e[1]*n.lastDir[1]<-.3&&n.flips.push(c),n.lastDir=e}n.flips=n.flips.filter(e=>c-e<700),n.flips.length>=3&&(Oe(o.sub(s,n.target),1),n.flips=[])}n.last={x:e,y:t,t:c},n.target=s}function Ce(e){let t=y.grab;t.twist+=e;let n=t.normal,r=t.twist/2,i=Math.sin(r);t.q=[n[0]*i,n[1]*i,n[2]*i,Math.cos(r)]}function we(){y.grab&&(y.grab=null,e.classList.remove(`grabbing`))}function Te(e){let t=null,n=.035;for(let[r,i]of y.userPinPos){let a=o.len(o.sub(i,e));a<n&&(n=a,t=r)}return t}function Ee(e,t,n){let r=Z(t,n),i=o.dot(r.d,e.normal);if(Math.abs(i)<1e-4)return;let a=o.dot(o.sub(e.anchor,r.o),e.normal)/i,s=o.add(r.o,o.scale(r.d,a));s[1]=Math.max(s[1],.01),y.userPinPos.set(e.v,s);let c=w.ctrlData,l=e.v;c[l*8]=s[0],c[l*8+1]=s[1],c[l*8+2]=s[2],c[l*8+3]=1,b.queue.writeBuffer(w.ctrl,l*32,c,l*8,4)}let De=0;function Oe(e,t){let n=o.len(e)>1e-5?o.norm(e):o.norm([Math.random()-.5,.3,Math.random()-.5]);n=o.norm(o.add(n,[0,.35,0])),y.shakeDir=n,y.shakeAmp=34*t,performance.now()-De>1200&&(a(`Shake!`),De=performance.now())}function ke(e,t){let n=be(Z(e,t));if(!n)return;let r=n.vertex;if(y.userPinPos.has(r))y.userPinPos.delete(r),a(`Unpinned`);else{let e=!1;for(let[t,r]of y.modePinPos)if(o.len(o.sub(r,n.point))<.05){e=!0;break}if(e){let e=Math.sign(C.px[r])||1;for(let t of[...y.modePinPos.keys()])Math.sign(C.px[t])===e&&y.modePinPos.delete(t);a(`Released one shoulder from the hanger`)}else y.userPinPos.set(r,[T[r*8],T[r*8+1],T[r*8+2]]),a(`Pinned · drag the pin to move it, double-click to release`)}re()}function Ae(e,t=!1){let r=e===`free`&&t&&y.mode!==`free`;if(y.mode=e,we(),y.userPinPos.clear(),y.modePinPos.clear(),!r){let t=m(C,e);if(ne(t),e===`hanger`)for(let e of C.hangerPins)y.modePinPos.set(e,[t[e*4],t[e*4+1],t[e*4+2]])}y.manqGrow=e===`mannequin`?0:1,re(),w.needNormals=!0,ye(e===`free`?{target:[0,.32,0],pitch:.42,dist:2.3}:{target:[0,.62,0],pitch:.06,dist:2.45}),n.onMode?.(e)}function je(){let t=new Map,r=null,a={t:0,x:0,y:0},s=null,l=0,u=(t,n)=>{let r=Y,i=2*r.dist*Math.tan(X.fov/2)/e.clientHeight,a=[Math.cos(r.yaw),0,-Math.sin(r.yaw)],o=[-Math.sin(r.pitch)*Math.sin(r.yaw),Math.cos(r.pitch),-Math.sin(r.pitch)*Math.cos(r.yaw)],s=Y.goal.target;Y.goal.target=[s[0]-a[0]*t*i+o[0]*n*i,c(s[1]-a[1]*t*i+o[1]*n*i,-.5,2.5),s[2]-a[2]*t*i+o[2]*n*i]},d=()=>{let[e,n]=[...t.values()];return{d:Math.hypot(e.x-n.x,e.y-n.y),mx:(e.x+n.x)/2,my:(e.y+n.y)/2}};i(e,`contextmenu`,e=>e.preventDefault()),i(e,`pointerdown`,i=>{if(e.focus({preventScroll:!0}),e.setPointerCapture(i.pointerId),t.set(i.pointerId,{x:i.clientX,y:i.clientY}),y.userActive=!0,n.onInteract?.(),s={t:performance.now(),x:i.clientX,y:i.clientY},t.size===2){we();let e=d();r={type:`pinch`,d0:e.d,dist0:Y.goal.dist,mx:e.mx,my:e.my};return}if(t.size>2)return;let a=i.button===1||i.button===2||i.shiftKey;if(!a&&i.button===0){let t=be(Z(i.clientX,i.clientY));if(t){let n=Te(t.point);if(n!==null){r={type:`pin`,v:n,anchor:y.userPinPos.get(n).slice(),normal:o.norm(o.sub(Y.target,X.eye))},e.classList.add(`grabbing`);return}xe(t),r={type:`grab`};return}}r={type:a?`pan`:`orbit`,x:i.clientX,y:i.clientY}}),i(e,`pointermove`,n=>{let i=t.get(n.pointerId);if(!i){n.pointerType===`mouse`&&performance.now()-l>60&&X&&(l=performance.now(),e.classList.toggle(`over-cloth`,!!be(Z(n.clientX,n.clientY))));return}let a=n.clientX-i.x,o=n.clientY-i.y;if(i.x=n.clientX,i.y=n.clientY,r){if(r.type===`grab`&&y.grab)Se(n.clientX,n.clientY);else if(r.type===`pin`)Ee(r,n.clientX,n.clientY);else if(r.type===`orbit`)Y.goal.yaw-=a*.0085,Y.goal.pitch=c(Y.goal.pitch+o*.006,-.3,1.35);else if(r.type===`pan`)u(a,o);else if(r.type===`pinch`&&t.size===2){let e=d();Y.goal.dist=c(r.dist0*r.d0/Math.max(e.d,1),.6,6),u(e.mx-r.mx,e.my-r.my),r.mx=e.mx,r.my=e.my}}});let f=n=>{if(t.has(n.pointerId)){if(t.delete(n.pointerId),y.userActive=t.size>0,r?.type===`grab`&&we(),r?.type===`pin`&&e.classList.remove(`grabbing`),n.pointerType!==`mouse`&&s&&performance.now()-s.t<260&&Math.hypot(n.clientX-s.x,n.clientY-s.y)<12){let e=performance.now();e-a.t<340&&Math.hypot(n.clientX-a.x,n.clientY-a.y)<36?(ke(n.clientX,n.clientY),a.t=0):a={t:e,x:n.clientX,y:n.clientY}}r=t.size===1?{type:`orbit`}:null}};i(e,`pointerup`,f),i(e,`pointercancel`,f),i(e,`dblclick`,e=>ke(e.clientX,e.clientY)),i(e,`wheel`,e=>{if(!y.grab&&!(e.ctrlKey||e.metaKey))return;e.preventDefault();let t=e.deltaMode===1?e.deltaY*16:e.deltaY;y.grab?Ce(t*.004):Y.goal.dist=c(Y.goal.dist*Math.exp(t*.0011),.6,6)},{passive:!1})}let Me=performance.now(),Q=0,$=60,Ne=performance.now()+2500,Pe=+!!g,Fe=0,Ie=!1,Le=!1,Re=NaN;function ze(e){if(Le||!Ie)return;let t=Math.min(.1,(e-Me)/1e3);Me=e,$+=(1/Math.max(t,.001)-$)*.08,!document.hidden&&e-Ne>1500&&($<50&&K<G.length-1?(q(K+1),Ne=e):$>59&&K>Pe&&e-Ne>4e3&&(q(K-1),Ne=e)),y.autoSpin&&!y.userActive&&!y.grab&&(Y.goal.yaw+=y.autoSpin*t),te(),ge(t),Math.abs(Y.yaw-Re)<1e-4||(Re=Y.yaw,n.onYaw?.(Y.yaw));let r=0;if(!y.paused){Q+=t;let e=$>50?2:1;for(;Q>=1/60&&r<e;)Q-=1/60,r++;Q>1/30&&(Q=0),y.shakeAmp*=Math.exp(-t*2.2),y.shakePhase+=t*24,y.manqGrow<1&&(y.manqGrow=Math.min(1,y.manqGrow+t/1.2))}X=ve();let i=b.createCommandEncoder();if(r>0||w.needNormals){y.time+=r/60,se();let e=i.beginComputePass();for(let t=0;t<r;t++)le(e);ue(e),e.end(),w.needNormals=!1}ce(X),de(i,w.shadowTex,w.bg.key),de(i,w.aoTex,w.bg.ao),fe(i);let a=me(i);b.queue.submit([i.finish()]),a&&he(),Fe=requestAnimationFrame(ze)}function Be(){Ie||Le||(Ie=!0,Me=performance.now(),Fe=requestAnimationFrame(ze))}function Ve(){Ie=!1,cancelAnimationFrame(Fe)}function He(){let e=n.framing;if(!e)return;let t=Y.goal.target;Y.goal.target=[t[0],t[1]+(e.dy||0),t[2]],Y.goal.dist*=e.dist||1}async function Ue(e,t){await L(e,t?.src??null),y[e===`front`?`frontRect`:`backRect`]=t?.rect??null}await O(),b.pushErrorScope(`validation`),C=p(),A(),N(),V(),await Promise.all([Ue(`front`,n.front),Ue(`back`,n.back)]),ee();let We=await b.popErrorScope();if(We)throw b.destroy(),Error(We.message);return q(Pe),je(),n.colour&&v[n.colour]&&(y.colour=n.colour),y.autoSpin=n.autoSpin||0,Ae(n.mode||`mannequin`),He(),Y.yaw=Y.goal.yaw=n.yaw||0,X=ve(),Be(),{setPrints:e=>Promise.all([Ue(`front`,e.front),Ue(`back`,e.back)]),setColour:e=>{v[e]&&(y.colour=e)},setMode:e=>{Ae(e,!0),He()},reset:()=>{Ae(y.mode),He()},setWind:e=>{y.wind=!!e},shake:()=>Oe([0,0,0],1),setAutoSpin:e=>{y.autoSpin=e||0},setYaw:(e,t=!1)=>{Y.goal.yaw=e,t&&(Y.yaw=e)},getYaw:()=>Y.goal.yaw,zoom:e=>{Y.goal.dist=c(Y.goal.dist*e,.6,6)},setActive:e=>e?Be():Ve(),destroy:()=>{Le=!0,Ve(),r.forEach(e=>e());try{b.destroy()}catch{}}}}export{e as createTeeViewer};