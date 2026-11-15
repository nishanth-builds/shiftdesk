// Edit this file to change the teams or the KPI questions on the logout page.
// type: "number" = whole number (required) | "rating" = 1 to 5 (required) | "yesno" = Yes/No (required)
//       "text" = short free text (optional) | "long" = long free text (optional, full width)
// s: optional section heading shown above a group of questions
export const TEAMS = ["Support", "Sales", "Operations", "Management"];

const R = (k, label, s) => ({ k, label, type: "rating", s });
const N = (k, label, s) => ({ k, label, type: "number", s });
const L = (k, label, s) => ({ k, label, type: "long", s });

export const KPI = {
  Support: [
    N("scheduled", "Sessions scheduled"),
    N("initialMeetings", "First-time sessions"),
    N("initialConducted", "First-time conducted"),
    N("initialMissed", "First-time missed"),
    N("conducted", "Sessions conducted"),
    N("missed", "Sessions missed"),
    N("targetHit", "Targets hit"),
    N("targetMissed", "Targets missed"),
    N("duration", "Duration (minutes)"),
  ],
  Sales: [
    N("conversions", "Today's sales value"),
    N("reminding", "Payment reminders sent (yesterday)"),
    N("leads", "Leads scheduled"),
    N("calls", "Client calls made"),
    N("picked", "Calls answered"),
    N("notPicked", "Calls not answered"),
    N("rescheduled", "Calls rescheduled"),
    N("pitch", "Pitches made"),
    N("conversation", "Conversations held"),
    N("nonConversation", "No conversation"),
    N("paid", "Clients paid"),
    N("nonPaid", "Clients not paid"),
    N("pendingPayment", "Pending payments (value)"),
    N("duration", "Duration (minutes)"),
  ],
  Operations: [
    N("totalClients", "Total clients"),
    N("calls", "Client calls made"),
    N("picked", "Calls answered"),
    N("notPicked", "Calls not answered"),
    N("newMeetings", "New meetings scheduled"),
    N("paused", "Clients paused"),
    N("trainersScheduled", "Staff scheduled"),
    N("meetingsScheduled", "Meetings scheduled"),
    N("meetingsRescheduled", "Meetings rescheduled"),
    N("rememberCalls", "Reminder calls (last hour of shift)"),
    { k: "messageCheck", label: "Client messages checked", type: "yesno" },
  ],
  Management: [
    N("revenue", "Today's revenue", "Business performance"),
    N("newLeads", "New leads generated"),
    N("leadsFollowed", "Leads followed up"),
    N("newClients", "New clients converted"),
    N("pendingPayments", "Pending client payments"),
    N("meetingsScheduled", "Number of meetings scheduled"),
    N("meetingsCompleted", "Number of meetings completed"),

    R("dailyOps", "Daily operations management", "Management performance (rate 1 to 5)"),
    R("taskCompletion", "Task completion"),
    R("teamCoord", "Team management & coordination"),
    R("employeePerf", "Employee performance management"),
    R("finance", "Financial management"),
    R("reporting", "Reporting & documentation"),
    R("communication", "Communication & accountability"),
    R("problemSolving", "Problem-solving & decision-making"),
    R("planning", "Planning & execution"),
    R("growth", "Business growth & development"),

    L("achievements", "Today's major achievements", "Daily closing report"),
    L("challenges", "Challenges faced"),
    L("pendingTasks", "Pending tasks"),
    L("priorities", "Tomorrow's priorities"),
  ],
};
