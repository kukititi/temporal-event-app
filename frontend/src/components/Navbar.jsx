import { Link } from "react-router-dom";
import logo from "../assets/tea-logo.png";

import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="TEA Logo" className="navbar-logo-image" />
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/">Inicio</Link>
        </li>

        <li>
          <Link to="/events">Eventos</Link>
        </li>

        <li>
          <Link to="/profile">Perfil</Link>
        </li>

        <li>
          <Link to="/login">Ingresar</Link>
        </li>

        <li>
          <Link to="/register">Registro</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
