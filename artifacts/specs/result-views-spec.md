# Result Views Specification

> TheOyinbooke Foundation Platform -- Assessment Result Views
> Version: 1.0
> Date: 2026-03-21
> Status: Draft

---

## 1. Overview

This document specifies the UI views for displaying assessment results across four user roles: beneficiaries, admins, facilitators, and mentors. Each role sees different levels of detail and different types of actionable information.

### Design System References

All views follow the TOF Design System (`/Design-System.md`). Key tokens used throughout:

| Token | Value | Usage in Results |
|-------|-------|-----------------|
| `--color-primary` | `#00D632` | Positive scores, success states, green severity band |
| `--color-warning` | `#F59E0B` | Amber severity band, moderate scores |
| `--color-error` | `#EF4444` | Red severity band (`admin_review` flags) |
| Custom orange | `#E65100` | Orange severity band (`mentor_notify` flags) |
| `--color-gray-900` | `#171717` | Headings, strong text |
| `--color-gray-500` | `#737373` | Secondary text, metadata |
| `--color-gray-200` | `#E5E5E5` | Borders, dividers |
| `--color-gray-50` | `#F7F7F7` | Page background |
| `--color-white` | `#FFFFFF` | Card backgrounds |

### Severity Band Colors

All severity band colors are standardized:

| Band Level | Hex | CSS Class | Usage |
|-----------|-----|-----------|-------|
| Green (healthy/positive) | `#00D632` | `bg-[#E6FBF0] text-[#00D632]` | No concern |
| Amber (moderate/watch) | `#F59E0B` | `bg-yellow-50 text-yellow-600` | Moderate range, room for growth |
| Orange (mentor_notify) | `#E65100` | `bg-orange-50 text-orange-600` | Needs mentor attention |
| Red (admin_review) | `#EF4444` | `bg-red-50 text-red-600` | Needs admin review/intervention |

### Chart Library

Use `recharts` for all data visualizations. It integrates well with React and supports responsive containers, bar charts, radial charts, and line charts needed for these views.

---

## 2. Beneficiary Result View

**Route:** `/beneficiary/assessments/[assignmentId]/results`
**Access:** The beneficiary who completed the assessment
**Loaded after:** Assessment submission completes and scoring is done
**Data sources:** `assessmentScores`, `assessmentResponses`, `assessmentTemplates`, prior scores for the same instrument

### 2.1 Score Display Card

The primary card shown immediately after submission.

```
+------------------------------------------------------------------+
|  [Template ShortCode Badge]   [Template Full Name]               |
|                                                                  |
|  +--------------------------+                                    |
|  |      SCORE GAUGE         |                                    |
|  |                          |                                    |
|  |    [Visual Gauge]        |    Your Score: [score]             |
|  |                          |    [Severity Band Badge]           |
|  |                          |    [Band Color Indicator]          |
|  +--------------------------+                                    |
|                                                                  |
|  [Platform Display Text -- empathetic, non-clinical]             |
|                                                                  |
+------------------------------------------------------------------+
```

**Score Gauge Component:**

- **For sum-scored instruments (GAD-7, SWBS, GSE, FSES, DSES, CDSE-SF):**
  - Horizontal progress bar showing score position within the total possible range
  - Bar divided into colored sections matching severity bands
  - A marker/indicator dot showing where the beneficiary's score falls
  - Score value displayed prominently (24px semi-bold, `--text-detail-amount`)

- **For mean-scored instruments (RAS, BRS, Grit-S, ESE, SL-7, ALQ, CTDA, SPCS):**
  - Radial gauge (semi-circle) showing score on the instrument's scale
  - Scale range labeled at both ends (e.g., "1.0" to "5.0")
  - Score displayed in the center of the gauge
  - Gauge arc colored by severity band

- **For subscale-only instruments (MLQ, AGQ-R):**
  - No single score gauge
  - Instead, display the subscale breakdown directly (see 2.2)
  - Header text reads "Your Profile" instead of "Your Score"

**Severity Band Badge:**
- Pill badge component (`rounded-full px-2.5 py-0.5 text-xs font-medium`)
- Background and text color from severity band color map
- Label text from the `severityBand` field (e.g., "Mild anxiety", "High resilience")

**Platform Display Text:**
- Below the gauge, in `--text-body` size
- Uses empathetic, non-clinical language from the template's `displayTexts` array
- Examples:
  - GAD-7 Minimal: "Your anxiety levels are minimal. Keep up the healthy practices you have in place."
  - Grit-S Below Average: "You may find it challenging to stick with goals over time. The accountability tools from this session can help you build consistency."
  - MLQ Low Presence / High Search: "You are actively searching for your life's purpose. This session is designed to help you find clarity."

