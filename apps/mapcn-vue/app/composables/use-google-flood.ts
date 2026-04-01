import type {
  FloodMarker,
  FloodRegion,
  GoogleFloodSeverity,
  GoogleFloodStatus,
  GoogleFloodStatusResponse,
  GoogleGaugeForecast,
  GoogleGaugeForecastsResponse,
  GoogleSignificantEvent,
  GoogleSignificantEventsResponse,
  ParsedFloodPolygon,
  SelectedGauge,
} from '~/types/flood';
import { parseKmlToPolygon } from '~/utils/kml-parser';

export const FLOOD_REGIONS: FloodRegion[] = [
  { code: 'IN', name: 'India', center: [78.9629, 20.5937], zoom: 4 },
  { code: 'BD', name: 'Bangladesh', center: [90.3563, 23.685], zoom: 6 },
  { code: 'VN', name: 'Vietnam', center: [108.2772, 14.0583], zoom: 5 },
  { code: 'BR', name: 'Brazil', center: [-51.9253, -14.235], zoom: 4 },
  { code: 'US', name: 'United States', center: [-95.7129, 37.0902], zoom: 4 },
  { code: 'CN', name: 'China', center: [104.1954, 35.8617], zoom: 4 },
  { code: 'CO', name: 'Colombia', center: [-74.2973, 4.5709], zoom: 5 },
  { code: 'ET', name: 'Ethiopia', center: [40.4897, 9.145], zoom: 5 },
  { code: 'GH', name: 'Ghana', center: [-1.0232, 7.9465], zoom: 6 },
  { code: 'HN', name: 'Honduras', center: [-86.2419, 15.2], zoom: 6 },
  { code: 'KE', name: 'Kenya', center: [37.9062, 0.0236], zoom: 6 },
  { code: 'MX', name: 'Mexico', center: [-102.5528, 23.6345], zoom: 5 },
  { code: 'NG', name: 'Nigeria', center: [8.6753, 9.082], zoom: 5 },
  { code: 'PK', name: 'Pakistan', center: [69.3451, 30.3753], zoom: 5 },
  { code: 'PE', name: 'Peru', center: [-75.0152, -9.19], zoom: 5 },
  { code: 'SN', name: 'Senegal', center: [-14.4524, 14.4974], zoom: 6 },
  { code: 'SS', name: 'South Sudan', center: [31.307, 7.8627], zoom: 6 },
  { code: 'TZ', name: 'Tanzania', center: [34.8888, -6.369], zoom: 6 },
  { code: 'UG', name: 'Uganda', center: [32.2903, 1.3733], zoom: 6 },
  { code: 'ZM', name: 'Zambia', center: [27.849, -13.1339], zoom: 6 },
];

const SEVERITY_COLORS: Record<
  GoogleFloodSeverity,
  [number, number, number, number]
> = {
  FLOOD_SEVERITY_UNSPECIFIED: [100, 116, 139, 180],
  UNKNOWN: [148, 163, 184, 180],
  NO_FLOODING: [34, 197, 94, 200],
  ABOVE_NORMAL: [234, 179, 8, 220],
  SEVERE: [249, 115, 22, 230],
  EXTREME: [220, 38, 38, 255],
};

const SEVERITY_RADII: Record<GoogleFloodSeverity, number> = {
  FLOOD_SEVERITY_UNSPECIFIED: 8000,
  UNKNOWN: 8000,
  NO_FLOODING: 10000,
  ABOVE_NORMAL: 15000,
  SEVERE: 22000,
  EXTREME: 30000,
};

function toFloodMarker(status: GoogleFloodStatus): FloodMarker {
  return {
    gaugeId: status.gaugeId,
    coordinates: [
      status.gauge.location.longitude,
      status.gauge.location.latitude,
    ],
    severity: status.severity,
    stationName: status.gauge.stationName ?? status.gaugeId,
    riverId: status.gauge.riverId,
    riverName: status.gauge.riverName,
    issuedTime: status.issuedTime,
    hasInundationMap:
      (status.inundationMapSet?.inundationMaps?.length ?? 0) > 0,
  };
}

