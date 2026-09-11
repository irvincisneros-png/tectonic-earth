/* Procedural, deterministic graphics. No generated images or external assets.
 * Globe effects share its renderer; the surface study uses one reusable renderer.
 * All animation is keyed to the event timeline, including reverse scrubbing. */
function createTectonicFX({group,local,ringGroup,icePatches,legacy}) {
  const T=THREE, sat=x=>Math.max(0,Math.min(1,x));
  const smooth=(a,b,x)=>{const t=sat((x-a)/(b-a));return t*t*(3-2*t);};
  const random=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
  const noise=(x,y)=>{
    const i=Math.floor(x),j=Math.floor(y);let u=x-i,v=y-j;u=u*u*(3-2*u);v=v*v*(3-2*v);
    const a=random(i+j*157),b=random(i+1+j*157),c=random(i+(j+1)*157),d=random(i+1+(j+1)*157);
    return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;
  };
  const fbm=(x,y)=>noise(x,y)*.57+noise(x*2.07,y*2.07)*.28+noise(x*4.13,y*4.13)*.15;
  const GLSL=`
    float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float fbm3(vec3 p){return .54*n3(p)+.27*n3(p*2.03)+.13*n3(p*4.11)+.06*n3(p*8.23);}
  `;
  const globeFX=new T.Group();group.add(globeFX);
  const originalTone=renderer.toneMapping,originalExposure=renderer.toneMappingExposure;
  for(const marker of ringGroup.children){if(marker.userData.name){const pin=marker.children[0];pin.geometry=new T.SphereGeometry(.0065,12,8);pin.material=new T.MeshBasicMaterial({color:0xffa65b});pin.position.y=.004;}else if(marker.isLine){marker.material.opacity=.48;}}
  const worldUniforms={progress:{value:0},origin:{value:new T.Vector3()},visibility:{value:1},volcanic:{value:0}};
  // Four translucent strata give parallax and broken cloud edges at the limb.
  for(let layer=0;layer<4;layer++){
    const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{...worldUniforms,stratum:{value:layer}},vertexShader:`varying vec3 vP;varying vec3 vW;void main(){vP=normalize(position);vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
      ${GLSL} varying vec3 vP;varying vec3 vW;uniform float progress;uniform vec3 origin;uniform float visibility;uniform float volcanic;uniform float stratum;
      void main(){vec3 n=normalize(vP);float travel=smoothstep(.32,.62,progress);float angle=acos(clamp(dot(n,origin),-1.,1.));
      vec3 wind=vec3(n.x+n.z*.24*sin(n.y*6.+progress*2.),n.y*.82,n.z-n.x*.17*cos(n.y*7.));
      vec3 warp=vec3(fbm3(wind*4.+stratum*.15),fbm3(wind.zxy*5.),fbm3(wind.yzx*4.));
      float billow=fbm3(wind*23.+warp*4.+vec3(progress*1.7,stratum*.61,0.));
      float edge=angle+(billow-.5)*.28;float front=1.-smoothstep(travel*3.6-.22,travel*3.6+.09,edge);
      float life=smoothstep(.26,.42,progress)*(1.-smoothstep(.72,1.,progress));
      float density=smoothstep(.19,.78,billow);float grazing=1.-abs(dot(n,normalize(cameraPosition-vW)));
      float alpha=(.13+.45*density)*front*life*visibility*(1.-volcanic*.48)*(1.+grazing*.4);
      float illumination=.20+.80*smoothstep(-.2,.85,dot(n,normalize(vec3(5.,3.,4.))));
      vec3 soot=mix(vec3(.19,.16,.14),vec3(.61,.54,.43),billow);vec3 sulfate=mix(vec3(.38,.43,.48),vec3(.73,.75,.72),billow);
      gl_FragColor=vec4(mix(soot,sulfate,volcanic)*illumination,alpha);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
      }`});
    const shell=new T.Mesh(new T.SphereGeometry(1.025+layer*.007,112,72),mat);shell.renderOrder=5+layer;globeFX.add(shell);
  }
  const atmosphere=new T.Mesh(new T.SphereGeometry(1.075,96,64),new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.BackSide,blending:T.AdditiveBlending,uniforms:{},vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 vN;varying vec3 vV;void main(){float rim=pow(max(0.,1.-abs(dot(normalize(vN),normalize(vV)))),4.);gl_FragColor=vec4(.12,.35,.62,rim*.26);}'}));group.add(atmosphere);
  const waveUniforms={uOrigin:{value:new T.Vector3()},uProgress:{value:0}};
  const waveFront=new T.Mesh(new T.SphereGeometry(1.004,144,96),new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:waveUniforms,vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vD;uniform vec3 uOrigin;uniform float uProgress;void main(){float angle=acos(clamp(dot(normalize(vD),uOrigin),-1.,1.));float front=smoothstep(.2,.6,uProgress)*.17+smoothstep(.6,1.,uProgress)*1.15;float d=angle-front;float envelope=exp(-d*d/ .004);float waves=sin(d*100.);float a=envelope*abs(waves)*smoothstep(.2,.25,uProgress)*.75;gl_FragColor=vec4(mix(vec3(.1,.65,.85),vec3(.93,.49,.19),step(0.,waves)),a);}'}));group.add(waveFront);
  const sourcePin=new T.Mesh(new T.SphereGeometry(.008,16,12),new T.MeshBasicMaterial({color:0xffc58b}));sourcePin.position.y=.008;local.add(sourcePin);

  function particles(count,colour,scale,hot=false){
    const geo=new T.BufferGeometry(),positions=new Float32Array(count*3),sizes=new Float32Array(count),alphas=new Float32Array(count),seeds=new Float32Array(count);
    for(let i=0;i<count;i++)seeds[i]=random(i+8)*100;
    geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('aSize',new T.BufferAttribute(sizes,1));geo.setAttribute('aAlpha',new T.BufferAttribute(alphas,1));geo.setAttribute('aSeed',new T.BufferAttribute(seeds,1));
    const uniforms={uScale:{value:scale},uColor:{value:new T.Color(colour)},uHot:{value:hot?1:0}};
    const material=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:hot?T.AdditiveBlending:T.NormalBlending,vertexShader:`attribute float aSize;attribute float aAlpha;attribute float aSeed;uniform float uScale;varying float vAlpha;varying float vSeed;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(aSize*uScale/max(.01,-p.z),1.,240.);vAlpha=aAlpha;vSeed=aSeed;}`,fragmentShader:`${GLSL} uniform vec3 uColor;uniform float uHot;varying float vAlpha;varying float vSeed;void main(){vec2 q=gl_PointCoord-.5;float r=length(q)*2.;if(r>1.)discard;float f=fbm3(vec3(q*5.,vSeed));float a=pow(max(0.,1.-r*r),1.8)*smoothstep(.12,.7,f)*vAlpha;vec3 c=uColor*(.55+f*.85);c=mix(c,mix(vec3(1.,.14,.008),vec3(1.,.9,.45),pow(max(0.,1.-r),3.)),uHot);gl_FragColor=vec4(c,a);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`});
    const mesh=new T.Points(geo,material);mesh.frustumCulled=false;return {mesh,positions,sizes,alphas,geo,uniforms,count};
  }
  const worldSmoke=particles(180,0x524c45,900);worldSmoke.mesh.renderOrder=12;local.add(worldSmoke.mesh);
  const ejecta=particles(150,0xffa343,900,true);ejecta.mesh.renderOrder=13;local.add(ejecta.mesh);
  function sync(pool){for(const name of ['position','aSize','aAlpha'])pool.geo.attributes[name].needsUpdate=true;}
  // A soft radial flash replaces the opaque expanding ball.
  const flashCanvas=document.createElement('canvas');flashCanvas.width=flashCanvas.height=128;
  const fx=flashCanvas.getContext('2d'),gradient=fx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,248,214,1)');gradient.addColorStop(.12,'rgba(255,196,78,.9)');gradient.addColorStop(.4,'rgba(255,76,9,.25)');gradient.addColorStop(1,'rgba(255,42,0,0)');fx.fillStyle=gradient;fx.fillRect(0,0,128,128);
  const flare=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(flashCanvas),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));local.add(flare);
  const rock=new T.IcosahedronGeometry(.024,4),rp=rock.attributes.position;
  for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),f=.84+.28*fbm(x*100+z*31,y*100);rp.setXYZ(i,x*f,y*f*.84,z*f*1.12);}rock.computeVertexNormals();legacy.asteroid.geometry.dispose();legacy.asteroid.geometry=rock;legacy.asteroid.material.color.setHex(0x645348);
  const trail=particles(80,0xff7733,900,true);group.add(trail.mesh);

  // Snow is shaded on the actual land mesh: no solid elliptical disks over oceans.
  const iceUniform={value:0};
  for(const m of contMeshes){const material=m.land.material,previous=material.onBeforeCompile;
    material.onBeforeCompile=shader=>{previous(shader);shader.uniforms.uIceCover=iceUniform;shader.fragmentShader=`uniform float uIceCover;${GLSL}\n`+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 ll=vUv*vec2(360.,180.)-vec2(180.,90.);
      float rough=fbm3(vec3(ll*.28,1.));
      float na=length((ll-vec2(-98.,62.))/vec2(48.,22.));
      float labrador=length((ll-vec2(-67.,60.))/vec2(15.,15.));
      float eu=length((ll-vec2(24.,66.))/vec2(37.,17.));
      float edge=min(min(na,labrador),eu)+(rough-.5)*.15;
      float cover=(1.-smoothstep(uIceCover-.08,uIceCover+.02,edge))*step(.01,uIceCover);
      float grain=fbm3(vec3(ll*2.8,3.));vec3 snow=mix(vec3(.38,.52,.62),vec3(.78,.86,.91),grain*.5+.45);
      diffuseColor.rgb=mix(diffuseColor.rgb,snow,cover*.97);`);
    };material.needsUpdate=true;
  }

  // Reusable full-size 3D surface study.
  const surfaceRenderer=new T.WebGLRenderer({antialias:true,alpha:false});surfaceRenderer.setPixelRatio(Math.min(devicePixelRatio,1.7));surfaceRenderer.outputEncoding=T.sRGBEncoding;surfaceRenderer.toneMapping=T.ACESFilmicToneMapping;surfaceRenderer.toneMappingExposure=1.12;
  surfaceRenderer.domElement.id='event-surface';surfaceRenderer.domElement.hidden=true;stage.prepend(surfaceRenderer.domElement);
  const surfaceScene=new T.Scene();surfaceScene.background=new T.Color(0x101c27);surfaceScene.fog=new T.FogExp2(0x142332,.025);
  const surfaceCamera=new T.PerspectiveCamera(43,1,.1,150);let azimuth=.68,elevation=.30,distance=19;
  surfaceScene.add(new T.HemisphereLight(0xadc9e1,0x3e2820,.85));const key=new T.DirectionalLight(0xffdbb6,2.6);key.position.set(-6,9,3);surfaceScene.add(key);
  const rim=new T.DirectionalLight(0x779cdb,1.1);rim.position.set(8,4,-8);surfaceScene.add(rim);
  const fireLight=new T.PointLight(0xff5c18,3,10,2);fireLight.position.set(0,3.3,0);surfaceScene.add(fireLight);
  const terrainRoot=new T.Group();surfaceScene.add(terrainRoot);
  const terrainGeo=new T.PlaneGeometry(32,32,192,192);terrainGeo.rotateX(-Math.PI/2);
  function height(x,z){const r=Math.hypot(x,z),a=Math.atan2(z,x);const flank=3.9*Math.exp(-Math.pow(r/3.4,1.25));const crater=1.15*Math.exp(-Math.pow(r/.58,4));const erosion=(Math.sin(a*19+r*.6)*.11+Math.sin(a*37-r*.8)*.055)*Math.min(r,2)*Math.exp(-r*.19);return flank-crater+erosion+(fbm(x*1.5,z*1.5)-.5)*.32-1.1;}
  const terrainPositions=terrainGeo.attributes.position,terrainColors=[];
  for(let i=0;i<terrainPositions.count;i++){const x=terrainPositions.getX(i),z=terrainPositions.getZ(i),y=height(x,z);terrainPositions.setY(i,y);const n=fbm(x*3,z*3),c=new T.Color();c.setRGB(.016+n*.039,.014+n*.034,.013+n*.032);if(y<.2)c.lerp(new T.Color(.018,.03,.018),.3);terrainColors.push(c.r,c.g,c.b);}
  terrainGeo.setAttribute('color',new T.Float32BufferAttribute(terrainColors,3));terrainGeo.computeVertexNormals();
  const terrainMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.98,metalness:.015});
  terrainMat.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 vRock;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRock=position;');shader.fragmentShader=GLSL+'varying vec3 vRock;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grit=fbm3(vRock*27.);diffuseColor.rgb*=.62+grit*.7;');};
  const terrain=new T.Mesh(terrainGeo,terrainMat);terrainRoot.add(terrain);
  const lavaMat=new T.ShaderMaterial({uniforms:{uTime:{value:0},uHeat:{value:1}},vertexShader:'varying vec3 vL;void main(){vL=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`${GLSL}varying vec3 vL;uniform float uTime;uniform float uHeat;void main(){float crust=fbm3(vL*18.+vec3(0.,uTime*.2,0.));float cracks=smoothstep(.34,.60,crust);vec3 c=mix(vec3(.07,.009,.003),vec3(2.8,.12,.003),cracks);c+=vec3(.8,.4,.01)*smoothstep(.64,.78,crust);c=mix(vec3(.035,.018,.013),c,uHeat);gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }`});
  const lavaPool=new T.Mesh(new T.CircleGeometry(.47,64),lavaMat);lavaPool.rotation.x=-Math.PI/2;lavaPool.position.y=height(0,0)+.07;terrainRoot.add(lavaPool);
  const flows=[];for(let j=0;j<7;j++){const points=[],a=j*2.399+.1;for(let i=0;i<=96;i++){const r=.42+i/96*(3.3+random(j)*1.5),angle=a+Math.sin(r*3+j)*.065;const x=Math.cos(angle)*r,z=Math.sin(angle)*r;points.push(new T.Vector3(x,height(x,z)+.035,z));}const g=new T.TubeGeometry(new T.CatmullRomCurve3(points),96,.027+random(j+1)*.025,6,false),m=new T.Mesh(g,lavaMat);terrainRoot.add(m);flows.push(m);}
  const planetTerrain=new T.Group();local.add(planetTerrain);planetTerrain.scale.setScalar(.013);planetTerrain.add(new T.Mesh(terrainGeo,terrainMat));planetTerrain.add(lavaPool.clone());for(const flow of flows)planetTerrain.add(flow.clone());
  const olderIslands=[];for(let i=0;i<2;i++){const island=new T.Mesh(terrainGeo,terrainMat);island.scale.setScalar(.3+i*.06);island.position.set(-6-i*4,-.65-i*.12,-3-i*2);surfaceScene.add(island);olderIslands.push(island);}
  const surfaceSmoke=particles(260,0x393632,850);surfaceScene.add(surfaceSmoke.mesh);
  const embers=particles(150,0xff8b2e,850,true);surfaceScene.add(embers.mesh);
  const waterUniforms={uTime:{value:0},uTsunami:{value:0},uProgress:{value:0}};
  const water=new T.Mesh(new T.PlaneGeometry(160,160,192,192),new T.ShaderMaterial({uniforms:waterUniforms,transparent:true,vertexShader:`uniform float uTime;uniform float uTsunami;uniform float uProgress;varying vec3 vWater;varying float vCrest;varying float vDepth;void main(){vec3 p=position;float swell=sin(p.x*.8+uTime)*.027+sin(p.y*1.3-uTime*.8)*.018;float front=-14.+uProgress*25.;float envelope=exp(-pow((p.x-front)/2.1,2.));float wave=sin((p.x-front)*1.6)*envelope*(.2+uProgress*.85)*uTsunami;p.z=swell+wave;vCrest=wave;vWater=p;vec4 mv=modelViewMatrix*vec4(p,1.);vDepth=-mv.z;gl_Position=projectionMatrix*mv;}`,fragmentShader:`${GLSL} varying vec3 vWater;varying float vCrest;varying float vDepth;uniform float uTime;uniform float uTsunami;void main(){float ripple=fbm3(vec3(vWater.xy*3.,uTime*.12));float glint=smoothstep(.67,.79,fbm3(vec3(vWater.xy*12.+ripple,uTime*.2)));vec3 c=mix(vec3(.004,.017,.025),vec3(.018,.065,.085),ripple);c+=vec3(.2,.28,.33)*glint*.3;float foam=smoothstep(.29,.7,vCrest)*smoothstep(.35,.6,ripple);c=mix(c,vec3(.55,.67,.68),foam);c=mix(c,vec3(.006,.012,.019),smoothstep(16.,75.,vDepth));gl_FragColor=vec4(c,.96);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }`}));water.rotation.x=-Math.PI/2;water.position.y=-.62;surfaceScene.add(water);
  // Coastal terrain is separate from the volcanic height field.
  const coastGeo=new T.PlaneGeometry(44,44,160,160);coastGeo.rotateX(-Math.PI/2);const cp=coastGeo.attributes.position,cc=[];
  function coastHeight(x,z){const shore=x+Math.sin(z*.47)*.65+Math.sin(z*1.3)*.18;return -1.4+smooth(2,10,shore)*2.4+(fbm(x*.4,z*.4)-.5)*.7*smooth(3,12,x);}
  for(let i=0;i<cp.count;i++){const x=cp.getX(i),z=cp.getZ(i),h=coastHeight(x,z);cp.setY(i,h);const c=new T.Color(x<7?0x74674e:0x35432d).convertSRGBToLinear();c.multiplyScalar(.65+fbm(x,z)*.6);cc.push(c.r,c.g,c.b);}coastGeo.setAttribute('color',new T.Float32BufferAttribute(cc,3));coastGeo.computeVertexNormals();const coastMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.97});coastMaterial.onBeforeCompile=terrainMat.onBeforeCompile;const coast=new T.Mesh(coastGeo,coastMaterial);surfaceScene.add(coast);
  const boulders=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),new T.MeshStandardMaterial({color:0x35352b,roughness:1}),130);const rockMatrix=new T.Object3D();for(let i=0;i<130;i++){const x=5+random(i)*10,z=(random(i+333)-.5)*30,r=.06+random(i+444)*.22;rockMatrix.position.set(x,coastHeight(x,z)+r*.3,z);rockMatrix.rotation.set(random(i)*2,random(i+1)*5,0);rockMatrix.scale.set(r,r*.6,r*.8);rockMatrix.updateMatrix();boulders.setMatrixAt(i,rockMatrix.matrix);}coast.add(boulders);
  // Ridge relief, with emissive fissures instead of rectangular blocks.
  const ridgeGeo=new T.PlaneGeometry(28,28,128,128);ridgeGeo.rotateX(-Math.PI/2);const rg=ridgeGeo.attributes.position;
  for(let i=0;i<rg.count;i++){const x=rg.getX(i),z=rg.getZ(i);rg.setY(i,1.1*Math.exp(-Math.abs(x)*.5)-.6*Math.exp(-x*x*5)+(fbm(x*2,z*2)-.5)*.5-.7);}ridgeGeo.computeVertexNormals();const ridgeMaterial=new T.MeshStandardMaterial({color:new T.Color(0x272a2e).convertSRGBToLinear(),roughness:.98});ridgeMaterial.onBeforeCompile=terrainMat.onBeforeCompile;const ridge=new T.Mesh(ridgeGeo,ridgeMaterial);surfaceScene.add(ridge);
  const fissurePoints=[];for(let i=0;i<100;i++){const z=-9+i*.18;fissurePoints.push(new T.Vector3(Math.sin(z*2)*.06,-.06+(fbm(0,z*2)-.5)*.5,z));}const fissure=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(fissurePoints),150,.04,6,false),lavaMat);surfaceScene.add(fissure);
  const planetRidge=new T.Group();planetRidge.scale.setScalar(.008);planetRidge.add(ridge.clone(),fissure.clone());local.add(planetRidge);
  let current=null,p=0,surfaceMode=false;
  const controls=document.createElement('div');controls.id='event-view-controls';controls.innerHTML='<button id="fx-planet" class="on">Planet view</button><button id="fx-surface">3D surface view</button><span id="fx-view-label">Drag to orbit · scroll to zoom</span>';stage.append(controls);controls.hidden=true;
  const studyLabel=document.createElement('div');studyLabel.id='surface-study-label';studyLabel.textContent='SURFACE STUDY · SCHEMATIC TERRAIN · VERTICAL SCALE EXAGGERATED';stage.append(studyLabel);studyLabel.hidden=true;
  function mode(value){surfaceMode=value;surfaceRenderer.domElement.hidden=!value;studyLabel.hidden=!value&&!['tsunami','krakatau'].includes(current);studyLabel.textContent=value?'SURFACE STUDY · SCHEMATIC TERRAIN · VERTICAL SCALE EXAGGERATED':'SCHEMATIC CRESTS & TROUGHS · NOT ARRIVAL TIMES';document.getElementById('fx-planet').classList.toggle('on',!value);document.getElementById('fx-surface').classList.toggle('on',value);document.body.classList.toggle('surface-study',value);render();}
  document.getElementById('fx-planet').onclick=()=>mode(false);document.getElementById('fx-surface').onclick=()=>mode(true);
  let dragState=null;const canvas=surfaceRenderer.domElement;canvas.addEventListener('pointerdown',e=>{dragState=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!dragState)return;azimuth-=(e.clientX-dragState[0])*.006;elevation=Math.max(.14,Math.min(1.25,elevation+(e.clientY-dragState[1])*.004));dragState=[e.clientX,e.clientY];render();});canvas.addEventListener('pointerup',()=>dragState=null);canvas.addEventListener('pointercancel',()=>dragState=null);canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(6,Math.min(26,distance*(1+Math.sign(e.deltaY)*.07)));render();},{passive:false});
  function resizeSurface(){const w=stage.clientWidth,h=stage.clientHeight;surfaceRenderer.setSize(w,h,false);surfaceCamera.aspect=w/h;surfaceCamera.updateProjectionMatrix();surfaceSmoke.uniforms.uScale.value=h*.95;embers.uniforms.uScale.value=h*.95;worldSmoke.uniforms.uScale.value=h*1.15;ejecta.uniforms.uScale.value=h*1.15;trail.uniforms.uScale.value=h*1.15;render();}
  new ResizeObserver(resizeSurface).observe(stage);
  function render(){if(!surfaceMode||!current)return;const target=current==='tsunami'?new T.Vector3(2,0,0):new T.Vector3(0,['eruption','winter','krakatau'].includes(current)?3.3:.7,0);surfaceCamera.position.set(target.x+distance*Math.cos(elevation)*Math.sin(azimuth),target.y+distance*Math.sin(elevation),target.z+distance*Math.cos(elevation)*Math.cos(azimuth));surfaceCamera.lookAt(target);surfaceRenderer.render(surfaceScene,surfaceCamera);}
  function update(id,progress,visibility){
    const changed=id!==current;current=id;p=progress;
    local.visible=['eruption','winter','krakatau','impact','island','ridge','tsunami'].includes(id);
    legacy.dust.visible=false;legacy.plume.visible=false;legacy.glow.visible=false;legacy.impactRing.visible=false;legacy.volcano.visible=false;legacy.lava.visible=false;legacy.ridgeGroup.visible=false;legacy.islandChain.forEach(m=>m.visible=false);icePatches.forEach(m=>m.visible=false);
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
    if(changed){controls.hidden=false;const available=['eruption','winter','krakatau','island','ridge','tsunami'].includes(id);document.getElementById('fx-surface').hidden=!available;azimuth=id==='tsunami'?-1.05:.68;elevation=id==='tsunami'?.44:.30;distance=innerWidth<821?24:['eruption','winter','krakatau'].includes(id)?21:16;mode(available&&id!=='tsunami');}
    const impact=id==='impact',volcanic=['eruption','winter','krakatau'].includes(id),atmospheric=impact||id==='winter';globeFX.visible=atmospheric;
    waveFront.visible=id==='tsunami'||id==='krakatau';waveUniforms.uOrigin.value.copy(local.position).normalize();waveUniforms.uProgress.value=id==='krakatau'?Math.max(0,(p-.3)/.7):p;
    sourcePin.visible=waveFront.visible;
    worldUniforms.progress.value=p;worldUniforms.visibility.value=visibility;worldUniforms.volcanic.value=id==='winter'?1:0;worldUniforms.origin.value.copy(local.position).normalize();iceUniform.value=id==='ice'?smooth(0,.45,p)*(1-smooth(.55,1,p)):0;
    const strength=smooth(.19,.29,p)*(1-smooth(.60,.85,p));worldSmoke.mesh.visible=(impact||volcanic)&&strength>0;
    for(let i=0;i<worldSmoke.count;i++){const t=random(i+1),a=i*2.399,spread=impact?.27:.085;worldSmoke.positions[i*3]=Math.cos(a)*spread*Math.sqrt(t)*smooth(.2,.46,p)+t*.12*smooth(.3,.6,p);worldSmoke.positions[i*3+1]=.025+t*(impact?.26:.22)*smooth(.19,.38,p);worldSmoke.positions[i*3+2]=Math.sin(a)*spread*Math.sqrt(t)*smooth(.2,.46,p);worldSmoke.sizes[i]=(.035+t*.06)*strength;worldSmoke.alphas[i]=strength*.44;}sync(worldSmoke);
    flare.visible=impact&&p>.195&&p<.32;flare.position.set(0,.015,0);flare.scale.setScalar(.09+smooth(.195,.32,p)*.65);flare.material.opacity=(1-smooth(.2,.32,p))*.95;
    ejecta.mesh.visible=impact&&p>.2&&p<.5;for(let i=0;i<ejecta.count;i++){const t=sat((p-.2)/.3),speed=.3+random(i)*.8,a=i*2.399;ejecta.positions[i*3]=Math.cos(a)*t*speed;ejecta.positions[i*3+1]=.015+Math.sin(t*Math.PI)*(.1+random(i+31)*.35);ejecta.positions[i*3+2]=Math.sin(a)*t*speed;ejecta.sizes[i]=.003+random(i+5)*.01;ejecta.alphas[i]=(1-t)*.9;}sync(ejecta);
    trail.mesh.visible=impact&&p<.2;const outward=local.position.clone().normalize();for(let i=0;i<trail.count;i++){const t=i/trail.count,offset=outward.clone().multiplyScalar(t*.32).add(new T.Vector3(0,t*.08,0));const pos=legacy.asteroid.position.clone().add(offset);trail.positions.set(pos.toArray(),i*3);trail.sizes[i]=.012+(1-t)*.037;trail.alphas[i]=(1-t)*.42;}sync(trail);
    terrainRoot.visible=['eruption','winter','krakatau','island'].includes(id);coast.visible=id==='tsunami';ridge.visible=fissure.visible=id==='ridge';water.visible=['island','tsunami','eruption','winter','krakatau'].includes(id);
    planetRidge.visible=id==='ridge';olderIslands.forEach((m,i)=>{m.visible=id==='island'&&p>.8+i*.07;});
    terrainRoot.position.y=id==='island'?-3.5+4.1*smooth(0,1,p):id==='krakatau'?-2.9*smooth(.4,.75,p):0;
    planetTerrain.visible=terrainRoot.visible;planetTerrain.position.y=terrainRoot.position.y*.013;
    fireLight.intensity=terrainRoot.visible?2.8*strength:1;lavaMat.uniforms.uTime.value=p*80;lavaMat.uniforms.uHeat.value=.4+.6*(1-smooth(.75,1,p));
    for(let i=0;i<flows.length;i++){const f=smooth(.12+i*.035,.8,p);flows[i].geometry.setDrawRange(0,Math.floor(flows[i].geometry.index.count*f/3)*3);}
    surfaceSmoke.mesh.visible=volcanic&&strength>0;embers.mesh.visible=volcanic&&strength>0;
    for(let i=0;i<surfaceSmoke.count;i++){
      const age=(random(i+19)+p*1.6)%1,a=i*2.399,height=age*7.5*strength,umbrella=smooth(2.6,5.8,height),width=.18+umbrella*2.9;
      surfaceSmoke.positions[i*3]=Math.cos(a)*width*Math.sqrt(random(i+3))+height*.16;surfaceSmoke.positions[i*3+1]=2.5+height;surfaceSmoke.positions[i*3+2]=Math.sin(a)*width*Math.sqrt(random(i+3));surfaceSmoke.sizes[i]=(.48+age*1.75)*strength;surfaceSmoke.alphas[i]=strength*(1-smooth(.72,1,age))*.53;
    }sync(surfaceSmoke);
    for(let i=0;i<embers.count;i++){const age=(random(i)+p*3)%1,a=i*2.399;embers.positions[i*3]=Math.cos(a)*age*1.5;embers.positions[i*3+1]=2.4+Math.sin(age*Math.PI)*1.9;embers.positions[i*3+2]=Math.sin(a)*age*1.5;embers.sizes[i]=.035+random(i+1)*.06;embers.alphas[i]=strength*(1-age)*.85;}sync(embers);
    waterUniforms.uTime.value=p*65;waterUniforms.uTsunami.value=id==='tsunami'||id==='krakatau'?1:0;waterUniforms.uProgress.value=id==='krakatau'?Math.max(0,(p-.35)/.65):p;render();
  }
  function exit(){current=null;surfaceMode=false;surfaceRenderer.domElement.hidden=true;studyLabel.hidden=true;controls.hidden=true;iceUniform.value=0;renderer.toneMapping=originalTone;renderer.toneMappingExposure=originalExposure;document.body.classList.remove('surface-study');}
  resizeSurface();return {update,exit};
}
