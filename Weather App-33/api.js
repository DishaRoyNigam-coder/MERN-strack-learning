/**
 * api.js
 * API calls for geocoding and weather data
 */

import { API_BASE, GEO_BASE } from './config.js';
import {
    NetworkError,
    NotFoundError,
    APIError,
    LocationError
} from './errors.js';

/**
 * Geocode a city name to coordinates
 */
export async function geocodeCity(cityName) {
    try {
        const url = `${GEO_BASE}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new APIError(
                `Geocoding API returned status ${response.status}`,
                response.status
            );
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new NotFoundError(`City "${cityName}" not found. Please check the spelling.`);
        }

        const result = data.results[0];
        return {
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            country: result.country || result.admin1 || 'Unknown'
        };
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof APIError) {
            throw error;
        }
        throw new NetworkError('Failed to connect to the geocoding service.', error.message);
    }
}

/**
 * Fetch weather data from Open-Meteo
 */
export async function fetchWeather(lat, lon) {
    try {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current_weather: true,
            daily: 'temperature_2m_max,temperature_2m_min,weathercode,uv_index_max',
            timezone: 'auto',
            forecast_days: 7
        });

        const url = `${API_BASE}?${params}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new APIError(
                `Weather API returned status ${response.status}`,
                response.status
            );
        }

        const data = await response.json();

        if (!data.current_weather) {
            throw new APIError('Invalid weather data received.', 500);
        }

        return data;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        if (error instanceof TypeError) {
            throw new NetworkError('Network error. Please check your internet connection.', error.message);
        }
        throw new NetworkError('Failed to fetch weather data.', error.message);
    }
}

/**
 * Get weather for current location using Geolocation API
 */
export async function getCurrentLocation() {
    if (!navigator.geolocation) {
        throw new LocationError('Geolocation is not supported by your browser.', 'NOT_SUPPORTED');
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            });
        });

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
    } catch (error) {
        if (error.code === 1) {
            throw new LocationError('Location access denied. Please allow location access or search manually.', 'PERMISSION_DENIED');
        } else if (error.code === 2) {
            throw new LocationError('Location unavailable. Please try again or search manually.', 'UNAVAILABLE');
        } else if (error.code === 3) {
            throw new LocationError('Location request timed out. Please try again or search manually.', 'TIMEOUT');
        } else {
            throw new LocationError(`Location error: ${error.message}`, 'UNKNOWN');
        }
    }
}