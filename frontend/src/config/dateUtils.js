// ============================================================
//  Utilidades de fecha/hora para eventos (TEA)
//  - combineDateTime: une la fecha (DatePicker) con la hora ("HH:MM")
//  - toTimeString: extrae "HH:MM" de un Date (para precargar al editar)
//  - hasEnded: indica si el evento ya finalizó (usa end_date)
//  - formatEventRange: texto legible del rango de fechas en español
// ============================================================

// Une un objeto Date (solo fecha) con un texto de hora "HH:MM".
// Devuelve un Date completo o null si no hay fecha.
export function combineDateTime(date, time) {
  if (!date) return null;

  const d = new Date(date);

  if (time && /^\d{1,2}:\d{2}/.test(time)) {
    const [h, m] = time.split(":");
    d.setHours(Number(h), Number(m), 0, 0);
  }

  return d;
}

// Extrae la hora "HH:MM" de un valor de fecha (o "" si no es válida).
export function toTimeString(value) {
  if (!value) return "";

  const d = new Date(value);
  if (isNaN(d.getTime())) return "";

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// ¿El evento ya terminó? Usa end_date; si no hay, cae a event_date.
export function hasEnded(event) {
  const end = event?.end_date || event?.event_date;
  if (!end) return false;

  const d = new Date(end);
  if (isNaN(d.getTime())) return false;

  return d.getTime() < Date.now();
}

// Devuelve un texto legible del rango del evento, por ejemplo:
//   "sáb 12 jul · 18:00 – 22:00"   (mismo día)
//   "sáb 12 jul 18:00 → dom 13 jul 02:00"   (cruza de día)
//   "sáb 12 jul · 18:00"   (sin hora de fin)
export function formatEventRange(event) {
  const start = event?.event_date ? new Date(event.event_date) : null;
  const end = event?.end_date ? new Date(event.end_date) : null;

  if (!start || isNaN(start.getTime())) return "Fecha por confirmar";

  const dateOpts = { weekday: "short", day: "numeric", month: "short" };
  const timeOpts = { hour: "2-digit", minute: "2-digit" };

  const startDay = start.toLocaleDateString("es-CL", dateOpts);
  const startTime = start.toLocaleTimeString("es-CL", timeOpts);

  if (!end || isNaN(end.getTime())) {
    return `${startDay} · ${startTime}`;
  }

  const endTime = end.toLocaleTimeString("es-CL", timeOpts);
  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${startDay} · ${startTime} – ${endTime}`;
  }

  const endDay = end.toLocaleDateString("es-CL", dateOpts);
  return `${startDay} ${startTime} → ${endDay} ${endTime}`;
}