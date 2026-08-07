/**
 * utils.js
 * Utility functions for formatting, validation, etc.
 */

import { WEATHER_CODES } from './config.js';

/**
 * Validate city input
 */
export function validateCityInput(city) {
    const trimmed = city.trim();
    if (!trimmed) {
        throw new ValidationError('Please enter a city name.');
    }
    if (trimmed.length < 2) {
        throw new ValidationError('City name must be at least 2 characters.');
    }
    if (trimmed.length > 100) {
        throw new ValidationError('City name is too long (max 100 characters).');
    }
    return trimmed;
}

/**
 * Get weather icon and label by code
 */
export function getWeatherIcon(code) {
    return WEATHER_CODES[code] || { icon: '❓', label: 'Unknown' };
}

/**
 * Get day name from date string
 */
export function getDayName(dateStr) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateStr);
    return days[date.getDay()];
}

/**
 * Format time
 */
export function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

/**
 * Format temperature
 */
export function formatTemperature(celsius, isCelsius) {
    const value = isCelsius ? celsius : celsiusToFahrenheit(celsius);
    const unit = isCelsius ? '°C' : '°F';
    return `${Math.round(value)}°${unit}`;
}

/**
 * Format temperature value (for display without unit)
 */
export function formatTempValue(celsius, isCelsius) {
    const value = isCelsius ? celsius : celsiusToFahrenheit(celsius);
    return Math.round(value);
}

/**
 * Get unit symbols
 */
export function getUnitSymbol(isCelsius) {
    return isCelsius ? '°C' : '°F';
}

export function getWindUnit(isCelsius) {
    return isCelsius ? 'km/h' : 'mph';
}

/**
 * Capitalize words in a string
 */
export function capitalizeWords(str) {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Safe async wrapper
 */
export function safeAsync(fn, errorHandler) {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            if (errorHandler) {
                errorHandler(error);
            }
            return null;
        }
    };
}

// Import ValidationError for the validator
import { ValidationError } from './errors.js';