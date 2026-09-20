import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dgxatxdfmlvjzxpmeqry.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zhD3Wyhvla5nrT11oFPz0g_DKDMWRif";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const email = document.getElementById("adminEmail");
const message = document.getElementById("adminMessage");

const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  window.location.href = "./admin.html";
} else {
  email.textContent = session.user.email || "Admin";
  message.textContent = "You are signed in.";
}

document.getElementById("signOut").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "./admin.html";
});
