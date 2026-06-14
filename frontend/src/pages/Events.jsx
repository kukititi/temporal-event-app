import { useEffect, useState } from "react";

import "../styles/events.css";
import API_URL from "../config/api";

function Events() {
  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("Todos");

  const [attendees, setAttendees] = useState({});

  const [attendingEvents, setAttendingEvents] = useState({});

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

      console.log(data);

      setEvents(data);

      data.forEach((event) => {
        fetchAttendees(event.id);
        checkAttendance(event.id);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchAttendees(eventId) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/attendees`);

      const data = await response.json();

      setAttendees((prev) => ({
        ...prev,
        [eventId]: data.attendees,
      }));
    } catch (error) {
      console.log(error);
    }
  }

  async function checkAttendance(eventId) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

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

  async function attendEvent(eventId) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

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

      alert("Asistencia registrada");
    } catch (error) {
      console.log(error);
    }
  }

  async function cancelAttendance(eventId) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

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

  useEffect(() => {
    const loadEvents = async () => {
      await fetchEvents();
    };

    loadEvents();
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
        {filteredEvents.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-image"></div>

            <div className="event-info">
              <h2>{event.title}</h2>

              <p>{event.category}</p>

              <span>{event.location}</span>

              <div className="event-address">📍 {event.address}</div>

              <small>{event.distance}</small>

              <p className="attendees-count">
                👥 {attendees[event.id] || 0} asistentes
              </p>

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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Events;
