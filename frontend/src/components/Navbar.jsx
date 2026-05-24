import { Link } from "react-router-dom";

import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>T.E.A.</h2>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/events">Events</Link>
        </li>

        <li>
          <Link to="/profile">Profile</Link>
        </li>

        <li>
          <Link to="/login">Login</Link>
        </li>

        <li>
          <Link to="/register">Register</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
