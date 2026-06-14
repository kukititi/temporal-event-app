import { useEffect, useState } from "react";
import "../styles/profile.css";
import API_URL from "../config/api";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [attendedEvents, setAttendedEvents] = useState([]);

  const [organizerMode, setOrganizerMode] = useState(
    user?.organizer_mode || false,
  );

  async function fetchAttendedEvents() {
    try {
      if (!user) return;

      const response = await fetch(
        `${API_URL}/users/${user.id}/attended-events`,
      );

      const data = await response.json();

      setAttendedEvents(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function toggleOrganizerMode() {
    try {
      const response = await fetch(
        `${API_URL}/users/${user.id}/organizer-mode`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organizer_mode: !organizerMode,
          }),
        },
      );

      const updatedUser = await response.json();

      setOrganizerMode(updatedUser.organizer_mode);

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.log(error);
    }
  }

  const interests = [
    "Gaming",
    "Música",
    "Tecnología",
    "Anime",
    "Robótica",
    "Películas",
  ];

  useEffect(() => {
    const loadAttendedEvents = async () => {
      await fetchAttendedEvents();
    };

    loadAttendedEvents();
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
          alt="Perfil"
          className="profile-image"
        />

        <h2>@{user?.username || "Usuario"}</h2>

        <h3>{user?.username || "Sin nombre"}</h3>

        <p>{user?.email || "Sin correo"}</p>

        <span>📍 {user?.city || "Sin ciudad"}</span>
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
          {attendedEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>

              <p>{event.category}</p>

              <small>📍 {event.location}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="profile-organizer">
        <h2>Modo Organizador</h2>

        <button className="organizer-button" onClick={toggleOrganizerMode}>
          {organizerMode ? "✓ Organizador Activo" : "Activar Modo Organizador"}
        </button>
      </div>
      {organizerMode && (
        <div className="organizer-panel">
          <h2>Panel de Organizador</h2>

          <button>Crear Evento</button>

          <button>Mis Eventos</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
