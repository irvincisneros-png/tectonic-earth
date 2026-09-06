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
