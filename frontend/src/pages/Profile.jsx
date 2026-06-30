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

  const [editingProfile, setEditingProfile] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newAvatar, setNewAvatar] = useState(user?.avatar_url || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newCity, setNewCity] = useState(user?.city || "");
  const [showAllInterests, setShowAllInterests] = useState(false);

  const [newAddress, setNewAddress] = useState(user?.address || "");

  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const [eventTitle, setEventTitle] = useState("");

  const [eventDescription, setEventDescription] = useState("");

  const [eventCategory, setEventCategory] = useState("");

  const [eventLocation, setEventLocation] = useState("");

  const [eventAddress, setEventAddress] = useState("");

  const [eventDate, setEventDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventImage, setEventImage] = useState("");

  const [editingEventId, setEditingEventId] = useState(null);

  const [myEvents, setMyEvents] = useState([]);

  const [showAttendedEvents, setShowAttendedEvents] = useState(false);

  const [showCreatedEvents, setShowCreatedEvents] = useState(false);

  const [selectedEventAttendees, setSelectedEventAttendees] = useState([]);

  const [openAttendeesEvent, setOpenAttendeesEvent] = useState(null);

  const [stats, setStats] = useState(null);

  const [favoriteEvents, setFavoriteEvents] = useState([]);

  const [showFavorites, setShowFavorites] = useState(false);

  const [eventAttendeesCount, setEventAttendeesCount] = useState({});

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

  // Limpia por completo el formulario de evento (campos + modo edición).
  // Se usa al crear, al terminar una edición y al abrir el form para crear.
  function resetEventForm() {
    setEditingEventId(null);
    setEventTitle("");
    setEventDescription("");
    setEventCategory("");
    setEventLocation("");
    setEventAddress("");
    setEventDate("");
    setEventEndDate("");
    setEventImage("");
  }

  // Sube la imagen de portada como archivo (la reduce y guarda en base64)
  function handleEventImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const max = 800;
        let width = img.width;
        let height = img.height;
        if (width > max) {
          height = (height * max) / width;
          width = max;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        setEventImage(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function createEvent() {
    if (!eventDate || !eventEndDate) {
      alert("Debes indicar fecha/hora de inicio y de fin.");
      return;
    }
    if (new Date(eventEndDate) <= new Date(eventDate)) {
      alert("La hora de fin debe ser posterior a la de inicio.");
      return;
    }
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
          end_date: eventEndDate,
          image_url: eventImage,
          created_by: user.id,
        }),
      });

      const data = await response.json();

      console.log(data);

      alert("Evento creado 🚀");

      resetEventForm();

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
          end_date: eventEndDate,
          image_url: eventImage,
        }),
      });

      const updatedEvent = await response.json();

      setMyEvents(
        myEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event,
        ),
      );

      resetEventForm();

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

    setEventEndDate(event.end_date ? event.end_date.slice(0, 16) : "");
    setEventImage(event.image_url || "");

    setShowCreateEvent(true);
  }

  async function fetchMyEvents() {
    try {
      const response = await fetch(`${API_URL}/events/creator/${user.id}`);

      const data = await response.json();

      setMyEvents(data);

      data.forEach((event) => {
        fetchAttendeesCount(event.id);
      });
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

  async function fetchAttendeesCount(eventId) {
    try {
      const response = await fetch(
        `${API_URL}/events/${eventId}/attendees-count`,
      );

      const data = await response.json();

      setEventAttendeesCount((prev) => ({
        ...prev,
        [eventId]: data.attendees,
      }));
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

  // Intereses reales del usuario (elegidos al registrarse o editados luego)
  const interests = Array.isArray(user?.interests) ? user.interests : [];

  useEffect(() => {
    const loadData = async () => {
      await fetchAttendedEvents();
      await fetchMyEvents();
      await fetchStats();
      await fetchFavorites();
    };

    loadData();
  }, []);

  async function updateProfile() {
    try {
      const response = await fetch(`${API_URL}/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          avatar_url: newAvatar,
          address: newAddress,
          email: newEmail,
          city: newCity,
        }),
      });

      if (!response.ok) {
        alert("No se pudo actualizar el perfil (codigo " + response.status + ").");
        return;
      }

      const updatedUser = await response.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditingProfile(false);
      window.location.reload();
    } catch (error) {
      console.log(error);
      alert("Error de conexion al actualizar el perfil.");
    }
  }

  // Sube una imagen como ARCHIVO: la reduce a 256px y la guarda como
  // base64 en avatar_url (sin necesidad de almacenamiento externo).
  function handleAvatarFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const max = 256;
        let width = img.width;
        let height = img.height;
        if (width > height && width > max) {
          height = (height * max) / width;
          width = max;
        } else if (height > max) {
          width = (width * max) / height;
          height = max;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        setNewAvatar(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        {editingProfile ? (
          <label className="avatar-edit">
            <img
              src={
                newAvatar ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Perfil"
              className="profile-image"
            />
            <span className="avatar-edit-badge">
              <img src="/edit-icon.png" alt="Editar" />
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFile}
              style={{ display: "none" }}
            />
          </label>
        ) : (
          <img
            src={
              user?.avatar_url ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
            alt="Perfil"
            className="profile-image"
          />
        )}

        <h2>@{user?.username || "Usuario"}</h2>

        {editingProfile ? (
          <div className="profile-edit-form">
            <label className="field-label">
              <img src="/edit-icon.png" className="field-icon" alt="" />
              Nombre
            </label>
            <input
              className="address-input"
              type="text"
              placeholder="Tu nombre"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <label className="field-label">
              <img src="/edit-icon.png" className="field-icon" alt="" />
              Correo
            </label>
            <input
              className="address-input"
              type="email"
              placeholder="Tu correo"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <label className="field-label">
              <img src="/edit-icon.png" className="field-icon" alt="" />
              Ciudad
            </label>
            <input
              className="address-input"
              type="text"
              placeholder="Tu ciudad"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />

            <label className="field-label">
              <img src="/edit-icon.png" className="field-icon" alt="" />
              Dirección
            </label>
            <input
              className="address-input"
              type="text"
              placeholder="Tu dirección"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />

            <a className="profile-link-btn" href="/intereses">
              ✏️ Editar intereses
            </a>

            <div className="event-actions">
              <button className="save-button" onClick={updateProfile}>
                Guardar
              </button>
              <button
                className="profile-cancel-btn"
                onClick={() => setEditingProfile(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3>{user?.name || user?.username || "Sin nombre"}</h3>

            <div className="profile-fields">
              <div className="profile-field">
                <span className="pf-label">Correo</span>
                <span className="pf-value">{user?.email || "—"}</span>
              </div>
              <div className="profile-field">
                <span className="pf-label">Ciudad</span>
                <span className="pf-value">{user?.city || "—"}</span>
              </div>
              <div className="profile-field">
                <span className="pf-label">Dirección</span>
                <span className="pf-value">{user?.address || "—"}</span>
              </div>
            </div>

            <button
              className="profile-edit-btn"
              onClick={() => {
                setNewName(user?.name || "");
                setNewAvatar(user?.avatar_url || "");
                setNewAddress(user?.address || "");
                setNewEmail(user?.email || "");
                setNewCity(user?.city || "");
                setEditingProfile(true);
              }}
            >
              ✏️ Editar perfil
            </button>
          </>
        )}
      </div>

      <div className="profile-interests">
        <h2>Intereses</h2>

        <div className="interests-container">
          {interests.length === 0 ? (
            <p>Aún no has elegido intereses.</p>
          ) : (
            (showAllInterests ? interests : interests.slice(0, 6)).map(
              (interest, index) => (
                <div key={index} className="interest-tag">
                  {interest}
                </div>
              ),
            )
          )}
        </div>

        {interests.length > 6 && (
          <button
            className="show-more-btn"
            onClick={() => setShowAllInterests(!showAllInterests)}
          >
            {showAllInterests
              ? "Mostrar menos ▲"
              : `Mostrar más (${interests.length - 6}) ▼`}
          </button>
        )}
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
      {organizerMode && stats && (
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

              <label className="event-image-upload">
                {eventImage ? (
                  <img
                    src={eventImage}
                    alt="Portada"
                    className="event-image-preview"
                  />
                ) : (
                  <span>📷 Subir imagen de portada</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEventImage}
                  style={{ display: "none" }}
                />
              </label>

              <label className="event-field-label">Inicio</label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />

              <label className="event-field-label">Fin</label>
              <input
                type="datetime-local"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
              />

              <div className="event-actions">
                <button
                  className="create-event-button"
                  onClick={editingEventId ? updateEvent : createEvent}
                >
                  {editingEventId ? "Guardar Cambios" : "Guardar Evento"}
                </button>

                <button
                  className="create-event-button"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                  }}
                  onClick={() => {
                    resetEventForm();
                    setShowCreateEvent(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <button
            className="create-event-button"
            onClick={() => {
              const abriendo = !showCreateEvent;
              setShowCreateEvent(abriendo);
              // Al ABRIR para crear, limpiamos cualquier rastro de una edición previa
              if (abriendo) resetEventForm();
            }}
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

                      <p className="attendees-counter">
                        👥 {eventAttendeesCount[event.id] || 0} asistentes
                      </p>

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