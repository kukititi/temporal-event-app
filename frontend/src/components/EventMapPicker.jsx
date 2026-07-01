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

// Centro por defecto: Santiago, Chile. Sirve también como sesgo de búsqueda.
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

function EventMapPicker({
  latitude,
  longitude,
  address,
  onChange,
  onResolveAddress,
}) {
  const hasCoords = latitude != null && longitude != null;
  const center = hasCoords
    ? { lat: latitude, lng: longitude }
    : DEFAULT_CENTER;

  const [query, setQuery] = useState(address || "");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const timer = useRef(null);

  // Autocompletado de direcciones con Photon (no requiere API key).
  // OJO: la instancia pública NO soporta lang=es (solo default/en/de/fr).
  // Sin el parámetro lang, Photon usa el idioma del navegador y devuelve
  // los nombres locales, que es justo lo que queremos en Chile.
  function handleSearch(value) {
    setQuery(value);
    setNoResults(false);
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
          )}&limit=5&lat=${DEFAULT_CENTER.lat}&lon=${DEFAULT_CENTER.lng}`,
        );
        const data = await res.json();
        const features = data.features || [];
        setResults(features);
        setNoResults(features.length === 0);
      } catch (error) {
        console.log(error);
        setNoResults(true);
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

  // Traducir un punto (lat/lng) a una dirección legible (reverse geocoding).
  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`,
      );
      const data = await res.json();
      const feature = (data.features || [])[0];
      if (!feature) return;

      const p = feature.properties || {};
      const street = [p.street, p.housenumber].filter(Boolean).join(" ");
      const line = street || p.name || "";
      const full = [line, p.city].filter(Boolean).join(", ") || line;
      const city = p.city || p.county || p.state || "";

      if (full) setQuery(full);
      if (onResolveAddress) onResolveAddress(full, city);
    } catch (error) {
      console.log(error);
    }
  }

  // Punto elegido por clic o arrastre: guardamos y resolvemos la dirección.
  function pickPoint(lat, lng) {
    onChange(lat, lng);
    reverseGeocode(lat, lng);
  }

  // Resultado elegido en la lista: ya trae etiqueta y ciudad.
  function selectResult(feature) {
    const [lng, lat] = feature.geometry.coordinates;
    const p = feature.properties || {};
    onChange(lat, lng);
    const label = labelOf(feature);
    setQuery(label || query);
    setResults([]);
    setNoResults(false);
    if (onResolveAddress) {
      onResolveAddress(label, p.city || p.state || "");
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      alert("Tu navegador no permite geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => pickPoint(pos.coords.latitude, pos.coords.longitude),
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

        {noResults && !searching && (
          <div className="map-picker-noresults">
            Sin resultados. Prueba con otra dirección o marca el punto en el
            mapa.
          </div>
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

          <ClickToPlace onPick={pickPoint} />

          {hasCoords && (
            <Marker
              position={[latitude, longitude]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target.getLatLng();
                  pickPoint(m.lat, m.lng);
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