// Fire-and-forget helper to trigger a notification email via the backend.
// Never blocks or throws into the calling UI code — a failed notification
// should not stop the actual admin action (status update, approval, etc.)
// from completing.
//
// Adjust API_BASE if your backend runs on a different host/port.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function notifyUser(userId, event, data = {}) {
  if (!userId) return;
  try {
    await fetch(`${API_BASE}/api/notify-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, event, data }),
    });
  } catch (err) {
    console.error("notifyUser failed (non-blocking):", err);
  }
}