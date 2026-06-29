import { useState } from "react";

import "../styles/auth.css";
import "../styles/interests.css";
import API_URL from "../config/api";

// Intereses sugeridos por defecto
const PRESET = [
  "Gaming",
  "Música",
  "Tecnología",
  "Anime",
  "Robótica",
  "Películas",
  "Deportes",
  "Arte",
  "Lectura",
  "Fotografía",
  "Comida",
  "Viajes",
];

function Interests() {
  const user = JSON.parse(localStorage.getItem("user"));

  // Si ya tenía intereses (por ejemplo, viene a editarlos), los precargamos
  const [selected, setSelected] = useState(
    Array.isArray(user?.interests) ? user.interests : [],
  );

  const [custom, setCustom] = useState("");

  function toggle(interest) {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  }

  function addCustom() {
    const value = custom.trim();
    if (!value) return;

    if (!selected.includes(value)) {
      setSelected((prev) => [...prev, value]);
    }

    setCustom("");
  }

  async function saveInterests() {
    if (!user || !user.id) {
      alert("No hay un usuario válido en sesión. Inicia sesión de nuevo.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${user.id}/interests`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selected }),
      });

      // Si el servidor respondió con error (404, 500, etc.), lo mostramos claro
      if (!response.ok) {
        const detalle = await response.text();
        console.log("Respuesta del servidor:", response.status, detalle);

        if (response.status === 404) {
          alert(
            "Error 404: el backend no tiene el endpoint de intereses.\n" +
              "¿api.js apunta a tu backend local con users.routes.js actualizado?",
          );
        } else if (response.status === 500) {
          alert(
            "Error 500: el backend falló.\n" +
              "Seguramente falta correr la migración (columna interests) en Supabase.",
          );
        } else {
          alert("No se pudieron guardar (código " + response.status + ").");
        }
        return;
      }

      const updatedUser = await response.json();

      // Actualizamos el usuario guardado para que el perfil muestre los intereses
      localStorage.setItem("user", JSON.stringify(updatedUser));

      window.location.href = "/profile";
    } catch (error) {
      console.log("Error de red:", error);
      alert(
        "No se pudo conectar con el backend.\n" +
          "¿Está corriendo? ¿api.js apunta al backend correcto?",
      );
    }
  }

  // Mostramos los sugeridos + cualquier interés personalizado que el usuario haya agregado
  const customSelected = selected.filter((i) => !PRESET.includes(i));
  const allChips = [...PRESET, ...customSelected];

  return (
    <div className="auth-container">
      <div className="auth-card interests-card">
        <h1>Tus intereses</h1>

        <p className="auth-subtitle">
          Elige los temas que te gustan o crea los tuyos. Aparecerán en tu
          perfil.
        </p>

        <div className="interests-grid">
          {allChips.map((interest) => (
            <button
              type="button"
              key={interest}
              className={
                "interest-chip" +
                (selected.includes(interest) ? " selected" : "")
              }
              onClick={() => toggle(interest)}
            >
              {interest}
            </button>
          ))}
        </div>

        <div className="interests-add">
          <input
            type="text"
            placeholder="Crear un interés..."
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
          />
          <button type="button" onClick={addCustom}>
            Agregar
          </button>
        </div>

        <button className="interests-save" onClick={saveInterests}>
          Guardar y continuar
        </button>

        <div className="auth-footer">
          <a href="/profile">Omitir por ahora</a>
        </div>
      </div>
    </div>
  );
}

export default Interests;