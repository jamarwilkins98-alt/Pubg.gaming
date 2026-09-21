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
      player_id,
      tournament_type,
      status,
      created_at,
      players (id, player_tag, pubg_id, contact, wins, kills, losses, matches_played),
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
      '<tr><td colspan="12" class="empty">No registrations to display.</td></tr>';
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
        <td><input class="stat-input" type="number" min="0" data-player="${player?.id}" data-field="wins" value="${player?.wins ?? 0}"></td>
        <td><input class="stat-input" type="number" min="0" data-player="${player?.id}" data-field="kills" value="${player?.kills ?? 0}"></td>
        <td><input class="stat-input" type="number" min="0" data-player="${player?.id}" data-field="losses" value="${player?.losses ?? 0}"></td>
        <td><input class="stat-input" type="number" min="0" data-player="${player?.id}" data-field="matches_played" value="${player?.matches_played ?? 0}"></td>
        <td class="action-buttons">
          <button type="button" class="approve-button" data-registration="${registration.id}" data-status="approved">Approve</button>
          <button type="button" class="reject-button" data-registration="${registration.id}" data-status="rejected">Reject</button>
          <button type="button" class="save-button" data-player="${player?.id}">Save Stats</button>
        </td>
        <td>${formatDate(registration.created_at)}</td>
      </tr>
    `;
  }).join("");

  playersTableBody.querySelectorAll("[data-registration]").forEach((button) => {
    button.addEventListener("click", () => updateRegistrationStatus(button.dataset.registration, button.dataset.status));
  });

  playersTableBody.querySelectorAll(".save-button").forEach((button) => {
    button.addEventListener("click", () => saveStats(button.dataset.player));
  });
}

async function updateRegistrationStatus(registrationId, status) {
  playersMessage.textContent = "Updating registration...";

  const { error } = await supabase
    .from("tournament_registrations")
    .update({ status })
    .eq("id", registrationId);

  if (error) {
    playersMessage.textContent = error.message || "Unable to update registration.";
    return;
  }

  playersMessage.textContent = `Registration ${status}.`;
  await loadRegistrations();
}

async function saveStats(playerId) {
  if (!playerId) return;

  const values = {};
  for (const field of ["wins", "kills", "losses", "matches_played"]) {
    const input = playersTableBody.querySelector(`[data-player="${playerId}"][data-field="${field}"]`);
    const value = Number(input?.value);
    if (!Number.isInteger(value) || value < 0) {
      playersMessage.textContent = "Statistics must be whole numbers that are 0 or higher.";
      return;
    }
    values[field] = value;
  }

  playersMessage.textContent = "Saving statistics...";
  const { error } = await supabase.from("players").update(values).eq("id", playerId);

  if (error) {
    playersMessage.textContent = error.message || "Unable to save statistics.";
    return;
  }

  playersMessage.textContent = "Player statistics saved.";
  await loadRegistrations();
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