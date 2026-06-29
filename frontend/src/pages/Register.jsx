import { Link } from "react-router-dom";

import { useState } from "react";

import "../styles/auth.css";
import API_URL from "../config/api";

function Register() {
  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [address, setAddress] = useState("");

  const [city, setCity] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          email,
          password,
          city,
          address,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        // Auto-login: guardamos el usuario recién creado...
        localStorage.setItem("user", JSON.stringify(data.user));

        // ...y lo llevamos a elegir sus intereses.
        window.location.href = "/intereses";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);

      alert("Error creando usuario");
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

        <h1>Crear Cuenta</h1>

        <p className="auth-subtitle">
          Únete a la comunidad y descubre eventos cerca de ti.
        </p>

        <form className="auth-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

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

          <input
            type="text"
            placeholder="Ciudad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            type="text"
            placeholder="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

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