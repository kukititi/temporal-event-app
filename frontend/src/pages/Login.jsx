import { Link } from "react-router-dom";

import "../styles/auth.css";

function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img
            src="https://cdn-icons-png.flaticon.com/512/942/942748.png"
            alt="Logo TEA"
          />
        </div>

        <h1>Bienvenido de Vuelta</h1>

        <p className="auth-subtitle">
          Inicia sesión para seguir explorando eventos cercanos.
        </p>

        <form className="auth-form">
          <input type="email" placeholder="Correo electrónico" />

          <input type="password" placeholder="Contraseña" />

          <button type="submit">Iniciar Sesión</button>
        </form>

        <div className="auth-footer">
          ¿No tienes una cuenta? <Link to="/register">Crear Cuenta</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
