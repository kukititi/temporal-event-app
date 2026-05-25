import "../styles/events.css";

function Events() {
  const events = [
    {
      title: "Anime Expo 2026",
      category: "Anime",
      location: "Providencia",
      distance: "A 2.3 km de distancia",
    },

    {
      title: "Meetup de Robótica",
      category: "Tecnología",
      location: "Santiago Centro",
      distance: "A 4.1 km de distancia",
    },

    {
      title: "Torneo de League of Legends",
      category: "Gaming",
      location: "Las Condes",
      distance: "A 6.5 km de distancia",
    },
  ];

  const filters = ["Todos", "Gaming", "Música", "Anime", "Tecnología"];

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
        {events.map((event, index) => (
          <div key={index} className="event-card">
            <div className="event-image"></div>

            <div className="event-info">
              <h2>{event.title}</h2>

              <p>{event.category}</p>

              <span>{event.location}</span>

              <small>{event.distance}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Events;
