import { Link } from "react-router-dom";
import logo from "../assets/tea-logo.png";

import "../styles/navbar.css";

function logout() {
  localStorage.removeItem("user");

  window.location.href = "/";
}

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
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

        {user && (
          <li>
            <Link to="/profile">👤 Perfil</Link>
          </li>
        )}

        {user ? (
          <>
            <span className="navbar-user">👤 {user.username}</span>

            <button className="logout-button" onClick={logout}>
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Ingresar</Link>

            <Link to="/register">Registro</Link>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
