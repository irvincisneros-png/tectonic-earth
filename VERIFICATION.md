# Earth events verification — 11 September 2026

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
