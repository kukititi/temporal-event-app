import { Link } from "react-router-dom";
import "../styles/login.css";

function Login() {
  return (
    <div className="login-container">
      <h1>Login</h1>

      <form className="login-form">
        <input type="email" placeholder="Email" />

        <input type="password" placeholder="Password" />

        <button type="submit">Login</button>
      </form>

      <p>
        ¿No tienes una cuenta? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;
