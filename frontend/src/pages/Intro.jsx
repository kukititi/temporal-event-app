import { Link } from "react-router-dom";

import AnimatedMap from "../components/AnimatedMap";

import "../styles/intro.css";

function Home() {
  return (
    <div className="home-container">
      <div className="hero-content">
        <h1>Descubre Eventos a tu Alrededor</h1>

        <p>
          Explora conciertos, juntas, eventos gaming y actividades comunitarias
          ocurriendo en tiempo real cerca de ti.
        </p>

        <div className="hero-buttons">
          <Link to="/events">
            <button>Explorar Eventos</button>
          </Link>

          <Link to="/register">
            <button>Crear Cuenta</button>
          </Link>
        </div>
      </div>

      <AnimatedMap />
    </div>
  );
}

export default Home;
