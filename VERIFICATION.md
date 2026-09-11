# Earth events verification — 11 September 2026

## Measured-terrain rebuild (current)

The previous generic surface renderer has been replaced. Six 193 × 193 terrain
grids and six 1536 × 1536 satellite cutouts are bundled in `terrain/` (about 2.3 MB).
Each historical terrain modification and source license is described in
`terrain/ATTRIBUTION.md`. Imagery is modern 2016 EOxCloudless, not historical.

- Removed all planar region meshes from the globe scene; this eliminates the
  square terrain patch and exposed corners in volcanic winter/Krakatau.
- Krakatau has interpreted Perboewatan/Danan/Rakata structure, selective collapse,
  surviving islands and labelled locations. Modern Anak Krakatau is excluded.
- Pinatubo replaces the hypothetical Toba example for volcanic winter. Its region
  has measured mountain terrain; the globe uses a thin aerosol haze rather than
  the impact-dust material at high opacity.
- Aceh and Sanriku use different elevation and imagery, not a shared coastline.
- Region and Close-up use the same geography; stage focus and manual orbit/zoom
  are available. Two volumetric plumes replace the original sparse sprite column.
- Fixed plume/water clipping, out-of-bounds foam, shallow-water breakup, and label
  collisions discovered during screenshot review.

`scripts/verify-scenes.js` passed in Chromium against the local site. It covers all
six disaster cases, all four main-page cases, data loading by exact terrain key,
Planet/Region/Close-up switching, start/middle/end/reverse scrubbing, playback,
pause, restart, return to plates, and a 390 × 844 phone layout. Screenshots were
visually inspected, including Krakatau before/during/after collapse and both
Krakatau/Pinatubo planet views. No JavaScript or shader errors were reported.
JavaScript syntax checks and `git diff --check` passed.

A regional Krakatau playback sample measured approximately 31 fps before the
final hidden-globe/shadow rendering optimization. This is a local measurement,
not a performance guarantee. Globe-only measurements from earlier revisions
must not be interpreted as regional volumetric performance.

These remain educational reconstructions, not exact 1883/1991/2004/2011 terrain or
fluid/climate simulations. Regional relief is exaggerated 2.3×. Near-zero offshore
depths are lowered for visual stability; waves do not compute historical inundation.

The remaining sections record superseded iterations and their tests.

## Graphics and separate Disaster Lab revision

Replaced the principal effects with procedural 3D terrain, lava shaders, soft ash/ejecta particles, a layered atmospheric veil, displaced water, and land-shader glaciation. Added a reusable surface renderer with orbit/zoom controls. Retained the 2D process diagrams behind an expandable disclosure. No extra media dependencies were added.

The main page now has four Earth-process cards. `disasters.html` has six disaster/extreme-event cards, including the 2004 Indian Ocean tsunami, 2011 Tōhoku tsunami and 1883 Krakatau eruption. Historical facts use NOAA and Smithsonian source links.

Browser verification covered all six Disaster Lab cases, main-page navigation, planet/surface switching, pause/restart, reverse scrubbing, and desktop/390 px phone layouts. No JavaScript or shader errors were reported. A desktop eruption playback sample measured about 100 requestAnimationFrame callbacks per second on the test machine; this is not a guarantee for other devices. The surface renderer caps pixel density.

Visual corrections included darker basalt, a complete ash-column camera framing, land-conforming snow, and explicit wave-front schematic labels. Fixed renderer inline styles overriding the hidden surface canvas during view changes.

The sections below describe the initial release checks; the page allocation and rendering have since changed as described above.

Implemented as static assets alongside the existing globe. No package installation or build output is required for deployment.

## Browser checks

Checked in Chromium through the Playwright CLI:

- All eight scenario buttons open the intended scene and explanatory text.
- Each timeline was scrubbed to 0, 25, 50, 65, 90 and 100%, then back to 0%.
- Playback advances; pause stops; restart returns to the beginning.
- Ice-age maximum applies −120 m sea level.
- Atmospheric visibility can be changed independently of event progress.
- Leaving a scenario restores the previous geological time (including −250 Ma).
- Changing the original sea-level slider retains the newly requested value when exiting an event.
- Reset closes the event and restores the original controls.
- Desktop and 390 × 844 phone layouts were inspected. The phone layout places the process diagram in the scrollable panel so it does not obscure the globe.
- No JavaScript page errors were reported during the scenario sweep. The local server's missing favicon was the only initial resource error.
- `node --check events.js` and `git diff --check` passed.

Visual inspection led to a subdivided spherical ice mesh, denser atmospheric veil, and a stage sizing correction when switching between phone and desktop layouts.

## Scientific limits

These are sourced teaching animations, not predictive physical solvers. Event phases compress unequal time intervals. Modern geography is retained for orientation. Volcanoes, particles, ice margins, island growth and coastal wave heights are illustrative. Source links and scenario-specific limits are included in the interface. In particular, volcanic sulfate aerosols and impact dust are distinguished, and orbital glaciation is not treated as the same process as a temporary atmospheric winter.
