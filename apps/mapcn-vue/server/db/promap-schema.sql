-- ─────────────────────────────────────────────────────────────────────────────
-- ProMap schema — US ZIP-level home price + population dataset (~33k rows)
--
-- Data sources joined offline (see server/db/README.md):
--   • Zillow ZHVI (median home value per ZIP, monthly)
--   • US Census ZCTA centroids (lat/lng per ZIP)
--   • SimpleMaps US Zips (population per ZIP)
--
-- Apply once per fresh D1 database (idempotent):
--   wrangler d1 execute mapcn-vue-db --local  --file=server/db/promap-schema.sql
--   wrangler d1 execute mapcn-vue-db --remote --file=server/db/promap-schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promap (
  zip        TEXT    NOT NULL PRIMARY KEY,
  lat        REAL    NOT NULL,
  lng        REAL    NOT NULL,
  price      INTEGER NOT NULL,
  size_rank  INTEGER NOT NULL,
  population INTEGER NOT NULL DEFAULT 0,
  city       TEXT    NOT NULL DEFAULT '',
  state      TEXT    NOT NULL DEFAULT '',
  metro      TEXT    NOT NULL DEFAULT '',
  p3         INTEGER NOT NULL DEFAULT 0,
  p6         INTEGER NOT NULL DEFAULT 0,
  p1         INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;

-- Compound index for viewport bbox queries (lat BETWEEN ? AND lng BETWEEN ?).
-- SQLite/D1 has no R*Tree on the Cloudflare side; this B-tree is the canonical
-- alternative for ~33k rows. Query planner uses the lat range to prune first.
CREATE INDEX IF NOT EXISTS idx_promap_lat_lng ON promap (lat, lng);

-- Sort key for "show biggest cities first" semantics at low zoom levels.
CREATE INDEX IF NOT EXISTS idx_promap_size_rank ON promap (size_rank);
