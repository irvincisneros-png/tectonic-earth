# Terrain sources and interpretation

## Satellite imagery

EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH
(Contains modified Copernicus Sentinel data 2016).
2016 imagery is licensed under Creative Commons Attribution 4.0:
https://creativecommons.org/licenses/by/4.0/
https://cloudless.eox.at/license-non-commercial

The JPEGs are unmodified WMS cutouts in EPSG:4326, downloaded with
scripts/fetch-imagery.py and draped onto the elevation grid. They depict modern
land cover, not 1883, 1991, 2004 or 2011 imagery. Historically added land uses a
procedural material instead of applying modern ocean imagery to it.

## Elevation

The bundled elevation grids are resampled from Mapzen / Tilezen Terrain Tiles,
hosted by the AWS Open Data Registry:
https://registry.opendata.aws/terrain-tiles/

SRTM and GMTED2010 terrain data courtesy of the U.S. Geological Survey.
Global ETOPO1 terrain data: DOC/NOAA/NESDIS/NCEI, NOAA, U.S. Department of Commerce.
Mapzen / Tilezen processing. Source attribution and terms:
https://github.com/tilezen/joerd/blob/master/docs/attribution.md

Grids are 193 × 193 signed little-endian elevation samples in metres. Coordinates,
extent, source zoom and elevation range are recorded in manifest.json. They were
bilinearly resampled from public Terrarium PNG data by scripts/build-terrain.py.
No online terrain service or API key is needed to run the published site.
Isolated positive spikes unsupported by their neighbours are filtered. For display,
zero/shallow ocean cells are lowered below the animated water; these modified
depths must not be interpreted as measured bathymetry.

Elevation is displayed with 2.3× vertical exaggeration. Data may contain coastal
and bathymetric inaccuracies; these grids are not inundation or navigation data.

Krakatau: the modern Anak Krakatau cone is removed; interpreted Danan and
Perboewatan cones and the pre-collapse connection to Rakata are added. Collapse
removes the northern/central edifice while retaining Rakata and adjacent islands.
This is a reference-informed interpretation, not a surveyed 1883 DEM.
Reference: Smithsonian Global Volcanism Program, Krakatau:
https://volcano.si.edu/volcano.cfm?vn=262000

Pinatubo: modern terrain is used with an interpreted pre-eruption summit cap that
is removed during the sequence. The atmospheric example references the 1991
eruption. Reference: USGS, The Cataclysmic 1991 Eruption of Mount Pinatubo:
https://pubs.usgs.gov/fs/1997/fs113-97/

Aceh and Sanriku show distinct measured coastal terrain. Animated waves illustrate
processes; they do not reproduce historical water levels or calculate arrival times.
Hawaiʻi growth changes the elevation of the modern island as an illustration of
shield growth, not a palaeogeographic reconstruction. Iceland shows the measured
Þingvellir region, with an explanatory rift overlay.
