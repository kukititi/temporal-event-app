import { useEffect, useState } from "react";

import "../styles/events.css";

function Events() {
  const [events, setEvents] = useState([]);

  const filters = ["Todos", "Gaming", "Música", "Anime", "Tecnología"];

  async function fetchEvents() {
    try {
      const response = await fetch("http://localhost:3000/events");

      const data = await response.json();

      console.log(data);

      setEvents(data);
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
        />
      </div>

      <div className="filters-container">
        {filters.map((filter, index) => (
          <button key={index} className="filter-button">
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
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-image"></div>

            <div className="event-info">
              <h2>{event.title}</h2>

              <p>{event.category}</p>

              <span>{event.location}</span>

              <div className="event-address">📍 {event.address}</div>

              <small>{event.distance}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Events;