export function useGoogleFlood() {
  const regionCode = ref<string>('IN');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const floodStatuses = shallowRef<GoogleFloodStatus[]>([]);
  const significantEvents = shallowRef<GoogleSignificantEvent[]>([]);
  const polygons = shallowRef<ParsedFloodPolygon[]>([]);
  const selectedGauge = ref<SelectedGauge | null>(null);
  const lastFetch = ref<Date | null>(null);

  const floodMarkers = computed<FloodMarker[]>(() =>
    floodStatuses.value.map(toFloodMarker),
  );

  function getSeverityColor(
    severity: GoogleFloodSeverity,
  ): [number, number, number, number] {
    return SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.UNKNOWN;
  }

  function getSeverityRadius(severity: GoogleFloodSeverity): number {
    return SEVERITY_RADII[severity] ?? SEVERITY_RADII.UNKNOWN;
  }

  async function fetchFloodStatuses(code: string): Promise<void> {
    const response = await $fetch<GoogleFloodStatusResponse>(
      '/api/flood-forecasting',
      {
        method: 'POST',
        query: { endpoint: 'floodStatus:searchLatestFloodStatusByArea' },
        body: {
          regionCode: code,
          pageSize: 200,
          includeNonQualityVerified: true,
        },
      },
    );
    floodStatuses.value = markRaw(response.floodStatuses ?? []);
  }

  async function fetchSignificantEvents(): Promise<void> {
    const response = await $fetch<GoogleSignificantEventsResponse>(
      '/api/flood-forecasting',
      {
        method: 'POST',
        query: { endpoint: 'significantEvents:search' },
        body: { pageSize: 20 },
      },
    );
    significantEvents.value = markRaw(response.significantEvents ?? []);
  }

  async function fetchPolygon(
    gaugeId: string,
    severity: GoogleFloodSeverity,
    serializedPolygonId: string,
  ): Promise<ParsedFloodPolygon | null> {
    const kmlText = await $fetch<string>(
      `/api/flood-forecasting?endpoint=serializedPolygons/${serializedPolygonId}`,
      { responseType: 'text' },
    );
    return parseKmlToPolygon(kmlText, gaugeId, severity, serializedPolygonId);
  }

  async function loadPolygonsForGauge(
    status: GoogleFloodStatus,
  ): Promise<void> {
    const maps = status.inundationMapSet?.inundationMaps ?? [];
    const results = await Promise.allSettled(
      maps
        .slice(0, 3)
        .map((m) =>
          fetchPolygon(status.gaugeId, m.severity, m.serializedPolygonId),
        ),
    );
    const loaded: ParsedFloodPolygon[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) loaded.push(r.value);
    }
    polygons.value = markRaw(loaded);
  }

  async function fetchGaugeForecast(
    gaugeId: string,
  ): Promise<GoogleGaugeForecast | null> {
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const response = await $fetch<GoogleGaugeForecastsResponse>(
      '/api/flood-forecasting',
      {
        query: {
          endpoint: 'gauges:queryGaugeForecasts',
          gaugeIds: gaugeId,
          issuedTimeStart: start,
          issuedTimeEnd: end,
        },
      },
    );
    return response.gaugeForecasts?.[0] ?? null;
  }

  async function selectGauge(marker: FloodMarker): Promise<void> {
    polygons.value = markRaw([]);
    selectedGauge.value = {
      gaugeId: marker.gaugeId,
      coordinates: marker.coordinates,
      severity: marker.severity,
      stationName: marker.stationName,
      riverId: marker.riverId,
      riverName: marker.riverName,
      issuedTime: marker.issuedTime,
      forecastLoading: true,
    };

    const status = floodStatuses.value.find(
      (s) => s.gaugeId === marker.gaugeId,
    );

    const [forecast] = await Promise.all([
      fetchGaugeForecast(marker.gaugeId).catch(() => null),
      status && marker.hasInundationMap
        ? loadPolygonsForGauge(status).catch(() => undefined)
        : Promise.resolve(),
    ]);

    if (selectedGauge.value?.gaugeId === marker.gaugeId) {
      selectedGauge.value = {
        ...selectedGauge.value,
        forecast: forecast ?? undefined,
        forecastLoading: false,
      };
    }
  }

  function clearSelection(): void {
    selectedGauge.value = null;
    polygons.value = markRaw([]);
  }

  async function refresh(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await Promise.all([
        fetchFloodStatuses(regionCode.value),
        fetchSignificantEvents(),
      ]);
      lastFetch.value = new Date();
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Failed to fetch flood data';
    } finally {
      loading.value = false;
    }
  }

  return {
    regionCode,
    loading,
    error,
    floodMarkers,
    floodStatuses,
    significantEvents,
    polygons,
    selectedGauge,
    lastFetch,
    getSeverityColor,
    getSeverityRadius,
    selectGauge,
    clearSelection,
    refresh,
  };
}
