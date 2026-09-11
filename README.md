# Tectonic Earth

Year 8 Science simulator: plate tectonics, mantle convection, and the supercontinent cycle.

Live: https://irvincisneros-png.github.io/tectonic-earth/

- **Surface view**: 3D globe with drag/zoom. Seven continents drift along keyframed paths from 400 Ma (Gondwana + Laurussia) through Pangaea (~250 Ma), breakup, today, to a Pangaea Proxima style supercontinent at +250 Ma.
- **Timeline slider / Play**: scrub or animate through geological time.
- **Real plate map (today ±20 Ma)**: the 52 plates and classified boundaries of Bird (2003, PB2002) — ridges (orange), subduction/collision (blue), transforms (yellow) — with plate labels and hover names. Zoom in (scroll) to inspect e.g. the India–Eurasia collision; click a boundary for an animated cross-section and relative speed.
- **Deep time**: continents are real Natural Earth coastlines rotated rigidly about Euler poles (Bullard-style Atlantic fits, Africa held as reference); away from today, simplified boundary markers are derived from relative continent motion.
- **Cutaway view**: Earth sliced open showing crust, mantle, outer and inner core with animated convection cells (hot rising = orange, cool sinking = blue).
- **Mantle heat slider**: scales convection speed and plate speed so students can test the cause-and-effect link.
- **Check your understanding**: four prompts in the side panel.

Static site (`index.html`, `disasters.html`, `events.js`, `visual-effects.js`, `events.css`), Three.js r128 from cdnjs, no build step. Continent shapes and paths are simplified for teaching, not geologically exact.

## Two pages

- **Tectonics:** the original globe, plate controls and four Earth processes: Ring of Fire, volcanism, island growth and new ocean crust.
- **[Disaster Lab](https://irvincisneros-png.github.io/tectonic-earth/disasters.html):** 2004 Indian Ocean, 2011 Tōhoku, 1883 Krakatau, Chicxulub, volcanic winter and the ice-age cycle.

Page navigation is above the scenario cards. `disasters.html` embeds the shared app with `?lab=disasters`, avoiding a second copy of the large globe dataset. The Disaster Lab hides the unrelated plate-control panels and starts with the Indian Ocean scenario. Historical cases use NOAA and Smithsonian sources linked in the interface. Tsunami fronts on the globe are schematic crests/troughs, masked by the land geometry, not calculated arrival-time maps.

### Detailed graphics

`visual-effects.js` adds a reusable 3D surface study for eruptions, island growth, ocean ridges and tsunamis. Drag to orbit and scroll to zoom; **Planet view** returns to global context. The surface scenes use procedural eroded terrain, textured basalt, calderas, emissive lava channels, soft ash particles, ejecta, and displaced water with crest foam. They are illustrative terrain studies, not surveyed reconstructions.

Global effects include a four-layer turbulent atmospheric veil, a soft impact flash and asteroid trail, atmospheric limb glow, and glacial coverage shaded directly on the existing land meshes. Ice no longer appears as floating oval disks over the ocean. The original explanatory diagrams are retained in **Explore the process diagram**.

All graphics are procedural code or the existing Earth textures. No AI images, new external media, or extra graphics libraries are used. Effects are deterministic with timeline scrubbing. The surface renderer is reused across scenarios and caps pixel density for performance.

## Earth events

Eight interactive teaching sequences extend the globe:

- **Ring of Fire:** selected real volcanic locations, schematic arcs and a tour of the Pacific margins.
- **Volcano eruption:** subduction, water-assisted mantle melting, magma ascent, ash dispersal and new rock.
- **Build an island:** submarine volcano growth, emergence and a hotspot island chain.
- **New ocean crust:** decompression melting and seafloor spreading, with an animated close-up.
- **Chicxulub impact:** asteroid approach, ejecta, a spreading global dust/aerosol veil, impact winter and clearing. A visibility control reveals the globe beneath the veil.
- **Ice-age cycle:** regional schematic ice sheets advance and retreat while sea level falls to approximately −120 m and returns.
- **Volcanic winter:** hypothetical explosive eruption and a temporary stratospheric sulfate aerosol veil.
- **Megathrust tsunami:** seafloor displacement, deep-water propagation and shallow-water amplification in a coastal cross-section.

Select a scenario, press **Run event**, or scrub its timeline. Playback speed, pause and restart are available. **Back to plates** restores the prior globe time, view, sea level and overlays. **Reset everything** also exits the event.

These are deterministic, explanatory animations, not numerical climate or hazard models. Each scenario identifies compressed timescales, exaggerated dimensions and the use of modern geography. Source links to USGS, NASA, NOAA and Senel et al. (2023, DOI: 10.1038/s41561-023-01290-4) are available in its **Science & sources** section. The atmospheric veil represents different materials in the impact and volcanic scenarios; ice-age forcing is a separate process.

Run locally with `python3 -m http.server 8765`, then open `http://localhost:8765`. No compilation is needed. Check JavaScript syntax with `node --check events.js`.

## Imagery
`tex/earth.jpg` is NASA Blue Marble (Visible Earth, world.topo.bathy 2004-12, public domain), resized to 4096×2048. `tex/earth_normal.jpg` is the Earth normal map from the three.js examples. Continents are textured with their present-day imagery and carry it with them through time; a **Satellite imagery** toggle switches back to flat colours.

## Sea level & Zealandia
- **Zealandia** is drawn as a translucent submerged-continent patch (hand-traced outline of the Lord Howe Rise, Norfolk Ridge, Chatham Rise and Campbell Plateau) that moves with the Australian block.
- **Sea level slider** (−130 to +250 m, Today only): rises flood land using `tex/elev.png` (NASA GEBCO_08 land elevation, ~25 m per grey level, 4096×2048); falls expose the continental shelf using the Natural Earth 10 m 200 m-bathymetry polygons (the ice-age shoreline was nearer 120 m, so the shelf is slightly generous). Presets: ice age −120 m, Greenland +7 m, all ice +70 m, Cretaceous hothouse +200 m, with climate-change context text.
