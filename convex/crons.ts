import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run session reminders every 6 hours
crons.interval(
  "session reminders",
  { hours: 6 },
  internal.notifications.sendSessionReminders,
  {},
);

// Run evidence overdue check every 12 hours
crons.interval(
  "evidence overdue check",
  { hours: 12 },
  internal.notifications.sendEvidenceOverdueNotifications,
  {},
);

// Mark overdue assessment assignments every 6 hours
crons.interval(
  "assessment overdue check",
  { hours: 6 },
  internal.assessments.assignments.markOverdue,
  {},
);

export default crons;
