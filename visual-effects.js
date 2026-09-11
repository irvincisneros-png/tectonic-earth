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
      float alpha=(.13+.45*density)*front*life*visibility*(1.-volcanic*.94)*(1.+grazing*.4);
      float illumination=.20+.80*smoothstep(-.2,.85,dot(n,normalize(vec3(5.,3.,4.))));
      vec3 soot=mix(vec3(.19,.16,.14),vec3(.61,.54,.43),billow);vec3 sulfate=mix(vec3(.38,.43,.48),vec3(.73,.75,.72),billow);
      gl_FragColor=vec4(mix(soot,sulfate,volcanic)*illumination,alpha);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
      }`});
    const shell=new T.Mesh(new T.SphereGeometry(1.025+layer*.007,112,72),mat);shell.renderOrder=5+layer;globeFX.add(shell);
  }
  const atmosphere=new T.Mesh(new T.SphereGeometry(1.032,96,64),new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.BackSide,blending:T.AdditiveBlending,uniforms:{},vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 vN;varying vec3 vV;void main(){float rim=pow(max(0.,1.-abs(dot(normalize(vN),normalize(vV)))),4.);gl_FragColor=vec4(.12,.35,.62,rim*.26);}'}));group.add(atmosphere);
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


  // No local terrain is attached to the globe. All region geometry lives in its own scene.
  const regional=createRegionalScenes(stage);
  let current=null,scenario=null,view='planet';
  const drawGlobe=renderer.render.bind(renderer);renderer.render=(s,c)=>{if(view==='planet')drawGlobe(s,c);};
  const controls=document.createElement('div');controls.id='event-view-controls';controls.hidden=true;
  controls.innerHTML='<button id="fx-planet">Planet</button><button id="fx-surface">Region</button><button id="fx-close">Close-up</button><span id="fx-view-label">Drag to orbit · scroll to zoom</span>';stage.append(controls);
  const note=document.createElement('div');note.id='surface-study-label';note.hidden=true;stage.append(note);
  function setView(v){view=v;regional.setView(v);document.body.classList.toggle('surface-study',v!=='planet');for(const [id,value] of [['fx-planet','planet'],['fx-surface','region'],['fx-close','close']])document.getElementById(id).classList.toggle('on',v===value);note.hidden=v!=='planet';note.textContent=current==='tsunami'||current==='krakatau'?'SCHEMATIC WAVE PROPAGATION · NOT ARRIVAL TIMES':current==='winter'?'STRATOSPHERIC AEROSOLS · THICKNESS EXAGGERATED':'';}
  document.getElementById('fx-planet').onclick=()=>setView('planet');document.getElementById('fx-surface').onclick=()=>setView('region');document.getElementById('fx-close').onclick=()=>setView('close');
  function update(id,p,visibility,context={}){
    const key=context.scenario||id,changed=key!==scenario;current=id;scenario=key;
    local.visible=['eruption','winter','krakatau','impact','island','ridge','tsunami'].includes(id);
    for(const name of ['dust','plume','glow','impactRing','volcano','lava','ridgeGroup'])legacy[name].visible=false;
    legacy.islandChain.forEach(m=>m.visible=false);icePatches.forEach(m=>m.visible=false);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
    const available=['eruption','winter','krakatau','island','ridge','tsunami'].includes(id);
    if(changed){controls.hidden=false;document.getElementById('fx-surface').hidden=!available;document.getElementById('fx-close').hidden=!available;regional.exit();if(available)regional.set(key,p,'region');setView(available?'region':'planet');}else if(available)regional.set(key,p,view);
    const impact=id==='impact';globeFX.visible=impact||id==='winter';worldUniforms.progress.value=p;worldUniforms.visibility.value=visibility;worldUniforms.volcanic.value=id==='winter'?1:0;worldUniforms.origin.value.copy(local.position).normalize();
    waveFront.visible=id==='tsunami'||id==='krakatau';waveUniforms.uOrigin.value.copy(local.position).normalize();waveUniforms.uProgress.value=id==='krakatau'?Math.max(0,(p-.3)/.7):p;sourcePin.visible=available;
    iceUniform.value=id==='ice'?smooth(0,.45,p)*(1-smooth(.55,1,p)):0;
    const strength=smooth(.19,.29,p)*(1-smooth(.55,.75,p));worldSmoke.mesh.visible=impact&&strength>0;
    for(let i=0;i<worldSmoke.count;i++){const t=random(i+1),a=i*2.399;worldSmoke.positions[i*3]=Math.cos(a)*.17*Math.sqrt(t)*smooth(.2,.46,p)+t*.06;worldSmoke.positions[i*3+1]=.016+t*.15*smooth(.19,.38,p);worldSmoke.positions[i*3+2]=Math.sin(a)*.17*Math.sqrt(t)*smooth(.2,.46,p);worldSmoke.sizes[i]=(.014+t*.035)*strength;worldSmoke.alphas[i]=strength*.44;}sync(worldSmoke);
    flare.visible=impact&&p>.195&&p<.32;flare.position.set(0,.015,0);flare.scale.setScalar(.09+smooth(.195,.32,p)*.55);flare.material.opacity=(1-smooth(.2,.32,p))*.95;
    ejecta.mesh.visible=impact&&p>.2&&p<.5;
    for(let i=0;i<ejecta.count;i++){const t=sat((p-.2)/.3),speed=.3+random(i)*.8,a=i*2.399;ejecta.positions[i*3]=Math.cos(a)*t*speed;ejecta.positions[i*3+1]=.015+Math.sin(t*Math.PI)*(.1+random(i+31)*.35);ejecta.positions[i*3+2]=Math.sin(a)*t*speed;ejecta.sizes[i]=.003+random(i+5)*.007;ejecta.alphas[i]=(1-t)*.9;}sync(ejecta);
    trail.mesh.visible=impact&&p<.2;const outward=local.position.clone().normalize();for(let i=0;i<trail.count;i++){const t=i/trail.count,pos=legacy.asteroid.position.clone().addScaledVector(outward,t*.32);trail.positions.set(pos.toArray(),i*3);trail.sizes[i]=.012+(1-t)*.037;trail.alphas[i]=(1-t)*.42;}sync(trail);
  }
  new ResizeObserver(()=>{worldSmoke.uniforms.uScale.value=stage.clientHeight;ejecta.uniforms.uScale.value=stage.clientHeight;trail.uniforms.uScale.value=stage.clientHeight;}).observe(stage);
  function exit(){current=null;scenario=null;view='planet';regional.exit();controls.hidden=true;note.hidden=true;iceUniform.value=0;renderer.toneMapping=originalTone;renderer.toneMappingExposure=originalExposure;document.body.classList.remove('surface-study');}
  return {update,exit};
}
