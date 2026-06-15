import { Link } from "react-router-dom";
import logo from "../assets/tea-logo.png";
import { useState, useEffect } from "react";

import "../styles/navbar.css";

function logout() {
  localStorage.removeItem("user");

  window.location.href = "/";
}

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";

    setTheme(newTheme);

    localStorage.setItem("theme", newTheme);

    document.body.className = newTheme;
  }

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="TEA Logo" className="navbar-logo-image" />
      </Link>

      <ul className="navbar-links">
        <li>
          <Link to="/events">Eventos</Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/profile" className="navbar-user">
                👤 {user.username}
              </Link>
            </li>

            <li>
              <button className="logout-button" onClick={logout}>
                Cerrar Sesión
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Ingresar</Link>
            </li>
            <li>
              <Link to="/register">Registro</Link>
            </li>
          </>
        )}
        <li>
          <button className="theme-button" onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
