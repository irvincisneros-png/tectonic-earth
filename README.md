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

Single file (`index.html`), Three.js r128 from cdnjs, no build step. Continent shapes and paths are simplified for teaching, not geologically exact.

## Imagery
`tex/earth.jpg` is NASA Blue Marble (Visible Earth, world.topo.bathy 2004-12, public domain), resized to 4096×2048. `tex/earth_normal.jpg` is the Earth normal map from the three.js examples. Continents are textured with their present-day imagery and carry it with them through time; a **Satellite imagery** toggle switches back to flat colours.

## Sea level & Zealandia
- **Zealandia** is drawn as a translucent submerged-continent patch (hand-traced outline of the Lord Howe Rise, Norfolk Ridge, Chatham Rise and Campbell Plateau) that moves with the Australian block.
- **Sea level slider** (−130 to +250 m, Today only): rises flood land using `tex/elev.png` (NASA GEBCO_08 land elevation, ~25 m per grey level, 4096×2048); falls expose the continental shelf using the Natural Earth 10 m 200 m-bathymetry polygons (the ice-age shoreline was nearer 120 m, so the shelf is slightly generous). Presets: ice age −120 m, Greenland +7 m, all ice +70 m, Cretaceous hothouse +200 m, with climate-change context text.
