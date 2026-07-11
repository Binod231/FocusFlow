// FocusFlow — Shared constants
export const API_URL = "https://y5kycth1g2.execute-api.us-east-1.amazonaws.com/prod/prioritize";

export const EXAMPLE_TASKS = `Fix critical payment bug blocking the release
Write Q3 performance reviews for my team
Reply to the client proposal from Acme Corp
Prepare slides for Friday's all-hands presentation
Review and merge 4 open pull requests
Set up CI/CD pipeline for the new service
Read chapter 3 of "Deep Work"
Update the README documentation
Schedule dentist appointment
Weekly 1-on-1 meeting prep notes`;

export const CATEGORY_META = {
  deep_work:     { label: "Deep Work",     color: "var(--indigo)", bg: "rgba(99,102,241,0.1)",   border: "rgba(99,102,241,0.25)" },
  admin:         { label: "Admin",         color: "var(--t3)",     bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
  communication: { label: "Comms",         color: "var(--amber)",  bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)" },
  creative:      { label: "Creative",      color: "var(--violet)", bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.25)" },
  routine:       { label: "Routine",       color: "var(--green)",  bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"   },
};

export const BLOCK_META = {
  morning:   { emoji: "🌅", label: "Morning",   time: "9 AM – 12 PM" },
  afternoon: { emoji: "☀️",  label: "Afternoon", time: "12 PM – 5 PM" },
  evening:   { emoji: "🌙", label: "Evening",   time: "5 PM – 9 PM"  },
  anytime:   { emoji: "🔄", label: "Anytime",   time: "Flexible"     },
};

// Streak key in localStorage
export const STREAK_KEY = "focusflow_streak";
export const HISTORY_KEY = "focusflow_history";
