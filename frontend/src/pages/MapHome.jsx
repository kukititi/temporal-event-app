import { useEffect, useMemo, useState } from "react";
import EventMap from "../components/EventMap";
import EventDetailModal from "../components/EventDetailModal";
import "../styles/mapHome.css";
import API_URL from "../config/api";
import { formatEventRange } from "../config/dateUtils";

const SANTIAGO = { lat: -33.4489, lng: -70.6693 };

// Distancia en km entre dos puntos (fórmula de Haversine).
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

function MapHome() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [recenterSignal, setRecenterSignal] = useState(0);

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

  // Pide la ubicación del usuario; si la rechaza, cae a Santiago.
  function locateUser(recenter = false) {
    if (!navigator.geolocation) {
      setUserLocation(SANTIAGO);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        if (recenter) setRecenterSignal((s) => s + 1);
      },
      () => setUserLocation((prev) => prev || SANTIAGO),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  useEffect(() => {
    locateUser(false);
  }, []);

  // Filtro de texto (título, categoría, ubicación).
  const searched = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        (event.category || "").toLowerCase().includes(q) ||
        (event.location || "").toLowerCase().includes(q),
    );
  }, [events, search]);

  // Cercanos: con coordenadas, dentro del radio, ordenados por distancia.
  const nearby = useMemo(() => {
    if (!userLocation) return [];
    return searched
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({
        ...e,
        _dist: distanceKm(userLocation, {
          lat: e.latitude,
          lng: e.longitude,
        }),
      }))
      .filter((e) => e._dist <= radiusKm)
      .sort((a, b) => a._dist - b._dist);
  }, [searched, userLocation, radiusKm]);

  const withoutCoords = searched.filter(
    (e) => e.latitude == null || e.longitude == null,
  ).length;

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

      <div className="map-controls">
        <span className="map-controls-label">Radio de búsqueda:</span>
        {[1, 5, 10, 25].map((km) => (
          <button
            key={km}
            className={`radius-button ${radiusKm === km ? "active" : ""}`}
            onClick={() => setRadiusKm(km)}
          >
            {km} km
          </button>
        ))}
      </div>

      <div className="map-area">
        <button
          className="locate-me-button"
          onClick={() => locateUser(true)}
          title="Centrar en mi ubicación"
        >
          📍 Centrar en mí
        </button>

        <EventMap
          events={searched}
          userLocation={userLocation}
          radiusKm={radiusKm}
          recenterSignal={recenterSignal}
          onSelectEvent={(event) => setSelectedEvent(event)}
        />
      </div>

      <div className="nearby-events">
        <h2>Eventos Cercanos ({nearby.length})</h2>

        {!userLocation ? (
          <p className="nearby-empty">Obteniendo tu ubicación…</p>
        ) : nearby.length === 0 ? (
          <p className="nearby-empty">
            No hay eventos dentro de {radiusKm} km. Prueba ampliar el radio.
          </p>
        ) : (
          nearby.map((event) => (
            <div key={event.id} className="nearby-card">
              <div
                className="nearby-thumb"
                style={
                  event.image_url
                    ? { backgroundImage: `url(${event.image_url})` }
                    : {}
                }
              />

              <div className="nearby-body">
                <div className="nearby-card-head">
                  <h3>{event.title}</h3>
                  <span className="nearby-distance">
                    {event._dist.toFixed(1)} km
                  </span>
                </div>

                <p className="nearby-meta">🗓️ {formatEventRange(event)}</p>

                {event.location && (
                  <p className="nearby-location">📍 {event.location}</p>
                )}

                <button
                  className="nearby-details-btn"
                  onClick={() => setSelectedEvent(event)}
                >
                  🔍 Ver y calificar
                </button>
              </div>
            </div>
          ))
        )}

        {withoutCoords > 0 && (
          <p className="nearby-note">
            {withoutCoords} evento(s) todavía no tienen ubicación en el mapa.
            Edítalos y marca su punto para que aparezcan aquí.
          </p>
        )}
      </div>

      {/* Modal de detalle: ver descripción, calificar y comentar */}
      <EventDetailModal
        event={selectedEvent}
        user={user}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default MapHome;