### 2.2 Subscale Breakdown Panel

Shown for all instruments with subscales. Appears below the main score card.

```
+------------------------------------------------------------------+
|  Subscale Breakdown                                              |
|                                                                  |
|  [Subscale Name 1]                              [score] / [max] |
|  [==============================-------]                         |
|                                                                  |
|  [Subscale Name 2]                              [score] / [max] |
|  [==================--------------------]                         |
|                                                                  |
|  [Subscale Name 3]                              [score] / [max] |
|  [======================================]                         |
|                                                                  |
+------------------------------------------------------------------+
```

**Implementation:**
- Card component (`rounded-xl border border-[#E5E5E5] bg-white p-6`)
- Section heading: "Subscale Breakdown" (`text-sm font-semibold text-[#171717]`)
- Each subscale row:
  - Label left-aligned (`text-sm text-[#262626]`)
  - Score right-aligned (`text-sm font-medium text-[#171717]`)
  - Horizontal bar below: background `#F0F0F0`, filled portion colored by the subscale's relative position (green if healthy, amber if moderate, etc.)
  - Bar height: 8px, border-radius: 4px

**For MLQ (2x2 matrix display):**

Instead of bars, show a 2x2 grid:

```
+------------------------------------------------------------------+
|  Your Meaning in Life Profile                                    |
|                                                                  |
|  +---------------------------+---------------------------+       |
|  |  HIGH PRESENCE            |  HIGH PRESENCE            |       |
|  |  LOW SEARCH               |  HIGH SEARCH              |       |
|  |                           |                           |       |
|  |  "Clear purpose"          |  "Grounded but exploring" |       |
|  |  [Presence: 28]           |  [Presence: 28]           |       |
|  |  [Search: 12]             |  [Search: 28]             |       |
|  +---------------------------+---------------------------+       |
|  |  LOW PRESENCE             |  LOW PRESENCE             |       |
|  |  LOW SEARCH               |  HIGH SEARCH              |       |
|  |                           |                           |       |
|  |  "Uncertain direction"    |  "Actively searching"     |       |
|  |  [Presence: 15]           |  [Presence: 15]           |       |
|  |  [Search: 12]             |  [Search: 28]             |       |
|  +---------------------------+---------------------------+       |
|                                                                  |
|  [Highlight the cell matching the beneficiary's scores]          |
+------------------------------------------------------------------+
```

- The matching cell gets a colored border and background tint
- Non-matching cells are grayed out (`bg-[#F7F7F7] opacity-50`)

**For AGQ-R (2x2 matrix display):**

Similar grid showing the four goal orientations with the beneficiary's scores highlighted.

### 2.3 Interpretation Panel

```
+------------------------------------------------------------------+
|  What This Means                                                 |
|                                                                  |
|  [Interpretation paragraph -- plain language, encouraging]       |
|                                                                  |
|  Connection to your session:                                     |
|  [Text connecting the score to the session they attended]        |
|                                                                  |
|  Next steps:                                                     |
|  - [Actionable suggestion 1]                                     |
|  - [Actionable suggestion 2]                                     |
|  - [Actionable suggestion 3]                                     |
|                                                                  |
+------------------------------------------------------------------+
```

**Content Rules:**
- Language is always encouraging, never alarming
- For clinical instruments (GAD-7), never use diagnostic language
- Connect the score to the specific session theme
- Provide 2-3 concrete next steps

**Clinical Disclaimer (for GAD-7, BRS, RAS when scores are concerning):**

```
+------------------------------------------------------------------+
|  [Info Icon]  Important Note                                     |
|                                                                  |
|  This assessment is a screening tool, not a diagnosis. Your      |
|  score indicates areas where additional support may be helpful.   |
|  If you are struggling, please reach out to your mentor or a     |
|  professional counselor. You are not alone.                       |
+------------------------------------------------------------------+
```

