import { useEffect, useState } from "react";
import "../styles/profile.css";
import API_URL from "../config/api";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [attendedEvents, setAttendedEvents] = useState([]);

  const [organizerMode, setOrganizerMode] = useState(
    user?.organizer_mode || false,
  );

  const [editingAddress, setEditingAddress] = useState(false);

  const [newAddress, setNewAddress] = useState(user?.address || "");

  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const [eventTitle, setEventTitle] = useState("");

  const [eventDescription, setEventDescription] = useState("");

  const [eventCategory, setEventCategory] = useState("");

  const [eventLocation, setEventLocation] = useState("");

  const [eventAddress, setEventAddress] = useState("");

  const [eventDate, setEventDate] = useState("");

  const [myEvents, setMyEvents] = useState([]);

  const [showMyEvents, setShowMyEvents] = useState(false);

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

  async function updateAddress() {
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/address`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: newAddress,
        }),
      });

      const updatedUser = await response.json();

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditingAddress(false);

      alert("Dirección actualizada");
    } catch (error) {
      console.log(error);
    }
  }

  async function createEvent() {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
          category: eventCategory,
          location: eventLocation,
          address: eventAddress,
          event_date: eventDate,
          created_by: user.id,
        }),
      });

      const data = await response.json();

      console.log(data);

      alert("Evento creado 🚀");

      setEventTitle("");
      setEventDescription("");
      setEventCategory("");
      setEventLocation("");
      setEventAddress("");
      setEventDate("");

      setShowCreateEvent(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchMyEvents() {
    try {
      const response = await fetch(`${API_URL}/events/creator/${user.id}`);

      const data = await response.json();

      setMyEvents(data);
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

        <span>🌎 {user?.city || "Sin ciudad"}</span>

        {editingAddress ? (
          <div>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />

            <button onClick={updateAddress}>Guardar</button>
          </div>
        ) : (
          <div>
            <p>📍 {user?.address || "Sin dirección"}</p>

            <button onClick={() => setEditingAddress(true)}>Editar</button>
          </div>
        )}
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

          {showCreateEvent && (
            <div className="create-event-form">
              <input
                type="text"
                placeholder="Título"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />

              <textarea
                placeholder="Descripción"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />

              <input
                type="text"
                placeholder="Categoría"
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
              />

              <input
                type="text"
                placeholder="Ubicación"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />

              <input
                type="text"
                placeholder="Dirección"
                value={eventAddress}
                onChange={(e) => setEventAddress(e.target.value)}
              />

              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />

              <button onClick={createEvent}>Guardar Evento</button>
            </div>
          )}

          <button onClick={() => setShowCreateEvent(!showCreateEvent)}>
            Crear Evento
          </button>

          {showMyEvents && (
            <div className="my-events-section">
              <h2>Mis Eventos</h2>

              {myEvents.length === 0 ? (
                <p>No has creado eventos todavía.</p>
              ) : (
                myEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <h3>{event.title}</h3>

                    <p>{event.category}</p>

                    <p>{event.address}</p>

                    <small>{event.event_date}</small>
                  </div>
                ))
              )}
            </div>
          )}

          <button
            onClick={async () => {
              await fetchMyEvents();
              setShowMyEvents(!showMyEvents);
            }}
          >
            Mis Eventos
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;
