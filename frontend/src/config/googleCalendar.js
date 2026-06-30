// ============================================================
// Genera un enlace "Agregar a Google Calendar" desde un evento.
// No requiere API ni OAuth: abre Google Calendar con el evento
// precargado para que el usuario lo guarde con un clic.
// ============================================================

// Convierte una fecha a formato YYYYMMDDTHHMMSSZ (UTC) que pide Google
function toGoogleDate(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function googleCalendarUrl(event) {
  const start = toGoogleDate(event.event_date);

  // Si no hay hora de fin, asumimos 2 horas después del inicio
  const end = event.end_date
    ? toGoogleDate(event.end_date)
    : toGoogleDate(
        new Date(new Date(event.event_date).getTime() + 2 * 60 * 60 * 1000),
      );

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "Evento",
    dates: `${start}/${end}`,
    details: event.description || "",
    location: event.address || event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}