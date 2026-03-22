// ─── All Email Templates ───
// Each function returns { subject, html, fromType } for a specific email type.

import {
  emailLayout,
  heading,
  paragraph,
  button,
  infoTable,
  divider,
  statusBadge,
} from "./layout";

type EmailResult = {
  subject: string;
  html: string;
  fromType: "hello" | "notify";
};

type TemplateData = Record<string, string>;

const BASE_URL = process.env.SITE_URL || "https://theoyinbookefoundation.com";

// ─── Helper ───

function link(url: string): string {
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

// ═══════════════════════════════════════════════════════════════
//  1. ACCOUNT & ONBOARDING
// ═══════════════════════════════════════════════════════════════

export function welcome(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const content = [
    heading(`Welcome, ${name}!`),
    paragraph(
      "We're excited to have you join TheOyinbooke Foundation. Our platform connects beneficiaries, mentors, and facilitators to create lasting educational impact.",
    ),
    paragraph(
      "Get started by completing your profile and exploring the resources available to you.",
    ),
    button("Go to Dashboard", link("/dashboard")),
    divider(),
    paragraph(
      '<span style="font-size:13px;color:#737373">If you have any questions, reach out to your assigned mentor or contact our admin team.</span>',
    ),
  ].join("");

  return {
    subject: "Welcome to TheOyinbooke Foundation",
    html: emailLayout(content, `Welcome to TheOyinbooke Foundation, ${name}!`),
    fromType: "hello",
  };
}

export function roleAssigned(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const newRole = data.newRole || "member";
  const roleLabel = newRole.charAt(0).toUpperCase() + newRole.slice(1);

  const content = [
    heading(`Your role has been updated`),
    paragraph(
      `Hello ${name}, your account role has been changed to <strong>${roleLabel}</strong>.`,
    ),
    paragraph(
      "Your dashboard and available features have been updated to reflect your new role.",
    ),
    button("View Your Dashboard", link("/dashboard")),
  ].join("");

  return {
    subject: `Your role has been updated to ${roleLabel}`,
    html: emailLayout(content, `Your role is now ${roleLabel}`),
    fromType: "hello",
  };
}

export function accountDeactivated(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";

  const content = [
    heading("Account Deactivated"),
    paragraph(
      `Hello ${name}, your account on TheOyinbooke Foundation platform has been deactivated by an administrator.`,
    ),
    paragraph(
      "If you believe this was done in error, please contact the foundation admin team for assistance.",
    ),
  ].join("");

  return {
    subject: "Your account has been deactivated",
    html: emailLayout(content, "Your account has been deactivated"),
    fromType: "hello",
  };
}

export function mentorAssigned(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const mentorName = data.mentorName || "your mentor";

  const content = [
    heading("You've been paired with a mentor"),
    paragraph(
      `Hello ${name}, great news! You have been paired with <strong>${mentorName}</strong> as your mentor.`,
    ),
    paragraph(
      "Your mentor will guide you through your educational journey, provide support, and help you stay on track with your goals.",
    ),
    button("View Your Dashboard", link("/beneficiary")),
  ].join("");

  return {
    subject: `You've been paired with ${mentorName}`,
    html: emailLayout(content, `${mentorName} is now your mentor`),
    fromType: "hello",
  };
}

export function menteeAssigned(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const menteeName = data.menteeName || "a new mentee";

  const content = [
    heading("New mentee assigned to you"),
    paragraph(
      `Hello ${name}, you have been assigned a new mentee: <strong>${menteeName}</strong>.`,
    ),
    paragraph(
      "You can view their profile, education records, and add mentoring notes from your dashboard.",
    ),
    button("View Your Mentees", link("/mentor/mentees")),
  ].join("");

  return {
    subject: `New mentee assigned: ${menteeName}`,
    html: emailLayout(content, `${menteeName} has been assigned to you`),
    fromType: "hello",
  };
}

export function cohortEnrollment(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const cohortName = data.cohortName || "a new cohort";

  const content = [
    heading("You've been enrolled in a cohort"),
    paragraph(
      `Hello ${name}, you have been added to <strong>${cohortName}</strong>.`,
    ),
    paragraph(
      "You'll now have access to sessions, materials, and assessments associated with this cohort.",
    ),
    button("View Your Sessions", link("/beneficiary/sessions")),
  ].join("");

  return {
    subject: `Enrolled in ${cohortName}`,
    html: emailLayout(content, `You've been enrolled in ${cohortName}`),
    fromType: "hello",
  };
}

// ═══════════════════════════════════════════════════════════════
//  2. SESSIONS & LEARNING
// ═══════════════════════════════════════════════════════════════

export function sessionScheduled(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const sessionTitle = data.sessionTitle || "New Session";
  const sessionDate = data.sessionDate || "TBD";
  const pillar = data.sessionPillar || "";

  const rows = [
    { label: "Session", value: sessionTitle },
    { label: "Date", value: sessionDate },
  ];
  if (pillar) rows.push({ label: "Pillar", value: pillar });

  const content = [
    heading("New Session Scheduled"),
    paragraph(`Hello ${name}, a new session has been scheduled for your cohort.`),
    infoTable(rows),
    button("View Sessions", link("/beneficiary/sessions")),
  ].join("");

  return {
    subject: `New session scheduled: ${sessionTitle}`,
    html: emailLayout(content, `New session: ${sessionTitle} on ${sessionDate}`),
    fromType: "notify",
  };
}

export function sessionReminder(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const sessionTitle = data.sessionTitle || "your session";
  const sessionDate = data.sessionDate || "tomorrow";

  const content = [
    heading("Session Reminder"),
    paragraph(
      `Hello ${name}, just a reminder that <strong>${sessionTitle}</strong> is scheduled for <strong>${sessionDate}</strong>.`,
    ),
    paragraph("Please make sure to attend on time."),
    button("View Session Details", link("/beneficiary/sessions")),
  ].join("");

  return {
    subject: `Reminder: ${sessionTitle} is tomorrow`,
    html: emailLayout(content, `Reminder: ${sessionTitle} is coming up`),
    fromType: "notify",
  };
}

export function sessionCancelled(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const sessionTitle = data.sessionTitle || "a session";

  const content = [
    heading("Session Cancelled"),
    paragraph(
      `Hello ${name}, the session <strong>${sessionTitle}</strong> has been cancelled.`,
    ),
    paragraph("Please check your dashboard for any rescheduled sessions or updates."),
    button("View Sessions", link("/beneficiary/sessions")),
  ].join("");

  return {
    subject: `Session cancelled: ${sessionTitle}`,
    html: emailLayout(content, `${sessionTitle} has been cancelled`),
    fromType: "notify",
  };
}

export function newMaterial(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const materialTitle = data.materialTitle || "New material";
  const materialType = data.materialType || "resource";
  const sessionTitle = data.sessionTitle || "";

  const info = sessionTitle
    ? `A new ${materialType} has been added to the session <strong>${sessionTitle}</strong>.`
    : `A new ${materialType} has been added to the resource library.`;

  const content = [
    heading("New Material Available"),
    paragraph(`Hello ${name}, ${info}`),
    infoTable([
      { label: "Title", value: materialTitle },
      { label: "Type", value: materialType.toUpperCase() },
    ]),
    button("View Materials", link("/library")),
  ].join("");

  return {
    subject: `New material: ${materialTitle}`,
    html: emailLayout(content, `New ${materialType}: ${materialTitle}`),
    fromType: "notify",
  };
}

// ═══════════════════════════════════════════════════════════════
//  3. ASSESSMENTS
// ═══════════════════════════════════════════════════════════════

export function assessmentAssigned(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const assessmentName = data.assessmentName || "an assessment";
  const dueDate = data.dueDate || "No due date";

  const content = [
    heading("Assessment Assigned"),
    paragraph(
      `Hello ${name}, you have been assigned a new assessment.`,
    ),
    infoTable([
      { label: "Assessment", value: assessmentName },
      { label: "Due Date", value: dueDate },
    ]),
    paragraph("Please complete this assessment before the due date."),
    button("Start Assessment", link("/beneficiary/assessments")),
  ].join("");

  return {
    subject: `Assessment assigned: ${assessmentName}`,
    html: emailLayout(content, `New assessment: ${assessmentName}, due ${dueDate}`),
    fromType: "notify",
  };
}

export function assessmentDueSoon(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const assessmentName = data.assessmentName || "your assessment";
  const dueDate = data.dueDate || "soon";

  const content = [
    heading("Assessment Due Soon"),
    paragraph(
      `Hello ${name}, your assessment <strong>${assessmentName}</strong> is due on <strong>${dueDate}</strong>.`,
    ),
    paragraph("Please make sure to complete it before the deadline."),
    button("Complete Assessment", link("/beneficiary/assessments")),
  ].join("");

  return {
    subject: `Due soon: ${assessmentName}`,
    html: emailLayout(content, `${assessmentName} is due on ${dueDate}`),
    fromType: "notify",
  };
}

export function assessmentOverdue(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const assessmentName = data.assessmentName || "your assessment";

  const content = [
    heading("Assessment Overdue"),
    paragraph(
      `Hello ${name}, your assessment <strong>${assessmentName}</strong> is now <strong style="color:#DC2626">overdue</strong>.`,
    ),
    paragraph("Please complete it as soon as possible."),
    button("Complete Now", link("/beneficiary/assessments")),
  ].join("");

  return {
    subject: `Overdue: ${assessmentName}`,
    html: emailLayout(content, `${assessmentName} is overdue`),
    fromType: "notify",
  };
}

export function assessmentResults(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const assessmentName = data.assessmentName || "your assessment";
  const interpretation = data.interpretation || "";

  const interp = interpretation
    ? paragraph(`<strong>Interpretation:</strong> ${interpretation}`)
    : "";

  const content = [
    heading("Assessment Results Available"),
    paragraph(
      `Hello ${name}, the results for <strong>${assessmentName}</strong> are now available.`,
    ),
    interp,
    button("View Results", link("/beneficiary/assessments")),
  ].join("");

  return {
    subject: `Results ready: ${assessmentName}`,
    html: emailLayout(content, `Results for ${assessmentName} are ready`),
    fromType: "notify",
  };
}

// ═══════════════════════════════════════════════════════════════
//  4. SUPPORT REQUESTS & FINANCES
// ═══════════════════════════════════════════════════════════════

export function supportRequestReceived(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const requestTitle = data.requestTitle || "your request";
  const category = data.requestCategory || "";
  const amount = data.requestAmount || "";

  const rows = [{ label: "Request", value: requestTitle }];
  if (category) rows.push({ label: "Category", value: category.charAt(0).toUpperCase() + category.slice(1) });
  if (amount) rows.push({ label: "Amount", value: `\u20A6${amount}` });

  const content = [
    heading("Support Request Submitted"),
    paragraph(
      `Hello ${name}, your support request has been submitted successfully. Our admin team will review it shortly.`,
    ),
    infoTable(rows),
    statusBadge("Submitted"),
    button("Track Your Request", link("/beneficiary/support")),
  ].join("");

  return {
    subject: `Support request submitted: ${requestTitle}`,
    html: emailLayout(content, `Your support request "${requestTitle}" has been submitted`),
    fromType: "notify",
  };
}

export function supportRequestAdmin(data: TemplateData): EmailResult {
  const name = data.recipientName || "Admin";
  const requestTitle = data.requestTitle || "New request";
  const beneficiaryName = data.beneficiaryName || "a beneficiary";
  const category = data.requestCategory || "";
  const amount = data.requestAmount || "";

  const rows = [
    { label: "From", value: beneficiaryName },
    { label: "Request", value: requestTitle },
  ];
  if (category) rows.push({ label: "Category", value: category.charAt(0).toUpperCase() + category.slice(1) });
  if (amount) rows.push({ label: "Amount", value: `\u20A6${amount}` });

  const content = [
    heading("New Support Request"),
    paragraph(
      `Hello ${name}, a new support request has been submitted and is awaiting review.`,
    ),
    infoTable(rows),
    button("Review Request", link(data.ctaUrl || "/admin/support")),
  ].join("");

  return {
    subject: `New support request from ${beneficiaryName}`,
    html: emailLayout(content, `New support request from ${beneficiaryName}: ${requestTitle}`),
    fromType: "notify",
  };
}

export function requestUnderReview(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const requestTitle = data.requestTitle || "your request";

  const content = [
    heading("Request Under Review"),
    paragraph(
      `Hello ${name}, your support request <strong>${requestTitle}</strong> is now being reviewed by the admin team.`,
    ),
    statusBadge("Under Review", "#F59E0B"),
    button("View Request", link("/beneficiary/support")),
  ].join("");

  return {
    subject: `Under review: ${requestTitle}`,
    html: emailLayout(content, `Your request "${requestTitle}" is under review`),
    fromType: "notify",
  };
}

export function requestApproved(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const requestTitle = data.requestTitle || "your request";
  const amount = data.requestAmount || "";

  const amountLine = amount
    ? paragraph(`Approved amount: <strong>\u20A6${amount}</strong>`)
    : "";

  const content = [
    heading("Request Approved!"),
    paragraph(
      `Hello ${name}, your support request <strong>${requestTitle}</strong> has been <strong style="color:#00D632">approved</strong>.`,
    ),
    amountLine,
    statusBadge("Approved"),
    paragraph("Disbursement will be processed shortly."),
    button("View Details", link("/beneficiary/support")),
  ].join("");

  return {
    subject: `Approved: ${requestTitle}`,
    html: emailLayout(content, `Your request "${requestTitle}" has been approved`),
    fromType: "notify",
  };
}

export function requestDeclined(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const requestTitle = data.requestTitle || "your request";
  const reason = data.declineReason || "No reason provided.";

  const content = [
    heading("Request Declined"),
    paragraph(
      `Hello ${name}, your support request <strong>${requestTitle}</strong> has been declined.`,
    ),
    statusBadge("Declined", "#DC2626"),
    divider(),
    paragraph(`<strong>Reason:</strong> ${reason}`),
    paragraph(
      '<span style="font-size:13px;color:#737373">If you have questions about this decision, please contact the admin team.</span>',
    ),
  ].join("");

  return {
    subject: `Declined: ${requestTitle}`,
    html: emailLayout(content, `Your request "${requestTitle}" has been declined`),
    fromType: "notify",
  };
}

export function disbursementCreated(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const amount = data.disbursementAmount || "0";
  const bankRef = data.bankReference || "N/A";
  const evidenceDue = data.evidenceDueDate || "N/A";

  const rows = [
    { label: "Amount", value: `\u20A6${amount}` },
    { label: "Bank Reference", value: bankRef },
    { label: "Evidence Due", value: evidenceDue },
  ];

  const content = [
    heading("Disbursement Created"),
    paragraph(
      `Hello ${name}, a disbursement has been created for your approved support request.`,
    ),
    infoTable(rows),
    paragraph(
      "Please keep records of how the funds are used. You may be asked to submit evidence of usage.",
    ),
    button("View Details", link("/beneficiary/support")),
  ].join("");

  return {
    subject: `Disbursement of \u20A6${amount} created`,
    html: emailLayout(content, `A disbursement of \u20A6${amount} has been created for you`),
    fromType: "notify",
  };
}

export function evidenceRequested(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const amount = data.disbursementAmount || "";
  const evidenceDue = data.evidenceDueDate || "as soon as possible";

  const content = [
    heading("Evidence Required"),
    paragraph(
      `Hello ${name}, you are required to submit evidence of how the disbursed funds${amount ? ` (\u20A6${amount})` : ""} were used.`,
    ),
    infoTable([{ label: "Due By", value: evidenceDue }]),
    paragraph(
      "Upload receipts, photos, or other documentation to verify fund usage.",
    ),
    button("Upload Evidence", link("/beneficiary/support")),
  ].join("");

  return {
    subject: "Evidence required for your disbursement",
    html: emailLayout(content, "Please submit evidence for your disbursement"),
    fromType: "notify",
  };
}

export function evidenceSubmitted(data: TemplateData): EmailResult {
  const name = data.recipientName || "Admin";
  const beneficiaryName = data.beneficiaryName || "A beneficiary";
  const amount = data.disbursementAmount || "";

  const content = [
    heading("Evidence Submitted"),
    paragraph(
      `Hello ${name}, <strong>${beneficiaryName}</strong> has submitted evidence for their disbursement${amount ? ` of \u20A6${amount}` : ""}.`,
    ),
    paragraph("Please review the submitted evidence and verify or request resubmission."),
    button("Review Evidence", link(data.ctaUrl || "/admin/support")),
  ].join("");

  return {
    subject: `Evidence submitted by ${beneficiaryName}`,
    html: emailLayout(content, `${beneficiaryName} submitted disbursement evidence`),
    fromType: "notify",
  };
}

export function evidenceVerified(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const amount = data.disbursementAmount || "";

  const content = [
    heading("Evidence Verified"),
    paragraph(
      `Hello ${name}, the evidence you submitted for your disbursement${amount ? ` of \u20A6${amount}` : ""} has been <strong style="color:#00D632">verified</strong> and the request has been closed.`,
    ),
    statusBadge("Verified"),
    paragraph("Thank you for your transparency and diligence."),
    button("View Details", link("/beneficiary/support")),
  ].join("");

  return {
    subject: "Your disbursement evidence has been verified",
    html: emailLayout(content, "Your disbursement evidence has been verified"),
    fromType: "notify",
  };
}

export function evidenceOverdue(data: TemplateData): EmailResult {
  const name = data.recipientName || "there";
  const amount = data.disbursementAmount || "";
  const isAdmin = data.isAdmin === "true";

  const content = isAdmin
    ? [
        heading("Evidence Overdue"),
        paragraph(
          `Hello ${name}, evidence for a disbursement${amount ? ` of \u20A6${amount}` : ""} from <strong>${data.beneficiaryName || "a beneficiary"}</strong> is now overdue.`,
        ),
        statusBadge("Overdue", "#DC2626"),
        button("Review Disbursement", link(data.ctaUrl || "/admin/support")),
      ].join("")
    : [
        heading("Evidence Overdue"),
        paragraph(
          `Hello ${name}, the evidence for your disbursement${amount ? ` of \u20A6${amount}` : ""} is now <strong style="color:#DC2626">overdue</strong>.`,
        ),
        statusBadge("Overdue", "#DC2626"),
        paragraph("Please submit your evidence as soon as possible to avoid further action."),
        button("Upload Evidence Now", link("/beneficiary/support")),
      ].join("");

  return {
    subject: amount
      ? `Evidence overdue for \u20A6${amount} disbursement`
      : "Evidence overdue for disbursement",
    html: emailLayout(content, "Disbursement evidence is overdue"),
    fromType: "notify",
  };
}

// ═══════════════════════════════════════════════════════════════
//  5. SAFEGUARDING
// ═══════════════════════════════════════════════════════════════

export function safeguardingAlertMentor(data: TemplateData): EmailResult {
  const name = data.recipientName || "Mentor";
  const beneficiaryName = data.beneficiaryName || "a beneficiary";
  const assessmentName = data.assessmentName || "an assessment";
  const actionRequired = data.actionRequired || "";

  const content = [
    heading("Safeguarding Alert"),
    paragraph(
      `Hello ${name}, a safeguarding concern has been flagged for your mentee <strong>${beneficiaryName}</strong> based on their assessment results.`,
    ),
    infoTable([
      { label: "Mentee", value: beneficiaryName },
      { label: "Assessment", value: assessmentName },
      { label: "Priority", value: "Mentor Review Required" },
    ]),
    actionRequired ? paragraph(`<strong>Recommended action:</strong> ${actionRequired}`) : "",
    paragraph(
      "Please review and take appropriate action as soon as possible.",
    ),
    button("View Safeguarding Actions", link("/mentor/mentees")),
  ].join("");

  return {
    subject: `Safeguarding alert for ${beneficiaryName}`,
    html: emailLayout(content, `Safeguarding concern flagged for ${beneficiaryName}`),
    fromType: "notify",
  };
}

export function safeguardingAlertAdmin(data: TemplateData): EmailResult {
  const name = data.recipientName || "Admin";
  const beneficiaryName = data.beneficiaryName || "a beneficiary";
  const assessmentName = data.assessmentName || "an assessment";
  const actionRequired = data.actionRequired || "";

  const content = [
    heading("Safeguarding Alert \u2014 Admin Review Required"),
    paragraph(
      `Hello ${name}, a safeguarding concern requiring <strong>admin review</strong> has been flagged for <strong>${beneficiaryName}</strong>.`,
    ),
    infoTable([
      { label: "Beneficiary", value: beneficiaryName },
      { label: "Assessment", value: assessmentName },
      { label: "Priority", value: "Admin Review Required" },
    ]),
    actionRequired ? paragraph(`<strong>Recommended action:</strong> ${actionRequired}`) : "",
    button("Review in Safeguarding Dashboard", link("/admin/safeguarding")),
  ].join("");

  return {
    subject: `[URGENT] Safeguarding review needed: ${beneficiaryName}`,
    html: emailLayout(content, `Urgent safeguarding review for ${beneficiaryName}`),
    fromType: "notify",
  };
}

export function safeguardingResolved(data: TemplateData): EmailResult {
  const name = data.recipientName || "Mentor";
  const beneficiaryName = data.beneficiaryName || "a beneficiary";
  const resolutionNote = data.resolutionNote || "No additional notes.";

  const content = [
    heading("Safeguarding Action Resolved"),
    paragraph(
      `Hello ${name}, the safeguarding action for <strong>${beneficiaryName}</strong> has been resolved.`,
    ),
    statusBadge("Resolved"),
    divider(),
    paragraph(`<strong>Resolution note:</strong> ${resolutionNote}`),
  ].join("");

  return {
    subject: `Safeguarding resolved for ${beneficiaryName}`,
    html: emailLayout(content, `Safeguarding action for ${beneficiaryName} has been resolved`),
    fromType: "notify",
  };
}

// ═══════════════════════════════════════════════════════════════
//  TEMPLATE REGISTRY
// ═══════════════════════════════════════════════════════════════

const TEMPLATES: Record<string, (data: TemplateData) => EmailResult> = {
  welcome,
  "role-assigned": roleAssigned,
  "account-deactivated": accountDeactivated,
  "mentor-assigned": mentorAssigned,
  "mentee-assigned": menteeAssigned,
  "cohort-enrollment": cohortEnrollment,
  "session-scheduled": sessionScheduled,
  "session-reminder": sessionReminder,
  "session-cancelled": sessionCancelled,
  "new-material": newMaterial,
  "assessment-assigned": assessmentAssigned,
  "assessment-due-soon": assessmentDueSoon,
  "assessment-overdue": assessmentOverdue,
  "assessment-results": assessmentResults,
  "support-request-received": supportRequestReceived,
  "support-request-admin": supportRequestAdmin,
  "request-under-review": requestUnderReview,
  "request-approved": requestApproved,
  "request-declined": requestDeclined,
  "disbursement-created": disbursementCreated,
  "evidence-requested": evidenceRequested,
  "evidence-submitted": evidenceSubmitted,
  "evidence-verified": evidenceVerified,
  "evidence-overdue": evidenceOverdue,
  "safeguarding-alert-mentor": safeguardingAlertMentor,
  "safeguarding-alert-admin": safeguardingAlertAdmin,
  "safeguarding-resolved": safeguardingResolved,
};

export function renderTemplate(
  emailType: string,
  data: TemplateData,
): EmailResult {
  const templateFn = TEMPLATES[emailType];
  if (!templateFn) {
    throw new Error(`Unknown email template: ${emailType}`);
  }
  return templateFn(data);
}

export function getAvailableTemplates(): string[] {
  return Object.keys(TEMPLATES);
}
