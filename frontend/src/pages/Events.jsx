import { useEffect, useMemo, useState } from "react";

import "../styles/events.css";
import API_URL from "../config/api";
import { googleCalendarUrl } from "../config/googleCalendar";
import {
  formatEventRange,
  eventStatus,
  statusLabel,
} from "../config/dateUtils";
import EventDetailModal from "../components/EventDetailModal";

// Ubicación por defecto (Av. Ejército 441) para ordenar por cercanía
// cuando el navegador no entrega la geolocalización.
const DEFAULT_LOCATION = { lat: -33.45249721842194, lng: -70.66111896424796 };

function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function Events() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("Todos");

  // Ordenamiento: "none" | "cercanos" | "tendencias" | "recientes"
  const [sortMode, setSortMode] = useState("none");

  const [userLocation, setUserLocation] = useState(null);

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

  // Aplica el ordenamiento elegido con las etiquetas de abajo.
  const visibleEvents = useMemo(() => {
    const list = [...filteredEvents];
    const origin = userLocation || DEFAULT_LOCATION;

    if (sortMode === "cercanos") {
      return list.sort((a, b) => {
        const da =
          a.latitude != null && a.longitude != null
            ? distanceKm(origin, { lat: a.latitude, lng: a.longitude })
            : Infinity;
        const db =
          b.latitude != null && b.longitude != null
            ? distanceKm(origin, { lat: b.latitude, lng: b.longitude })
            : Infinity;
        return da - db;
      });
    }

    if (sortMode === "tendencias") {
      return list.sort((a, b) => {
        const asis = (attendees[b.id] || 0) - (attendees[a.id] || 0);
        if (asis !== 0) return asis;
        const ra = ratings[a.id]?.average || 0;
        const rb = ratings[b.id]?.average || 0;
        return rb - ra;
      });
    }

    if (sortMode === "recientes") {
      return list.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    }

    return list;
  }, [filteredEvents, sortMode, userLocation, attendees, ratings]);

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

  // Ubicación del usuario (para ordenar por cercanía).
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_LOCATION);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUserLocation(DEFAULT_LOCATION),
    );
  }, []);

  // Alterna el orden: si tocas la etiqueta activa, se desactiva.
  function toggleSort(mode) {
    setSortMode((prev) => (prev === mode ? "none" : mode));
  }

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
        <button
          className={`sort-button ${sortMode === "cercanos" ? "active-sort" : ""}`}
          onClick={() => toggleSort("cercanos")}
        >
          📍 Cercanos
        </button>

        <button
          className={`sort-button ${sortMode === "tendencias" ? "active-sort" : ""}`}
          onClick={() => toggleSort("tendencias")}
        >
          🔥 Tendencias
        </button>

        <button
          className={`sort-button ${sortMode === "recientes" ? "active-sort" : ""}`}
          onClick={() => toggleSort("recientes")}
        >
          🕒 Recientes
        </button>
      </div>

      <div className="events-list">
        {visibleEvents.length === 0 ? (
          <p className="events-empty">No se encontraron eventos.</p>
        ) : (
          visibleEvents.map((event) => {
            const status = eventStatus(event);
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
                  <span className={`status-badge status-${status}`}>
                    {statusLabel(event)}
                  </span>
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