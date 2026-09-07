// src/components/RegistrationForm.jsx

import { useState, useRef } from 'react';
import './RegistrationForm.css';

function RegistrationForm() {
  // ============================================================
  // 1. CONTROLLED INPUTS (State)
  // ============================================================
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    termsAccepted: false,
  });

  // For error messages
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ============================================================
  // 2. UNCONTROLLED INPUT (File input with ref)
  // ============================================================
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // ============================================================
  // 3. VALIDATION FUNCTION
  // ============================================================
  const validateForm = (data) => {
    const newErrors = {};

    // Username: required, min 3 chars
    if (!data.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (data.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (data.username.length > 20) {
      newErrors.username = 'Username must be at most 20 characters';
    }

    // Email: required, valid format
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password: required, min 8 chars, with mix
    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and a number';
    }

    // Confirm Password: must match
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms: must be accepted
    if (!data.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms';
    }

    return newErrors;
  };

  // ============================================================
  // 4. HANDLERS
  // ============================================================

  // Handler for controlled inputs
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handler for file input (uncontrolled)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for blur (to mark fields as touched)
  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate single field on blur
    const fieldErrors = validateField(name, formData[name]);
    if (fieldErrors) {
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors,
      }));
    }
  };

  // Validate a single field
  const validateField = (name, value) => {
    const fieldErrors = validateForm({ ...formData, [name]: value });
    return fieldErrors[name] || null;
  };

  // Submit handler
  const handleSubmit = (event) => {
    event.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        console.log('✅ Form submitted:', {
          ...formData,
          avatar: fileInputRef.current?.files[0]?.name || 'No file',
        });
        // Reset form after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          resetForm();
        }, 3000);
      }, 1500);
    } else {
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      termsAccepted: false,
    });
    setErrors({});
    setTouched({});
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================
  // 5. RENDER HELPERS
  // ============================================================

  const isFieldValid = (name) => {
    return touched[name] && !errors[name];
  };

  const isFieldInvalid = (name) => {
    return touched[name] && errors[name];
  };

  const getFieldClass = (name) => {
    if (isFieldValid(name)) return 'valid';
    if (isFieldInvalid(name)) return 'invalid';
    return '';
  };

  const isFormValid = () => {
    const validationErrors = validateForm(formData);
    return Object.keys(validationErrors).length === 0;
  };

  // ============================================================
  // 6. RENDER
  // ============================================================

  if (submitSuccess) {
    return (
      <div className="form-container">
        <div className="success-card">
          <span className="success-icon">🎉</span>
          <h2>Registration Successful!</h2>
          <p>Welcome, {formData.username}!</p>
          <p className="success-detail">
            We've sent a confirmation email to {formData.email}
          </p>
          <button className="reset-btn" onClick={resetForm}>
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <header className="form-header">
          <h1>📝 Create Account</h1>
          <p>Join our community today</p>
          <div className="form-badge">
            {Object.keys(errors).length > 0 ? (
              <span className="badge-error">⚠️ {Object.keys(errors).length} errors</span>
            ) : (
              <span className="badge-valid">✅ All fields valid</span>
            )}
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          {/* ============================================================
              CONTROLLED INPUT: Username
              ============================================================ */}
          <div className="form-group">
            <label htmlFor="username">
              Username <span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClass('username')}
              autoFocus
            />
            {isFieldValid('username') && (
              <span className="valid-message">✅ Looks good!</span>
            )}
            {isFieldInvalid('username') && (
              <span className="error-message">{errors.username}</span>
            )}
            <span className="hint">3-20 characters</span>
          </div>

          {/* ============================================================
              CONTROLLED INPUT: Email
              ============================================================ */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClass('email')}
            />
            {isFieldValid('email') && (
              <span className="valid-message">✅ Valid email</span>
            )}
            {isFieldInvalid('email') && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* ============================================================
              CONTROLLED INPUT: Password
              ============================================================ */}
          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClass('password')}
            />
            {isFieldValid('password') && (
              <span className="valid-message">✅ Strong password</span>
            )}
            {isFieldInvalid('password') && (
              <span className="error-message">{errors.password}</span>
            )}
            <span className="hint">
              Minimum 8 chars, mix of upper/lower/numbers
            </span>
            {/* Password strength indicator */}
            {formData.password && (
              <div className="strength-bar">
                <div
                  className={`strength-fill strength-${getPasswordStrength(formData.password)}`}
                  style={{
                    width: `${(formData.password.length / 12) * 100}%`,
                    maxWidth: '100%',
                  }}
                />
              </div>
            )}
          </div>

          {/* ============================================================
              CONTROLLED INPUT: Confirm Password
              ============================================================ */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClass('confirmPassword')}
            />
            {isFieldValid('confirmPassword') && (
              <span className="valid-message">✅ Passwords match</span>
            )}
            {isFieldInvalid('confirmPassword') && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* ============================================================
              CONTROLLED INPUT: Select (Role)
              ============================================================ */}
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">👤 User</option>
              <option value="moderator">🛡️ Moderator</option>
              <option value="admin">🔑 Admin</option>
            </select>
          </div>

          {/* ============================================================
              UNCONTROLLED INPUT: File (Avatar)
              ============================================================ */}
          <div className="form-group">
            <label>Profile Picture</label>
            <div className="file-upload">
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" />
                ) : (
                  <span className="avatar-placeholder">👤</span>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                id="avatar"
              />
              <label htmlFor="avatar" className="file-label">
                {avatarPreview ? 'Change Picture' : 'Upload Picture'}
              </label>
              <span className="hint">Optional (max 5MB)</span>
            </div>
          </div>

          {/* ============================================================
              CONTROLLED INPUT: Checkbox (Terms)
              ============================================================ */}
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className={getFieldClass('termsAccepted')}
            />
            <label htmlFor="termsAccepted">
              I accept the <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <span className="required"> *</span>
            </label>
            {isFieldInvalid('termsAccepted') && (
              <span className="error-message">{errors.termsAccepted}</span>
            )}
          </div>

          {/* ============================================================
              SUBMIT BUTTON
              ============================================================ */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? '⏳ Creating account...' : '🚀 Register'}
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              🔄 Reset
            </button>
          </div>
        </form>

        {/* ============================================================
            FORM STATS
            ============================================================ */}
        <div className="form-stats">
          <span>
            📝 {Object.values(formData).filter(v => v !== '' && v !== false).length} /{' '}
            {Object.keys(formData).length} fields filled
          </span>
          <span>❌ {Object.keys(errors).length} errors</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 7. HELPER: Password Strength
// ============================================================
function getPasswordStrength(password) {
  if (password.length === 0) return 'none';
  if (password.length < 4) return 'weak';
  if (password.length < 8) return 'medium';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 4) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
}

export default RegistrationForm;