import "../styles/mapHome.css";

function MapHome() {
  return (
    <div className="map-home-container">
      <div className="map-search-container">
        <input
          type="text"
          placeholder="Buscar eventos cercanos..."
          className="map-search"
        />
      </div>

      <div className="map-area">
        <div className="fake-road horizontal-road"></div>
        <div className="fake-road vertical-road"></div>

        <div className="user-marker"></div>

        <div className="event-marker marker-1"></div>
        <div className="event-marker marker-2"></div>
        <div className="event-marker marker-3"></div>
      </div>

      <div className="nearby-events">
        <h2>Eventos Cercanos</h2>

        <div className="nearby-card">
          <h3>Anime Expo 2026</h3>
          <p>📍 A 1.2 km de distancia</p>
        </div>

        <div className="nearby-card">
          <h3>Torneo Gaming</h3>
          <p>📍 A 2.8 km de distancia</p>
        </div>
      </div>
    </div>
  );
}

export default MapHome;
