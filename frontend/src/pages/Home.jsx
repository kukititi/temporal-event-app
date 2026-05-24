import { Link } from "react-router-dom";

import AnimatedMap from "../components/AnimatedMap";

import "../styles/home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="hero-content">
        <h1>Descubre Eventos a tu Alrededor</h1>

        <p>
          Explore concerts, meetups, gaming events and community activities
          happening in real time.
        </p>

        <div className="hero-buttons">
          <Link to="/events">
            <button>Explore Events</button>
          </Link>

          <Link to="/register">
            <button>Create Account</button>
          </Link>
        </div>
      </div>

      <AnimatedMap />
    </div>
  );
}

export default Home;
