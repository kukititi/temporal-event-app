import { useEffect, useState } from "react";

import API_URL from "../config/api";
import { formatEventRange, hasEnded } from "../config/dateUtils";

// Selector / muestra de estrellas.
// - readOnly=false: clickeable (para calificar).
// - readOnly=true: solo muestra el valor.
function StarRating({ value = 0, onChange, readOnly = false, size = 26 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hover || value) >= star;
        return (
          <span
            key={star}
            className={`star ${filled ? "star-filled" : ""} ${
              readOnly ? "star-readonly" : ""
            }`}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange && onChange(star)}
            role={readOnly ? undefined : "button"}
          >
            {filled ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}

function EventDetailModal({ event, user, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [saving, setSaving] = useState(false);

  const [attendees, setAttendees] = useState(0);
  const [stats, setStats] = useState(null);

  const ended = hasEnded(event);
  const isCreator =
    user && event && String(user.id) === String(event.created_by);

  async function loadReviews() {
    try {
      const res = await fetch(`${API_URL}/events/${event.id}/reviews`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);

      // Precargamos la reseña del usuario actual (si ya calificó)
      if (user) {
        const mine = data.find(
          (r) => String(r.user_id) === String(user.id),
        );
        if (mine) {
          setMyRating(mine.rating);
          setMyComment(mine.comment || "");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function loadRating() {
    try {
      const res = await fetch(`${API_URL}/events/${event.id}/rating`);
      const data = await res.json();
      setAverage(data.average || 0);
      setCount(data.count || 0);
    } catch (error) {
      console.log(error);
    }
  }

  async function loadAttendees() {
    try {
      const res = await fetch(
        `${API_URL}/events/${event.id}/attendees-count`,
      );
      const data = await res.json();
      setAttendees(Number(data.attendees) || 0);
    } catch (error) {
      console.log(error);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch(`${API_URL}/events/${event.id}/event-stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!event) return;

    // reiniciamos por si el modal se reutiliza con otro evento
    setMyRating(0);
    setMyComment("");
    setStats(null);

    loadReviews();
    loadRating();
    loadAttendees();

    if (isCreator && ended) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  async function submitReview() {
    if (!user) {
      alert("Debes iniciar sesión para calificar.");
      return;
    }
    if (!myRating) {
      alert("Selecciona cuántas estrellas le das al evento.");
      return;
    }

    try {
      setSaving(true);

      await fetch(`${API_URL}/events/${event.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          rating: myRating,
          comment: myComment,
        }),
      });

      await loadReviews();
      await loadRating();
      if (isCreator && ended) await loadStats();

      alert("¡Gracias por tu calificación!");
    } catch (error) {
      console.log(error);
      alert("No se pudo guardar tu calificación.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMyReview() {
    if (!user) return;
    const ok = window.confirm("¿Eliminar tu reseña de este evento?");
    if (!ok) return;

    try {
      await fetch(`${API_URL}/events/${event.id}/reviews/${user.id}`, {
        method: "DELETE",
      });

      setMyRating(0);
      setMyComment("");

      await loadReviews();
      await loadRating();
      if (isCreator && ended) await loadStats();
    } catch (error) {
      console.log(error);
    }
  }

  if (!event) return null;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div
        className="event-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="event-modal-close" onClick={onClose}>
          ✕
        </button>

        {/* Portada */}
        <div
          className="event-modal-cover"
          style={
            event.image_url
              ? { backgroundImage: `url(${event.image_url})` }
              : {}
          }
        >
          {ended && <span className="badge-ended">Finalizado</span>}
        </div>

        {/* Encabezado */}
        <div className="event-modal-body">
          <div className="event-modal-head">
            <h2>{event.title}</h2>
            {event.category && (
              <span className="event-badge">{event.category}</span>
            )}
          </div>

          <div className="event-modal-rating-summary">
            <StarRating value={Math.round(average)} readOnly size={20} />
            <span>
              {average ? average.toFixed(1) : "Sin calificaciones"}{" "}
              {count > 0 && `(${count})`}
            </span>
          </div>

          {/* Detalles */}
          <p className="event-modal-meta">🗓️ {formatEventRange(event)}</p>
          {event.location && (
            <p className="event-modal-meta">🏷️ {event.location}</p>
          )}
          {event.address && (
            <p className="event-modal-meta">📍 {event.address}</p>
          )}
          <p className="event-modal-meta">👥 {attendees} asistentes</p>

          <h3 className="event-modal-subtitle">Descripción</h3>
          <p className="event-modal-description">
            {event.description || "Este evento no tiene descripción."}
          </p>

          {/* Estadísticas post-evento (solo organizador y evento finalizado) */}
          {isCreator && ended && (
            <div className="post-event-stats">
              <h3>📊 Estadísticas post-evento</h3>
              {stats ? (
                <div className="post-event-grid">
                  <div className="pe-stat">
                    <span className="pe-number">{stats.attendees}</span>
                    <span className="pe-label">Asistentes</span>
                  </div>
                  <div className="pe-stat">
                    <span className="pe-number">
                      {stats.averageRating || "—"}
                    </span>
                    <span className="pe-label">Calificación</span>
                  </div>
                  <div className="pe-stat">
                    <span className="pe-number">{stats.totalReviews}</span>
                    <span className="pe-label">Reseñas</span>
                  </div>
                </div>
              ) : (
                <p>Cargando estadísticas…</p>
              )}
            </div>
          )}

          {/* Calificar (requiere haber abierto el evento + estar logueado) */}
          {user ? (
            <div className="review-form">
              <h3 className="event-modal-subtitle">
                {myRating ? "Tu calificación" : "Califica este evento"}
              </h3>
              <StarRating value={myRating} onChange={setMyRating} />
              <textarea
                className="review-textarea"
                placeholder="Escribe un comentario (opcional)…"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
              />
              <div className="review-form-actions">
                <button
                  className="review-submit"
                  onClick={submitReview}
                  disabled={saving}
                >
                  {saving ? "Guardando…" : "Publicar reseña"}
                </button>
                {myRating > 0 && (
                  <button
                    className="review-delete"
                    onClick={deleteMyReview}
                  >
                    Eliminar mi reseña
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="review-login-hint">
              Inicia sesión para calificar y comentar este evento.
            </p>
          )}

          {/* Lista de reseñas */}
          <h3 className="event-modal-subtitle">
            Comentarios ({reviews.length})
          </h3>
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="reviews-empty">
                Todavía no hay reseñas. ¡Sé el primero!
              </p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="review-item">
                  <img
                    className="review-avatar"
                    src={
                      r.avatar_url ||
                      "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                    }
                    alt=""
                  />
                  <div className="review-content">
                    <div className="review-head">
                      <strong>@{r.username}</strong>
                      <StarRating value={r.rating} readOnly size={16} />
                    </div>
                    {r.comment && <p>{r.comment}</p>}
                    <small>
                      {new Date(r.created_at).toLocaleDateString("es-CL")}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailModal;