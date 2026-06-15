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

  const [editingEventId, setEditingEventId] = useState(null);

  const [myEvents, setMyEvents] = useState([]);

  const [showAttendedEvents, setShowAttendedEvents] = useState(false);

  const [showCreatedEvents, setShowCreatedEvents] = useState(false);

  const [selectedEventAttendees, setSelectedEventAttendees] = useState([]);

  const [openAttendeesEvent, setOpenAttendeesEvent] = useState(null);

  const [stats, setStats] = useState(null);

  const [favoriteEvents, setFavoriteEvents] = useState([]);

  const [showFavorites, setShowFavorites] = useState(false);

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

  async function updateEvent() {
    try {
      const response = await fetch(`${API_URL}/events/${editingEventId}`, {
        method: "PUT",

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
        }),
      });

      const updatedEvent = await response.json();

      setMyEvents(
        myEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event,
        ),
      );

      setEditingEventId(null);

      setShowCreateEvent(false);

      alert("Evento actualizado 🚀");
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteEvent(eventId) {
    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este evento?",
    );

    if (!confirmDelete) return;

    try {
      await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
      });

      setMyEvents(myEvents.filter((event) => event.id !== eventId));

      alert("Evento eliminado");
    } catch (error) {
      console.log(error);
    }
  }

  function editEvent(event) {
    setEditingEventId(event.id);

    setEventTitle(event.title || "");
    setEventDescription(event.description || "");
    setEventCategory(event.category || "");
    setEventLocation(event.location || "");
    setEventAddress(event.address || "");

    if (event.event_date) {
      setEventDate(event.event_date.slice(0, 16));
    }

    setShowCreateEvent(true);
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

  async function fetchStats() {
    try {
      const response = await fetch(`${API_URL}/events/stats/${user.id}`);

      const data = await response.json();

      setStats(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchAttendeesForEvent(eventId) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/attendees`);

      const data = await response.json();

      setSelectedEventAttendees(data);

      setOpenAttendeesEvent(eventId);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchFavorites() {
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/favorites`);

      const data = await response.json();

      setFavoriteEvents(data);
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
    const loadData = async () => {
      await fetchAttendedEvents();
      await fetchMyEvents();
      await fetchStats();
      await fetchFavorites();
    };

    loadData();
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

            <button className="save-button" onClick={updateAddress}></button>
          </div>
        ) : (
          <div>
            <p>📍 {user?.address || "Sin dirección"}</p>

            <button
              className="edit-button"
              onClick={() => setEditingAddress(true)}
            ></button>
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
        <button
          className="accordion-button"
          onClick={() => setShowAttendedEvents(!showAttendedEvents)}
        >
          {showAttendedEvents ? "▼" : "▶"} Eventos Asistidos (
          {attendedEvents.length})
        </button>

        {showAttendedEvents && (
          <div className="profile-events-container">
            {attendedEvents.length === 0 ? (
              <p>No has asistido a eventos.</p>
            ) : (
              attendedEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h3>{event.title}</h3>

                  <p>{event.category}</p>

                  <small>📍 {event.location}</small>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="profile-favorites">
        <button
          className="accordion-button"
          onClick={() => setShowFavorites(!showFavorites)}
        >
          {showFavorites ? "▼" : "▶"} Favoritos ({favoriteEvents.length})
        </button>

        {showFavorites && (
          <div className="profile-events-container">
            {favoriteEvents.length === 0 ? (
              <p>No tienes favoritos.</p>
            ) : (
              favoriteEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h3>{event.title}</h3>

                  <p>{event.category}</p>

                  <small>📍 {event.location}</small>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {stats && (
        <div className="stats-card">
          <h3>📊 Estadísticas</h3>

          <p>Eventos creados: {stats.totalEvents}</p>

          <p>Asistentes totales: {stats.totalAttendees}</p>

          {stats.mostPopularEvent && (
            <p>
              Evento más popular: {stats.mostPopularEvent.title} (
              {stats.mostPopularEvent.attendees} asistentes)
            </p>
          )}
        </div>
      )}
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

              <button
                className="create-event-button"
                onClick={editingEventId ? updateEvent : createEvent}
              ></button>
            </div>
          )}

          <button
            className="create-event-button"
            onClick={() => setShowCreateEvent(!showCreateEvent)}
          >
            Crear Evento
          </button>

          <div className="my-events-section">
            <button
              className="accordion-button"
              onClick={() => setShowCreatedEvents(!showCreatedEvents)}
            >
              {showCreatedEvents ? "▼" : "▶"} Eventos Creados ({myEvents.length}
              )
            </button>

            {showCreatedEvents && (
              <>
                {myEvents.length === 0 ? (
                  <p>No has creado eventos.</p>
                ) : (
                  myEvents.map((event) => (
                    <div key={event.id} className="event-card">
                      <h3>{event.title}</h3>

                      <p>{event.category}</p>

                      <p>📍 {event.address}</p>

                      <small>
                        {new Date(event.event_date).toLocaleDateString()}
                      </small>
                      <button
                        className="attendees-button"
                        onClick={() => fetchAttendeesForEvent(event.id)}
                      >
                        👥 Ver asistentes
                      </button>
                      {openAttendeesEvent === event.id && (
                        <div className="attendees-list">
                          <h4>Asistentes</h4>

                          {selectedEventAttendees.length === 0 ? (
                            <p>No hay asistentes todavía.</p>
                          ) : (
                            selectedEventAttendees.map((attendee) => (
                              <div key={attendee.id} className="attendee-item">
                                👤 {attendee.username}
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {organizerMode && (
                        <div className="event-actions">
                          <button
                            className="edit-button"
                            onClick={() => editEvent(event)}
                          >
                            Editar
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => deleteEvent(event.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
