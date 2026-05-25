import { Link } from "react-router-dom";

import "../styles/auth.css";

function Register() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img
            src="https://cdn-icons-png.flaticon.com/512/942/942748.png"
            alt="Logo TEA"
          />
        </div>

        <h1>Crear Cuenta</h1>

        <p className="auth-subtitle">
          Únete a la comunidad y descubre eventos cerca de ti.
        </p>

        <form className="auth-form">
          <input type="text" placeholder="Nombre de usuario" />

          <input type="email" placeholder="Correo electrónico" />

          <input type="password" placeholder="Contraseña" />

          <input type="password" placeholder="Confirmar contraseña" />

          <button type="submit">Crear Cuenta</button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
