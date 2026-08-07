/**
 * app.js
 * Main application entry point
 */

import { STORAGE_KEY, UNIT_KEY, DEFAULT_CITY } from './config.js';
import {
    AppError,
    NetworkError,
    ValidationError,
    NotFoundError,
    APIError,
    LocationError,
    handleError
} from './errors.js';
import {
    validateCityInput,
    safeAsync
} from './utils.js';
import {
    geocodeCity,
    fetchWeather,
    getCurrentLocation
} from './api.js';
import { UI } from './ui.js';

// ============================================================
// Application State
// ============================================================

let isCelsius = true;
let lastWeatherData = null;
let lastLocation = null;

// ============================================================
// Core Functions
// ============================================================

/**
 * Search for weather by city name
 */
async function searchWeather(cityQuery) {
    const query = (cityQuery || UI.getCity()).trim();

    try {
        const validatedCity = validateCityInput(query);

        UI.hideError();
        UI.showWeather(false);
        UI.showLoading(true);

        const location = await geocodeCity(validatedCity);
        const weather = await fetchWeather(location.latitude, location.longitude);

        UI.renderAll(weather, location, isCelsius);
        lastWeatherData = weather;
        lastLocation = location;

        localStorage.setItem(STORAGE_KEY, location.name);
        UI.setCity(location.name);

    } catch (error) {
        const errorInfo = handleError(error);
        UI.showError(errorInfo.message, errorInfo.details, errorInfo.type);
        UI.showWeather(false);
    } finally {
        UI.showLoading(false);
    }
}

/**
 * Get weather for current location
 */
async function getLocationWeather() {
    try {
        UI.hideError();
        UI.showWeather(false);
        UI.showLoading(true);

        const coords = await getCurrentLocation();
        const weather = await fetchWeather(coords.latitude, coords.longitude);

        const location = {
            name: 'Current Location',
            country: '',
            latitude: coords.latitude,
            longitude: coords.longitude
        };

        UI.renderAll(weather, location, isCelsius);
        lastWeatherData = weather;
        lastLocation = location;

        UI.setCity('Current Location');
        localStorage.setItem(STORAGE_KEY, 'Current Location');

    } catch (error) {
        const errorInfo = handleError(error);
        UI.showError(errorInfo.message, errorInfo.details, errorInfo.type);
        UI.showWeather(false);
    } finally {
        UI.showLoading(false);
    }
}

/**
 * Refresh current weather
 */
async function refreshWeather() {
    const city = UI.getCity();
    if (!city) {
        UI.showError('No city to refresh. Please search first.', null, 'warning');
        return;
    }
    await searchWeather(city);
}

/**
 * Toggle temperature unit
 */
function toggleUnit() {
    isCelsius = !isCelsius;
    localStorage.setItem(UNIT_KEY, isCelsius ? 'c' : 'f');
    UI.updateUnitButton(isCelsius);

    if (lastWeatherData && lastLocation) {
        UI.renderAll(lastWeatherData, lastLocation, isCelsius);
    }
}

// ============================================================
// Event Setup
// ============================================================

function setupEvents() {
    // Search button
    UI.searchBtn.addEventListener('click', safeAsync(searchWeather, (error) => {
        const info = handleError(error);
        UI.showError(info.message, info.details, info.type);
    }));

    // Enter key in input
    UI.cityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchWeather();
        }
    });

    // Location button
    UI.locationBtn.addEventListener('click', safeAsync(getLocationWeather, (error) => {
        const info = handleError(error);
        UI.showError(info.message, info.details, info.type);
    }));

    // Refresh button
    UI.refreshBtn.addEventListener('click', safeAsync(refreshWeather, (error) => {
        const info = handleError(error);
        UI.showError(info.message, info.details, info.type);
    }));

    // Unit toggle
    UI.unitBtn.addEventListener('click', toggleUnit);
}

// ============================================================
// Global Error Handlers
// ============================================================

window.onerror = function(message, source, line, column, error) {
    console.error('🚨 Global error caught:', { message, source, line, column, error });
    UI.showError('An unexpected error occurred. Please refresh the page.', null, 'error');
    return true;
};

window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 Unhandled rejection:', event.reason);
    const info = handleError(event.reason);
    UI.showError(info.message, info.details, info.type);
    event.preventDefault();
});

// ============================================================
// Initialization
// ============================================================

async function init() {
    // Load unit preference
    const savedUnit = localStorage.getItem(UNIT_KEY);
    if (savedUnit === 'f') {
        isCelsius = false;
        UI.updateUnitButton(isCelsius);
    }

    // Load last city
    const lastCity = localStorage.getItem(STORAGE_KEY);
    const initialCity = lastCity || DEFAULT_CITY;
    UI.setCity(initialCity);

    // Load weather for the initial city
    await searchWeather(initialCity);

    console.log('✅ Weather App initialized with modules!');
    console.log('📦 Architecture: config → errors → utils → api → ui → app');
}

// Setup and start
setupEvents();
init().catch(error => {
    console.error('Failed to initialize app:', error);
    const info = handleError(error);
    UI.showError(info.message, info.details, info.type);
});