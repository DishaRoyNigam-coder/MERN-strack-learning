// src/components/TemperatureInput.jsx

import './TemperatureInput.css';

function TemperatureInput({
  label,
  value,
  onChange,
  unit,
  placeholder = 'Enter temperature...',
  disabled = false,
  min = -273.15,
  max = 1000
}) {
  // Handle input change
  const handleChange = (event) => {
    const inputValue = event.target.value;

    // Allow empty input (user deleting content)
    if (inputValue === '') {
      onChange('');
      return;
    }

    // Parse the input as a number
    const numValue = parseFloat(inputValue);

    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      // Clamp the value to min/max
      const clampedValue = Math.min(Math.max(numValue, min), max);
      onChange(clampedValue.toString());
    }
  };

  // Handle blur: validate and format
  const handleBlur = () => {
    if (value !== '' && !isNaN(parseFloat(value))) {
      // Round to 2 decimal places on blur for cleaner display
      const rounded = parseFloat(value).toFixed(2);
      onChange(rounded);
    }
  };

  return (
    <div className="temperature-input-container">
      <label className="input-label">{label}</label>
      <div className="input-wrapper">
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`temperature-input ${disabled ? 'disabled' : ''}`}
          min={min}
          max={max}
        />
        <span className="unit-badge">{unit}</span>
      </div>
    </div>
  );
}

export default TemperatureInput;