import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dgxatxdfmlvjzxpmeqry.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zhD3Wyhvla5nrT11oFPz0g_DKDMWRif";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const form = document.getElementById("adminLoginForm");
const message = document.getElementById("loginMessage");

const { data: { session } } = await supabase.auth.getSession();
if (session) {
  window.location.href = "./admin-dashboard.html";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Signing in...";

  const data = Object.fromEntries(new FormData(form));

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email.trim(),
    password: data.password
  });

  if (error) {
    console.error("Admin login error:", error);
    message.textContent = error.message || "Login failed. Please check your email and password.";
    return;
  }

  window.location.href = "./admin-dashboard.html";
});
