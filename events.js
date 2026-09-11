/* Earth events: deterministic, illustrative teaching sequences, not hazard forecasts.
   Uses the existing globe, camera, sea-level tool and render loop. */
(() => {
  'use strict';
  const sources = {
    plates: ['USGS · Plate motion and new land', 'https://pubs.usgs.gov/gip/dynamic/understanding.html'],
    ring: ['USGS · The Ring of Fire', 'https://pubs.usgs.gov/gip/dynamic/fire.html'],
    hot: ['USGS · Hotspots and volcanoes', 'https://pubs.usgs.gov/gip/volc/tectonics.html'],
    impact: ['Senel et al. (2023) · Chicxulub impact winter', 'https://doi.org/10.1038/s41561-023-01290-4'],
    ice: ['NASA · Orbital cycles and ice ages', 'https://science.nasa.gov/science-research/earth-science/milankovitch-orbital-cycles-and-their-role-in-earths-climate/'],
    winter: ['USGS · Volcanoes can affect climate', 'https://www.usgs.gov/programs/VHP/volcanoes-can-affect-climate'],
    tsunami: ['NOAA · How tsunamis work', 'https://tsunami.noaa.gov/tsunami-story'],
    indian: ['NOAA · 2004 Indian Ocean tsunami', 'https://nctr.pmel.noaa.gov/indo_1204.html'],
    tohoku: ['NOAA · 2011 Tōhoku earthquake and tsunami', 'https://www.ncei.noaa.gov/news/day-2011-japan-earthquake-and-tsunami'],
    krakatau: ['Smithsonian · Krakatau eruption history', 'https://volcano.si.edu/volcano.cfm?vn=262000'],
    pinatubo: ['USGS · Pinatubo, 1991', 'https://pubs.usgs.gov/fs/1997/fs113-97/'],
    terrain: ['Terrain data, attribution & reconstruction notes', 'terrain/ATTRIBUTION.md']
  };
  const scenarios = {
    ring: {title:'Ring of Fire',sub:'Explore the Pacific rim',lat:15,lon:175,refs:['ring','plates'],times:['Pacific overview','American margin','Aleutian arc','Japan & Philippines','Tonga & New Zealand'],phases:['A belt, not a single volcano','Ocean plate descends','An island arc curves around a trench','Water helps mantle rock melt','Many plates, connected processes'],copy:[
      'Orange markers locate selected volcanoes around the Pacific. The highlighted arcs follow the broad volcanic belt, not an exact boundary map. The centre of the Pacific is mostly outside this belt.',
      'Along the Andes and Cascades, oceanic lithosphere descends beneath another plate. Water released from the slab helps the overlying mantle melt; buoyant magma rises.',
      'Subduction beneath the Aleutians builds an arc of volcanic islands. Deep earthquakes trace the descending slab, while volcanoes form on the overriding plate.',
      'Japan and the Philippines sit among several interacting plates. Explosive eruptions can occur where gas-rich magma reaches the surface.',
      'The belt continues through Tonga and New Zealand. Transform boundaries also occur around the Pacific; they do not automatically produce volcanoes.'],note:'Markers are selected examples, not live eruption reports. The orange belt is schematic; volcano size is exaggerated.',metric:['Main driver','Subduction','Magma source','Mantle wedge']},
    eruption: {title:'Volcano eruption',sub:'Magma → ash & lava',lat:15.13,lon:120.35,refs:['plates','winter'],times:['Before eruption','Magma rises','Eruption begins','Ash disperses','Lava cools'],phases:['Pressure builds','Gas expands','Ash column and lava','Heavy ash falls first','New rock remains'],copy:[
      'Magma collects below a volcano. This example shows a subduction setting, where water from a descending slab helps the mantle above it melt.',
      'As magma rises, pressure falls and dissolved gases form expanding bubbles. Sticky, gas-rich magma can fragment explosively.',
      'Ash, rock fragments and gas rise in an eruption column. Lava is molten rock at the surface; ash is fragmented rock, not smoke.',
      'Coarse ash settles nearer the volcano. Fine ash travels farther downwind. Hot flows near the vent are a separate hazard from the high ash cloud.',
      'Lava solidifies and adds rock to the landscape. Erosion and later eruptions continue to reshape the volcano.'],note:'A generic eruption at a Philippine volcano location, not a reconstruction of a particular eruption. Durations and dimensions are compressed.',metric:['Setting','Subduction arc','New material','Igneous rock']},
    island: {title:'Build an island',sub:'Seafloor → new land',lat:19.4,lon:-155.3,refs:['hot','plates'],times:['Submarine vent','Seamount grows','Near sea level','Island emerges','Older island drifts'],phases:['A hotspot beneath a plate','Lava piles up underwater','A volcanic mountain grows','New land breaks the surface','An island chain develops'],copy:[
      'Hot mantle rises beneath an oceanic plate. Partial melting supplies magma to a volcano on the seafloor, away from a plate boundary.',
      'Repeated eruptions build a seamount. Most of the growing volcano is still hidden beneath the ocean.',
      'Successive lava flows build the summit towards sea level. This is new volcanic rock, rather than old land exposed by a falling sea.',
      'The summit emerges as an island. Lava can extend its coastline, while waves and landslides remove material.',
      'Plate motion carries the older volcano away from the hotspot. A younger volcano develops over the source; older islands erode and subside.'],note:'Hawaiʻi-inspired process model over hundreds of thousands to millions of years. Island sizes, spacing and growth are exaggerated.',metric:['Source','Hotspot','Timescale','~0.1–10 Ma']},
    ridge: {title:'New ocean crust',sub:'Rifting & seafloor spreading',lat:64,lon:-19,refs:['plates'],times:['Plates diverge','Mantle rises','Partial melting','Basalt cools','Crust moves outward'],phases:['Pulling apart','Pressure decreases','Magma fills the gap','A new strip of crust','An ocean basin widens'],copy:[
      'At a mid-ocean ridge, two plates move apart. Most ridges lie deep underwater; Iceland is an unusual exposed section with extra magma supply.',
      'Hot, mostly solid mantle rises into the space. Its pressure drops as it rises, allowing some rock to melt.',
      'Magma rises through cracks at the ridge. This is decompression melting, unlike the water-assisted melting above a subducting slab.',
      'Magma cools into basaltic oceanic crust. The youngest crust lies at the ridge axis.',
      'New crust moves away on both sides, cools and becomes denser. Most stays underwater; making crust does not necessarily make dry land.'],note:'Cross-section illustrates the process, not measured spreading at Iceland. Motion represents millions of years.',metric:['Boundary','Divergent','Youngest crust','At the ridge']},
    impact: {title:'Chicxulub impact',sub:'66 Ma · impact winter',lat:21.4,lon:-89.5,refs:['impact'],times:['Seconds before','Impact · minutes','Days to weeks','Months to ~2 years','Years to decades'],phases:['An asteroid approaches','Impact and ejecta','Debris spreads around Earth','Darkness and impact winter','Atmosphere gradually clears'],copy:[
      'About 66 million years ago, an asteroid roughly 10 km across struck near today’s Yucatán Peninsula. The asteroid is enlarged here so its approach is visible.',
      'The collision excavates rock and launches ejecta high above the surface. Extreme local heating and a huge tsunami accompany the impact.',
      'Fine silicate dust, sulfate aerosols and soot disperse through the atmosphere. Watch a patchy plume expand into a planet-wide veil; coarse debris settles sooner.',
      'Less sunlight reaches the surface. Photosynthesis is severely disrupted and Earth cools, damaging food webs. The 2023 dust model found photosynthesis could be suppressed for almost two years.',
      'Particles settle and sunlight returns over years. Ecosystem recovery takes much longer. The impact contributed to the extinction of non-avian dinosaurs and many other groups; birds survived.'],note:'Illustrative sequence, not a climate solver. Modern coastlines locate the impact; they are not a 66 Ma reconstruction. Veil thickness and particles are enlarged. Darkness and recovery vary among scientific models.',metric:['Asteroid diameter','~10 km','Impact age','~66 Ma']},
    ice: {title:'Ice-age cycle',sub:'Ice sheets & land bridges',lat:63,lon:-45,refs:['ice'],times:['Before advance','Thousands of years','Glacial maximum','Deglaciation','Interglacial'],phases:['Cool summers favour snow survival','Ice sheets spread','Water stored on land','Ice retreats; seas rise','A warmer interval'],copy:[
      'Changes in orbit and tilt alter the distribution of sunlight. Cool northern summers can let winter snow survive. Greenhouse gases and ice reflectivity amplify the response.',
      'Snow compacts into ice and ice sheets grow across northern North America and Eurasia over many thousands of years.',
      'Around the last glacial maximum, roughly 20,000 years ago, global sea level was about 120 m lower. Exposed shelves formed land bridges. Tropical oceans did not freeze solid.',
      'Changing seasonal sunlight, greenhouse gases and feedbacks favour melting. Water returns to the oceans, submerging many land bridges.',
      'Northern ice sheets have retreated, but Greenland and Antarctica still hold ice. This is a simplified past glacial cycle, not a forecast of the next one.'],note:'Ice outlines are schematic, not mapped ice margins. Modern coastlines are used. The existing shelf model uses the 200 m contour, so exposed land is approximate.',metric:['Peak sea level','~−120 m','Cycle scale','~100,000 yr']},
    winter: {title:'Volcanic winter',sub:'A major explosive eruption',lat:-2.6,lon:98.8,refs:['winter'],times:['Before eruption','Hours to days','Weeks to months','Months to years','Recovery'],phases:['A large magma reservoir','An explosive eruption','Sulfur reaches the stratosphere','An aerosol veil reflects sunlight','Particles settle out'],copy:[
      'Explore a hypothetical large explosive eruption at the Toba region. This is not a prediction or a reconstruction of Toba’s past climate effects.',
      'Ash and sulfur dioxide are injected high into the atmosphere. The local eruption is destructive, but eruption size alone does not determine global cooling.',
      'Sulfur dioxide forms sulfate aerosols. These tiny droplets can spread widely through the stratosphere; coarse ash usually falls out much sooner.',
      'Sulfate aerosols reflect some incoming sunlight and cool the surface temporarily. This is different from long-term orbital ice-age cycles.',
      'Aerosols are removed and their cooling effect fades. Outcomes depend on sulfur injection, altitude, latitude and the state of the climate.'],note:'Hypothetical process model. Global cooling is caused mainly by sulfate aerosols, not a permanent blanket of ash. No temperature or casualty forecast is implied.',metric:['Long-lived veil','Sulfate aerosol','Climate effect','Temporary cooling']},
    tsunami: {title:'Megathrust tsunami',sub:'Seafloor shift → coastal waves',lat:38.3,lon:142.4,refs:['tsunami'],times:['Fault locked','Rupture · seconds','Minutes','Tens of minutes','Hours'],phases:['Strain accumulates','Seafloor shifts vertically','Waves cross deep water','Waves grow in shallow water','More waves can follow'],copy:[
      'At a locked subduction boundary, strain builds as plates continue to move. This generic scenario is located off Japan.',
      'Sudden fault slip lifts or drops part of the seafloor. The displaced water column starts a tsunami; not every earthquake produces one.',
      'Long waves travel rapidly across deep water with relatively small heights. The close-up exaggerates wave height so you can follow the motion.',
      'As water becomes shallower, the waves slow and can grow much taller, flooding the coast. Actual run-up depends strongly on local bathymetry and coastline shape.',
      'A tsunami is a series of waves, and the first is not always the largest. The diagram is a process explanation, not an inundation map.'],note:'Schematic coastal cross-section; wave height and time are exaggerated. It does not predict arrival times, safe areas or flooding.',metric:['Trigger','Seafloor uplift','Deep-water wave','Long, often low']}
  };
  Object.assign(scenarios.winter,{sub:'Pinatubo · 1991 aerosol cooling',lat:15.142,lon:120.35,refs:['pinatubo','winter','terrain'],metric:['Reference event','Pinatubo 1991','Climate agent','Sulfate aerosol'],copy:[
    'Mount Pinatubo rises within a rugged Philippine mountain range. The regional view uses measured terrain, with an interpreted summit before the 1991 eruption.',
    'The climactic eruption on 15 June 1991 sent ash and sulfur dioxide high into the atmosphere. Pyroclastic flows swept down the surrounding valleys.',
    'The summit collapsed into a caldera. Coarse ash fell out relatively quickly; sulfur dioxide formed tiny sulfate aerosols in the stratosphere.',
    'The aerosol layer spread widely and reflected sunlight. Planet view shows a thin haze, while the regional view dims to illustrate reduced sunlight. It is not an opaque shell of ash.',
    'As aerosols were removed, the temporary cooling weakened. The terrain remained changed. Atmospheric and landscape recovery operate on different timescales.'
  ],note:'Pinatubo-based teaching sequence. Measured modern terrain has an interpreted pre-eruption summit. Atmospheric thickness and terrain relief are exaggerated; haze and dimming are qualitative, not climate-model output.'});
  scenarios.eruption.refs.push('terrain');scenarios.eruption.note='Measured Pinatubo-region terrain with an interpreted summit. Generic eruption processes are compressed into a teaching sequence; this is not an exact reconstruction of every 1991 phase.';
  Object.assign(scenarios.tsunami,{title:'Tōhoku, Japan',sub:'2011 · earthquake & tsunami',refs:['tohoku','tsunami','terrain'],metric:['Date','11 Mar 2011','Magnitude','Mw 9.1']});
  scenarios.tsunami.copy[0]='On 11 March 2011, a magnitude 9.1 earthquake ruptured the subduction boundary off northeastern Honshu, Japan. Strain accumulated where the Pacific Plate descends beneath the overriding plate.';
  scenarios.tsunami.copy[4]='The tsunami devastated parts of northeastern Japan and was recorded across the Pacific. Later waves can remain dangerous. This study explains the mechanism, not measured inundation at a particular coast.';
  scenarios.indian={...scenarios.tsunami,effect:'tsunami',title:'Indian Ocean',sub:'2004 · Sumatra–Andaman',lat:3.295,lon:95.982,refs:['indian','tsunami'],metric:['Date','26 Dec 2004','Magnitude','Mw 9.1'],times:['Before rupture','Earthquake · minutes','Near-source coasts','Across the basin','Continuing waves'],phases:['A locked subduction boundary','A long fault ruptures','Water surges towards nearby coasts','The tsunami crosses the Indian Ocean','A basin-wide catastrophe'],copy:[
    'On 26 December 2004, a magnitude 9.1 earthquake began off northern Sumatra. The Indian Plate was descending beneath the overriding Burma plate along the Sunda subduction zone.',
    'Fault slip displaced the seafloor over a long region extending north towards the Andaman Islands. The displaced water generated a tsunami. The source was an extended fault, not just the epicentre dot.',
    'Nearby coasts, including Aceh in northern Sumatra, were struck quickly. The 3D coastal view illustrates shoaling: waves slow and can grow as they enter shallow water.',
    'Waves spread through the Indian Ocean, reaching Thailand, Sri Lanka, India and much farther west. Planet view shows a schematic spreading front; real waves refracted around islands and underwater terrain.',
    'The tsunami affected communities around the basin. Multiple waves arrived over hours. The scale of the disaster led to major improvements in Indian Ocean tsunami warning systems.'
  ],note:'Historical event, schematic animation. The coastal terrain is illustrative, not an Aceh reconstruction. Wave fronts do not calculate bathymetry, travel times or inundation. Switch between Planet view and 3D surface view.'};
  scenarios.krakatau={...scenarios.eruption,effect:'krakatau',title:'Krakatau',sub:'1883 · eruption & tsunami',lat:-6.102,lon:105.423,refs:['krakatau','tsunami'],metric:['Location','Sunda Strait','Event','1883 eruption'],times:['Volcanic island','Explosive activity','Caldera collapse','Tsunami generation','Changed landscape'],phases:['An island between Java and Sumatra','Ash and hot material erupt','Much of the volcano collapses','Water is displaced','A caldera remains'],copy:[
    'Krakatau stood in the Sunda Strait between Java and Sumatra. Its catastrophic 1883 eruption reshaped the volcanic island and surrounding seafloor.',
    'Powerful explosive activity produced ash and pyroclastic flows: fast-moving mixtures of hot gas and volcanic fragments. The ash column and hot material are distinct hazards.',
    'Collapse during the eruption destroyed much of the volcanic edifice and formed a caldera. The summit in this illustration subsides as the sequence advances.',
    'The eruption and collapse generated destructive tsunamis. Volcanic tsunamis have different sources from megathrust-earthquake tsunamis; the detailed contributions to the 1883 waves are complex.',
    'The eruption left a profoundly altered landscape. Anak Krakatau later grew inside the caldera, beginning in the twentieth century. It is not shown growing during this short eruption sequence.'
  ],note:'Historical event, schematic terrain and collapse. Ash, collapse and water displacement are illustrated; this is not a reconstruction of exact 1883 wave heights or topography.'};
  const disasterPage=new URLSearchParams(location.search).get('lab')==='disasters';
  for(const id of ['krakatau','indian','island','ridge'])if(!scenarios[id].refs.includes('terrain'))scenarios[id].refs.push('terrain');
  scenarios.krakatau.note='Interpreted pre-1883 Danan and Perboewatan cones collapse while Rakata survives. Adjacent islands use measured modern terrain; modern Anak Krakatau is excluded. Relief is exaggerated. This is not a surveyed historical DEM or tsunami forecast.';
  scenarios.indian.note='Measured western Aceh terrain; wave motion is schematic, not historical inundation. Planet, Region and Close-up views show context, coastline and local wave behaviour. Relief is exaggerated.';
  scenarios.tsunami.note='Measured Sanriku coastal terrain. Rias and headlands differ from the Aceh example. Waves illustrate processes, not measured 2011 inundation or arrival times.';
  scenarios.island.phases[4]='Multiple shields build an island';scenarios.island.times[4]='An island grows';scenarios.island.copy[4]='Hawaiʻi is built from several overlapping shield volcanoes. This view uses its modern shape to illustrate growth. Across the wider Hawaiian chain, plate motion carries older volcanoes away from the hotspot, where they erode and subside.';
  scenarios.island.note='Modern Hawaiʻi elevation and 2016 imagery illustrate shield-island growth, not an ancient reconstruction. Heights and growth are exaggerated. The wider Hawaiian island chain lies outside this regional view.';
  scenarios.ridge.note='Measured Þingvellir-region terrain and 2016 imagery provide Icelandic rift context. The orange arrows schematically illustrate divergence, not a surveyed fault-motion forecast. Open the process diagram for the spreading cross-section.';
  const disasterIds=['indian','tsunami','krakatau','impact','winter','ice'];
  const visibleScenarios=Object.entries(scenarios).filter(([id])=>disasterPage?disasterIds.includes(id):!disasterIds.includes(id));
  if(disasterPage){visibleScenarios.sort(([a],[b])=>disasterIds.indexOf(a)-disasterIds.indexOf(b));document.body.classList.add('disaster-lab');document.title='Disaster Lab · Tectonic Earth';$('hud').querySelector('h1').textContent='Disaster Lab';}
  const menu = document.createElement('section'); menu.id='events';
  menu.innerHTML=`<h2>Earth events</h2><p class="event-intro">Build new worlds. Explore the events that changed ours.</p><div class="event-menu">${Object.entries(scenarios).map(([id,s])=>`<button data-event="${id}" aria-pressed="false">${s.title}<span>${s.sub}</span></button>`).join('')}</div><div id="event-panel" hidden><h3 id="event-title"></h3><div class="event-actions"><button id="event-play">▶ Run event</button><button id="event-restart">↺ Restart</button><button id="event-exit">Back to plates</button><select id="event-speed" aria-label="Event playback speed"><option value="0.5">0.5× speed</option><option value="1" selected>1× speed</option><option value="2">2× speed</option></select></div><label class="slider" for="event-progress">Scrub through the event</label><input id="event-progress" type="range" min="0" max="100" step="0.1" value="0"><div class="event-clock"><b id="event-phase"></b><span id="event-time"></span></div><p id="event-copy"></p><div class="event-metrics" id="event-metrics"></div><label id="veil-control" class="slider" hidden>Inspect beneath the atmospheric veil<input id="veil-opacity" aria-label="Atmospheric veil visibility" type="range" min="0" max="100" value="100"></label><p class="event-note" id="event-note"></p><details id="event-sources"><summary>Science &amp; sources</summary><div></div></details></div>`;
  $('side').prepend(menu);
  menu.querySelector('h2').textContent=disasterPage?'Disasters & extremes':'Earth processes';
  menu.querySelector('.event-intro').textContent=disasterPage?'Explore what happened, how it spread, and why.':'Explore volcanism, plate boundaries and the formation of new land.';
  menu.querySelector('.event-menu').innerHTML=visibleScenarios.map(([id,s])=>`<button data-event="${id}" aria-pressed="false">${s.title}<span>${s.sub}</span></button>`).join('');
  menu.insertAdjacentHTML('afterbegin',`<nav class="lab-nav" aria-label="Simulation pages"><a href="index.html" target="_top" ${disasterPage?'':'aria-current="page"'}>Tectonics</a><a href="disasters.html" target="_top" ${disasterPage?'aria-current="page"':''}>Disaster Lab ↗</a></nav>`);
  if(disasterPage)$('event-exit').textContent='↺ Reset scene';
  stage.insertAdjacentHTML('beforeend','<div id="event-banner" hidden><strong></strong><span></span></div><div id="event-detail" hidden><div class="detail-heading"><b id="event-detail-title">PROCESS CLOSE-UP</b><span>Illustration · not to scale</span></div><canvas id="event-diagram" width="640" height="250" aria-label="Animated event process diagram" role="img"></canvas><div class="detail-foot" id="event-caption"></div></div>');
  const processDetails=document.createElement('details');processDetails.id='event-process-notes';processDetails.innerHTML='<summary>Explore the process diagram</summary>';$('event-copy').after(processDetails);processDetails.append($('event-detail'));
  new ResizeObserver(()=>resize()).observe(stage);
  const group=new THREE.Group();group.name='Earth events';globe.add(group);group.visible=false;
  let active=null,progress=0,running=false,saved=null,lastPhase=-1;
  const clamp=(v)=>Math.max(0,Math.min(1,v));
  const ramp=(p,a,b)=>clamp((p-a)/(b-a));
  const smooth=(p,a,b)=>{const x=ramp(p,a,b);return x*x*(3-2*x);};
  function mesh(geometry,color){return new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.85}));}
  function anchor(lat,lon){const g=new THREE.Group();g.position.copy(ll2v(lat,lon).multiplyScalar(1.012));g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),ll2v(lat,lon));return g;}
  // Selected real locations, deliberately not a live activity catalogue.
  const volcanoes=[['Villarrica',-39.4,-71.9],['Lascar',-23.4,-67.7],['Sabancaya',-15.8,-71.9],['Cotopaxi',-.7,-78.4],['Nevado del Ruiz',4.9,-75.3],['Fuego',14.5,-90.9],['Popocatépetl',19,-98.6],['Mount St Helens',46.2,-122.2],['Rainier',46.9,-121.8],['Redoubt',60.5,-152.7],['Shishaldin',54.8,-164],['Cleveland',52.8,-169.9],['Klyuchevskoy',56.1,160.6],['Alaid',50.9,155.6],['Asama',36.4,138.5],['Sakurajima',31.6,130.7],['Mayon',13.3,123.7],['Pinatubo',15.1,120.4],['Taal',14,121],['Rabaul',-4.3,152.2],['Yasur',-19.5,169.4],['Hunga Tonga',-20.5,-175.4],['Ruapehu',-39.3,175.6]];
  const ringGroup=new THREE.Group();group.add(ringGroup);
  const coneGeo=new THREE.ConeGeometry(.013,.034,10);
  volcanoes.forEach(([name,lat,lon])=>{const a=anchor(lat,lon),c=mesh(coneGeo,0xff8342);c.position.y=.012;a.add(c);a.userData.name=name;ringGroup.add(a);});
  cv.addEventListener('pointermove',e=>{if(active!=='ring'||drag)return;const rect=cv.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(ringGroup.children,true).find(h=>h.object.parent.userData.name&&h.point.dot(camera.position.clone().normalize())>0);if(hit){tip.textContent=hit.object.parent.userData.name;tip.style.display='block';tip.style.left=(e.clientX-rect.left+12)+'px';tip.style.top=(e.clientY-rect.top+10)+'px';}});
  const arcs=[volcanoes.slice(0,15),[volcanoes[14],volcanoes[15],volcanoes[16],volcanoes[17]],[volcanoes[19],volcanoes[20],volcanoes[21],volcanoes[22]]];
  arcs.forEach(arc=>{const pts=[];for(let i=0;i<arc.length-1;i++)for(let j=0;j<=16;j++)pts.push(slerp(ll2v(arc[i][1],arc[i][2]),ll2v(arc[i+1][1],arc[i+1][2]),j/16).multiplyScalar(1.014));ringGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xff793b,transparent:true,opacity:.8})));});
  const local=new THREE.Group();group.add(local);
  const volcano=mesh(new THREE.ConeGeometry(.045,.09,24),0x66524c);volcano.position.y=.024;local.add(volcano);
  const lava=mesh(new THREE.ConeGeometry(.024,.047,20),0xff6929);lava.material.emissive.setHex(0xff3a08);lava.position.y=.05;local.add(lava);
  const islandChain=[];for(let i=0;i<4;i++){const m=mesh(new THREE.ConeGeometry(.025,.04,16),0x698d55);local.add(m);islandChain.push(m);}
  const asteroid=mesh(new THREE.IcosahedronGeometry(.022,1),0xab8870);asteroid.material.emissive.setHex(0x592810);group.add(asteroid);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.055,24,16),new THREE.MeshBasicMaterial({color:0xffcb78,transparent:true,opacity:0,depthWrite:false}));group.add(glow);
  const dustUniforms={uProgress:{value:0},uOpacity:{value:1},uOrigin:{value:ll2v(21.4,-89.5)},uTint:{value:new THREE.Color(0xa89c89)}};
  const dust=new THREE.Mesh(new THREE.SphereGeometry(1.047,80,48),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:dustUniforms,vertexShader:'varying vec3 vDirection; void main(){vDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`varying vec3 vDirection;uniform float uProgress;uniform float uOpacity;uniform vec3 uOrigin;uniform vec3 uTint;
    float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    void main(){vec3 n=normalize(vDirection);float p=uProgress;float spread=smoothstep(.19,.53,p)*3.3;float angle=acos(clamp(dot(n,uOrigin),-1.,1.));float turbulence=noise(n*9.)*.6+noise(n*27.)*.3+noise(n*65.)*.1;float cover=1.-smoothstep(max(0.,spread-.45),spread+.05,angle+turbulence*.12);float build=smoothstep(.16,.29,p);float clear=1.-smoothstep(.70,1.,p);float light=.45+.55*max(0.,dot(n,normalize(vec3(5.,3.,4.))));gl_FragColor=vec4(uTint*light*(.72+turbulence*.4),cover*build*clear*(.89+.10*turbulence)*uOpacity);}` }));group.add(dust);
  // Ejecta paths are stable when scrubbing, with coarse material falling first.
  const particleCount=320,particlePositions=new Float32Array(particleCount*3);
  const particleGeometry=new THREE.BufferGeometry();particleGeometry.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
  const plume=new THREE.Points(particleGeometry,new THREE.PointsMaterial({color:0xcbbba8,size:.009,transparent:true,opacity:.8,depthWrite:false}));local.add(plume);
  const iceGroup=new THREE.Group();group.add(iceGroup);
  // Regional ice-sheet lobes avoid depicting tropical land or ocean as globally frozen.
  const icePatches=[];
  [[60,-100,23,20],[60,-70,10,14],[65,22,16,16],[74,-42,5,13],[-90,0,23,23]].forEach(([lat,lon,rx,ry],index)=>{
    const center=ll2v(lat,lon),b=basis(center),vertices=[],indices=[],rings=24,segments=96;
    for(let r=0;r<=rings;r++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,edge=1+.05*Math.sin(a*7)+.025*Math.cos(a*13),u=Math.cos(a)*rx*D2R*r/rings*edge,v=Math.sin(a)*ry*D2R*r/rings*edge;vertices.push(...center.clone().addScaledVector(b.east,u).addScaledVector(b.north,v).normalize().multiplyScalar(1.018).toArray());}
    for(let r=0;r<rings;r++)for(let i=0;i<segments;i++){const a=r*(segments+1)+i,c=a+segments+1;indices.push(a,c,a+1,a+1,c,c+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
    const colors=[];for(let i=0;i<vertices.length;i+=3){const shade=.73+.10*Math.sin(vertices[i]*93)*Math.cos(vertices[i+1]*87)+.06*Math.sin(vertices[i+2]*217);colors.push(shade,shade,shade);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const m=mesh(g,0xb0c7d5);m.material.vertexColors=true;m.material.side=THREE.DoubleSide;m.userData={base:Float32Array.from(vertices),center,index};iceGroup.add(m);icePatches.push(m);
  });
  const impactRing=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:96},(_,i)=>new THREE.Vector3(Math.cos(i/96*Math.PI*2),0,Math.sin(i/96*Math.PI*2)))),new THREE.LineBasicMaterial({color:0xffb46a,transparent:true,opacity:1}));local.add(impactRing);
  const ridgeGroup=new THREE.Group();local.add(ridgeGroup);
  for(let i=-5;i<=5;i++){const strip=mesh(new THREE.BoxGeometry(.012,.009,.022),i===0?0xff8e4b:0xb47c62);strip.position.set(i*.014,.009,0);ridgeGroup.add(strip);}
  const siteMarker=mesh(new THREE.SphereGeometry(.012,12,8),0x77dfff);siteMarker.material.emissive.setHex(0x225577);siteMarker.position.y=.02;local.add(siteMarker);
  const ambient=scene.children.find(o=>o.isAmbientLight);
  const fidelity=createTectonicFX({group,local,ringGroup,icePatches,legacy:{dust,plume,glow,impactRing,asteroid,volcano,lava,islandChain,ridgeGroup}});
  function setButton(){ $('event-play').textContent=running?'❚❚ Pause':'▶ Run event'; }
  function stop(){running=false;setButton();}
  function capture(){return {time,sea:seaLevel,theta:camTheta,phi:camPhi,dist:camDist,cut:cutaway,spin:autoSpin,toggles:['tBound','tArrows','tPlates','tLabels','tGrid'].map(id=>[id,$(id).classList.contains('on')])};}
  function enter(id){
    if(!saved)saved=capture();stop();active=id;progress=0;lastPhase=-1;
    playing=false;$('play').textContent='▶ Play';setTime(0);setSea(0);setCut(false);if(autoSpin)$('tSpin').click();
    ['tBound','tArrows','tPlates','tLabels','tGrid'].forEach(id=>{if($(id).classList.contains('on'))$(id).click();});
    const s=scenarios[id],v=ll2v(s.lat,s.lon);camTheta=Math.atan2(v.x,v.z);camPhi=Math.asin(v.y);camDist=innerWidth<=820?4.4:3.8;
    local.position.copy(v.clone().multiplyScalar(1.014));local.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v);
    dustUniforms.uOrigin.value.copy(v);dustUniforms.uTint.value.setHex(id==='winter'?0xc2c6bb:0xa89c89);
    $('event-panel').hidden=false;$('event-banner').hidden=false;$('event-detail').hidden=false;document.body.classList.add('event-active');group.visible=true;
    document.querySelectorAll('[data-event]').forEach(b=>{const on=b.dataset.event===id;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});
    $('event-title').textContent=s.title;$('event-banner').querySelector('strong').textContent=s.title;$('event-note').textContent=s.note;
    $('event-metrics').innerHTML=`<div>${s.metric[0]}<strong>${s.metric[1]}</strong></div><div>${s.metric[2]}<strong>${s.metric[3]}</strong></div>`;
    $('event-sources').querySelector('div').innerHTML=s.refs.map(k=>`<a href="${sources[k][1]}" target="_blank" rel="noopener">${sources[k][0]} ↗</a>`).join('');
    $('veil-control').hidden=!['impact','winter'].includes(id);$('veil-control').firstChild.textContent=id==='winter'?'Planet view: aerosol visibility':'Planet view: dust visibility';$('veil-opacity').value=100;
    update();
  }
  function exit(restore=true){
    if(!active)return;stop();active=null;fidelity.exit();group.visible=false;sun.intensity=1.1;if(ambient)ambient.intensity=.75;
    ['event-panel','event-banner','event-detail'].forEach(id=>$(id).hidden=true);document.body.classList.remove('event-active');
    document.querySelectorAll('[data-event]').forEach(b=>{b.classList.remove('on');b.setAttribute('aria-pressed','false');});
    const old=saved;saved=null;if(restore&&old){setTime(old.time);setSea(old.sea);setCut(old.cut);camTheta=old.theta;camPhi=old.phi;camDist=old.dist;old.toggles.forEach(([id,on])=>{if($(id).classList.contains('on')!==on)$(id).click();});if(autoSpin!==old.spin)$('tSpin').click();}
  }
  menu.querySelectorAll('[data-event]').forEach(b=>b.addEventListener('click',()=>enter(b.dataset.event)));
  $('event-play').onclick=()=>{if(progress>=1)progress=0;running=!running;setButton();update();};
  $('event-restart').onclick=()=>{stop();progress=0;update();};$('event-exit').onclick=()=>disasterPage?enter(active||'indian'):exit();
  $('event-progress').oninput=e=>{stop();progress=+e.target.value/100;update();};$('veil-opacity').oninput=()=>update();
  // Exit before the original controls run, so ordinary globe controls keep their meaning.
  ['reset','mCut','mSurface','time','today','pangaea','play','sea','sIce','sNow','sGr','sAll','sCret'].forEach(id=>$(id).addEventListener(id==='time'||id==='sea'?'input':'click',e=>{const input=e.target.value;exit();if(e.type==='input')e.target.value=input;},true));
  function update(){
    if(!active)return;const s=scenarios[active],p=progress,phase=Math.min(4,Math.floor(p*5));
    $('event-progress').value=p*100;
    if(phase!==lastPhase){lastPhase=phase;$('event-phase').textContent=s.phases[phase];$('event-time').textContent=s.times[phase];$('event-copy').textContent=s.copy[phase];$('event-banner').querySelector('span').textContent=s.phases[phase];$('event-diagram').setAttribute('aria-label',s.phases[phase]+'. '+s.copy[phase]);if(active==='ring'){const views=[[15,175],[10,-100],[52,-170],[24,133],[-22,175]],v=ll2v(...views[phase]);camTheta=Math.atan2(v.x,v.z);camPhi=Math.asin(v.y);}}
    ringGroup.visible=active==='ring';local.visible=['eruption','island','ridge','impact','winter','tsunami'].includes(active);
    ridgeGroup.visible=active==='ridge';ridgeGroup.children.forEach((m,i)=>{m.position.x=(i-5)*(.004+.012*p);});siteMarker.visible=active==='tsunami';siteMarker.scale.setScalar(1+.6*Math.sin(p*Math.PI*8));
    const volcanic=['eruption','winter','island'].includes(active);volcano.visible=volcanic;lava.visible=volcanic;
    const growth=active==='island'?.15+.85*smooth(p,0,.8):1;volcano.scale.setScalar(growth);lava.scale.setScalar(growth*(1-.7*smooth(p,.7,1)));volcano.position.y=active==='island'?-.065+.10*smooth(p,0,1)-.045*growth:.024;lava.position.y=active==='island'?volcano.position.y+.024*growth:.05;
    islandChain.forEach((m,i)=>{m.visible=active==='island'&&p>.68+i*.075;m.position.set(-.045*(i+1),-.005,-.02*(i+1));});
    const atmospheric=['impact','winter'].includes(active);dust.visible=atmospheric;dustUniforms.uProgress.value=p;dustUniforms.uOpacity.value=+$('veil-opacity').value/100*(active==='winter'?.55:1);
    const veil=smooth(p,.2,.5)*(1-smooth(p,.7,1));sun.intensity=1.1*(1-(active==='impact'?.82:active==='winter'?.2:0)*veil);if(ambient)ambient.intensity=.75*(1-(active==='impact'?.75:active==='winter'?.15:0)*veil);
    asteroid.visible=active==='impact'&&p<.2;
    const origin=ll2v(s.lat,s.lon),tangent=basis(origin).east;asteroid.position.copy(origin.clone().multiplyScalar(1.02+Math.max(0,1-p/.2)*1.1).addScaledVector(tangent,Math.max(0,1-p/.2)*.55));
    glow.visible=active==='impact'&&p>=.2&&p<.32;glow.position.copy(origin.clone().multiplyScalar(1.04));glow.scale.setScalar(1+7*ramp(p,.2,.32));glow.material.opacity=.75*(1-ramp(p,.2,.32));
    plume.visible=['eruption','winter','impact'].includes(active)&&p>.2&&p<.65;
    for(let i=0;i<particleCount;i++){const seed=((i*73)%317)/317,angle=i*2.39996,u=ramp(p,.2,.65),life=clamp(u*(1.2+seed*.6));const width=(active==='impact'?.5:.13)*life;particlePositions[i*3]=Math.cos(angle)*width*Math.sqrt(seed);particlePositions[i*3+1]=.04+Math.sin(life*Math.PI)*(.12+seed*.22);particlePositions[i*3+2]=Math.sin(angle)*width*Math.sqrt(seed);}
    particleGeometry.attributes.position.needsUpdate=true;plume.material.opacity=.85*(1-smooth(p,.45,.65));
    impactRing.visible=active==='impact'&&p>.2&&p<.45;impactRing.position.y=.016;impactRing.scale.setScalar(.01+.4*ramp(p,.2,.45));impactRing.material.opacity=1-ramp(p,.2,.45);
    iceGroup.visible=active==='ice';if(active==='ice'){
      const ice=smooth(p,0,.45)*(1-smooth(p,.55,1));const sea=-Math.round(120*ice);if(seaLevel!==sea)setSea(sea);
      icePatches.forEach(m=>{const {base,center,index}=m.userData;const scale=index>=3?.8+.2*ice:.03+.97*ice;const arr=m.geometry.attributes.position.array;for(let i=0;i<base.length;i+=3){_v.fromArray(base,i).normalize().sub(center).multiplyScalar(scale).add(center).normalize().multiplyScalar(1.018).toArray(arr,i);}m.geometry.attributes.position.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();m.visible=index>=3||ice>.03;});
    }
    drawDiagram(p,phase);
    fidelity.update(s.effect||active,p,+$('veil-opacity').value/100,{scenario:active});
  }
  const ctx=$('event-diagram').getContext('2d');
  function text(str,x,y,color='#d4e4f4',size=15){ctx.fillStyle=color;ctx.font=`${size}px system-ui`;ctx.fillText(str,x,y);}
  function poly(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
  function arrow(x,y,dx,dy,color='#ffbf77'){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();const a=Math.atan2(dy,dx);poly([[x+dx,y+dy],[x+dx-10*Math.cos(a-.5),y+dy-10*Math.sin(a-.5)],[x+dx-10*Math.cos(a+.5),y+dy-10*Math.sin(a+.5)]],color);}
  function cloud(x,y,r,alpha=1){ctx.fillStyle=`rgba(172,164,151,${alpha})`;for(let i=0;i<8;i++){ctx.beginPath();ctx.ellipse(x+(i-3.5)*r*.38,y+Math.sin(i*2)*r*.17,r*.45,r*.32,0,0,7);ctx.fill();}}
  function drawDiagram(p,phase){
    ctx.clearRect(0,0,640,250);const bg=ctx.createLinearGradient(0,0,0,250);bg.addColorStop(0,'#101c30');bg.addColorStop(1,'#20394d');ctx.fillStyle=bg;ctx.fillRect(0,0,640,250);
    let caption='';
    const effect=scenarios[active].effect||active;
    if(['ring','eruption','krakatau'].includes(effect)){
      poly([[0,145],[640,145],[640,250],[0,250]],'#793e31');poly([[0,130],[210,130],[410,220],[400,238],[202,151],[0,151]],'#677d93');poly([[230,136],[380,136],[455,75],[523,136],[640,136],[640,162],[260,162]],'#8e7965');
      arrow(110,122,56,0,'#7fcaff');arrow(333,155,52,25,'#7fcaff');arrow(434,180,12,-54);poly([[441,162],[450,92],[458,162]],'#ff8241');text('Oceanic plate',24,109);text('Mantle wedge',300,224);text('Magma rises',468,198);text('Volcanic arc',457,58);arrow(260,193,30,-28,'#9eddff');text('Water released',76,219,'#9eddff',14);
      if(['eruption','krakatau'].includes(effect)&&p>.25&&p<.85){cloud(452,45,25+35*smooth(p,.25,.7),.8);for(let i=0;i<16;i++){const x=456+i*9;ctx.fillStyle='#c5b9a6';ctx.fillRect(x,65+((i*17+p*100)%52),3,3);}}
      caption='Water from the descending slab helps the mantle above it melt.';
    } else if(active==='island'){
      ctx.fillStyle='#155078';ctx.fillRect(0,96,640,110);ctx.fillStyle='#5c4a42';ctx.fillRect(0,207,640,43);
      const h=30+150*smooth(p,0,.85);poly([[195,207],[328,207-h],[465,207]],'#85715a');poly([[313,207],[328,207-h],[340,207]],'#ff8746');
      arrow(328,243,0,-37);arrow(240,224,-70,0,'#98d6ff');text('Plate motion',91,241,'#98d6ff',14);text('Hotspot',355,238,'#ffbd85');text('Sea level',18,87,'#9fdbff');ctx.strokeStyle='#8ed6ff';ctx.beginPath();ctx.moveTo(0,96);ctx.lineTo(640,96);ctx.stroke();
      if(p>.75)poly([[50,207],[125,95],[220,207]],'#5c7562');text(h>111?'New island':'Growing seamount',367,63);caption='Repeated lava flows build a mountain from the seafloor upwards.';
    } else if(active==='ridge'){
      ctx.fillStyle='#124e72';ctx.fillRect(0,55,640,90);poly([[0,153],[280,125],[307,153],[307,190],[0,190]],'#708393');poly([[333,153],[360,125],[640,153],[640,190],[333,190]],'#708393');ctx.fillStyle='#a04d32';ctx.fillRect(0,190,640,60);poly([[305,220],[318,147],[325,147],[337,220]],'#ff9750');
      const spread=20+100*p;ctx.fillStyle='#d49977';ctx.fillRect(310-spread,166,spread-3,15);ctx.fillRect(333,166,spread-3,15);arrow(280,108,-85,0,'#9bd7ff');arrow(360,108,85,0,'#9bd7ff');arrow(320,242,0,-35);text('Youngest basalt',257,81);text('Older crust',27,143);text('Older crust',492,143);text('Rising mantle · lower pressure → partial melting',65,232,'#ffd0a1',15);caption='Crust forms at the ridge, then moves outward on both plates.';
    } else if(['impact','winter'].includes(active)){
      const veil=smooth(p,.2,.48)*(1-smooth(p,.7,1));ctx.fillStyle='#304b40';ctx.fillRect(0,202,640,48);ctx.fillStyle='#789058';ctx.fillRect(0,200,640,6);
      ctx.fillStyle='#ffe6a0';ctx.beginPath();ctx.arc(64,40,19,0,7);ctx.fill();for(let i=0;i<4;i++)arrow(50+i*26,67,25,55,'#ffe6a0');
      if(veil>.01){cloud(330,86,177,veil*.9);ctx.fillStyle=`rgba(0,0,0,${veil*.7})`;ctx.fillRect(0,128,640,72);}
      if(active==='impact'&&p<.2){ctx.fillStyle='#ffb770';ctx.beginPath();ctx.arc(460-120*p/.2,35+155*p/.2,8,0,7);ctx.fill();arrow(495-120*p/.2,8+155*p/.2,-27,24);}
      if(active==='winter')poly([[240,201],[310,137],[384,201]],'#81736c');
      for(let i=0;i<6;i++){const x=50+i*99;ctx.fillStyle=veil>.5?'#4e5946':'#81a96b';ctx.fillRect(x,179,4,22);ctx.beginPath();ctx.ellipse(x+2,176,13,8,0,0,7);ctx.fill();}
      text(active==='impact'?'Dust + sulfate aerosols + soot':'Main climate agent: sulfate aerosols',159,31,'#e5ddd2',15);text(veil>.65?'Less light reaches plants and the ocean':'Sunlight reaches the surface',155,155,'#e1d8bb',16);
      caption=active==='impact'?'Global veil is enlarged for visibility. Use the visibility slider to look beneath it.':'Ash settles sooner; stratospheric sulfate aerosols prolong the cooling.';
    } else if(active==='ice'){
      const amount=smooth(p,0,.45)*(1-smooth(p,.55,1));ctx.fillStyle='#184d72';ctx.fillRect(0,137+amount*43,640,113);poly([[0,174],[140,149],[250,188],[440,168],[560,141],[640,156],[640,250],[0,250]],'#80765c');
      poly([[0,174],[0,126-amount*74],[60+amount*90,134-amount*35],[110+amount*130,163],[140,173]],'#d8effb');ctx.fillStyle='#184d72';ctx.fillRect(245,180+amount*35,180,70);
      text('Ice sheet',30,46,'#d6f3ff');text(`Sea level: ${-Math.round(amount*120)} m`,392,72,'#a9ddff');text(amount>.6?'Exposed shelf / land bridge':'Shelf beneath the sea',243,236,'#e4d3b6');arrow(143,106,amount*95,25,'#daefff');caption='Ice stored on land lowers the ocean; melting reverses the process.';
    } else if(effect==='tsunami'){
      poly([[0,194],[350,194],[500,163],[575,111],[640,105],[640,250],[0,250]],'#766e60');
      ctx.beginPath();ctx.moveTo(0,130);for(let x=0;x<=620;x+=2){const centre=80+p*510,amp=p>.55?12+30*ramp(p,.55,1):9;const y=130-Math.sin((x-centre)/24)*Math.exp(-Math.pow((x-centre)/100,2))*amp;ctx.lineTo(x,y);}ctx.lineTo(620,230);ctx.lineTo(0,230);ctx.closePath();ctx.fillStyle='rgba(46,148,199,.65)';ctx.fill();
      if(p<.35)arrow(99,223,0,-32*ramp(p,.05,.3),'#ffb57a');text('Deep ocean',30,42);text('Shallow coast',440,42);arrow(213,80,90,0,'#94deff');text('Wave slows and grows',373,83,'#afe4ff',15);text('Seafloor displacement',22,245,'#f3c398',14);caption='Exaggerated wave height. Local seafloor shape controls real tsunami behaviour.';
    }
    $('event-caption').textContent=caption;
  }
  // Reuse the existing animation loop so scene changes are rendered in the same frame.
  const originalFrame=frame;let eventLast=performance.now();
  frame=function(now){const dt=Math.min(.05,(now-eventLast)/1000);eventLast=now;if(active&&running&&!document.hidden){progress=Math.min(1,progress+dt/36*+$('event-speed').value);if(progress===1)stop();update();}originalFrame(now);};
  if(disasterPage)enter('indian');
})();
