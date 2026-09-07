// src/pages/Contact.jsx

import { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="page contact-page">
      <h1>📬 Contact Us</h1>
      <p>Have a question or feedback? We'd love to hear from you.</p>

      <div className="contact-container">
        <div className="contact-info">
          <div className="info-item">
            <span className="info-icon">📧</span>
            <div>
              <strong>Email</strong>
              <p>hello@example.com</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📞</span>
            <div>
              <strong>Phone</strong>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📍</span>
            <div>
              <strong>Address</strong>
              <p>123 Main St, City, Country</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message..."
              rows="5"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            {submitted ? '✅ Sent!' : 'Send Message'}
          </button>

          {submitted && (
            <p className="success-message">Thank you! We'll get back to you soon.</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Contact;