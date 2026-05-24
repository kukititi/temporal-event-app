import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      {" "}
      <h2>Temporal Event App</h2>{" "}
      <ul>
        {" "}
        <li>
          <Link to="/">Home</Link>
        </li>{" "}
        <li>
          <Link to="/events">Events</Link>
        </li>{" "}
        <li>
          <Link to="/profile">Profile</Link>
        </li>{" "}
        <li>
          <Link to="/login">Login</Link>
        </li>{" "}
        <li>
          <Link to="/register">Register</Link>
        </li>{" "}
      </ul>{" "}
    </nav>
  );
}

export default Navbar;
