import { Link } from "react-router-dom";

import { useState } from "react";

import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login exitoso 🚀");

        console.log("Usuario guardado:", data.user);

        setEmail("");
        setPassword("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);

      alert("Error iniciando sesión");
    }
  };

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

        <form className="auth-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

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
