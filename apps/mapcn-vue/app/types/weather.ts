export interface CityInfo {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

export interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  is_day: number;
}

export interface CityWeather extends CityInfo {
  current: CurrentWeather;
}

export interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  wind_speed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
}

export interface CityForecast {
  latitude: number;
  longitude: number;
  current: CurrentWeather & {
    wind_gusts_10m: number;
    uv_index: number;
  };
  daily: DailyForecast;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  population?: number;
}

export interface OpenMeteoCurrentResponse {
  latitude: number;
  longitude: number;
  current: CurrentWeather;
}

export interface AirQualityData {
  us_aqi: number;
  european_aqi: number;
  pm10: number;
  pm2_5: number;
}

export interface AqiLevel {
  label: string;
  color: string;
  textColor: string;
}

export interface CityAirQuality extends CityInfo {
  airQuality: AirQualityData;
}

export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  current: AirQualityData;
}
