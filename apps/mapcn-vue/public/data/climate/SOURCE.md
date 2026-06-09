# Climate Equivalents Data

- **Source**: https://github.com/indraneel/climate-equivalents
- **Fetched**: 2026-06-06
- **License**: MIT (per source repository)

## Files

| File                    | Size     | Description                                                                                                                 |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `country-zones.geojson` | ~11.5 MB | 1054 MultiPolygon features — each is a (country subunit, Köppen class) pair with `iso3`, `name`, `koppen_class`, `area_km2` |
| `class-exemplars.json`  | ~18 KB   | Per-class top-8 country subunits by area (`{ [classId]: [{ iso3, name, area_km2 }] }`)                                      |

## Regeneration

To regenerate from source:

```bash
git clone https://github.com/indraneel/climate-equivalents.git
cd climate-equivalents
uv run scripts/prep_country_zones.py
```

Requires Python + uv with PEP 723 inline deps: `rasterio`, `geopandas`, `shapely`.
Inputs: Beck et al. 2023 Köppen-Geiger raster (10 km) + Natural Earth 10 m Admin-0 Map Subunits.
