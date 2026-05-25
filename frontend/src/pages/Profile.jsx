import "../styles/profile.css";

function Profile() {
  const interests = [
    "Gaming",
    "Música",
    "Tecnología",
    "Anime",
    "Robótica",
    "Películas",
  ];

  const attendedEvents = [
    "Torneo de League of Legends",
    "Anime Expo 2026",
    "Meetup de Robótica",
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
          alt="Perfil"
          className="profile-image"
        />

        <h2>@BenjaTea</h2>

        <h3>Benjamin Manriquez</h3>

        <p>benja@email.com</p>

        <span>📍 Santiago, Chile</span>
      </div>

      <div className="profile-interests">
        <h2>Intereses</h2>

        <div className="interests-container">
          {interests.map((interest, index) => (
            <div key={index} className="interest-tag">
              {interest}
            </div>
          ))}
        </div>
      </div>

      <div className="profile-events">
        <h2>Eventos Asistidos</h2>

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
