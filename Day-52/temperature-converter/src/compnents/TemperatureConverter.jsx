// src/components/TemperatureConverter.jsx

import { useState, useEffect } from 'react';
import TemperatureInput from './TemperatureInput';
import './TemperatureConverter.css';

// ============================================================
// 🚀 CONVERSION FUNCTIONS
// ============================================================

function celsiusToFahrenheit(celsius) {
  if (celsius === '' || isNaN(celsius)) return '';
  return (parseFloat(celsius) * 9 / 5 + 32).toFixed(2);
}

function fahrenheitToCelsius(fahrenheit) {
  if (fahrenheit === '' || isNaN(fahrenheit)) return '';
  return ((parseFloat(fahrenheit) - 32) * 5 / 9).toFixed(2);
}

// ============================================================
// 🚀 MAIN COMPONENT (State is Lifted to App)
// ============================================================

function TemperatureConverter() {
  // 🔥 STATE LIFTED TO THE PARENT (TemperatureConverter)
  // Both inputs share this single source of truth
  const [temperature, setTemperature] = useState({
    value: '',
    unit: 'c' // 'c' or 'f'
  });

  // Track the last changed unit (to prevent feedback loops)
  const [lastChanged, setLastChanged] = useState('c');

  // State for conversion info display
  const [conversionInfo, setConversionInfo] = useState({
    celsius: '',
    fahrenheit: ''
  });

  // State for history
  const [history, setHistory] = useState([]);

  // ============================================================
  // HANDLERS
  // ============================================================

  // Handle Celsius input change
  const handleCelsiusChange = (value) => {
    // If the value is empty, clear both fields
    if (value === '') {
      setTemperature({ value: '', unit: 'c' });
      setLastChanged('c');
      setConversionInfo({ celsius: '', fahrenheit: '' });
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const fahrenheitValue = celsiusToFahrenheit(numValue);
      setTemperature({ value: value, unit: 'c' });
      setLastChanged('c');
      setConversionInfo({
        celsius: value,
        fahrenheit: fahrenheitValue
      });
    }
  };

  // Handle Fahrenheit input change
  const handleFahrenheitChange = (value) => {
    if (value === '') {
      setTemperature({ value: '', unit: 'f' });
      setLastChanged('f');
      setConversionInfo({ celsius: '', fahrenheit: '' });
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const celsiusValue = fahrenheitToCelsius(numValue);
      setTemperature({ value: value, unit: 'f' });
      setLastChanged('f');
      setConversionInfo({
        celsius: celsiusValue,
        fahrenheit: value
      });
    }
  };

  // Handle clear all
  const handleClear = () => {
    setTemperature({ value: '', unit: 'c' });
    setLastChanged('c');
    setConversionInfo({ celsius: '', fahrenheit: '' });
  };

  // Handle swap units
  const handleSwap = () => {
    if (temperature.value === '' || isNaN(temperature.value)) return;

    if (temperature.unit === 'c') {
      const fahrenheitValue = celsiusToFahrenheit(temperature.value);
      setTemperature({ value: fahrenheitValue, unit: 'f' });
      setLastChanged('f');
      setConversionInfo({
        celsius: temperature.value,
        fahrenheit: fahrenheitValue
      });
    } else {
      const celsiusValue = fahrenheitToCelsius(temperature.value);
      setTemperature({ value: celsiusValue, unit: 'c' });
      setLastChanged('c');
      setConversionInfo({
        celsius: celsiusValue,
        fahrenheit: temperature.value
      });
    }
  };

  // Handle history entry
  const addHistory = () => {
    if (conversionInfo.celsius === '' || conversionInfo.fahrenheit === '') return;

    const newEntry = {
      id: Date.now(),
      celsius: parseFloat(conversionInfo.celsius).toFixed(2),
      fahrenheit: parseFloat(conversionInfo.fahrenheit).toFixed(2),
      timestamp: new Date().toLocaleTimeString()
    };

    setHistory(prev => [newEntry, ...prev.slice(0, 19)]);
  };

  // Handle clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Handle keyboard shortcut: Enter to add to history
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && temperature.value !== '') {
        addHistory();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [temperature, conversionInfo]);

  // ============================================================
  // DETERMINE WHICH VALUES TO DISPLAY
  // ============================================================

  // Celsius display value: always show the current celsius value
  const celsiusDisplay = temperature.unit === 'c' 
    ? temperature.value 
    : (temperature.value ? fahrenheitToCelsius(temperature.value) : '');

  // Fahrenheit display value: always show the current fahrenheit value
  const fahrenheitDisplay = temperature.unit === 'f' 
    ? temperature.value 
    : (temperature.value ? celsiusToFahrenheit(temperature.value) : '');

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="converter-container">
      <header className="converter-header">
        <h1>🌡️ Temperature Converter</h1>
        <p>Lifting State Up – Celsius ↔ Fahrenheit</p>
        <span className="badge">🧪 Shared state in parent component</span>
      </header>

      <div className="converter-card">
        {/* --- INPUTS --- */}
        <div className="inputs-row">
          {/* 🔥 LIFTED STATE: Both inputs share the same state through callbacks */}
          <TemperatureInput
            label="🌡️ Celsius"
            value={celsiusDisplay}
            onChange={handleCelsiusChange}
            unit="°C"
            placeholder="Enter °C"
            disabled={false}
            min={-273.15}
          />

          <div className="swap-section">
            <button 
              onClick={handleSwap} 
              className="swap-btn"
              disabled={temperature.value === ''}
              title="Swap values"
            >
              ⇄
            </button>
          </div>

          <TemperatureInput
            label="🌡️ Fahrenheit"
            value={fahrenheitDisplay}
            onChange={handleFahrenheitChange}
            unit="°F"
            placeholder="Enter °F"
            disabled={false}
            min={-459.67}
          />
        </div>

        {/* --- BUTTONS --- */}
        <div className="action-row">
          <button 
            onClick={addHistory} 
            className="btn-history"
            disabled={conversionInfo.celsius === ''}
          >
            📝 Save Conversion
          </button>
          <button onClick={handleClear} className="btn-clear">
            🗑️ Clear All
          </button>
        </div>

        {/* --- CONVERSION INFO --- */}
        <div className="conversion-info">
          <div className="info-card">
            <span className="info-label">📊 Result</span>
            <div className="info-values">
              <span className="value-pair">
                {conversionInfo.celsius ? `${conversionInfo.celsius}°C` : '—'}
                <span className="arrow">→</span>
                {conversionInfo.fahrenheit ? `${conversionInfo.fahrenheit}°F` : '—'}
              </span>
            </div>
          </div>

          <div className="info-card">
            <span className="info-label">📐 Formula</span>
            <div className="info-formula">
              <span>°F = (°C × 9/5) + 32</span>
              <span>°C = (°F − 32) × 5/9</span>
            </div>
          </div>
        </div>

        {/* --- HISTORY --- */}
        <div className="history-section">
          <div className="history-header">
            <span className="history-title">📋 Conversion History</span>
            <div className="history-actions">
              <span className="history-count">{history.length} entries</span>
              {history.length > 0 && (
                <button onClick={clearHistory} className="btn-clear-history">
                  Clear
                </button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="history-empty">
              <span className="empty-icon">📭</span>
              <p>No conversions saved yet.</p>
              <p className="empty-hint">Press Enter or click "Save Conversion"</p>
            </div>
          ) : (
            <ul className="history-list">
              {history.map((entry) => (
                <li key={entry.id} className="history-item">
                  <span className="history-value">
                    {entry.celsius}°C ↔ {entry.fahrenheit}°F
                  </span>
                  <span className="history-time">{entry.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- STATE VISUALIZATION --- */}
        <div className="state-visualization">
          <details>
            <summary>🔍 View Component State</summary>
            <pre className="state-json">
              {JSON.stringify({
                temperature: temperature,
                lastChanged: lastChanged,
                conversionInfo: conversionInfo,
                historyCount: history.length
              }, null, 2)}
            </pre>
          </details>
        </div>
      </div>

      <footer className="converter-footer">
        <p>
          💡 <strong>Lifting State Up:</strong> The temperature state lives in the 
          parent component and is passed down to both inputs via props.
        </p>
        <p>
          🎯 <strong>Single Source of Truth:</strong> Both inputs read from and 
          write to the same state.
        </p>
      </footer>
    </div>
  );
}

export default TemperatureConverter;