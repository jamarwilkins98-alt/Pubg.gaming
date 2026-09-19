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

  try {
    const { error } = await supabase.from("players").insert({
      player_tag: data.playerTag,
      pubg_id: data.pubgId,
      contact: data.contact,
      status: "pending",
      wins: 0,
      kills: 0,
      losses: 0,
      matches_played: 0
    });

    if (error) throw error;

    message.textContent =
      "Registration submitted successfully. Status: Pending.";
    form.reset();
  } catch (error) {
    console.error("Supabase registration error:", error);
    message.textContent =
      error.message || "Registration failed. Please try again.";
  }
});