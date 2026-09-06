// src/components/ProfileCard.jsx

import PropTypes from 'prop-types';

function ProfileCard({ name, age, occupation, isOnline, avatar, children }) {
  return (
    <div className="profile-card">
      <div className="profile-avatar">
        {avatar ? <img src={avatar} alt={`${name}'s avatar`} /> : "👤"}
      </div>
      <h2 className="profile-name">{name}</h2>
      <p className="profile-age">Age: {age}</p>
      <p className="profile-occupation">💼 {occupation}</p>
      <p className="profile-status">
        Status: {isOnline ? "🟢 Online" : "🔴 Offline"}
      </p>
      {children && (
        <div className="profile-extra">
          {children}
        </div>
      )}
    </div>
  );
}

// Default props
ProfileCard.defaultProps = {
  name: "Unknown User",
  age: "N/A",
  occupation: "Not specified",
  isOnline: false,
  avatar: null
};

// Prop types
ProfileCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  occupation: PropTypes.string,
  isOnline: PropTypes.bool,
  avatar: PropTypes.string,
  children: PropTypes.node
};

export default ProfileCard;