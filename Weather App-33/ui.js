/**
 * ui.js
 * DOM manipulation and rendering
 */

import {
    getWeatherIcon,
    getDayName,
    formatTime,
    formatTemperature,
    formatTempValue,
    getUnitSymbol,
    getWindUnit
} from './utils.js';

// ============================================================
// DOM References
// ============================================================

// We'll use a function to get references, or you could pass them in
// For simplicity, we'll use a UI class/object

export const UI = {
    // Elements
    cityName: document.getElementById('cityName'),
    cityCountry: document.getElementById('cityCountry'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    weatherDesc: document.getElementById('weatherDesc'),
    updateTime: document.getElementById('updateTime'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    feelsLike: document.getElementById('feelsLike'),
    uvIndex: document.getElementById('uvIndex'),
    forecastGrid: document.getElementById('forecastGrid'),
    loading: document.getElementById('loading'),
    errorBox: document.getElementById('errorBox'),
    errorMessage: document.getElementById('errorMessage'),
    errorDetails: document.getElementById('errorDetails'),
    weatherDisplay: document.getElementById('weatherDisplay'),
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    unitBtn: document.getElementById('unitBtn'),
    refreshBtn: document.getElementById('refreshBtn'),

    /**
     * Show/hide loading state
     */
    showLoading(visible) {
        this.loading.classList.toggle('visible', visible);
        this.cityInput.disabled = visible;
        this.searchBtn.disabled = visible;
        this.locationBtn.disabled = visible;
        this.refreshBtn.disabled = visible;
    },

    /**
     * Show/hide weather display
     */
    showWeather(visible) {
        this.weatherDisplay.classList.toggle('visible', visible);
    },

    /**
     * Show error message
     */
    showError(message, details = null, type = 'error') {
        this.errorBox.className = `error-box ${type}`;
        this.errorMessage.textContent = message;
        if (details) {
            this.errorDetails.textContent = details;
            this.errorDetails.style.display = 'block';
        } else {
            this.errorDetails.style.display = 'none';
        }
        this.errorBox.classList.add('visible');
        clearTimeout(this.errorBox._timeout);
        this.errorBox._timeout = setTimeout(() => {
            this.errorBox.classList.remove('visible');
        }, 8000);
    },

    /**
     * Hide error
     */
    hideError() {
        this.errorBox.classList.remove('visible');
    },

    /**
     * Render current weather
     */
    renderCurrentWeather(weather, location, isCelsius) {
        const current = weather.current_weather;
        const now = new Date();

        this.cityName.textContent = location.name;
        this.cityCountry.textContent = location.country || '';

        this.temperature.innerHTML =
            `${formatTempValue(current.temperature, isCelsius)}<span class="degree">${getUnitSymbol(isCelsius)}</span>`;

        const weatherInfo = getWeatherIcon(current.weathercode);
        this.weatherIcon.textContent = weatherInfo.icon;
        this.weatherDesc.textContent = weatherInfo.label;

        this.updateTime.textContent = `Last updated: ${formatTime(now)}`;

        this.humidity.textContent = weather.current_weather.relative_humidity !== undefined ?
            `${weather.current_weather.relative_humidity}%` :
            '—';

        const windKmh = current.windspeed || 0;
        const windValue = isCelsius ? windKmh : windKmh * 0.621371;
        this.windSpeed.textContent = `${windValue.toFixed(1)} ${getWindUnit(isCelsius)}`;

        this.feelsLike.textContent = `${formatTempValue(current.temperature, isCelsius)}${getUnitSymbol(isCelsius)}`;

        if (weather.daily && weather.daily.uv_index_max && weather.daily.uv_index_max.length > 0) {
            this.uvIndex.textContent = weather.daily.uv_index_max[0] !== undefined ?
                weather.daily.uv_index_max[0].toFixed(1) :
                '—';
        } else {
            this.uvIndex.textContent = '—';
        }

        // Update page title
        document.title = `Weather: ${location.name} | Weather App`;
    },

    /**
     * Render forecast
     */
    renderForecast(weather, isCelsius) {
        if (!weather.daily) {
            this.forecastGrid.innerHTML = '<p style="color: #94a3b8;">No forecast data available.</p>';
            return;
        }

        const days = weather.daily.time.length;
        const maxTemps = weather.daily.temperature_2m_max || [];
        const minTemps = weather.daily.temperature_2m_min || [];
        const codes = weather.daily.weathercode || [];

        let html = '';

        for (let i = 0; i < Math.min(days, 7); i++) {
            const dayName = i === 0 ? 'Today' : getDayName(weather.daily.time[i]);
            const weatherInfo = getWeatherIcon(codes[i] || 0);
            const maxTemp = maxTemps[i] !== undefined ? formatTempValue(maxTemps[i], isCelsius) : '—';
            const minTemp = minTemps[i] !== undefined ? formatTempValue(minTemps[i], isCelsius) : '—';

            html += `
                <div class="forecast-day">
                    <div class="day-name">${dayName}</div>
                    <span class="day-icon">${weatherInfo.icon}</span>
                    <div class="day-temp">
                        ${maxTemp}°<span class="temp-low">${minTemp}°</span>
                    </div>
                </div>
            `;
        }

        this.forecastGrid.innerHTML = html;
    },

    /**
     * Render all weather data
     */
    renderAll(weather, location, isCelsius) {
        this.renderCurrentWeather(weather, location, isCelsius);
        this.renderForecast(weather, isCelsius);
        this.showWeather(true);
    },

    /**
     * Update unit button state
     */
    updateUnitButton(isCelsius) {
        this.unitBtn.textContent = isCelsius ? '°F' : '°C';
        this.unitBtn.classList.toggle('active', !isCelsius);
    },

    /**
     * Set city input value
     */
    setCity(value) {
        this.cityInput.value = value;
    },

    /**
     * Get city input value
     */
    getCity() {
        return this.cityInput.value.trim();
    }
};

// Export individual elements for convenience
export const {
    cityName,
    cityCountry,
    weatherIcon,
    temperature,
    weatherDesc,
    updateTime,
    humidity,
    windSpeed,
    feelsLike,
    uvIndex,
    forecastGrid,
    loading,
    errorBox,
    errorMessage,
    errorDetails,
    weatherDisplay,
    cityInput,
    searchBtn,
    locationBtn,
    unitBtn,
    refreshBtn
} = UI;