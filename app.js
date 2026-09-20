import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dgxatxdfmlvjzxpmeqry.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zhD3Wyhvla5nrT11oFPz0g_DKDMWRif";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const form = document.getElementById("registrationForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "Submitting...";

  const data = Object.fromEntries(new FormData(form));
  const isTeamFormat = data.tournamentType !== "1v1";

  if (isTeamFormat && !data.teamName.trim()) {
    message.textContent = "Team Name is required for 2v2, 3v3 and 4v4.";
    return;
  }

  try {
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        player_tag: data.playerTag.trim(),
        pubg_id: data.pubgId.trim(),
        contact: data.contact.trim(),
        status: "pending",
        wins: 0,
        kills: 0,
        losses: 0,
        matches_played: 0
      })
      .select("id")
      .single();

    if (playerError) throw playerError;

    let teamId = null;

    if (isTeamFormat) {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({ team_name: data.teamName.trim() })
        .select("id")
        .single();

      if (teamError) throw teamError;

      teamId = team.id;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: teamId,
          player_id: player.id
        });

      if (memberError) throw memberError;
    }

    const { error: registrationError } = await supabase
      .from("tournament_registrations")
      .insert({
        player_id: player.id,
        tournament_type: data.tournamentType,
        team_id: teamId,
        status: "pending"
      });

    if (registrationError) throw registrationError;

    message.textContent =
      "Registration submitted successfully. Status: Pending.";
    form.reset();
  } catch (error) {
    console.error("Registration error:", error);
    message.textContent =
      error.message || "Registration failed. Please try again.";
  }
});