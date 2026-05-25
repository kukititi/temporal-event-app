import "../styles/profile.css";

function Profile() {
  const interests = ["Gaming", "Music", "Tech", "Anime", "Robotics", "Movies"];

  const attendedEvents = [
    "League of Legends Tournament",
    "Anime Expo 2026",
    "Robotics Meetup",
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
          alt="Profile"
          className="profile-image"
        />

        <h2>@BenjaTea</h2>

        <h3>Benjamin Manriquez</h3>

        <p>benja@email.com</p>

        <span>📍 Santiago, Chile</span>
      </div>

      <div className="profile-interests">
        <h2>Interests</h2>

        <div className="interests-container">
          {interests.map((interest, index) => (
            <div key={index} className="interest-tag">
              {interest}
            </div>
          ))}
        </div>
      </div>

      <div className="profile-events">
        <h2>Events Attended</h2>

        <div className="events-container">
          {attendedEvents.map((event, index) => (
            <div key={index} className="event-card">
              {event}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
