// src/App.jsx

import './App.css';
import ProfileCard from './components/ProfileCard';
import './components/ProfileCard.css';

function App() {
  // Sample user data
  const users = [
    {
      id: 1,
      name: "Alice Johnson",
      age: 28,
      occupation: "Frontend Developer",
      isOnline: true,
      avatar: "https://i.pravatar.cc/150?img=1",
      bio: "Passionate about building beautiful UIs."
    },
    {
      id: 2,
      name: "Bob Smith",
      age: 34,
      occupation: "Backend Engineer",
      isOnline: false,
      avatar: "https://i.pravatar.cc/150?img=2",
      bio: "Loves working with Node.js and databases."
    },
    {
      id: 3,
      name: "Carol Davis",
      age: 26,
      occupation: "UI/UX Designer",
      isOnline: true,
      avatar: "https://i.pravatar.cc/150?img=3",
      bio: "Creating delightful user experiences."
    },
    {
      id: 4,
      name: "David Wilson",
      age: 31,
      occupation: "DevOps Engineer",
      isOnline: false,
      avatar: "https://i.pravatar.cc/150?img=4",
      bio: "Automating everything possible."
    }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>👥 Team Directory</h1>
        <p>Get to know our amazing team members.</p>
      </header>

      <main className="team-grid">
        {/* Map over users and render a ProfileCard for each */}
        {users.map((user) => (
          <ProfileCard
            key={user.id}
            name={user.name}
            age={user.age}
            occupation={user.occupation}
            isOnline={user.isOnline}
            avatar={user.avatar}
          >
            {/* This is the children prop */}
            <p className="profile-bio">📝 {user.bio}</p>
          </ProfileCard>
        ))}
      </main>

      <footer className="app-footer">
        <p>© 2026 Team Directory. Built with React.</p>
      </footer>
    </div>
  );
}

export default App;