import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dgxatxdfmlvjzxpmeqry.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zhD3Wyhvla5nrT11oFPz0g_DKDMWRif";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const email = document.getElementById("adminEmail");
const message = document.getElementById("adminMessage");
const playersMessage = document.getElementById("playersMessage");
const playersTableBody = document.getElementById("adminPlayersTableBody");

const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  window.location.href = "./admin.html";
} else {
  email.textContent = session.user.email || "Admin";
  message.textContent = "You are signed in.";
  await loadRegistrations();
}

async function loadRegistrations() {
  playersMessage.textContent = "Loading registrations...";
  playersTableBody.innerHTML = "";

  const { data, error } = await supabase
    .from("tournament_registrations")
    .select(`
      id,
      tournament_type,
      status,
      created_at,
      players (player_tag, pubg_id, contact),
      teams (team_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin registrations error:", error);
    playersMessage.textContent = error.message || "Unable to load registrations.";
    return;
  }

  playersMessage.textContent = data.length
    ? `${data.length} registration${data.length === 1 ? "" : "s"} found.`
    : "No registrations found.";

  if (!data.length) {
    playersTableBody.innerHTML =
      '<tr><td colspan="7" class="empty">No registrations to display.</td></tr>';
    return;
  }

  playersTableBody.innerHTML = data.map((registration) => {
    const player = Array.isArray(registration.players)
      ? registration.players[0]
      : registration.players;
    const team = Array.isArray(registration.teams)
      ? registration.teams[0]
      : registration.teams;

    return `
      <tr>
        <td>${escapeHtml(player?.player_tag || "—")}</td>
        <td>${escapeHtml(player?.pubg_id || "—")}</td>
        <td>${escapeHtml(player?.contact || "—")}</td>
        <td>${escapeHtml(registration.tournament_type || "—")}</td>
        <td>${escapeHtml(team?.team_name || "—")}</td>
        <td class="status">${escapeHtml(registration.status || "—")}</td>
        <td>${formatDate(registration.created_at)}</td>
      </tr>
    `;
  }).join("");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("refreshPlayers").addEventListener("click", loadRegistrations);

document.getElementById("signOut").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "./admin.html";
});
