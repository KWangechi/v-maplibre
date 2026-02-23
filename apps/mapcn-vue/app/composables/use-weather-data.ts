import type {
  CityInfo,
  CityWeather,
  CityForecast,
  GeocodingResult,
  OpenMeteoCurrentResponse,
  AirQualityData,
  AqiLevel,
  OpenMeteoAirQualityResponse,
} from '~/types/weather';

const MAJOR_CITIES: CityInfo[] = [
  { name: 'New York', lat: 40.71, lon: -74.01, country: 'US' },
  { name: 'London', lat: 51.51, lon: -0.12, country: 'GB' },
  { name: 'Paris', lat: 48.85, lon: 2.35, country: 'FR' },
  { name: 'Tokyo', lat: 35.68, lon: 139.69, country: 'JP' },
  { name: 'Mumbai', lat: 19.07, lon: 72.88, country: 'IN' },
  { name: 'Sydney', lat: -33.87, lon: 151.21, country: 'AU' },
  { name: 'São Paulo', lat: -23.55, lon: -46.63, country: 'BR' },
  { name: 'Cairo', lat: 30.04, lon: 31.24, country: 'EG' },
  { name: 'Moscow', lat: 55.75, lon: 37.62, country: 'RU' },
  { name: 'Beijing', lat: 39.9, lon: 116.4, country: 'CN' },
  { name: 'Dubai', lat: 25.2, lon: 55.27, country: 'AE' },
  { name: 'Singapore', lat: 1.35, lon: 103.82, country: 'SG' },
  { name: 'Berlin', lat: 52.52, lon: 13.41, country: 'DE' },
  { name: 'Lagos', lat: 6.52, lon: 3.38, country: 'NG' },
  { name: 'Mexico City', lat: 19.43, lon: -99.13, country: 'MX' },
  { name: 'Bangkok', lat: 13.76, lon: 100.5, country: 'TH' },
  { name: 'Istanbul', lat: 41.01, lon: 28.98, country: 'TR' },
  { name: 'Buenos Aires', lat: -34.6, lon: -58.38, country: 'AR' },
  { name: 'Seoul', lat: 37.57, lon: 126.98, country: 'KR' },
  { name: 'Nairobi', lat: -1.29, lon: 36.82, country: 'KE' },
  { name: 'Toronto', lat: 43.65, lon: -79.38, country: 'CA' },
  { name: 'Rome', lat: 41.9, lon: 12.5, country: 'IT' },
  { name: 'Madrid', lat: 40.42, lon: -3.7, country: 'ES' },
  { name: 'Johannesburg', lat: -26.2, lon: 28.04, country: 'ZA' },
  { name: 'Auckland', lat: -36.85, lon: 174.76, country: 'NZ' },
];

const WMO_ICON_MAP: Record<number, string> = {
  0: 'lucide:sun',
  1: 'lucide:cloud-sun',
  2: 'lucide:cloud-sun',
  3: 'lucide:cloud',
  45: 'lucide:cloud-fog',
  48: 'lucide:cloud-fog',
  51: 'lucide:cloud-drizzle',
  53: 'lucide:cloud-drizzle',
  55: 'lucide:cloud-drizzle',
  56: 'lucide:cloud-drizzle',
  57: 'lucide:cloud-drizzle',
  61: 'lucide:cloud-rain',
  63: 'lucide:cloud-rain',
  65: 'lucide:cloud-rain',
  66: 'lucide:cloud-rain',
  67: 'lucide:cloud-rain',
  71: 'lucide:snowflake',
  73: 'lucide:snowflake',
  75: 'lucide:snowflake',
  77: 'lucide:snowflake',
  80: 'lucide:cloud-rain-wind',
  81: 'lucide:cloud-rain-wind',
  82: 'lucide:cloud-rain-wind',
  85: 'lucide:cloud-snow',
  86: 'lucide:cloud-snow',
  95: 'lucide:cloud-lightning',
  96: 'lucide:cloud-lightning',
  99: 'lucide:cloud-lightning',
};

const WMO_DESCRIPTION_MAP: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

const AQI_LEVELS: { max: number; level: AqiLevel }[] = [
  { max: 50, level: { label: 'Good', color: '#22c55e', textColor: '#14532d' } },
  {
    max: 100,
    level: { label: 'Moderate', color: '#eab308', textColor: '#713f12' },
  },
  {
    max: 150,
    level: { label: 'Unhealthy (SG)', color: '#f97316', textColor: '#7c2d12' },
  },
  {
    max: 200,
    level: { label: 'Unhealthy', color: '#ef4444', textColor: '#7f1d1d' },
  },
  {
    max: 300,
    level: { label: 'Very Unhealthy', color: '#a855f7', textColor: '#3b0764' },
  },
  {
    max: Infinity,
    level: { label: 'Hazardous', color: '#881337', textColor: '#fecdd3' },
  },
];

function getAqiLevel(aqi: number): AqiLevel {
  const match = AQI_LEVELS.find((l) => aqi <= l.max);
  return match?.level ?? AQI_LEVELS[AQI_LEVELS.length - 1]!.level;
}

