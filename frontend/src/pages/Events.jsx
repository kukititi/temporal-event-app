import { useEffect, useState } from "react";

import "../styles/events.css";
import API_URL from "../config/api";
import { googleCalendarUrl } from "../config/googleCalendar";
import { formatEventRange, hasEnded } from "../config/dateUtils";
import EventDetailModal from "../components/EventDetailModal";

function Events() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("Todos");

  const [attendees, setAttendees] = useState({});

  const [attendingEvents, setAttendingEvents] = useState({});

  const [favoriteEvents, setFavoriteEvents] = useState({});

  const [ratings, setRatings] = useState({});

  // Evento abierto en el modal de detalle (null = cerrado)
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filters = ["Todos", "Gaming", "Música", "Anime", "Tecnología"];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.category.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      selectedFilter === "Todos" || event.category === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  async function fetchEvents() {
    try {
      const response = await fetch(`${API_URL}/events`);

      const data = await response.json();

      setEvents(data);

      data.forEach((event) => {
        fetchAttendees(event.id);
        checkAttendance(event.id);
        checkFavorite(event.id);
        fetchRating(event.id);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchAttendees(eventId) {
    try {
      const response = await fetch(
        `${API_URL}/events/${eventId}/attendees-count`,
      );

      const data = await response.json();

      setAttendees((prev) => ({
        ...prev,
        [eventId]: data.attendees,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchRating(eventId) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/rating`);

      const data = await response.json();

      setRatings((prev) => ({
        ...prev,
        [eventId]: data,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  async function checkAttendance(eventId) {
    try {
      if (!user) return;

      const response = await fetch(
        `${API_URL}/events/${eventId}/is-attending/${user.id}`,
      );

      const data = await response.json();

      setAttendingEvents((prev) => ({
        ...prev,
        [eventId]: data.attending,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  async function checkFavorite(eventId) {
    try {
      if (!user) return;

      const response = await fetch(
        `${API_URL}/events/${eventId}/is-favorite/${user.id}`,
      );

      const data = await response.json();

      setFavoriteEvents((prev) => ({
        ...prev,
        [eventId]: data.favorite,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  async function attendEvent(eventId) {
    try {
      if (!user) {
        alert("Debes iniciar sesión");
        return;
      }

      await fetch(`${API_URL}/events/${eventId}/attend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      fetchAttendees(eventId);

      setAttendingEvents((prev) => ({
        ...prev,
        [eventId]: true,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  async function cancelAttendance(eventId) {
    try {
      if (!user) return;

      await fetch(`${API_URL}/events/${eventId}/attend`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      fetchAttendees(eventId);

      setAttendingEvents((prev) => ({
        ...prev,
        [eventId]: false,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  async function toggleFavorite(eventId) {
    try {
      if (!user) return;

      if (favoriteEvents[eventId]) {
        await fetch(`${API_URL}/events/${eventId}/favorite`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        });
      } else {
        await fetch(`${API_URL}/events/${eventId}/favorite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        });
      }

      setFavoriteEvents((prev) => ({
        ...prev,
        [eventId]: !prev[eventId],
      }));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Descubrir Eventos</h1>

        <input
          type="text"
          placeholder="Buscar eventos..."
          className="search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filters-container">
        {filters.map((filter, index) => (
          <button
            key={index}
            className={`filter-button ${
              selectedFilter === filter ? "active-filter" : ""
            }`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="sort-container">
        <button className="sort-button">📍 Cercanos</button>

        <button className="sort-button">🔥 Tendencias</button>

        <button className="sort-button">🕒 Recientes</button>
      </div>

      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <p className="events-empty">No se encontraron eventos.</p>
        ) : (
          filteredEvents.map((event) => {
            const ended = hasEnded(event);
            const rating = ratings[event.id];

            return (
              <div key={event.id} className="event-card">
                <div
                  className="event-image"
                  style={
                    event.image_url
                      ? { backgroundImage: `url(${event.image_url})` }
                      : {}
                  }
                >
                  {ended && <span className="badge-ended">Finalizado</span>}
                </div>

                <div className="event-info">
                  <div className="event-info-head">
                    <h2>{event.title}</h2>
                    {event.category && (
                      <span className="event-badge">{event.category}</span>
                    )}
                  </div>

                  {rating && rating.count > 0 && (
                    <p className="event-rating-line">
                      ⭐ {Number(rating.average).toFixed(1)} ({rating.count})
                    </p>
                  )}

                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}

                  <p className="event-date-line">
                    🗓️ {formatEventRange(event)}
                  </p>

                  {event.location && (
                    <span className="event-location">🏷️ {event.location}</span>
                  )}

                  {event.address && (
                    <div className="event-address">📍 {event.address}</div>
                  )}

                  <p className="attendees-count">
                    👥 {attendees[event.id] || 0} asistentes
                  </p>

                  <button
                    className="details-button"
                    onClick={() => setSelectedEvent(event)}
                  >
                    🔍 Ver detalles y calificar
                  </button>

                  <button
                    className="favorite-button"
                    onClick={() => toggleFavorite(event.id)}
                  >
                    {favoriteEvents[event.id] ? "💖 Guardado" : "🤍 Guardar"}
                  </button>

                  {attendingEvents[event.id] ? (
                    <button
                      className="attend-button attending"
                      onClick={() => cancelAttendance(event.id)}
                    >
                      ✓ Asistirás
                    </button>
                  ) : (
                    <button
                      className="attend-button"
                      onClick={() => attendEvent(event.id)}
                    >
                      Asistiré
                    </button>
                  )}

                  <a
                    className="calendar-button"
                    href={googleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📅 Agregar a Google Calendar
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de detalle: ver descripción completa, calificar y comentar */}
      <EventDetailModal
        event={selectedEvent}
        user={user}
        onClose={() => {
          setSelectedEvent(null);
          // refrescamos la calificación de la tarjeta al cerrar
          if (selectedEvent) fetchRating(selectedEvent.id);
        }}
      />
    </div>
  );
}

export default Events;