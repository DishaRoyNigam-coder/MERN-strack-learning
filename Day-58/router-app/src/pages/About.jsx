// src/pages/About.jsx

import './About.css';

function About() {
  return (
    <div className="page about-page">
      <h1>📖 About Us</h1>
      <div className="about-content">
        <div className="about-card">
          <h2>Our Mission</h2>
          <p>
            We're building the next generation of web applications using React
            and modern JavaScript. Our goal is to create fast, responsive, and
            accessible user experiences.
          </p>
        </div>

        <div className="about-card">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <span className="member-avatar">👩‍💻</span>
              <h4>Alice Johnson</h4>
              <p>Lead Developer</p>
            </div>
            <div className="team-member">
              <span className="member-avatar">👨‍💻</span>
              <h4>Bob Smith</h4>
              <p>UI/UX Designer</p>
            </div>
            <div className="team-member">
              <span className="member-avatar">🧑‍💻</span>
              <h4>Carol Davis</h4>
              <p>DevOps Engineer</p>
            </div>
          </div>
        </div>

        <div className="about-card">
          <h2>Technologies We Use</h2>
          <div className="tech-tags">
            <span className="tech-tag">React</span>
            <span className="tech-tag">React Router</span>
            <span className="tech-tag">Vite</span>
            <span className="tech-tag">CSS3</span>
            <span className="tech-tag">JavaScript</span>
            <span className="tech-tag">ES6+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;