function getAqiColor(aqi: number): string {
  return getAqiLevel(aqi).color;
}

function getTemperatureColor(temp: number): string {
  if (temp <= -20) return '#1e40af';
  if (temp <= -5) return '#3b82f6';
  if (temp <= 5) return '#06b6d4';
  if (temp <= 15) return '#22c55e';
  if (temp <= 25) return '#eab308';
  if (temp <= 35) return '#f97316';
  return '#ef4444';
}

function getWeatherIcon(code: number): string {
  return WMO_ICON_MAP[code] ?? 'lucide:cloud';
}

function getWeatherDescription(code: number): string {
  return WMO_DESCRIPTION_MAP[code] ?? 'Unknown';
}

export function useWeatherData() {
  const citiesWeather = ref<CityWeather[]>([]);
  const selectedCity = ref<CityWeather | null>(null);
  const selectedForecast = ref<CityForecast | null>(null);
  const searchResults = ref<GeocodingResult[]>([]);
  const isLoading = ref(true);
  const isForecastLoading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);
  const citiesAirQuality = ref<Map<string, AirQualityData>>(new Map());
  const selectedCityAqi = ref<AirQualityData | null>(null);

  async function fetchAllCitiesWeather(): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;

      const lats = MAJOR_CITIES.map((c) => c.lat).join(',');
      const lons = MAJOR_CITIES.map((c) => c.lon).join(',');
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lats}&longitude=${lons}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,is_day` +
        `&timezone=auto`;
      const aqiUrl =
        `https://air-quality-api.open-meteo.com/v1/air-quality` +
        `?latitude=${lats}&longitude=${lons}` +
        `&current=us_aqi,european_aqi,pm10,pm2_5`;

      const [weatherResponse, aqiResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(aqiUrl),
      ]);

      const weatherData: OpenMeteoCurrentResponse[] =
        await weatherResponse.json();
      const aqiData: OpenMeteoAirQualityResponse[] = await aqiResponse.json();
      citiesWeather.value = MAJOR_CITIES.map((city, index) => ({
        ...city,
        current: weatherData[index]!.current,
      }));

      const aqiMap = new Map<string, AirQualityData>();
      MAJOR_CITIES.forEach((city, index) => {
        const aqi = aqiData[index]?.current;
        if (aqi) {
          aqiMap.set(city.name, aqi);
        }
      });
      citiesAirQuality.value = aqiMap;
      lastUpdated.value = new Date();
      isLoading.value = false;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch weather data';
      isLoading.value = false;
    }
  }

  async function fetchCityForecast(lat: number, lon: number): Promise<void> {
    try {
      isForecastLoading.value = true;
      const forecastUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day,uv_index` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,sunrise,sunset` +
        `&forecast_days=7&timezone=auto`;
      const aqiUrl =
        `https://air-quality-api.open-meteo.com/v1/air-quality` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=us_aqi,european_aqi,pm10,pm2_5`;

      const [forecastResponse, aqiResponse] = await Promise.all([
        fetch(forecastUrl),
        fetch(aqiUrl),
      ]);

      selectedForecast.value = await forecastResponse.json();
      const aqiData: OpenMeteoAirQualityResponse = await aqiResponse.json();
      selectedCityAqi.value = aqiData.current;
      isForecastLoading.value = false;
    } catch {
      isForecastLoading.value = false;
    }
  }

  async function searchCity(query: string): Promise<void> {
    if (query.length < 2) {
      searchResults.value = [];
      return;
    }

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
      const response = await fetch(url);
      const data = await response.json();
      searchResults.value = data.results ?? [];
    } catch {
      searchResults.value = [];
    }
  }

  function selectCity(city: CityWeather): void {
    selectedCity.value = city;
    fetchCityForecast(city.lat, city.lon);
  }

  function selectSearchResult(result: GeocodingResult): void {
    const newCity: CityWeather = {
      name: result.name,
      lat: result.latitude,
      lon: result.longitude,
      country: result.country,
      current: {
        temperature_2m: 0,
        relative_humidity_2m: 0,
        apparent_temperature: 0,
        weather_code: 0,
        wind_speed_10m: 0,
        wind_direction_10m: 0,
        is_day: 1,
      },
    };

    selectedCity.value = newCity;
    fetchCityForecast(result.latitude, result.longitude);
    searchResults.value = [];
  }

  function clearSelection(): void {
    selectedCity.value = null;
    selectedForecast.value = null;
  }

  return {
    citiesWeather,
    citiesAirQuality,
    selectedCity,
    selectedForecast,
    selectedCityAqi,
    searchResults,
    isLoading,
    isForecastLoading,
    error,
    lastUpdated,
    fetchAllCitiesWeather,
    fetchCityForecast,
    searchCity,
    selectCity,
    selectSearchResult,
    clearSelection,
    getTemperatureColor,
    getWeatherIcon,
    getWeatherDescription,
    getAqiLevel,
    getAqiColor,
  };
}
