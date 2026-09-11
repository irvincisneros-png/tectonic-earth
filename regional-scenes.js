/* Measured terrain, distinct event reconstructions, and one reusable renderer.
 * Coordinates are east / up / south. Terrain source and historical edits are
 * described in terrain/ATTRIBUTION.md and in each visible scene caption. */
function createRegionalScenes(host) {
  const T=THREE, clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  const rand=i=>{const x=Math.sin(i*127.1+42)*43758.5453;return x-Math.floor(x);};
  const glsl=`float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
  float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
  float fbm(vec3 p){return noise(p)*.57+noise(p*2.03)*.28+noise(p*4.11)*.15;}`;
  const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
  const canvas=renderer.domElement;canvas.id='event-surface';canvas.hidden=true;host.prepend(canvas);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(43,1,.05,200);scene.background=new T.Color(0x8097a4);scene.fog=new T.FogExp2(0x8097a4,.019);
  const hemi=new T.HemisphereLight(0xc4dbe6,0x253422,.75);scene.add(hemi);
  const sun=new T.DirectionalLight(0xffebd4,2.5);sun.position.set(-10,14,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:.1,far:60});sun.shadow.bias=-.00015;sun.shadow.normalBias=.018;scene.add(sun);
  const fill=new T.DirectionalLight(0x8aaed0,.45);fill.position.set(10,5,-12);scene.add(fill);
  const terrainRoot=new T.Group();scene.add(terrainRoot);
  const terrainUniforms={ash:{value:0},clock:{value:0}};
  function rockMaterial(){const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.94});mat.onBeforeCompile=s=>{Object.assign(s.uniforms,terrainUniforms);s.vertexShader='attribute float historical;varying float vHistorical;varying vec3 vGround;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGround=position;vHistorical=historical;');s.fragmentShader=glsl+'uniform float ash;varying vec3 vGround;varying float vHistorical;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float grit=fbm(vGround*42.);float veins=fbm(vGround*8.);diffuseColor.rgb*=.72+grit*.55;
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.022,.058,.024)*(.7+veins*.6),vHistorical);
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.09,.085,.075)*(.8+grit*.3),ash*(.55+veins*.45));`);};return mat;}
  const terrainMaterial=rockMaterial();
  const waterU={clock:{value:0},wave:{value:0},progress:{value:0},direction:{value:1},heightMap:{value:null},sea:{value:0},weather:{value:0},circular:{value:0},origin:{value:new T.Vector2()}};
  const water=new T.Mesh(new T.PlaneGeometry(160,160,256,256),new T.ShaderMaterial({uniforms:waterU,transparent:true,depthWrite:false,vertexShader:`uniform float clock, wave, progress, direction, sea,circular;uniform vec2 origin;varying vec3 vP;varying vec3 vW;varying float vH;
    void main(){vec3 p=position;float radial=length(p.xy-origin);float q=mix(p.x*direction,radial,circular);float front=mix(-10.+progress*20.,progress*13.,circular);float env=exp(-pow((q-front)/1.3,2.));float h=sin((q-front)*3.)*env*wave; p.z=sea+h+sin(p.x*2.1+clock)*.001+sin(p.y*3.7-clock*.8)*.0006;vH=h;vP=p;vW=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`${glsl} uniform float clock,weather;uniform sampler2D heightMap;varying vec3 vP,vW;varying float vH;
    void main(){vec3 V=normalize(cameraPosition-vW);float n=fbm(vec3(vP.xy*6.,clock*.08));float nx=fbm(vec3(vP.xy*6.+vec2(.08,0),clock*.08)),ny=fbm(vec3(vP.xy*6.+vec2(0,.08),clock*.08));vec3 N=normalize(vec3((n-nx)*1.7,1.,(n-ny)*1.7));float fres=pow(1.-max(0.,dot(N,V)),4.);vec3 L=normalize(vec3(-10.,14.,6.));float spec=pow(max(0.,dot(reflect(-L,N),V)),140.);
    vec2 uv=(vec2(vP.x,-vP.y)+10.)/20.;vec2 enc=texture2D(heightMap,uv).rg;float ground=(enc.r*65280.+enc.g*255.)/65535.*20.-8.;float inside=step(0.,uv.x)*step(0.,uv.y)*step(uv.x,1.)*step(uv.y,1.);float depth=mix(5.,max(0.,vP.z-ground),inside);
    vec3 shallow=vec3(.025,.18,.16),deep=vec3(.007,.046,.069);vec3 c=mix(shallow,deep,smoothstep(0.,.24,depth));c=mix(c,vec3(.25,.35,.40),fres*.62);c+=vec3(1.,.88,.68)*spec*.7;
    float foam=(1.-smoothstep(.015,.10,depth))*smoothstep(.37,.65,n)*.25+smoothstep(.16,.35,vH)*smoothstep(.4,.7,n)*.65;c=mix(c,vec3(.50,.60,.60),clamp(foam,0.,.75));c*=1.-weather*.58;float fog=1.-exp(-length(cameraPosition-vW)*.017);c=mix(c,vec3(.20,.28,.32)*(1.-weather*.55),fog*.75);gl_FragColor=vec4(c,.98);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }`}));water.rotation.x=-Math.PI/2;water.renderOrder=1;scene.add(water);
  function makeVolume(){
    const uniforms={eye:{value:new T.Vector3()},clock:{value:0},strength:{value:0},low:{value:0}};
    const mat=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,depthTest:false,side:T.BackSide,vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`${glsl} varying vec3 vP;uniform vec3 eye;uniform float clock,strength,low;
      float density(vec3 p){float y=p.y+.5;vec2 xz=p.xz-vec2(y*.13,0.);float stem=exp(-dot(xz,xz)/( .002+y*.012))*smoothstep(0.,.10,y)*(1.-smoothstep(.68,.96,y));float cap=exp(-pow((y-.72)/.16,2.))*exp(-dot(xz,xz)/.095);float billow=fbm(p*12.+vec3(0.,-clock*.4,0.));float fade=(1.-smoothstep(.34,.49,abs(p.x)))*(1.-smoothstep(.34,.49,abs(p.z)))*smoothstep(0.,.04,y)*(1.-smoothstep(.87,1.,y));float d=max(stem,cap)*smoothstep(.23,.65,billow);return d*strength*fade;}
      void main(){vec3 ray=normalize(vP-eye),inv=1./ray;vec3 t0=(-vec3(.5)-eye)*inv,t1=(vec3(.5)-eye)*inv;vec3 nearv=min(t0,t1),farv=max(t0,t1);float start=max(0.,max(max(nearv.x,nearv.y),nearv.z)),end=min(min(farv.x,farv.y),farv.z);if(end<=start)discard;float stepSize=(end-start)/36.;vec3 rgb=vec3(0.);float alpha=0.;for(int i=0;i<36;i++){vec3 p=eye+ray*(start+(float(i)+.5)*stepSize);float d=density(p);float shade=density(p+vec3(-.06,.08,.03));float light=exp(-shade*3.8);vec3 c=mix(vec3(.038,.037,.036),vec3(.44,.43,.40),light);float a=1.-exp(-d*stepSize*18.);rgb+=(1.-alpha)*a*c;alpha+=(1.-alpha)*a;if(alpha>.97)break;}if(alpha<.005)discard;gl_FragColor=vec4(rgb/max(alpha,.001),alpha);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`});const m=new T.Mesh(new T.BoxGeometry(1,1,1),mat);m.renderOrder=2;scene.add(m);return m;
  }
  const volumes=[makeVolume(),makeVolume(),makeVolume()];
  const spreadingArrows=[new T.ArrowHelper(new T.Vector3(-1,0,0),new T.Vector3(),1.4,0xffbb73,.18,.10),new T.ArrowHelper(new T.Vector3(1,0,0),new T.Vector3(),1.4,0xffbb73,.18,.10)];spreadingArrows.forEach(a=>scene.add(a));
  const lavaGeometry=new T.BufferGeometry(),lavaPositions=new Float32Array(3*81*2*3),lavaIndices=[];
  for(let k=0;k<3;k++)for(let i=0;i<80;i++){const a=k*162+i*2;lavaIndices.push(a,a+1,a+2,a+1,a+3,a+2);}
  lavaGeometry.setAttribute('position',new T.BufferAttribute(lavaPositions,3));lavaGeometry.setIndex(lavaIndices);
  const lava=new T.Mesh(lavaGeometry,new T.ShaderMaterial({uniforms:{clock:terrainUniforms.clock},side:T.DoubleSide,vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`${glsl}uniform float clock;varying vec3 vP;void main(){float n=fbm(vP*70.+vec3(clock*.03,0.,0.));vec3 c=mix(vec3(.024,.008,.003),vec3(2.4,.15,.008),smoothstep(.36,.64,n));gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }`}));lava.frustumCulled=false;scene.add(lava);
  // Dense ground-hugging particles follow the measured / reconstructed slopes.
  const puffGeo=new T.BufferGeometry(),puffP=new Float32Array(240*3),puffS=new Float32Array(240),puffA=new Float32Array(240);
  puffGeo.setAttribute('position',new T.BufferAttribute(puffP,3));puffGeo.setAttribute('size',new T.BufferAttribute(puffS,1));puffGeo.setAttribute('alpha',new T.BufferAttribute(puffA,1));
  const puffU={pixel:{value:800}};const groundCloud=new T.Points(puffGeo,new T.ShaderMaterial({uniforms:puffU,transparent:true,depthWrite:false,vertexShader:'attribute float size,alpha;uniform float pixel;varying float a;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(size*pixel/-p.z,1.,180.);a=alpha;}',fragmentShader:`${glsl}varying float a;void main(){vec2 q=gl_PointCoord-.5;float r=length(q)*2.;if(r>1.)discard;float n=fbm(vec3(q*7.,2.));float opacity=pow(1.-r*r,1.5)*a;gl_FragColor=vec4(vec3(.18,.17,.15)*(.7+n*.6),opacity);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
  }`}));groundCloud.frustumCulled=false;scene.add(groundCloud);
  const labelRoot=document.createElement('div');labelRoot.id='regional-labels';host.append(labelRoot);
  const status=document.createElement('div');status.id='regional-status';host.append(status);status.hidden=true;
  const cameraButton=document.createElement('button');cameraButton.id='regional-focus';cameraButton.textContent='Focus on this stage';host.append(cameraButton);cameraButton.hidden=true;
  let active=null,progress=0,view='planet',terrainMesh=null,base=[],model=[],heightTexture=null,site=null,loading=0,dirty=true,azimuth=.7,elevation=.62,distance=13,target=new T.Vector3(),drag=null,lastPhase=-1;
  const cache=new Map(),labels=[];
  const manifestPromise=fetch('terrain/manifest.json').then(r=>{if(!r.ok)throw Error('Terrain manifest unavailable');return r.json();});
  function siteKey(id){return ({krakatau:'krakatau',winter:'pinatubo',eruption:'pinatubo',indian:'aceh',tsunami:'sanriku',island:'kilauea',ridge:'rift'})[id];}
  function sample(x,z){if(!site||!model.length)return 0;const n=site.size,c=clamp((x+10)/20)*(n-1),r=clamp((z+10)/20)*(n-1),i=Math.min(n-2,Math.floor(c)),j=Math.min(n-2,Math.floor(r)),u=c-i,v=r-j;return (model[j*n+i]*(1-u)+model[j*n+i+1]*u)*(1-v)+(model[(j+1)*n+i]*(1-u)+model[(j+1)*n+i+1]*u)*v;}
  function label(text,x,z){const el=document.createElement('div');el.className='regional-label';el.textContent=text;labelRoot.append(el);labels.push({el,x,z});}
  function setLabels(){labels.length=0;labelRoot.replaceChildren();if(active==='krakatau'){label('Rakata · surviving remnant',1.88,4.9);label('Danan · lost in 1883',1.1,2.8);label('Perboewatan',.6,1.2);label('Sertung',-3.1,-.5);}else if(['winter','eruption'].includes(active)){label('Pinatubo summit / caldera',0,0);label('Valleys carry pyroclastic flows',-3,4);}else if(active==='indian'){label('Indian Ocean',-4,-3);label('Western Aceh coast',1,1);}else if(active==='tsunami'){label('Pacific Ocean',5,0);label('Sanriku inlets',0,1);}else if(active==='island'){label('Hawaiʻi shield volcanoes',0,0);}else if(active==='ridge'){label('Þingvellir rift landscape',0,0);}}
  async function load(id){const token=++loading,key=siteKey(id);status.hidden=false;status.textContent='Loading terrain and satellite imagery…';try{
    const manifest=await manifestPromise;
    if(!cache.has(key)){const response=await fetch(manifest[key].file);if(!response.ok)throw Error('Terrain data unavailable');const values=new Int16Array(await response.arrayBuffer()),texture=await new T.TextureLoader().loadAsync('terrain/'+key+'.jpg');texture.encoding=T.sRGBEncoding;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();cache.set(key,{...manifest[key],values,texture});}
    if(token!==loading)return;site=cache.get(key);canvas.dataset.terrain=key;base=Array.from(site.values,h=>h/1000*20/site.extentKm*2.3);model=base.slice();
    if(terrainMesh){terrainRoot.remove(terrainMesh);terrainMesh.geometry.dispose();}
    const geo=new T.PlaneGeometry(20,20,site.size-1,site.size-1);geo.rotateX(-Math.PI/2);geo.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(base.length*3),3));geo.setAttribute('historical',new T.Float32BufferAttribute(new Float32Array(base.length),1));
    terrainMaterial.map=site.texture;terrainMaterial.needsUpdate=true;terrainMesh=new T.Mesh(geo,terrainMaterial);terrainMesh.castShadow=true;terrainMesh.receiveShadow=true;terrainRoot.add(terrainMesh);
    if(heightTexture)heightTexture.dispose();heightTexture=new T.DataTexture(new Uint8Array(site.size*site.size*4),site.size,site.size,T.RGBAFormat);heightTexture.magFilter=T.LinearFilter;heightTexture.minFilter=T.LinearFilter;heightTexture.flipY=false;waterU.heightMap.value=heightTexture;setLabels();lastPhase=-1;rebuild();focus();render();
  }catch(e){if(token===loading)status.textContent=e.message+'. Return to Planet view.';}}
  function rebuild(){if(!site||!terrainMesh)return;const n=site.size,pos=terrainMesh.geometry.attributes.position,col=terrainMesh.geometry.attributes.color,data=heightTexture.image.data;
    const collapse=smooth(.38,.72,progress),unit=20/site.extentKm,exag=2.3;
    for(let i=0;i<base.length;i++){const x=(i%n/(n-1)-.5)*20,z=(Math.floor(i/n)/(n-1)-.5)*20;let y=base[i];
      if(active==='krakatau'){
        // Remove modern Anak Krakatau from this explicitly pre-1927 reconstruction.
        const anak=Math.hypot(x+.1,z-.3);if(anak<1.35)y=Math.min(y,-.045);
        const peak=(cx,cz,h,r)=>h*exag*Math.exp(-Math.pow(Math.hypot(x-cx,z-cz)/r,1.6))-.075;
        const pre=Math.max(y,peak(1.88,4.9,.81,1.5),peak(1.1,2.8,.45,1.25),peak(.6,1.2,.16,.85));
        const pocket=Math.hypot((x-1.0)/1.8,(z-2.5)/2.45);const loss=(1-smooth(.7,1.08,pocket))*collapse;const post=Math.min(y,-.10);y=pre*(1-loss)+post*loss;
      }else if(['winter','eruption'].includes(active)){const r=Math.hypot(x,z);y+=.50*unit*exag*Math.exp(-r*r/.65)*(1-collapse);}
      else if(active==='island'){y=base[i]*(.35+.65*smooth(0,.85,progress))-.9*(1-smooth(0,.85,progress));}
      // Zero / shallow ocean DEM cells must stay below the animated water mesh.
      // Offshore depths are display-only, not reconstructed bathymetry.
      if(y<=0)y=Math.min(y,-.18);
      model[i]=y;pos.setY(i,y);const relief=Math.abs(base[Math.min(base.length-1,i+1)]-base[Math.max(0,i-1)]),grain=rand(i)*.035;
      let c=new T.Color();if(y<.01)c.setRGB(.09+grain,.08+grain,.06+grain);else if(relief>.09)c.setRGB(.065+grain,.061+grain,.049+grain);else c.setRGB(.014+grain*.35,.040+grain,.017+grain*.3);
      if(active==='island'&&y<.14)c.setRGB(.025+grain*.3,.022+grain*.3,.019+grain*.3);col.setXYZ(i,1,1,1);
      terrainMesh.geometry.attributes.historical.setX(i,['krakatau','winter','eruption'].includes(active)?smooth(.003,.04,y-base[i]):0);
      const enc=Math.round(clamp((y+8)/20)*65535);data[i*4]=enc>>8;data[i*4+1]=enc&255;data[i*4+2]=0;data[i*4+3]=255;
    }pos.needsUpdate=true;col.needsUpdate=true;terrainMesh.geometry.attributes.historical.needsUpdate=true;terrainMesh.geometry.computeVertexNormals();terrainMesh.geometry.computeBoundingSphere();heightTexture.needsUpdate=true;renderer.shadowMap.needsUpdate=true;dirty=false;
  }
  function focus(){if(!site)return;azimuth=active==='indian'?-1.1:active==='tsunami'?1.1:active==='krakatau'?1.25:.7;elevation=view==='close'?.33:.64;distance=view==='close'?6.8:14.5;
    if(active==='krakatau')target.set(1.0,.45,2.5);else if(active==='indian'||active==='tsunami')target.set(0,.1,0);else target.set(0,Math.max(.3,sample(0,0)),0);
    if(['winter','eruption'].includes(active)&&progress>.2&&progress<.6){target.y+=2;distance=view==='close'?11:17;elevation=.38;}if(innerWidth<821)distance*=1.25;render();}
  cameraButton.onclick=focus;
  function setView(next){view=next;const shown=next!=='planet';canvas.hidden=!shown;status.hidden=!shown;labelRoot.hidden=!shown;cameraButton.hidden=!shown;if(shown)focus();}
  function set(id,p,nextView){const changed=id!==active;active=id;progress=p;terrainUniforms.clock.value=p*40;const phase=Math.min(4,Math.floor(p*5));if(changed){site=null;terrainRoot.visible=false;volumes.forEach(m=>m.visible=false);groundCloud.visible=false;load(id);}else{terrainRoot.visible=!!site;if(['krakatau','island','winter','eruption'].includes(id))dirty=true;}
    if(nextView&&nextView!==view)setView(nextView);if(site&&dirty)rebuild();if(site&&phase!==lastPhase){lastPhase=phase;focus();}render();
  }
  function render(){if(view==='planet'||!site||!active)return;terrainRoot.visible=true;status.hidden=false;
    const historic=active==='krakatau'?'Interpreted 1883 island · surviving islands use modern terrain':active==='winter'||active==='eruption'?'Pinatubo terrain · interpreted pre-eruption summit':site.label+' · measured terrain';status.innerHTML=historic+' · relief ×2.3<br><a href="terrain/ATTRIBUTION.md" target="_blank" rel="noopener">USGS/NOAA terrain · EOxCloudless by EOX · Copernicus 2016 imagery</a>';
    camera.position.set(target.x+distance*Math.cos(elevation)*Math.sin(azimuth),target.y+distance*Math.sin(elevation),target.z+distance*Math.cos(elevation)*Math.cos(azimuth));camera.lookAt(target);camera.updateMatrixWorld();
    const volcanic=['krakatau','winter','eruption'].includes(active),s=smooth(.18,.30,progress)*(1-smooth(.58,.86,progress));terrainUniforms.ash.value=volcanic?smooth(.25,.65,progress)*.85:0;
    spreadingArrows.forEach((a,i)=>{a.visible=active==='ridge';const x=(i?1:-1)*(.45+progress*.8);a.position.set(x,sample(x,0)+.15,0);});
    lava.visible=active==='island'&&progress>.58;
    if(lava.visible){const length=smooth(.58,.94,progress)*3.4;for(let k=0;k<3;k++)for(let i=0;i<=80;i++){const t=i/80,x=3.8+t*length*(.25+k*.20)+Math.sin(t*11+k)*.025,z=3.6+t*length;for(let side=0;side<2;side++){const px=x+(side-.5)*.028;lavaPositions.set([px,sample(px,z)+.009,z],(k*162+i*2+side)*3);}}lavaGeometry.attributes.position.needsUpdate=true;}
    water.visible=['krakatau','indian','tsunami','island'].includes(active);waterU.clock.value=progress*45;waterU.wave.value=(active==='indian'||active==='tsunami')?smooth(.2,.5,progress)*.17:active==='krakatau'?smooth(.45,.6,progress)*.18:0;waterU.progress.value=active==='krakatau'?smooth(.42,.95,progress):progress;waterU.direction.value=active==='tsunami'?-1:1;waterU.circular.value=active==='krakatau'?1:0;waterU.origin.value.set(1,-2.5);
    const weather=active==='winter'?smooth(.4,.75,progress)*(1-smooth(.8,1,progress)):.15*s;waterU.weather.value=weather;sun.intensity=2.5*(1-weather*.70);hemi.intensity=.75*(1-weather*.42);scene.background.setRGB(.21*(1-weather*.55),.29*(1-weather*.55),.35*(1-weather*.55));scene.fog.color.copy(scene.background);
    const vents=active==='krakatau'?[[.6,1.2],[1.1,2.8]]:[[0,0]];
    for(let i=0;i<volumes.length;i++){const m=volumes[i];m.visible=volcanic&&i<vents.length&&s>.01;if(!m.visible)continue;const [x,z]=vents[i],h=sample(x,z),size=active==='krakatau'?5.5:7.3;m.scale.set(size,size,size);m.position.set(x,Math.max(0,h)+size*.50,z);m.material.uniforms.strength.value=s*(i?.8:1);m.material.uniforms.clock.value=progress*17+i*4;m.updateMatrixWorld();m.material.uniforms.eye.value.copy(camera.position);m.worldToLocal(m.material.uniforms.eye.value);}
    groundCloud.visible=volcanic&&progress>.32&&progress<.86;
    const spread=smooth(.3,.75,progress)*6;
    for(let i=0;i<240;i++){const a=i*2.399,r=(.12+rand(i)*.88)*spread,origin=active==='krakatau'?[1.1,2.8]:[0,0],x=origin[0]+Math.cos(a)*r,z=origin[1]+Math.sin(a)*r;puffP.set([x,Math.max(0,sample(x,z))+.06+rand(i+50)*.12,z],i*3);puffS[i]=.15+rand(i+1)*.55;puffA[i]=s*.55;}for(const name of ['position','size','alpha'])puffGeo.attributes[name].needsUpdate=true;
    const occupied=[];for(const l of labels){const pos=new T.Vector3(l.x,Math.max(0,sample(l.x,l.z))+.18,l.z).project(camera),x=(pos.x+1)/2*host.clientWidth;let y=(1-pos.y)/2*host.clientHeight;for(let tries=0;tries<3&&occupied.some(q=>Math.abs(q.x-x)<125&&Math.abs(q.y-y)<24);tries++)y-=26;l.el.style.left=x+'px';l.el.style.top=y+'px';l.el.hidden=pos.z>1||Math.abs(pos.x)>.95||Math.abs(pos.y)>.9;occupied.push({x,y});}
    renderer.render(scene,camera);
  }
  canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag)return;azimuth-=(e.clientX-drag[0])*.006;elevation=Math.max(.12,Math.min(1.25,elevation+(e.clientY-drag[1])*.004));drag=[e.clientX,e.clientY];render();});for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,()=>drag=null);canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(3,Math.min(27,distance*(1+Math.sign(e.deltaY)*.07)));render();},{passive:false});
  new ResizeObserver(()=>{renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();puffU.pixel.value=host.clientHeight;render();}).observe(host);
  function exit(){++loading;active=null;view='planet';canvas.hidden=true;labelRoot.hidden=true;status.hidden=true;cameraButton.hidden=true;}
  exit();return {set,setView,exit,ready:()=>!!site};
}
