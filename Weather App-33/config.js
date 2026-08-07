/**
 * config.js
 * Application configuration and constants
 */

// API endpoints
export const API_BASE = 'https://api.open-meteo.com/v1/forecast';
export const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

// localStorage keys
export const STORAGE_KEY = 'weather_app_last_city';
export const UNIT_KEY = 'weather_app_unit';

// Weather code mapping
export const WEATHER_CODES = {
    0: { icon: '☀️', label: 'Clear sky' },
    1: { icon: '🌤️', label: 'Mainly clear' },
    2: { icon: '⛅', label: 'Partly cloudy' },
    3: { icon: '☁️', label: 'Overcast' },
    45: { icon: '🌫️', label: 'Fog' },
    48: { icon: '🌫️', label: 'Depositing rime fog' },
    51: { icon: '🌦️', label: 'Light drizzle' },
    53: { icon: '🌦️', label: 'Moderate drizzle' },
    55: { icon: '🌧️', label: 'Dense drizzle' },
    56: { icon: '🌧️', label: 'Light freezing drizzle' },
    57: { icon: '🌧️', label: 'Dense freezing drizzle' },
    61: { icon: '🌧️', label: 'Slight rain' },
    63: { icon: '🌧️', label: 'Moderate rain' },
    65: { icon: '🌧️', label: 'Heavy rain' },
    66: { icon: '🌧️', label: 'Light freezing rain' },
    67: { icon: '🌧️', label: 'Heavy freezing rain' },
    71: { icon: '🌨️', label: 'Slight snow fall' },
    73: { icon: '🌨️', label: 'Moderate snow fall' },
    75: { icon: '🌨️', label: 'Heavy snow fall' },
    77: { icon: '🌨️', label: 'Snow grains' },
    80: { icon: '🌧️', label: 'Slight rain showers' },
    81: { icon: '🌧️', label: 'Moderate rain showers' },
    82: { icon: '🌧️', label: 'Violent rain showers' },
    85: { icon: '🌨️', label: 'Slight snow showers' },
    86: { icon: '🌨️', label: 'Heavy snow showers' },
    95: { icon: '⛈️', label: 'Thunderstorm' },
    96: { icon: '⛈️', label: 'Thunderstorm with slight hail' },
    99: { icon: '⛈️', label: 'Thunderstorm with heavy hail' }
};

// Default city
export const DEFAULT_CITY = 'London';