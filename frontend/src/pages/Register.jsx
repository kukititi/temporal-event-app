import { Link } from "react-router-dom";
import "../styles/register.css";

function Register() {
  return (
    <div className="register-container">
      <h1>Create Account</h1>

      <form className="register-form">
        <input type="text" placeholder="Name" />

        <input type="email" placeholder="Email" />

        <input type="password" placeholder="Password" />

        <input type="password" placeholder="Confirm Password" />

        <button type="submit">Create Account</button>
      </form>

      <p>
        ¿Ya tienes una cuenta? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
