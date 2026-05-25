import "../styles/events.css";

function Events() {
  const events = [
    {
      title: "Anime Expo 2026",
      category: "Anime",
      location: "Providencia",
      distance: "2.3 km away",
    },

    {
      title: "Robotics Meetup",
      category: "Tech",
      location: "Santiago Centro",
      distance: "4.1 km away",
    },

    {
      title: "League Tournament",
      category: "Gaming",
      location: "Las Condes",
      distance: "6.5 km away",
    },
  ];

  const filters = ["All", "Gaming", "Music", "Anime", "Tech"];

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Discover Events</h1>

        <input
          type="text"
          placeholder="Search events..."
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
        <button className="sort-button">📍 Nearby</button>

        <button className="sort-button">🔥 Trending</button>

        <button className="sort-button">🕒 Recent</button>
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
