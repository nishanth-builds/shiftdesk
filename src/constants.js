import { KPI } from "./kpi";

export const MOTIVATION = [
  "Every call is a step closer to your target. Keep going!",
  "Small wins every day build big results.",
  "You are not behind, you are growing. Go get it!",
  "Consistency beats intensity. Great work!",
  "Stay focused, stay positive, keep improving.",
];

export const MODES = {
  login: { label: "Login", head: "Start your day", steps: ["Enter your employee number and name", "Take your laptop login photo", "Submit your login time"], cta: "Continue to login" },
  logout: { label: "Logout", head: "End your day", steps: ["Confirm your details", "Take your laptop logout photo", "Fill in your team KPI sheet"], cta: "Continue to logout" },
};
