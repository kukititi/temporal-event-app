import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "../styles/eventMapPicker.css";

// Pin propio (divIcon) para no depender de las imágenes de Leaflet,
// que suelen romperse con Vite. Se estiliza desde eventMapPicker.css.
const pinIcon = L.divIcon({
  className: "tea-pick-pin",
  html: '<div class="tea-pick-pin-dot"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

// Centro por defecto: Santiago, Chile.
const DEFAULT_CENTER = { lat: -33.4489, lng: -70.6693 };

// Recentra el mapa cuando cambian las coordenadas (búsqueda / geolocalización).
function Recenter({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], 16, { animate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return null;
}

// Coloca el pin donde el usuario haga clic en el mapa.
function ClickToPlace({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function EventMapPicker({ latitude, longitude, address, onChange }) {
  const hasCoords = latitude != null && longitude != null;
  const center = hasCoords
    ? { lat: latitude, lng: longitude }
    : DEFAULT_CENTER;

  const [query, setQuery] = useState(address || "");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef(null);

  // Autocompletado de direcciones con Photon (no requiere API key).
  function handleSearch(value) {
    setQuery(value);
    clearTimeout(timer.current);

    if (value.trim().length < 3) {
      setResults([]);
      return;
    }

    timer.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            value,
          )}&lang=es&limit=5`,
        );
        const data = await res.json();
        setResults(data.features || []);
      } catch (error) {
        console.log(error);
      } finally {
        setSearching(false);
      }
    }, 350);
  }

  function labelOf(feature) {
    const p = feature.properties || {};
    return [p.name, p.street, p.housenumber, p.city, p.state]
      .filter(Boolean)
      .join(", ");
  }

  function selectResult(feature) {
    const [lng, lat] = feature.geometry.coordinates;
    onChange(lat, lng);
    setQuery(labelOf(feature) || query);
    setResults([]);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      alert("Tu navegador no permite geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange(pos.coords.latitude, pos.coords.longitude),
      () => alert("No pudimos obtener tu ubicación."),
    );
  }

  return (
    <div className="map-picker">
      <div className="map-picker-search">
        <input
          type="text"
          placeholder="Busca una dirección o lugar…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <button type="button" onClick={useMyLocation}>
          📍 Mi ubicación
        </button>

        {searching && <span className="map-picker-loading">Buscando…</span>}

        {results.length > 0 && (
          <ul className="map-picker-results">
            {results.map((feature, i) => (
              <li key={i} onClick={() => selectResult(feature)}>
                {labelOf(feature)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="map-picker-map">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={hasCoords ? 16 : 12}
          scrollWheelZoom
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Recenter
            lat={hasCoords ? latitude : null}
            lng={hasCoords ? longitude : null}
          />

          <ClickToPlace onPick={onChange} />

          {hasCoords && (
            <Marker
              position={[latitude, longitude]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target.getLatLng();
                  onChange(m.lat, m.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="map-picker-hint">
        {hasCoords
          ? "Arrastra el pin o haz clic en el mapa para ajustar el punto exacto."
          : "Busca una dirección, usa tu ubicación o haz clic en el mapa para marcar dónde será el evento."}
      </p>
    </div>
  );
}

export default EventMapPicker;