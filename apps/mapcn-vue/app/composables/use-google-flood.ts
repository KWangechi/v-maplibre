import type {
  FloodMarker,
  FloodRegion,
  GoogleFloodSeverity,
  GoogleFloodStatus,
  GoogleFloodStatusResponse,
  GoogleGauge,
  GoogleGaugeForecast,
  GoogleGaugeForecastsResponse,
  GoogleGaugesSearchResponse,
  GoogleSignificantEvent,
  GoogleSignificantEventsResponse,
  ParsedFloodPolygon,
  SelectedGauge,
} from '~/types/flood';
import { parseKmlToPolygon } from '~/utils/kml-parser';

// 154 countries from Google Flood Hub coverage list
// Source: https://support.google.com/flood-hub/answer/16508958
export const FLOOD_REGIONS: FloodRegion[] = [
  { code: 'AF', name: 'Afghanistan', center: [67.71, 33.94], zoom: 5 },
  { code: 'AL', name: 'Albania', center: [20.17, 41.15], zoom: 7 },
  { code: 'DZ', name: 'Algeria', center: [1.66, 28.03], zoom: 5 },
  { code: 'AO', name: 'Angola', center: [17.87, -11.2], zoom: 5 },
  { code: 'AR', name: 'Argentina', center: [-63.62, -38.42], zoom: 4 },
  { code: 'AM', name: 'Armenia', center: [45.04, 40.07], zoom: 7 },
  { code: 'AU', name: 'Australia', center: [133.78, -25.27], zoom: 4 },
  { code: 'AT', name: 'Austria', center: [14.55, 47.52], zoom: 6 },
  { code: 'AZ', name: 'Azerbaijan', center: [47.58, 40.14], zoom: 7 },
  { code: 'BS', name: 'Bahamas', center: [-77.4, 25.03], zoom: 7 },
  { code: 'BD', name: 'Bangladesh', center: [90.36, 23.68], zoom: 6 },
  { code: 'BY', name: 'Belarus', center: [27.95, 53.71], zoom: 6 },
  { code: 'BE', name: 'Belgium', center: [4.47, 50.5], zoom: 7 },
  { code: 'BZ', name: 'Belize', center: [-88.5, 17.19], zoom: 7 },
  { code: 'BO', name: 'Bolivia', center: [-63.59, -16.29], zoom: 5 },
  { code: 'BA', name: 'Bosnia & Herzegovina', center: [17.68, 43.92], zoom: 7 },
  { code: 'BW', name: 'Botswana', center: [24.68, -22.33], zoom: 6 },
  { code: 'BR', name: 'Brazil', center: [-51.93, -14.24], zoom: 4 },
  { code: 'BN', name: 'Brunei', center: [114.73, 4.54], zoom: 8 },
  { code: 'BG', name: 'Bulgaria', center: [25.49, 42.73], zoom: 7 },
  { code: 'BF', name: 'Burkina Faso', center: [-1.56, 12.24], zoom: 6 },
  { code: 'BI', name: 'Burundi', center: [29.92, -3.37], zoom: 8 },
  { code: 'KH', name: 'Cambodia', center: [104.99, 12.57], zoom: 6 },
  { code: 'CM', name: 'Cameroon', center: [12.35, 7.37], zoom: 5 },
  { code: 'CA', name: 'Canada', center: [-96.82, 56.13], zoom: 3 },
  {
    code: 'CF',
    name: 'Central African Republic',
    center: [20.94, 6.61],
    zoom: 5,
  },
  { code: 'TD', name: 'Chad', center: [18.73, 15.45], zoom: 5 },
  { code: 'CL', name: 'Chile', center: [-71.54, -35.68], zoom: 4 },
  { code: 'CO', name: 'Colombia', center: [-74.3, 4.57], zoom: 5 },
  { code: 'CG', name: 'Congo', center: [15.83, -0.23], zoom: 6 },
  { code: 'CR', name: 'Costa Rica', center: [-83.75, 9.75], zoom: 7 },
  { code: 'CI', name: "Côte d'Ivoire", center: [-5.55, 7.54], zoom: 6 },
  { code: 'HR', name: 'Croatia', center: [15.2, 45.1], zoom: 7 },
  { code: 'CU', name: 'Cuba', center: [-77.78, 21.52], zoom: 6 },
  { code: 'CZ', name: 'Czechia', center: [15.47, 49.82], zoom: 7 },
  { code: 'CD', name: 'DR Congo', center: [21.76, -4.04], zoom: 5 },
  { code: 'DK', name: 'Denmark', center: [9.5, 56.26], zoom: 6 },
  { code: 'DJ', name: 'Djibouti', center: [42.59, 11.83], zoom: 8 },
  { code: 'DO', name: 'Dominican Republic', center: [-70.16, 18.74], zoom: 7 },
  { code: 'EC', name: 'Ecuador', center: [-78.18, -1.83], zoom: 6 },
  { code: 'EG', name: 'Egypt', center: [30.8, 26.82], zoom: 5 },
  { code: 'SV', name: 'El Salvador', center: [-88.9, 13.79], zoom: 8 },
  { code: 'GQ', name: 'Equatorial Guinea', center: [10.27, 1.65], zoom: 8 },
  { code: 'ER', name: 'Eritrea', center: [39.78, 15.18], zoom: 6 },
  { code: 'EE', name: 'Estonia', center: [25.01, 58.6], zoom: 7 },
  { code: 'SZ', name: 'Eswatini', center: [31.47, -26.52], zoom: 8 },
  { code: 'FJ', name: 'Fiji', center: [178.07, -17.71], zoom: 7 },
  { code: 'FI', name: 'Finland', center: [25.75, 61.92], zoom: 5 },
  { code: 'FR', name: 'France', center: [2.21, 46.23], zoom: 5 },
  { code: 'GF', name: 'French Guiana', center: [-53.13, 3.93], zoom: 7 },
  { code: 'GA', name: 'Gabon', center: [11.61, -0.8], zoom: 6 },
  { code: 'GM', name: 'Gambia', center: [-15.31, 13.44], zoom: 8 },
  { code: 'GE', name: 'Georgia', center: [43.36, 42.32], zoom: 7 },
  { code: 'DE', name: 'Germany', center: [10.45, 51.17], zoom: 5 },
  { code: 'GH', name: 'Ghana', center: [-1.02, 7.95], zoom: 6 },
  { code: 'GR', name: 'Greece', center: [21.82, 39.07], zoom: 6 },
  { code: 'GP', name: 'Guadeloupe', center: [-61.55, 16.0], zoom: 9 },
  { code: 'GT', name: 'Guatemala', center: [-90.23, 15.78], zoom: 7 },
  { code: 'GN', name: 'Guinea', center: [-9.95, 9.95], zoom: 6 },
  { code: 'GW', name: 'Guinea-Bissau', center: [-15.18, 12.0], zoom: 8 },
  { code: 'GY', name: 'Guyana', center: [-58.93, 4.86], zoom: 6 },
  { code: 'HT', name: 'Haiti', center: [-72.29, 18.97], zoom: 7 },
  { code: 'HN', name: 'Honduras', center: [-86.24, 15.2], zoom: 6 },
  { code: 'HU', name: 'Hungary', center: [19.5, 47.16], zoom: 7 },
  { code: 'IS', name: 'Iceland', center: [-19.02, 64.96], zoom: 5 },
  { code: 'IN', name: 'India', center: [78.96, 20.59], zoom: 4 },
  { code: 'ID', name: 'Indonesia', center: [113.92, -0.79], zoom: 4 },
  { code: 'IQ', name: 'Iraq', center: [43.68, 33.22], zoom: 5 },
  { code: 'IE', name: 'Ireland', center: [-8.24, 53.41], zoom: 6 },
  { code: 'IL', name: 'Israel', center: [34.85, 31.05], zoom: 7 },
  { code: 'IT', name: 'Italy', center: [12.57, 41.87], zoom: 5 },
  { code: 'JM', name: 'Jamaica', center: [-77.3, 18.11], zoom: 8 },
  { code: 'JO', name: 'Jordan', center: [36.24, 30.59], zoom: 7 },
  { code: 'KZ', name: 'Kazakhstan', center: [66.92, 48.02], zoom: 4 },
  { code: 'KE', name: 'Kenya', center: [37.91, 0.02], zoom: 6 },
  { code: 'KW', name: 'Kuwait', center: [47.48, 29.31], zoom: 8 },
  { code: 'KG', name: 'Kyrgyzstan', center: [74.77, 41.2], zoom: 6 },
  { code: 'LA', name: 'Laos', center: [102.5, 19.86], zoom: 6 },
  { code: 'LV', name: 'Latvia', center: [24.6, 56.88], zoom: 7 },
  { code: 'LB', name: 'Lebanon', center: [35.86, 33.85], zoom: 8 },
  { code: 'LS', name: 'Lesotho', center: [28.23, -29.61], zoom: 8 },
  { code: 'LR', name: 'Liberia', center: [-9.43, 6.43], zoom: 7 },
  { code: 'LY', name: 'Libya', center: [17.23, 26.34], zoom: 5 },
  { code: 'LT', name: 'Lithuania', center: [23.88, 55.17], zoom: 7 },
  { code: 'MG', name: 'Madagascar', center: [46.87, -18.77], zoom: 5 },
  { code: 'MW', name: 'Malawi', center: [34.3, -13.25], zoom: 6 },
  { code: 'MY', name: 'Malaysia', center: [101.98, 4.21], zoom: 5 },
  { code: 'ML', name: 'Mali', center: [-4.0, 17.57], zoom: 5 },
  { code: 'MQ', name: 'Martinique', center: [-61.02, 14.64], zoom: 9 },
  { code: 'MR', name: 'Mauritania', center: [-10.94, 21.01], zoom: 5 },
  { code: 'MX', name: 'Mexico', center: [-102.55, 23.63], zoom: 4 },
  { code: 'MD', name: 'Moldova', center: [28.37, 47.41], zoom: 7 },
  { code: 'ME', name: 'Montenegro', center: [19.37, 42.71], zoom: 8 },
  { code: 'MA', name: 'Morocco', center: [-7.09, 31.79], zoom: 5 },
  { code: 'MZ', name: 'Mozambique', center: [35.53, -18.67], zoom: 5 },
  { code: 'MM', name: 'Myanmar', center: [96.68, 21.91], zoom: 5 },
  { code: 'NA', name: 'Namibia', center: [18.49, -22.96], zoom: 5 },
  { code: 'NP', name: 'Nepal', center: [84.12, 28.39], zoom: 6 },
  { code: 'NL', name: 'Netherlands', center: [5.29, 52.13], zoom: 7 },
  { code: 'NC', name: 'New Caledonia', center: [165.62, -20.9], zoom: 7 },
  { code: 'NZ', name: 'New Zealand', center: [174.89, -40.9], zoom: 5 },
  { code: 'NI', name: 'Nicaragua', center: [-85.21, 12.87], zoom: 7 },
  { code: 'NG', name: 'Nigeria', center: [8.68, 9.08], zoom: 5 },
  { code: 'MK', name: 'North Macedonia', center: [21.75, 41.51], zoom: 8 },
  { code: 'NO', name: 'Norway', center: [8.47, 60.47], zoom: 4 },
  { code: 'PK', name: 'Pakistan', center: [69.35, 30.38], zoom: 5 },
  { code: 'PA', name: 'Panama', center: [-80.78, 8.54], zoom: 7 },
  { code: 'PG', name: 'Papua New Guinea', center: [143.96, -6.31], zoom: 5 },
  { code: 'PY', name: 'Paraguay', center: [-58.44, -23.44], zoom: 5 },
  { code: 'PE', name: 'Peru', center: [-75.02, -9.19], zoom: 5 },
  { code: 'PH', name: 'Philippines', center: [121.77, 12.88], zoom: 5 },
  { code: 'PL', name: 'Poland', center: [19.15, 51.92], zoom: 6 },
  { code: 'PT', name: 'Portugal', center: [-8.22, 39.4], zoom: 6 },
  { code: 'PR', name: 'Puerto Rico', center: [-66.59, 18.22], zoom: 8 },
  { code: 'RO', name: 'Romania', center: [24.97, 45.94], zoom: 6 },
  { code: 'RW', name: 'Rwanda', center: [29.87, -1.94], zoom: 8 },
  { code: 'SA', name: 'Saudi Arabia', center: [45.08, 23.89], zoom: 5 },
  { code: 'SN', name: 'Senegal', center: [-14.45, 14.5], zoom: 6 },
  { code: 'RS', name: 'Serbia', center: [21.01, 44.02], zoom: 7 },
  { code: 'SL', name: 'Sierra Leone', center: [-11.78, 8.46], zoom: 7 },
  { code: 'SK', name: 'Slovakia', center: [19.7, 48.67], zoom: 7 },
  { code: 'SI', name: 'Slovenia', center: [14.4, 46.15], zoom: 8 },
  { code: 'SB', name: 'Solomon Islands', center: [160.16, -9.64], zoom: 6 },
  { code: 'SO', name: 'Somalia', center: [46.2, 5.15], zoom: 5 },
  { code: 'ZA', name: 'South Africa', center: [22.94, -30.56], zoom: 5 },
  { code: 'SS', name: 'South Sudan', center: [31.31, 7.86], zoom: 5 },
  { code: 'ES', name: 'Spain', center: [-3.75, 40.46], zoom: 5 },
  { code: 'LK', name: 'Sri Lanka', center: [80.77, 7.87], zoom: 7 },
  { code: 'SD', name: 'Sudan', center: [30.22, 12.86], zoom: 5 },
  { code: 'SR', name: 'Suriname', center: [-56.03, 3.92], zoom: 7 },
  { code: 'SE', name: 'Sweden', center: [18.64, 60.13], zoom: 4 },
  { code: 'CH', name: 'Switzerland', center: [8.23, 46.82], zoom: 7 },
  { code: 'ST', name: 'São Tomé & Príncipe', center: [6.61, 0.19], zoom: 9 },
  { code: 'TW', name: 'Taiwan', center: [120.96, 23.69], zoom: 7 },
  { code: 'TJ', name: 'Tajikistan', center: [71.28, 38.86], zoom: 6 },
  { code: 'TH', name: 'Thailand', center: [100.99, 15.87], zoom: 5 },
  { code: 'TL', name: 'Timor-Leste', center: [125.73, -8.87], zoom: 8 },
  { code: 'TT', name: 'Trinidad & Tobago', center: [-61.22, 10.69], zoom: 8 },
  { code: 'TN', name: 'Tunisia', center: [9.54, 33.89], zoom: 6 },
  { code: 'TR', name: 'Turkey', center: [35.24, 38.96], zoom: 5 },
  { code: 'TM', name: 'Turkmenistan', center: [59.56, 38.97], zoom: 5 },
  { code: 'AE', name: 'UAE', center: [53.85, 23.42], zoom: 6 },
  { code: 'UA', name: 'Ukraine', center: [31.17, 48.38], zoom: 5 },
  { code: 'GB', name: 'United Kingdom', center: [-3.44, 55.38], zoom: 5 },
  { code: 'US', name: 'United States', center: [-95.71, 37.09], zoom: 4 },
  { code: 'UY', name: 'Uruguay', center: [-55.77, -32.52], zoom: 6 },
  { code: 'UZ', name: 'Uzbekistan', center: [64.59, 41.38], zoom: 5 },
  { code: 'VU', name: 'Vanuatu', center: [166.96, -15.38], zoom: 7 },
  { code: 'VA', name: 'Vatican City', center: [12.45, 41.9], zoom: 12 },
  { code: 'VE', name: 'Venezuela', center: [-66.59, 6.42], zoom: 5 },
  { code: 'VN', name: 'Vietnam', center: [108.28, 14.06], zoom: 5 },
  { code: 'YE', name: 'Yemen', center: [48.52, 15.55], zoom: 6 },
  { code: 'ZM', name: 'Zambia', center: [27.85, -13.13], zoom: 5 },
  { code: 'ZW', name: 'Zimbabwe', center: [29.15, -19.02], zoom: 6 },
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

export function useGoogleFlood() {
  const regionCode = ref<string>('IN');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const floodStatuses = shallowRef<GoogleFloodStatus[]>([]);
  const gaugeMetadata = shallowRef<Map<string, GoogleGauge>>(new Map());
  const significantEvents = shallowRef<GoogleSignificantEvent[]>([]);
  const polygons = shallowRef<ParsedFloodPolygon[]>([]);
  const selectedGauge = ref<SelectedGauge | null>(null);
  const lastFetch = ref<Date | null>(null);

  const floodMarkers = computed<FloodMarker[]>(() => {
    const metadata = gaugeMetadata.value;
    return floodStatuses.value.map((status) => {
      const gauge = metadata.get(status.gaugeId);
      return {
        gaugeId: status.gaugeId,
        coordinates: [
          status.gaugeLocation.longitude,
          status.gaugeLocation.latitude,
        ],
        severity: status.severity,
        stationName: gauge?.siteName || status.gaugeId,
        riverId: undefined,
        riverName: gauge?.river || undefined,
        issuedTime: status.issuedTime,
        hasInundationMap:
          (status.inundationMapSet?.inundationMaps?.length ?? 0) > 0,
      };
    });
  });

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

  async function fetchGauges(code: string): Promise<void> {
    const response = await $fetch<GoogleGaugesSearchResponse>(
      '/api/flood-forecasting',
      {
        method: 'POST',
        query: { endpoint: 'gauges:searchGaugesByArea' },
        body: {
          regionCode: code,
          pageSize: 500,
          includeNonQualityVerified: true,
        },
      },
    );
    const map = new Map<string, GoogleGauge>();
    for (const gauge of response.gauges ?? []) {
      map.set(gauge.gaugeId, gauge);
    }
    gaugeMetadata.value = map;
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
      hasInundationMap: marker.hasInundationMap,
      forecastLoading: true,
    };

    const status = floodStatuses.value.find(
      (s) => s.gaugeId === marker.gaugeId,
    );

    const gauge = gaugeMetadata.value.get(marker.gaugeId);
    const hasModel = gauge?.hasModel !== false;

    const [forecast] = await Promise.all([
      hasModel
        ? fetchGaugeForecast(marker.gaugeId).catch(() => null)
        : Promise.resolve(null),
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
        fetchGauges(regionCode.value).catch(() => undefined),
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
