import type { GoogleFloodSeverity, ParsedFloodPolygon } from '~/types/flood';

function parseKmlRings(kmlText: string): [number, number][][] {
  const rings: [number, number][][] = [];
  const coordPattern = /<coordinates[^>]*>([\s\S]*?)<\/coordinates>/gi;
  let match: RegExpExecArray | null;

  while ((match = coordPattern.exec(kmlText)) !== null) {
    const raw = (match[1] ?? '').trim();
    const points: [number, number][] = raw
      .split(/\s+/)
      .filter((s) => s.includes(','))
      .map((triplet) => {
        const parts = triplet.split(',');
        const lng = parseFloat(parts[0] ?? '0');
        const lat = parseFloat(parts[1] ?? '0');
        return [lng, lat] as [number, number];
      })
      .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat));

    if (points.length >= 3) {
      rings.push(points);
    }
  }

  return rings;
}

export function parseKmlToPolygon(
  kmlText: string,
  gaugeId: string,
  severity: GoogleFloodSeverity,
  serializedPolygonId: string,
): ParsedFloodPolygon | null {
  const rings = parseKmlRings(kmlText);
  if (rings.length === 0) return null;

  return {
    gaugeId,
    severity,
    coordinates: rings,
    serializedPolygonId,
  };
}
