// src/components/RegistrationForm.jsx

import { useState } from 'react';
import './RegistrationForm.css';

function RegistrationForm() {
  // --- State for form fields ---
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    country: '',
    termsAccepted: false,
    newsletter: false
  });

  // --- State for errors ---
  const [errors, setErrors] = useState({});

  // --- State for submission ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- State for character count ---
  const [charCount, setCharCount] = useState(0);
  const maxBioLength = 200;

  // --- Handle input changes ---
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Update character count for bio
    if (name === 'bio') {
      setCharCount(value.length);
    }
  };

  // --- Handle file input (uncontrolled) ---
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};

    // First name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and a number';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Age
    if (formData.age && (formData.age < 13 || formData.age > 120)) {
      newErrors.age = 'Age must be between 13 and 120';
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }

    // Country
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }

    // Terms
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handle form submission ---
  const handleSubmit = (event) => {
    event.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        setSubmitted(true);
        setIsSubmitting(false);
        console.log('📋 Form submitted:', { ...formData, avatarFile });
      }, 1500);
    } else {
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // --- Reset form ---
  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      gender: '',
      country: '',
      termsAccepted: false,
      newsletter: false
    });
    setErrors({});
    setCharCount(0);
    setAvatarFile(null);
    setAvatarPreview(null);
    setSubmitted(false);
  };

  // --- Render success message ---
  if (submitted) {
    return (
      <div className="registration-container">
        <div className="registration-card success-card">
          <div className="success-icon">🎉</div>
          <h2>Registration Successful!</h2>
          <p>Thank you for registering, {formData.firstName}!</p>
          <div className="success-details">
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Country:</strong> {formData.country}</p>
            {formData.newsletter && <p>✅ Subscribed to newsletter</p>}
          </div>
          <button onClick={handleReset} className="submit-btn">
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2>📝 Create Account</h2>
        <p className="subtitle">Join our community today</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* -------- Personal Information -------- */}
          <fieldset>
            <legend>Personal Information</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g., John"
                  className={errors.firstName ? 'error' : ''}
                  autoFocus
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g., Doe"
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="18"
                min="13"
                max="120"
                className={errors.age ? 'error' : ''}
              />
              {errors.age && (
                <span className="error-message">{errors.age}</span>
              )}
              <span className="hint">Minimum 13 years old</span>
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? 'error' : ''}
              >
                <option value="">Select gender...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              {errors.gender && (
                <span className="error-message">{errors.gender}</span>
              )}
            </div>
          </fieldset>

          {/* -------- Account Details -------- */}
          <fieldset>
            <legend>Account Details</legend>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
              <span className="hint">
                Must include uppercase, lowercase, and a number
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={errors.country ? 'error' : ''}
              >
                <option value="">Select country...</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="BR">Brazil</option>
                <option value="IN">India</option>
                <option value="other">Other</option>
              </select>
              {errors.country && (
                <span className="error-message">{errors.country}</span>
              )}
            </div>
          </fieldset>

          {/* -------- Preferences -------- */}
          <fieldset>
            <legend>Preferences</legend>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="newsletter"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
              />
              <label htmlFor="newsletter">
                📨 Subscribe to our newsletter
                <span className="hint">(we'll send you updates)</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className={errors.termsAccepted ? 'error' : ''}
              />
              <label htmlFor="termsAccepted">
                I accept the Terms and Conditions *
                {errors.termsAccepted && (
                  <span className="error-message">{errors.termsAccepted}</span>
                )}
              </label>
            </div>
          </fieldset>

          {/* -------- Avatar Upload (Uncontrolled) -------- */}
          <fieldset>
            <legend>Profile Picture</legend>

            <div className="form-group avatar-group">
              <div className="avatar-upload">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
                ) : (
                  <div className="avatar-placeholder">👤</div>
                )}
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="avatar" className="file-label">
                  {avatarFile ? 'Change Picture' : 'Upload Picture'}
                </label>
              </div>
              {avatarFile && (
                <span className="file-name">📎 {avatarFile.name}</span>
              )}
              <span className="hint">(Optional) Upload a profile picture</span>
            </div>
          </fieldset>

          {/* -------- Form Actions -------- */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Registering...' : '🚀 Register'}
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              🔄 Reset
            </button>
          </div>
        </form>

        {/* -------- Form Stats -------- */}
        <div className="form-stats">
          <span>📝 {Object.values(formData).filter(v => v).length} fields filled</span>
          <span>❌ {Object.keys(errors).length} errors</span>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;
