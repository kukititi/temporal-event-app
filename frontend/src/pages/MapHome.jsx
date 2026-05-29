import { useEffect, useState } from "react";

import "../styles/maphome.css";
import API_URL from "../config/api";

function MapHome() {
  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedEvent, setSelectedEvent] = useState(null);

  async function fetchEvents() {
    try {
      const response = await fetch(`${API_URL}/events`);

      const data = await response.json();

      setEvents(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.category.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="map-home-container">
      <div className="map-search-container">
        <input
          type="text"
          placeholder="Buscar eventos cercanos..."
          className="map-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="map-area">
        <div className="fake-road horizontal-road"></div>

        <div className="fake-road vertical-road"></div>

        <div className="user-marker"></div>

        {selectedEvent && (
          <div className="map-popup">
            <h3>{selectedEvent.title}</h3>

            <p>{selectedEvent.category}</p>

            <span>📍 {selectedEvent.location}</span>

            <small>{selectedEvent.distance}</small>

            <button onClick={() => setSelectedEvent(null)}>Cerrar</button>
          </div>
        )}

        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="event-marker"
            style={{
              left: event.x_position,
              top: event.y_position,
            }}
            title={event.title}
            onClick={() => setSelectedEvent(event)}
          ></div>
        ))}
      </div>

      <div className="nearby-events">
        <h2>Eventos Cercanos</h2>

        {filteredEvents.map((event) => (
          <div key={event.id} className="nearby-card">
            <h3>{event.title}</h3>

            <p>📍 {event.distance}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MapHome;
