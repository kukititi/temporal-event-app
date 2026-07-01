// Capa única de notificaciones: usa las notificaciones NATIVAS de Capacitor
// cuando la app corre en el teléfono, y la API del navegador cuando corre
// en el navegador (modo desarrollo). Así el mismo código sirve en ambos.
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const isNative = Capacitor.isNativePlatform();

// Los IDs de notificación en Android deben ser enteros de 32 bits.
let notifId = 1;

// Normaliza el estado a: "granted" | "denied" | "prompt" | "unsupported"
function normalizeNative(display) {
  if (display === "granted") return "granted";
  if (display === "denied") return "denied";
  return "prompt";
}

// Consulta el estado actual del permiso (sin pedirlo).
export async function checkNotifPermission() {
  try {
    if (isNative) {
      const res = await LocalNotifications.checkPermissions();
      return normalizeNative(res.display);
    }
  } catch (error) {
    console.log(error);
  }

  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission === "default"
    ? "prompt"
    : Notification.permission;
}

// Pide el permiso al usuario y devuelve el nuevo estado.
export async function requestNotifPermission() {
  try {
    if (isNative) {
      const res = await LocalNotifications.requestPermissions();
      return normalizeNative(res.display);
    }
  } catch (error) {
    console.log(error);
  }

  if (typeof Notification === "undefined") return "unsupported";
  const p = await Notification.requestPermission();
  return p === "default" ? "prompt" : p;
}

// Lanza una notificación inmediata (nativa en el teléfono, web en el navegador).
export async function sendLocalNotification(title, body) {
  try {
    if (isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId++,
            title,
            body,
          },
        ],
      });
    } else if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      new Notification(title, { body });
    }
  } catch (error) {
    console.log(error);
  }
}