- Card with `border-l-4 border-[#3B82F6] bg-blue-50 p-4`
- Info icon: blue (#3B82F6), 18px
- Text: `text-sm text-[#262626]`
- Shown when the template has `clinicalDisclaimer: true` AND the score falls in a concerning band

### 2.4 Growth Tracking Panel

Shown when the beneficiary has previously completed the same instrument (re-administration at midpoint or completion).

```
+------------------------------------------------------------------+
|  Your Growth                                                     |
|                                                                  |
|  [Session 1]              [Session 9]             [Session 16]   |
|                                                                  |
|  +------------------------------------------------------------+ |
|  |                                                            | |
|  |         [Bar Chart or Line Chart]                          | |
|  |    28                                                      | |
|  |    |     *--------*                                        | |
|  |    |    /          \                                       | |
|  |    20  *            *--------*  32                         | |
|  |    |                                                       | |
|  +------------------------------------------------------------+ |
|                                                                  |
|  [Direction Arrow Up/Down]  Your score [increased/decreased]     |
|  by [X points/X.X] since your last assessment.                   |
|                                                                  |
|  [Celebration text if improved]                                  |
+------------------------------------------------------------------+
```

**Implementation:**
- Use `recharts` `<LineChart>` or `<BarChart>` component
- X-axis: assessment dates or session labels
- Y-axis: score values
- Data points connected by line, colored by severity band at each point
- Change indicator below chart:
  - Green up arrow + "Improved by X" if score moved in the positive direction
  - Amber sideways arrow + "Stayed consistent" if minimal change
  - Red down arrow + "Changed by X" if score moved in the concerning direction
- Note: "positive direction" depends on instrument. For GAD-7, lower is better. For GSE, higher is better.

**Celebration Text (for improvement):**
- "Great progress! Your [metric] has improved since [last date]."
- Tone: warm, encouraging, acknowledging effort
- Only shown when the direction of change is positive

### 2.5 Privacy Notice

Always shown at the bottom of the result view.

```
+------------------------------------------------------------------+
|  [Lock Icon]  About Your Results                                 |
|                                                                  |
|  Your results are private. They are shared only with:            |
|  - Your assigned mentor (to support you better)                  |
|  - Program administrators (only if your score indicates you      |
|    may need additional support)                                  |
|                                                                  |
|  Your results are used to help us support you, never to judge    |
|  you. If you have questions, speak with your mentor.             |
+------------------------------------------------------------------+
```

- Card: `rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] p-4`
- Lock icon: `#737373`, 16px
- Text: `text-xs text-[#737373]`

---

## 3. Admin Result View

**Route:** `/admin/assessments/results` (cohort overview) and `/admin/beneficiaries/[userId]/assessments` (individual)
**Access:** Users with `role === "admin"`
**Data sources:** `assessmentScores`, `assessmentResponses`, `assessmentTemplates`, `users`, `safeguardingActions`, `cohortMemberships`

### 3.1 Individual Assessment Results

Shown when an admin views a specific beneficiary's assessment.

```
+------------------------------------------------------------------+
|  [Beneficiary Name]  [Cohort Badge]                              |
|  Assessment: [Template Name] ([ShortCode])                       |
|  Completed: [Date]                                               |
|                                                                  |
|  +---------------------------+  +-----------------------------+  |
|  |  SCORE SUMMARY            |  |  FLAG STATUS                |  |
|  |                           |  |                             |  |
|  |  Total: [score]           |  |  [Flag Badge]               |  |
|  |  Band: [severity badge]   |  |  [Safeguarding Status]     |  |
|  |  Scoring: [sum/average]   |  |  [Link to Safeguarding]    |  |
|  +---------------------------+  +-----------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
```

**Subscale Detail Table:**

```
+------------------------------------------------------------------+
|  Subscale Scores                                                 |
|                                                                  |
|  | Subscale              | Score  | Range    | Bar             | |
|  |-----------------------|--------|----------|-----------------|  |
|  | Self-Appraisal        | 14     | 0-20     | [==========---] |  |
|  | Occupational Info     | 8      | 0-20     | [=====---------] |  |
|  | Goal Selection        | 16     | 0-20     | [============-] |  |
|  | Planning              | 11     | 0-20     | [=======------] |  |
|  | Problem Solving       | 13     | 0-20     | [=========----] |  |
|                                                                  |
+------------------------------------------------------------------+
```

- Table uses existing table row pattern (`52px height, 12px 16px padding, 1px divider`)
- Progress bar in last column: colored by relative position within the subscale range

**Scoring Details (Expandable):**

```
+------------------------------------------------------------------+
|  v  Scoring Details                                              |
|                                                                  |
|  Scoring method: Sum                                             |
|  Items answered: 25 / 25                                         |
|                                                                  |
|  Reversed items: None                                            |
|                                                                  |
|  Item-by-item:                                                   |
|  | # | Raw | Reversed? | Final | Subscale           |           |
|  |---|-----|-----------|-------|--------------------|           |
|  | 1 |  3  |    No     |   3   | Self-Appraisal     |           |
|  | 2 |  2  |    No     |   2   | Self-Appraisal     |           |
|  | 3 |  4  |    No     |   4   | Self-Appraisal     |           |
|  ...                                                             |
+------------------------------------------------------------------+
```

- Collapsible section (chevron toggle pattern)
- Shows the complete scoring computation for auditability
- For reversed items, shows both the raw answer and the reversed score

**Cross-References Panel:**

```
+------------------------------------------------------------------+
|  Other Assessment Scores for [Name]                              |
|                                                                  |
|  | Instrument | Session | Score     | Band          | Date      ||
|  |------------|---------|-----------|---------------|-----------|
|  | MLQ        | S1      | P:28 S:15 | High P/Low S | Jan 15    ||
|  | GAD-7      | S4      | 12        | Moderate      | Feb 12    ||
|  | GSE        | S6      | 24        | Moderate      | Mar 10    ||
|  | Grit-S     | S9      | 3.2       | Moderate      | Apr 7     ||
|                                                                  |
|  [Cross-Instrument Alerts]                                       |
|  ! High anxiety (GAD-7: 12) + Low self-efficacy (GSE: 24)       |
|    — this combination needs targeted mentorship                  |
+------------------------------------------------------------------+
```

- Links each row to the individual assessment detail
- Cross-instrument alerts shown if patterns from Appendix A are detected

### 3.2 Cohort Overview Dashboard

**Route:** `/admin/assessments/dashboard`

The primary admin view for understanding how the cohort is performing across all instruments.

#### Distribution Charts

```
+------------------------------------------------------------------+
|  GAD-7 Score Distribution (Cohort: [Name])                       |
|                                                                  |
|  [Stacked Bar Chart]                                             |
|                                                                  |
|  |  Minimal  |  Mild  |  Moderate  |  Severe  |                 |
|  |===========|========|============|==========|                  |
|  |    45%    |  30%   |    18%     |    7%    |                  |
|  |  (18)     |  (12)  |    (7)     |   (3)    |                  |
|                                                                  |
+------------------------------------------------------------------+
```

- Use `recharts` `<BarChart>` with stacked bars
- One chart per instrument that has been administered
- Bars colored by severity band
- Show both percentage and count
- Chart fits within a card component

#### Average Scores Table

```
+------------------------------------------------------------------+
|  Cohort Average Scores                                           |
|                                                                  |
|  | Instrument | Avg Score | Range   | Avg Band    | n   |       |
|  |------------|-----------|---------|-------------|-----|       |
|  | GAD-7      | 7.2       | 0-21    | Mild        | 40  |       |
|  | GSE        | 26.4      | 10-40   | Moderate    | 38  |       |
|  | Grit-S     | 3.4       | 1-5     | Moderate    | 35  |       |
|  | BRS        | 3.1       | 1-5     | Normal      | 35  |       |
|                                                                  |
+------------------------------------------------------------------+
```

- Sortable by any column
- Average band determined by applying severity bands to the average score
- `n` shows number of completed assessments for that instrument

#### Flag Summary

```
+------------------------------------------------------------------+
|  Flag Summary                                                    |
|                                                                  |
|  +------------------+  +------------------+  +------------------+|
|  |  [!] admin_review |  |  [!] mentor_notify|  |  [check] none   ||
|  |       3           |  |       12          |  |       85        ||
|  |  View all -->     |  |  View all -->     |  |                 ||
|  +------------------+  +------------------+  +------------------+|
|                                                                  |
+------------------------------------------------------------------+
```

- Three summary cards showing flag counts
- `admin_review` card: red accent (`border-l-4 border-red-500`)
- `mentor_notify` card: orange accent (`border-l-4 border-orange-500`)
- `none` card: green accent (`border-l-4 border-[#00D632]`)
- "View all" links to the Flagged Scores Panel (3.3)

#### Growth Tracking (Pre/Post)

```
+------------------------------------------------------------------+
|  Cohort Growth: Pre vs Post Comparison                           |
|                                                                  |
|  [Grouped Bar Chart]                                             |
|                                                                  |
|  MLQ-P  |===== 22  |========= 28                                |
|  GAD-7  |========= 9.2  |====== 6.1                             |
|  GSE    |======= 24  |========== 31                              |
|  Grit-S |====== 3.1  |======== 3.8                               |
|  SPCS   |===== 2.8  |========= 3.9                               |
|                                                                  |
|  [Blue = Pre]  [Green = Post]                                    |
|                                                                  |
|  Overall: 4/5 instruments showed improvement                     |
+------------------------------------------------------------------+
```

- Use `recharts` `<BarChart>` with grouped bars (pre/post side by side)
- Pre bars in `#3B82F6` (info blue), post bars in `#00D632` (primary green)
- Direction arrows on each pair showing improvement or regression
- Summary line below the chart

### 3.3 Flagged Scores Panel

**Route:** `/admin/assessments/flagged` or integrated into `/admin/safeguarding`

```
+------------------------------------------------------------------+
|  Flagged Assessment Scores                                       |
|                                                                  |
|  [Filter: All | admin_review | mentor_notify]                   |
|  [Filter: Instrument | Date Range | Cohort]                     |
|                                                                  |
|  +--------------------------------------------------------------+|
|  | [!] [Name]           GAD-7   Score: 18   Severe              ||
|  |     admin_review     Completed: Mar 15                       ||
|  |     Safeguarding: [open] [View Action -->]                   ||
|  +--------------------------------------------------------------+|
|  | [!] [Name]           BRS     Mean: 1.8   Low resilience      ||
|  |     admin_review     Completed: Mar 14                       ||
|  |     Safeguarding: [in_progress] [View Action -->]            ||
|  +--------------------------------------------------------------+|
|  | [!] [Name]           FSES    Score: 8    Low                 ||
|  |     mentor_notify    Completed: Mar 12                       ||
|  |     Safeguarding: [resolved] [View Action -->]               ||
|  +--------------------------------------------------------------+|
|                                                                  |
+------------------------------------------------------------------+
```

**List Item Component:**
- Card with left border colored by flag level (red for admin_review, orange for mentor_notify)
- Alert icon matching flag level
- Beneficiary name (linked to their profile)
- Instrument short code + score + severity band label
- Safeguarding action status badge
- "View Action" links to the safeguarding detail or creates a new action if none exists

**Quick Actions:**
- "Create Safeguarding Action" button if no action exists for this score
- "Assign to Mentor" quick action dropdown
- "Mark as Reviewed" for quick dismissal of false positives

**Status Flow:**
- `open` --> `in_progress` --> `resolved` / `dismissed`
- Each transition logs who performed it and when
- Status badges use existing color scheme from safeguarding page

### 3.4 Cross-Session Analysis

**Route:** `/admin/assessments/analysis`

Implements the connection patterns from Appendix A of the reference document.

#### Pattern Cards

```
+------------------------------------------------------------------+
|  Cross-Instrument Patterns                                       |
|                                                                  |
|  +--------------------------------------------------------------+|
|  |  Vision + Purpose (MLQ + Grit-S)                             ||
|  |                                                               ||
|  |  Beneficiaries with concerning pattern: 5 / 40               ||
|  |  [Low Presence + Low Grit = no direction + no persistence]   ||
|  |                                                               ||
|  |  [Name 1] - P:12, Grit:2.1                                  ||
|  |  [Name 2] - P:18, Grit:2.4                                  ||
|  |  [Name 3] - P:10, Grit:1.8                                  ||
|  |  ... [Show all -->]                                          ||
|  +--------------------------------------------------------------+|
|                                                                  |
|  +--------------------------------------------------------------+|
|  |  Trust + Anxiety (SWBS + GAD-7)                              ||
|  |                                                               ||
|  |  Beneficiaries with concerning pattern: 3 / 40               ||
|  |  [Low SWB + High GAD-7 = spiritual well-being not buffering] ||
|  |                                                               ||
|  |  [Name 1] - SWB:35, GAD-7:16                                ||
|  |  [Name 2] - SWB:42, GAD-7:14                                ||
|  |  ... [Show all -->]                                          ||
|  +--------------------------------------------------------------+|
|                                                                  |
+------------------------------------------------------------------+
```

**All Patterns:**

| Pattern Name | Instruments | Concerning Condition |
|-------------|------------|---------------------|
| Vision + Purpose | MLQ (S1) + Grit-S (S9) | Low Presence (<20) AND Low Overall Grit (<3.0) |
| Trust + Anxiety | SWBS (S3) + GAD-7 (S4) | SWB < 60 AND GAD-7 >= 10 |
| Self-Belief Chain | GSE (S6) + FSES (S7) + ESE (S10) | GSE < 20 AND (FSES < 12 OR ESE < 2.5) |
| Leadership Arc | SL-7 (S11) + ALQ (S14) + SPCS (S16) | All three below moderate thresholds |
| Resilience + Grit | BRS (S12) + Grit-S (S9) | BRS < 3.0 AND PE < 3.0 |
| Emotional Maturity | GAD-7 (S4) + RAS (S8) + BRS (S12) | GAD-7 >= 10 AND RAS < 3.0 AND BRS < 3.0 |
| Critical + Spiritual | CTDA (S15) + DSES (S5) + SWBS (S3) | CTDA < 3.5 AND DSES < 45 AND SWB < 60 |
| Career Readiness | CDSE (S13) + ESE (S10) + Grit-S (S9) + AGQ-R (S2) | CDSE < 40 AND ESE < 2.5 AND Grit < 3.0 AND PAv >= 5.0 |

**Export Capability:**
- "Export to CSV" button on each pattern card
- Exports: beneficiary name, email, instrument scores, pattern match details
- "Export Full Report" button generates a summary PDF for program evaluation

### 3.5 Pillar Progress Report

**Route:** `/admin/assessments/pillars`

Aggregates scores by curriculum pillar to identify cohort strengths and weaknesses.

```
+------------------------------------------------------------------+
|  Pillar Progress Report                                          |
|                                                                  |
|  +--------------------------------------------------------------+|
|  |  Spiritual Development                                       ||
|  |  Sessions: 1 (MLQ), 3 (SWBS), 5 (DSES), 9 (Grit-S)        ||
|  |                                                               ||
|  |  [Radar Chart showing average subscale scores]               ||
|  |                                                               ||
|  |  Overall strength: Moderate                                  ||
|  |  Key gap: Daily spiritual practice (DSES avg: 48)            ||
|  +--------------------------------------------------------------+|
|                                                                  |
|  +--------------------------------------------------------------+|
|  |  Emotional Development                                       ||
|  |  Sessions: 4 (GAD-7), 8 (RAS), 12 (BRS)                    ||
|  |                                                               ||
|  |  [Radar Chart showing average subscale scores]               ||
|  |                                                               ||
|  |  Overall strength: Below Average                             ||
|  |  Key gap: Resilience (BRS avg: 2.8)                          ||
|  +--------------------------------------------------------------+|
|                                                                  |
|  +--------------------------------------------------------------+|
|  |  Financial & Career Development                              ||
|  |  Sessions: 2 (AGQ-R), 6 (GSE), 7 (FSES), 10 (ESE),        ||
|  |  13 (CDSE-SF)                                                ||
|  |                                                               ||
|  |  [Radar Chart showing average subscale scores]               ||
|  |                                                               ||
|  |  Overall strength: Moderate                                  ||
|  |  Key gap: Financial self-efficacy (FSES avg: 13)             ||
|  +--------------------------------------------------------------+|
|                                                                  |
|  +--------------------------------------------------------------+|
|  |  Discipleship & Leadership                                   ||
|  |  Sessions: 11 (SL-7), 14 (ALQ), 15 (CTDA), 16 (SPCS-R)    ||
|  |                                                               ||
|  |  [Radar Chart showing average subscale scores]               ||
|  |                                                               ||
|  |  Overall strength: Strong                                    ||
|  |  Key gap: Critical thinking (CTDA avg: 3.8)                  ||
|  +--------------------------------------------------------------+|
|                                                                  |
+------------------------------------------------------------------+
```

**Pillar-Instrument Mapping:**

| Pillar | Instruments |
|--------|------------|
| Spiritual Development | MLQ (S1), SWBS (S3), DSES (S5), Grit-S (S9) |
| Emotional Development | GAD-7 (S4), RAS (S8), BRS (S12) |
| Financial & Career Development | AGQ-R (S2), GSE (S6), FSES (S7), ESE (S10), CDSE-SF (S13) |
| Discipleship & Leadership | SL-7 (S11), ALQ-Self (S14), CTDA (S15), SPCS-R (S16) |

**Radar Chart:**
- Use `recharts` `<RadarChart>` component
- One axis per instrument in the pillar
- Scores normalized to 0-100 scale for cross-instrument comparison
- Filled area shows cohort average profile
- Optional: overlay individual beneficiary profile on the cohort average

**Normalization formula:**
```
normalizedScore = ((rawScore - scaleMin) / (scaleMax - scaleMin)) * 100
```

For instruments where lower is better (GAD-7): invert before normalizing.

---

## 4. Facilitator View

**Route:** `/facilitator/sessions/[sessionId]/briefing`
**Access:** Users with `role === "facilitator"` assigned to the session
**Timing:** Available once assessments for the upcoming session have been collected

### 4.1 Pre-Session Briefing

```
+------------------------------------------------------------------+
|  Pre-Session Briefing                                            |
|  Session 4: Dealing with Anxiety (GAD-7)                         |
|  Scheduled: [Date]   Cohort: [Name]                              |
|                                                                  |
+------------------------------------------------------------------+
|  Assessment Summary                                              |
|                                                                  |
|  Completed: 38 / 40 beneficiaries                                |
|                                                                  |
|  [Distribution Chart - same as admin but simplified]             |
|                                                                  |
|  |  Minimal  |  Mild  |  Moderate  |  Severe  |                 |
|  |===========|========|============|==========|                  |
|  |   45%     |  30%   |    18%     |    7%    |                  |
+------------------------------------------------------------------+
|  Common Themes to Address                                        |
|                                                                  |
|  - 25% of the cohort scores in the moderate-to-severe range.     |
|    Consider spending extra time on coping strategies.             |
|  - Average score: 7.2 (Mild). The cohort is generally managing   |
|    but could benefit from anxiety prevention tools.              |
|  - 7% scored Severe. These beneficiaries may need more           |
|    individual attention during the session.                      |
+------------------------------------------------------------------+
|  Beneficiaries Needing Extra Attention                           |
|                                                                  |
|  [!] [Name 1] - Score: 18 (Severe) - admin_review flagged       |
|  [!] [Name 2] - Score: 16 (Severe) - admin_review flagged       |
|  [!] [Name 3] - Score: 15 (Severe) - admin_review flagged       |
|  [!] [Name 4] - Score: 12 (Moderate) - mentor_notify flagged    |
|  ...                                                             |
|                                                                  |
|  Note: Specific scores are shared for preparation purposes.      |
|  Please handle this information with care and confidentiality.   |
+------------------------------------------------------------------+
```

**Content Rules:**
- Facilitators see aggregate data and flagged names only
- They do NOT see raw answers or detailed scoring breakdowns
- Flag information is shared solely for preparation; the facilitator should not disclose individual scores
- A privacy reminder is always shown at the bottom

**Aggregate Insights (Auto-Generated):**
The system generates 2-3 bullet points based on the score distribution:
1. Percentage in concerning bands
2. Average score and its implication
3. Number of flagged scores

---

## 5. Mentor View

**Route:** `/mentor/mentees/[userId]/assessments`
**Access:** Users with `role === "mentor"` who are assigned to the beneficiary
**Data scope:** Only sees scores for their assigned mentees, only flagged or completed scores

### 5.1 Mentee Assessment Summary

```
+------------------------------------------------------------------+
|  [Mentee Name]'s Assessments                                     |
|                                                                  |
|  +--------------------------------------------------------------+|
|  | [!] GAD-7 (S4)    Score: 14   Moderate anxiety   Mar 12     ||
|  |     [mentor_notify]  [View Details -->]                      ||
|  +--------------------------------------------------------------+|
|  | [check] GSE (S6)  Score: 28   Moderate           Mar 24     ||
|  |     [none]  [View Details -->]                               ||
|  +--------------------------------------------------------------+|
|  | [!] BRS (S12)     Mean: 2.3   Low resilience     Apr 5      ||
|  |     [mentor_notify]  [View Details -->]                      ||
|  +--------------------------------------------------------------+|
|                                                                  |
+------------------------------------------------------------------+
```

**Mentor Detail View:**
- Shows score, severity band, subscale breakdown
- Does NOT show raw answers (only admin sees those)
- Shows the "What This Means" interpretation text
- Shows growth tracking if re-administered
- Shows suggested conversation topics based on the score

**Suggested Conversation Topics (per instrument):**
- Generated based on score + severity band
- Example for GAD-7 Moderate: "Ask about their biggest worries this week. Explore whether the coping strategies from Session 4 are being used. Discuss prayer as an anxiety tool (Session 3 connection)."

---

## 6. Component Specifications

### 6.1 ScoreGauge Component

```tsx
interface ScoreGaugeProps {
  score: number;
  min: number;
  max: number;
  severityBands: Array<{
    label: string;
    min: number;
    max: number;
    color: string;
  }>;
  scoringMethod: "sum" | "average";
}
```

- **Sum-scored:** Horizontal bar divided into colored segments
- **Mean-scored:** Radial semi-circle gauge
- Both show the score value prominently in the center/above

### 6.2 SubscaleBar Component

```tsx
interface SubscaleBarProps {
  name: string;
  score: number;
  min: number;
  max: number;
  color: string;
}
```

- Horizontal progress bar
- Label left, score right
- Bar color determined by score position relative to range

### 6.3 SeverityBadge Component

```tsx
interface SeverityBadgeProps {
  label: string;
  flagBehavior: "none" | "mentor_notify" | "admin_review";
}
```

- Pill badge (`rounded-full px-2.5 py-0.5 text-xs font-medium`)
- Colors from severity band color map

### 6.4 GrowthChart Component

```tsx
interface GrowthChartProps {
  dataPoints: Array<{
    date: number;
    score: number;
    sessionLabel: string;
    severityBand: string;
  }>;
  min: number;
  max: number;
  positiveDirection: "higher" | "lower";
}
```

- `recharts` `<LineChart>` with data points colored by severity
- `positiveDirection` determines whether increase or decrease is shown as improvement

### 6.5 MatrixDisplay Component (MLQ, AGQ-R)

```tsx
interface MatrixDisplayProps {
  type: "mlq" | "agqr";
  subscaleScores: Record<string, number>;
  activeCell: string; // which cell the beneficiary falls in
  cellDescriptions: Record<string, {
    title: string;
    description: string;
    color: string;
  }>;
}
```

- 2x2 grid layout using CSS Grid
- Active cell highlighted with colored border and background tint
- Inactive cells grayed out

### 6.6 DistributionChart Component (Admin)

```tsx
interface DistributionChartProps {
  instrumentName: string;
  bands: Array<{
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}
```

- `recharts` `<BarChart>` with single stacked bar
- Each segment labeled with count and percentage

### 6.7 PillarRadar Component (Admin)

```tsx
interface PillarRadarProps {
  pillarName: string;
  instruments: Array<{
    shortCode: string;
    normalizedAverage: number; // 0-100
  }>;
  cohortProfile?: number[]; // optional overlay
}
```

- `recharts` `<RadarChart>` with filled area
- One axis per instrument, labeled with short code

---

## 7. Data Flow

### Beneficiary Views

```
assessmentAssignments (by userId, status=completed)
  --> assessmentScores (by assignmentId)
    --> assessmentTemplates (by templateId) -- for display texts, subscale names
  --> prior assessmentScores (by userId + templateId) -- for growth tracking
```

### Admin Views

```
assessmentScores (all, or filtered by cohort/instrument/flag)
  --> users (by userId) -- for beneficiary names
  --> assessmentTemplates (by templateId) -- for instrument metadata
  --> assessmentResponses (by assignmentId) -- for raw answer detail
  --> safeguardingActions (by scoreId) -- for flag status
  --> cohortMemberships (by userId) -- for cohort filtering
```

### Facilitator Views

```
sessions (by sessionId)
  --> assessmentAssignments (by sessionId, status=completed)
    --> assessmentScores (by assignmentId)
      --> users (by userId) -- for flagged beneficiary names
```

### Mentor Views

```
mentorAssignments (by mentorId, isActive=true)
  --> assessmentScores (by userId) -- for each assigned mentee
    --> assessmentTemplates (by templateId)
```

---

## 8. API Queries Needed

### New Queries Required

| Query | Args | Returns | Used By |
|-------|------|---------|---------|
| `scores.getByAssignment` | `assignmentId` | Score + template + prior scores | Beneficiary result view |
| `scores.getByUser` | `userId` | All scores for a user with templates | Admin individual, Mentor |
| `scores.getByCohort` | `cohortId, instrumentShortCode?` | All scores for cohort members | Admin dashboard |
| `scores.getFlagged` | `flagBehavior?, status?` | Flagged scores with user + template + safeguarding | Admin flagged panel |
| `scores.getDistribution` | `templateId, cohortId?` | Band counts and percentages | Admin + Facilitator |
| `scores.getCohortAverages` | `cohortId` | Average scores per instrument | Admin dashboard |
| `scores.getGrowthData` | `userId, templateId` | Chronological scores for an instrument | Growth tracking |
| `scores.getCrossInstrument` | `userId` | All scores with pattern matching | Admin cross-session |
| `scores.getPillarSummary` | `cohortId` | Normalized averages by pillar | Admin pillar report |
| `scores.getPreSessionBriefing` | `sessionId` | Distribution + flagged names | Facilitator |

### Existing Queries to Extend

| Query | Current | Enhancement |
|-------|---------|-------------|
| `responses.getByAssignment` | Returns response for assignment | Add template + score data join |
| `safeguarding.listAll` | Lists all actions | Add filter by cohort, instrument |

---

## 9. Responsive Design

### Mobile Breakpoints

All result views must be fully usable on mobile (< 768px).

| Desktop Component | Mobile Adaptation |
|------------------|-------------------|
| Score gauge (horizontal bar) | Full-width, increased height for touch |
| Score gauge (radial) | Smaller radius, centered above text |
| Subscale bars | Full-width stack, no table layout |
| 2x2 matrix | 2x2 grid maintained but with smaller cells |
| Distribution chart | Horizontal stacked bar, full-width |
| Radar chart | Reduced size, tap for detail |
| Growth line chart | Full-width, horizontal scroll if many points |
| Data tables | Card-based layout instead of table rows |
| Expandable sections | Full-width accordion |
| Action buttons | Full-width at bottom, 44px min height |

### Touch Targets

All interactive elements (badges, buttons, expand toggles, chart data points) must meet the 44px x 44px minimum touch target requirement per the design system.

---

## 10. Accessibility

- All charts must have `aria-label` descriptions summarizing the data
- Color must never be the sole indicator of severity; always pair with text labels
- Score gauges should include a text alternative for screen readers
- Tab navigation must work through all interactive elements
- Focus outlines: 2px `--color-primary` offset
- Reduced motion: honor `prefers-reduced-motion` by disabling chart animations

---

## 11. Performance Considerations

- Cohort dashboard queries may return large datasets; implement pagination (50 scores per page)
- Use Convex reactive queries for real-time updates when new scores come in
- Lazy-load chart components (recharts) to avoid blocking initial page render
- Cache pillar and distribution computations; invalidate when new scores are added
- Growth tracking should use indexed queries (`by_userId` + `by_templateId`)

---

*End of Result Views Specification*
