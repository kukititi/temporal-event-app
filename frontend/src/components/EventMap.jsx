import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { formatEventRange, hasEnded } from "../config/dateUtils";

// Pines propios (divIcon) para no depender de las imágenes de Leaflet.
const eventIcon = L.divIcon({
  className: "tea-map-pin",
  html: '<div class="tea-map-pin-dot"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -20],
});

const endedIcon = L.divIcon({
  className: "tea-map-pin ended",
  html: '<div class="tea-map-pin-dot"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -20],
});

const userIcon = L.divIcon({
  className: "tea-user-pin",
  html: '<div class="tea-user-pin-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Recentra el mapa cuando cambia la ubicación del usuario.
function Recenter({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center && center[0], center && center[1]]);

  return null;
}

function EventMap({ events = [], userLocation, radiusKm = 5, onSelectEvent }) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [-33.4489, -70.6693];

  // Solo se dibujan los eventos que tienen coordenadas.
  const withCoords = events.filter(
    (e) => e.latitude != null && e.longitude != null,
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="tea-leaflet"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Recenter
        center={userLocation ? [userLocation.lat, userLocation.lng] : null}
      />

      {userLocation && (
        <>
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          />
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "#4fd1c5",
              fillColor: "#4fd1c5",
              fillOpacity: 0.08,
            }}
          />
        </>
      )}

      {withCoords.map((event) => (
        <Marker
          key={event.id}
          position={[event.latitude, event.longitude]}
          icon={hasEnded(event) ? endedIcon : eventIcon}
        >
          <Popup>
            <div className="map-marker-popup">
              <strong>{event.title}</strong>

              {event.category && (
                <span className="mm-cat">{event.category}</span>
              )}

              <small>🗓️ {formatEventRange(event)}</small>

              {event.location && <p>📍 {event.location}</p>}

              <button
                type="button"
                onClick={() => onSelectEvent && onSelectEvent(event)}
              >
                Ver detalles
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default EventMap;