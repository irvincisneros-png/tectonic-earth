# Earth events verification — 11 September 2026

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
