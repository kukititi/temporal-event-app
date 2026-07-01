import { useEffect, useMemo, useRef, useState } from "react";
import EventMap from "../components/EventMap";
import EventDetailModal from "../components/EventDetailModal";
import "../styles/mapHome.css";
import API_URL from "../config/api";
import { formatEventRange, eventStatus, statusLabel } from "../config/dateUtils";
import {
  checkNotifPermission,
  requestNotifPermission,
  sendLocalNotification,
} from "../config/notify";

// Ubicación por defecto: Av. Ejército Libertador 441, Santiago.
// Es a lo que caemos si el navegador no entrega la geolocalización.
const DEFAULT_LOCATION = { lat: -33.45249721842194, lng: -70.66111896424796 };

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

  // Notificaciones
  const [showBanner, setShowBanner] = useState(true);
  const [notifPermission, setNotifPermission] = useState("prompt");
  const notifiedRef = useRef(new Set());

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

  // Estado inicial del permiso de notificaciones.
  useEffect(() => {
    checkNotifPermission().then(setNotifPermission);
  }, []);

  // Pide la ubicación del usuario; si la rechaza, cae a Av. Ejército 441.
  function locateUser(recenter = false) {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_LOCATION);
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
      () => setUserLocation((prev) => prev || DEFAULT_LOCATION),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  useEffect(() => {
    locateUser(false);
  }, []);

  // Botón "Centrar en mí": recentra YA a la ubicación conocida (aunque la
  // geolocalización falle o tarde) y, en paralelo, intenta actualizarla.
  function centerOnMe() {
    setUserLocation((prev) => prev || DEFAULT_LOCATION);
    setRecenterSignal((s) => s + 1);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setRecenterSignal((s) => s + 1);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  }

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

  // Pide permiso para notificaciones (nativo en el teléfono, web en dev).
  function enableNotifications() {
    requestNotifPermission().then((p) => {
      setNotifPermission(p);
      if (p === "unsupported") {
        alert("Este dispositivo no soporta notificaciones.");
      }
    });
  }

  // Dispara una notificación cuando aparecen eventos nuevos dentro del
  // radio (solo una vez por evento).
  useEffect(() => {
    if (notifPermission !== "granted") return;

    const nuevos = nearby.filter((e) => !notifiedRef.current.has(e.id));
    if (nuevos.length === 0) return;

    nuevos.forEach((e) => notifiedRef.current.add(e.id));

    const primero = nuevos[0];
    const titulo =
      nuevos.length === 1
        ? "Evento cerca de ti"
        : `${nuevos.length} eventos cerca de ti`;
    const cuerpo =
      nuevos.length === 1
        ? `${primero.title} · a ${primero._dist.toFixed(1)} km`
        : `El más cercano: ${primero.title} · a ${primero._dist.toFixed(1)} km`;

    sendLocalNotification(titulo, cuerpo);
  }, [nearby, notifPermission]);

  return (
    <div className="map-home-container">
      {nearby.length > 0 && showBanner && (
        <div className="nearby-banner">
          <span className="nearby-banner-text">
            📍 Hay {nearby.length} evento(s) dentro de {radiusKm} km de ti.
          </span>

          {(notifPermission === "prompt" || notifPermission === "denied") && (
            <button className="banner-bell" onClick={enableNotifications}>
              🔔 Avisarme
            </button>
          )}

          {notifPermission === "granted" && (
            <span className="banner-bell-on">🔔 Avisos activados</span>
          )}

          <button
            className="banner-close"
            onClick={() => setShowBanner(false)}
          >
            ✕
          </button>
        </div>
      )}

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
            onClick={() => {
              setRadiusKm(km);
              setShowBanner(true);
            }}
          >
            {km} km
          </button>
        ))}
      </div>

      <div className="map-area">
        <button
          className="locate-me-button"
          onClick={centerOnMe}
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

                <span className={`status-chip ${eventStatus(event)}`}>
                  {statusLabel(event)}
                </span>

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