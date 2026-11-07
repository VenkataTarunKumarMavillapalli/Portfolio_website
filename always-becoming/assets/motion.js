/* Native WebGL + Canvas art. No frameworks, fonts, APIs or external requests.
   All graphics are decorative; their controls have keyboard-accessible DOM equivalents. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let saved = null;
  try { saved = localStorage.getItem('venkata-motion'); } catch (_) {}
  const state = {motion: !media.matches && saved !== 'off', time: 0, chapter: 0, form: 0, city: 0};
  const renderers = [];
  let raf = 0, last = 0, dirty = true;
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const announce = () => document.dispatchEvent(new CustomEvent('experience:motion',{detail:state.motion}));
  function requestDraw(){dirty=true;if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
  function frame(now){
    raf=0;
    const dt=last?Math.min((now-last)/1000,.04):.016;last=now;
    if(state.motion)state.time+=dt;
    const draw=dirty||state.motion;dirty=false;
    if(draw)for(const r of renderers)if(r.visible)r.draw(state.time,dt);
    if(state.motion&&!document.hidden&&renderers.some(r=>r.visible))raf=requestAnimationFrame(frame);
  }
  function setMotion(value,store=true){
    state.motion=!!value&&!media.matches;
    document.documentElement.classList.toggle('motion-off',!state.motion);
    if(store){saved=state.motion?'on':'off';try{localStorage.setItem('venkata-motion',saved);}catch(_){}}
    announce();requestDraw();
  }
  media.addEventListener('change',()=>setMotion(!media.matches&&saved!=='off',false));
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
    else requestDraw();
  });
  function register(canvas,draw,resize){
    const r={canvas,draw,visible:true};renderers.push(r);
    new ResizeObserver(()=>{resize();requestDraw();}).observe(canvas);
    new IntersectionObserver(entries=>{r.visible=entries[0].isIntersecting;requestDraw();},{rootMargin:'80px'}).observe(canvas);
    resize();return r;
  }
  function canvas2D(canvas){
    const ctx=canvas.getContext('2d');let w=0,h=0,dpr=1;
    if(!ctx)return null;
    const resize=()=>{const b=canvas.getBoundingClientRect();w=b.width;h=b.height;dpr=Math.min(window.devicePixelRatio||1,1.6);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
    return {ctx,resize,get width(){return w},get height(){return h}};
  }
  // A woven torus knot morphs into an orbit and an expanding double spiral.
  const hero=document.getElementById('sculpture');
  let heroUniforms=null,heroGl=null,formValue=0,pointerX=0,pointerY=0,smoothX=0,smoothY=0;
  let fallbackCanvas=null;
  function heroFallback(){
    hero.hidden=true;
    if(fallbackCanvas)return;
    const canvas=document.createElement('canvas');canvas.id='sculpture2D';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','A live three-dimensional woven sculpture, rendered in Canvas');
    hero.parentNode.insertBefore(canvas,hero.nextSibling);fallbackCanvas=canvas;
    const ctx=canvas2D(canvas);
    if(!ctx){canvas.remove();document.getElementById('sculptureFallback').hidden=false;return;}
    document.getElementById('sculptureFallback').hidden=true;
    const mobile=innerWidth<650,strands=mobile?44:76,steps=mobile?210:300,curves=[];
    for(let s=0;s<strands;s++){
      const tube=s/strands*TAU,curve=[];
      for(let i=0;i<=steps;i++){
        const t=i/steps*TAU,r=1.55+.55*Math.cos(3*t),rr=.30*Math.cos(tube),vv=.30*Math.sin(tube),lat=(s/(strands-1)-.5)*Math.PI,ht=(i/steps-.5)*3.8,angle=t*2.1+tube,rad=1.1+.45*Math.sin((ht+1.9)*1.5);
        curve.push([[(r+rr)*Math.cos(2*t),(r+rr)*Math.sin(2*t),.65*Math.sin(3*t)+vv],[2*Math.cos(lat)*Math.cos(t),2*Math.sin(lat),2*Math.cos(lat)*Math.sin(t)],[Math.cos(angle)*rad,ht,Math.sin(angle)*rad]]);
      }
      curves.push(curve);
    }
    register(canvas,(time,dt)=>{
      const c=ctx.ctx,w=ctx.width,h=ctx.height;c.clearRect(0,0,w,h);
      formValue=state.motion?formValue+(state.form-formValue)*Math.min(dt*4,1):state.form;
      smoothX=state.motion?smoothX+(pointerX-smoothX)*.045:0;smoothY=state.motion?smoothY+(pointerY-smoothY)*.045:0;
      const ax=.52+smoothY*.22,ay=time*.12+smoothX*.28,az=-.35,sx=Math.sin(ax),cx=Math.cos(ax),sy=Math.sin(ay),cy=Math.cos(ay),sz=Math.sin(az),cz=Math.cos(az),scale=h*.168;
      const f=Math.min(1,Math.max(0,formValue<1?formValue:formValue-1)),mix=f*f*(3-2*f),from=formValue<1?0:1,to=from+1;
      c.globalCompositeOperation='lighter';
      curves.forEach((curve,j)=>{
        c.beginPath();let depth=0;
        curve.forEach((v,i)=>{
          let x=v[from][0]*(1-mix)+v[to][0]*mix,y=v[from][1]*(1-mix)+v[to][1]*mix,z=v[from][2]*(1-mix)+v[to][2]*mix;
          const yy=y*cx-z*sx,zz=y*sx+z*cx;y=yy;z=zz;
          const xx=x*cy+z*sy,zzz=-x*sy+z*cy;x=xx;z=zzz;
          const xxx=x*cz-y*sz,yyy=x*sz+y*cz;x=xxx;y=yyy;
          const perspective=6/(6-z),px=w*.51+x*scale*perspective,py=h*.49-y*scale*perspective;
          if(i===0)c.moveTo(px,py);else c.lineTo(px,py);depth+=z;
        });
        const bright=.24+.12*Math.sin(j/strands*TAU+time*.15)+.03*(depth/curve.length);
        c.strokeStyle=`rgba(${166+Math.round(20*Math.sin(j*.1))},${200+Math.round(15*Math.sin(j*.1))},105,${bright})`;c.lineWidth=mobile?.6:.68;c.stroke();
      });
      c.globalCompositeOperation='source-over';
    },ctx.resize);
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width*2-1;pointerY=(e.clientY-r.top)/r.height*2-1;});
    canvas.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
  }
  try{
    const gl=hero.getContext('webgl',{alpha:true,antialias:false,depth:false,powerPreference:'low-power',preserveDrawingBuffer:false});
    if(!gl)throw new Error('WebGL not supported');heroGl=gl;
    const vs=`precision highp float;
      attribute vec3 aKnot; attribute vec3 aOrb; attribute vec3 aSpiral; attribute float aPhase;
      uniform float uTime; uniform float uForm; uniform vec2 uPointer; uniform float uAspect; uniform float uDpr;
      varying vec3 vColor; varying float vAlpha;
      vec3 rotateY(vec3 p,float a){return vec3(cos(a)*p.x+sin(a)*p.z,p.y,-sin(a)*p.x+cos(a)*p.z);}
      vec3 rotateX(vec3 p,float a){return vec3(p.x,cos(a)*p.y-sin(a)*p.z,sin(a)*p.y+cos(a)*p.z);}
      vec3 rotateZ(vec3 p,float a){return vec3(cos(a)*p.x-sin(a)*p.y,sin(a)*p.x+cos(a)*p.y,p.z);}
      void main(){
        vec3 p = uForm < 1.0 ? mix(aKnot,aOrb,smoothstep(0.0,1.0,uForm)) : mix(aOrb,aSpiral,smoothstep(1.0,2.0,uForm));
        p = rotateX(p,.52+uPointer.y*.22);p=rotateY(p,uTime*.12+uPointer.x*.28);p=rotateZ(p,-.35);
        float perspective=6.0/(6.0-p.z);float size=.355;
        gl_Position=vec4(p.x*size*perspective/uAspect,p.y*size*perspective,0.0,1.0);
        gl_PointSize=clamp((.8+.5*perspective)*uDpr,.8,3.2);
        float light=.42+.5*(p.z+2.8)/5.6;
        float wave=.5+.5*sin(aPhase*6.2831+uTime*.25);
        vColor=mix(vec3(.31,.43,.17),vec3(.77,.96,.44),light);
        vColor=mix(vColor,vec3(.92,.87,.59),wave*.23);
        vAlpha=.16+.40*light;
      }`;
    const fs=`precision mediump float;varying vec3 vColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vColor,vAlpha*(1.0-smoothstep(.15,.5,d)));}`;
    function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader compilation failed');return s;}
    const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader linking failed');gl.useProgram(program);
    const mobile=window.innerWidth<650;const strands=mobile?65:110,steps=mobile?480:700,N=strands*steps;
    const knot=new Float32Array(N*3),orb=new Float32Array(N*3),spiral=new Float32Array(N*3),phases=new Float32Array(N);
    let n=0;
    for(let s=0;s<strands;s++){
      const tube=s/strands*TAU;
      for(let i=0;i<steps;i++){
        const t=i/(steps-1)*TAU;
        // Parallel microfilaments wind around a trefoil trajectory.
        const radius=1.55+.55*Math.cos(3*t),radial=.30*Math.cos(tube),vertical=.30*Math.sin(tube);
        knot[n*3]=(radius+radial)*Math.cos(2*t);knot[n*3+1]=(radius+radial)*Math.sin(2*t);knot[n*3+2]=.65*Math.sin(3*t)+vertical;
        const lat=(s/(strands-1)-.5)*Math.PI;
        orb[n*3]=2*Math.cos(lat)*Math.cos(t);orb[n*3+1]=2*Math.sin(lat);orb[n*3+2]=2*Math.cos(lat)*Math.sin(t);
        const ht=(i/(steps-1)-.5)*3.8,angle=t*2.1+tube;
        const rad=1.1+.45*Math.sin((ht+1.9)*1.5);
        spiral[n*3]=Math.cos(angle)*rad;spiral[n*3+1]=ht;spiral[n*3+2]=Math.sin(angle)*rad;
        phases[n]=s/strands;n++;
      }
    }
    function attribute(name,array,size){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,array,gl.STATIC_DRAW);const l=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,size,gl.FLOAT,false,0,0);}
    attribute('aKnot',knot,3);attribute('aOrb',orb,3);attribute('aSpiral',spiral,3);attribute('aPhase',phases,1);
    heroUniforms={time:gl.getUniformLocation(program,'uTime'),form:gl.getUniformLocation(program,'uForm'),pointer:gl.getUniformLocation(program,'uPointer'),aspect:gl.getUniformLocation(program,'uAspect'),dpr:gl.getUniformLocation(program,'uDpr')};
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.disable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
    let width=1,height=1,dpr=1;
    register(hero,(t,dt)=>{
      formValue=state.motion?formValue+(state.form-formValue)*Math.min(dt*4,1):state.form;
      smoothX=state.motion?smoothX+(pointerX-smoothX)*.045:0;smoothY=state.motion?smoothY+(pointerY-smoothY)*.045:0;
      gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(heroUniforms.time,t);gl.uniform1f(heroUniforms.form,formValue);gl.uniform2f(heroUniforms.pointer,smoothX,smoothY);gl.uniform1f(heroUniforms.aspect,width/height);gl.uniform1f(heroUniforms.dpr,dpr);gl.drawArrays(gl.POINTS,0,N);
    },()=>{const r=hero.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,1.6);hero.width=Math.round(width*dpr);hero.height=Math.round(height*dpr);gl.viewport(0,0,hero.width,hero.height);});
    hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width*2-1;pointerY=(e.clientY-r.top)/r.height*2-1;});
    hero.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
    hero.addEventListener('webglcontextlost',e=>{e.preventDefault();heroFallback();});
    hero.addEventListener('webglcontextrestored',()=>{heroFallback();});
  }catch(_){heroFallback();}
  // An abstract visual identity for each chapter. These are not documentary images.
  const chapterCanvas=document.getElementById('chapterCanvas'),chapter=canvas2D(chapterCanvas);
  if(chapter){
    register(chapterCanvas,(t)=>{
      const c=chapter.ctx,w=chapter.width,h=chapter.height,k=state.chapter;c.clearRect(0,0,w,h);
      const cx=w*.5,cy=h*.43,scale=Math.min(w,h)*.37;
      c.strokeStyle='rgba(27,40,19,.08)';c.lineWidth=.7;
      for(let x=25;x<w;x+=35){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
      for(let y=25;y<h;y+=35){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
      c.save();c.translate(cx,cy);
      const rot=t*.10;
      if(k===0){
        // Arch-shaped pages: a visual metaphor for a beginning.
        for(let i=0;i<21;i++){
          const offset=i*3.9,rx=scale*.72-offset*.43,ry=scale*.77-offset*.34;
          c.strokeStyle=`rgba(31,43,22,${.16+i*.017})`;c.lineWidth=1;
          c.beginPath();c.moveTo(-rx,scale*.8);c.lineTo(-rx,0);c.ellipse(0,0,rx,ry,0,Math.PI,0);c.lineTo(rx,scale*.8);c.stroke();
        }
        const p=(Math.sin(t*.45)+1)*.5;c.fillStyle='#1b2b16';c.beginPath();c.arc(0,-scale*.2+p*scale*.5,6,0,TAU);c.fill();
      }else if(k===1||k===4){
        for(let i=0;i<24;i++){
          c.save();c.rotate(i*.14+rot*.3);c.strokeStyle=`rgba(27,42,18,${.1+(i/24)*.35})`;c.lineWidth=.8;c.beginPath();c.ellipse(0,0,scale*(.7+i*.008),scale*(.18+i*.013),0,0,TAU);c.stroke();c.restore();
        }
        for(let i=0;i<5;i++){let a=i*TAU/5+rot;c.fillStyle='#263b1a';c.beginPath();c.arc(Math.cos(a)*scale*.8,Math.sin(a)*scale*.5,3.4,0,TAU);c.fill();}
      }else if(k===2){
        for(let i=0;i<18;i++){
          const s=scale*(.35+i*.035);c.save();c.translate(0,Math.sin(rot+i*.2)*9);c.rotate(-Math.PI/6);c.scale(1,.56);c.strokeStyle=`rgba(26,45,24,${.15+i*.02})`;c.strokeRect(-s,-s,s*2,s*2);c.restore();
        }
      }else if(k===3){
        for(let i=0;i<35;i++){
          c.beginPath();for(let j=0;j<=90;j++){const x=(j/90-.5)*scale*2.1;const y=Math.sin(j/90*TAU*1.2+i*.12+rot*3)*scale*.43+(i-17)*3.3;if(!j)c.moveTo(x,y);else c.lineTo(x,y);}
          c.strokeStyle=`rgba(28,45,22,${.17+Math.sin(i/35*Math.PI)*.32})`;c.lineWidth=.8;c.stroke();
        }
      }else if(k===5){
        const pts=[];for(let i=0;i<38;i++){const a=i*2.399+rot*.25,r=scale*Math.sqrt(i/38);pts.push([Math.cos(a)*r,Math.sin(a)*r]);}
        pts.forEach((p,i)=>{pts.slice(i+1).forEach(q=>{const d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(d<scale*.53){c.strokeStyle=`rgba(18,52,46,${.29*(1-d/(scale*.6))})`;c.beginPath();c.moveTo(...p);c.lineTo(...q);c.stroke();}});c.fillStyle='#244b39';c.beginPath();c.arc(...p,i%7===0?4:2,0,TAU);c.fill();});
      }else{
        for(let i=0;i<38;i++){let a=i/38*TAU+rot*.4;c.save();c.rotate(a);c.strokeStyle=`rgba(25,45,9,${.2+(i%3)*.1})`;c.beginPath();c.ellipse(scale*.28,0,scale*.65,scale*.19,0,0,TAU);c.stroke();c.restore();}
        c.fillStyle='#253b14';c.beginPath();c.arc(0,0,7,0,TAU);c.fill();
      }
      c.restore();
      c.fillStyle='rgba(30,42,20,.35)';for(let i=0;i<27;i++)c.fillRect(28+i*5,58,1,5+(i%5===0?6:0));
    },chapter.resize);
  }
  // Geographic globe. Orthographic projection; no external map service.
  const globeCanvas=document.getElementById('globe'),globe=canvas2D(globeCanvas);
  let rotation=78.487*Math.PI/180,targetRotation=rotation,tilt=.3,targetTilt=.3,dragging=false,lastDragX=0,dragStartX=0,dragStartY=0,dragMoved=false,autospin=false;
  const rad=d=>d*Math.PI/180;
  const xyz=(lon,lat)=>{const a=rad(lon),b=rad(lat);return [Math.cos(b)*Math.sin(a),Math.sin(b),Math.cos(b)*Math.cos(a)];};
  const coast=(window.LAND_RINGS||[]).map(r=>r.map(p=>xyz(p[0],p[1])));
  const landPts=(window.LAND_POINTS||[]).map(p=>xyz(p[0],p[1]));
  const graticule=[];
  for(let lat=-60;lat<=60;lat+=30){const line=[];for(let lon=-180;lon<=180;lon+=3)line.push(xyz(lon,lat));graticule.push(line);}
  for(let lon=-180;lon<180;lon+=30){const line=[];for(let lat=-90;lat<=90;lat+=3)line.push(xyz(lon,lat));graticule.push(line);}
  const cities=window.PORTFOLIO.cities,cityVectors=cities.map(p=>xyz(p.lon,p.lat));
  let cityScreens=[];
  function selectCity(index){state.city=clamp(index,0,cities.length-1);const city=cities[state.city];let a=rad(city.lon);while(a-rotation>Math.PI)a-=TAU;while(a-rotation<-Math.PI)a+=TAU;targetRotation=a;targetTilt=rad(city.lat*.65);autospin=false;if(!state.motion){rotation=targetRotation;tilt=targetTilt;}requestDraw();}
  function rotateGlobe(delta){targetRotation+=rad(delta);autospin=false;if(!state.motion)rotation=targetRotation;requestDraw();}
  if(globe){
    register(globeCanvas,(t,dt)=>{
      if(!dragging){if(autospin&&state.motion)targetRotation+=dt*.035;rotation+=((targetRotation-rotation)*(state.motion?.06:1));tilt+=((targetTilt-tilt)*(state.motion?.05:1));}
      const c=globe.ctx,w=globe.width,h=globe.height,cx=w*.5,cy=h*.5,R=Math.min(w,h)*.445;
      c.clearRect(0,0,w,h);const sr=Math.sin(rotation),cr=Math.cos(rotation),st=Math.sin(tilt),ct=Math.cos(tilt);
      const project=(v,raise=1)=>{const x=v[0]*cr-v[2]*sr,z=v[0]*sr+v[2]*cr,y=v[1]*ct-z*st,zz=v[1]*st+z*ct;return [cx+x*R*raise,cy-y*R*raise,zz];};
      const grad=c.createRadialGradient(cx-R*.22,cy-R*.2,R*.05,cx,cy,R*1.2);grad.addColorStop(0,'#25351a');grad.addColorStop(.7,'#182611');grad.addColorStop(1,'#111a0d');
      c.fillStyle=grad;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
      c.strokeStyle='rgba(170,205,120,.09)';c.lineWidth=.7;
      function strokeLine(points,raise=1){let started=false;c.beginPath();for(const v of points){const p=project(v,raise);if(p[2]>.005){if(started)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);started=true;}else started=false;}c.stroke();}
      graticule.forEach(line=>strokeLine(line));
      c.strokeStyle='rgba(160,193,114,.26)';c.lineWidth=.65;coast.forEach(line=>strokeLine(line));
      for(const v of landPts){const p=project(v);if(p[2]>0){c.fillStyle=`rgba(177,210,132,${.15+p[2]*.44})`;c.beginPath();c.arc(p[0],p[1],.75,0,TAU);c.fill();}}
      // Connections from the origin to education and career locations.
      for(let i=1;i<cities.length;i++){
        const a=cityVectors[0],b=cityVectors[i],angle=Math.acos(clamp(a[0]*b[0]+a[1]*b[1]+a[2]*b[2],-1,1)),denom=Math.sin(angle),pts=[];
        for(let j=0;j<=65;j++){const u=j/65,sa=Math.sin((1-u)*angle)/denom,sb=Math.sin(u*angle)/denom;pts.push([a[0]*sa+b[0]*sb,a[1]*sa+b[1]*sb,a[2]*sa+b[2]*sb]);}
        c.strokeStyle=i===state.city?'rgba(196,241,107,.8)':'rgba(176,216,117,.2)';c.lineWidth=i===state.city?1.25:.65;
        c.setLineDash(i===state.city?[]:[2,5]);c.lineDashOffset=-t*7;strokeLine(pts,1.013);c.setLineDash([]);
        if(state.motion){const u=(t*.08+i*.12)%1,j=Math.floor(u*65),p=project(pts[j],1.013);if(p[2]>0){c.fillStyle='#c4f16b';c.beginPath();c.arc(p[0],p[1],i===state.city?2.3:1.2,0,TAU);c.fill();}}
      }
      c.strokeStyle='rgba(171,203,131,.2)';c.lineWidth=1;c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();
      c.strokeStyle='rgba(171,203,131,.09)';c.beginPath();c.ellipse(cx,cy,R*1.09,R*.25,-.23,0,TAU);c.stroke();
      cityScreens=[];
      cities.forEach((city,i)=>{const p=project(cityVectors[i],1.014);cityScreens.push(p);if(p[2]<0)return;const selected=i===state.city;c.fillStyle=selected?'#d4ff85':'#a6c282';c.beginPath();c.arc(p[0],p[1],selected?4:2.3,0,TAU);c.fill();if(selected){c.strokeStyle='rgba(196,241,107,.35)';c.beginPath();c.arc(p[0],p[1],10+(state.motion?Math.sin(t*2)*2:0),0,TAU);c.stroke();c.fillStyle='#d6e8bd';c.font='9px monospace';c.fillText(city.name.toUpperCase(),p[0]+16,p[1]-9);}});
      // Calibration marks outside the sphere.
      c.strokeStyle='rgba(180,208,144,.18)';c.lineWidth=1;
      for(let i=0;i<72;i++){const a=i/72*TAU,rr=R*1.07,len=i%6===0?7:3;c.beginPath();c.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);c.lineTo(cx+Math.cos(a)*(rr+len),cy+Math.sin(a)*(rr+len));c.stroke();}
    },globe.resize);
    globeCanvas.addEventListener('pointerdown',e=>{dragging=true;dragMoved=false;lastDragX=dragStartX=e.clientX;dragStartY=e.clientY;});
    globeCanvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastDragX;if(Math.abs(e.clientX-dragStartX)>6&&Math.abs(e.clientX-dragStartX)>Math.abs(e.clientY-dragStartY)){dragMoved=true;try{globeCanvas.setPointerCapture(e.pointerId);}catch(_){}rotation-=dx*.008;targetRotation=rotation;autospin=false;requestDraw();}lastDragX=e.clientX;});
    function stopDrag(e){if(!dragging)return;dragging=false;if(!dragMoved&&e.type==='pointerup'){const r=globeCanvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=-1,d=22;cityScreens.forEach((p,i)=>{const v=Math.hypot(p[0]-x,p[1]-y);if(p[2]>0&&v<d){d=v;best=i;}});if(best>=0)document.dispatchEvent(new CustomEvent('experience:city',{detail:best}));}try{globeCanvas.releasePointerCapture(e.pointerId);}catch(_){} }
    globeCanvas.addEventListener('pointerup',stopDrag);globeCanvas.addEventListener('pointercancel',stopDrag);window.addEventListener('pointerup',()=>{dragging=false;});
  }
  window.Experience={
    get motion(){return state.motion;},get systemReduced(){return media.matches;},
    setMotion,
    setForm(index){state.form=clamp(index,0,2);requestDraw();},
    setChapter(index){state.chapter=clamp(index,0,6);requestDraw();},
    selectCity,rotateGlobe,
    redraw:requestDraw,
    diagnostics(){return {webgl:!!heroGl,heroRenderer:fallbackCanvas?'canvas-3d':(heroGl?'webgl':'css'),canvasCount:renderers.length,motion:state.motion,landPoints:landPts.length,coastlines:coast.length,chapter:state.chapter,form:state.form,city:state.city};}
  };
  setMotion(state.motion,false);requestDraw();
})();
