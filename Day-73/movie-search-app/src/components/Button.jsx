// src/components/Button.jsx

import PropTypes from 'prop-types';
import './Button.css';

function Button({ children, onClick, variant = 'primary', size = 'medium', disabled = false, className = '' }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
  };

  const sizes = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg',
  };

  return (
    <button
      className={`btn ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;