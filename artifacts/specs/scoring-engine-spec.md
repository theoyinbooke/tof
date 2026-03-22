# Scoring Engine Specification

> TheOyinbooke Foundation Platform -- Assessment Scoring Engine
> Version: 1.0
> Date: 2026-03-21
> Status: Draft

---

## 1. Overview

The scoring engine converts raw beneficiary responses into meaningful scores, subscale breakdowns, severity band classifications, and flag behaviors that drive safeguarding workflows. It is invoked immediately upon assessment submission and produces a single `assessmentScores` record per response.

### Current Implementation

The existing engine in `convex/assessments/responses.ts` (the `scoreAssessment` function):

1. Determines `maxOptionValue` and `minOptionValue` from the first item's response options
2. Applies reverse scoring via `maxOptionValue + minOptionValue - rawAnswer`
3. Sums all item scores into a single `totalScore`
4. Computes subscale scores as sums of constituent items
5. Matches `totalScore` against `severityBands` to find the band, flag behavior, and interpretation

### Why Enhancements Are Needed

The current engine assumes all instruments use sum scoring and that a single total score drives severity. In reality:

- **6 instruments** use average (mean) scoring, not sum
- **2 instruments** (MLQ, AGQ-R) have no total score at all; only subscales are interpreted
- **1 instrument** (DSES) has items with two different response scales (items 1-15 on 1-6, item 16 on 1-4)
- **1 instrument** (SWBS) requires ALL items to be reverse-scored (both positively and negatively worded) to achieve a "higher = better" convention
- **1 instrument** (FSES) has ALL items reverse-scored
- **2 instruments** (MLQ, AGQ-R) use conditional 2x2 matrix interpretation instead of linear severity bands
- Cross-instrument comparison logic (Appendix A patterns) is not yet implemented

---

## 2. Scoring Method Matrix

All 17 instruments (16 sessions, with Session 8 having two versions RAS-A and RAS-B) are listed below.

| # | Short Code | Full Name | Session | Scoring Method | Has Subscales | Has Reversed Items | Total Score Range | Subscale-Only? |
|---|-----------|-----------|---------|---------------|--------------|-------------------|------------------|---------------|
| 1 | MLQ | Meaning in Life Questionnaire | S1 | Sum (per subscale) | Yes | Yes (item 9) | N/A -- no total | Yes |
| 2 | AGQ-R | Achievement Goal Questionnaire -- Revised | S2 | Average (per subscale) | Yes | No | N/A -- no total | Yes |
| 3 | SWBS | Spiritual Well-Being Scale | S3 | Sum | Yes | Yes (all items) | 20--120 | No |
| 4 | GAD-7 | Generalized Anxiety Disorder 7-Item Scale | S4 | Sum | No | No | 0--21 | No |
| 5 | DSES | Daily Spiritual Experience Scale | S5 | Sum (reversed) | No | Yes (items 1-15, item 16) | 16--94 | No |
| 6 | GSE | General Self-Efficacy Scale | S6 | Sum | No | No | 10--40 | No |
| 7 | FSES | Financial Self-Efficacy Scale | S7 | Sum (all reversed) | No | Yes (all 6 items) | 6--24 | No |
| 8 | RAS-A | Relationship Assessment Scale (In Relationship) | S8 | Mean | No | Yes (items 4, 7) | 1.00--5.00 | No |
| 9 | RAS-B | Relationship Assessment Scale (Single) | S8 | Mean | No | Yes (items 4, 7) | 1.00--5.00 | No |
| 10 | Grit-S | Short Grit Scale | S9 | Average | Yes | Yes (items 1, 3, 5, 7) | 1.00--5.00 (overall avg) | No |
| 11 | ESE | Entrepreneurial Self-Efficacy Scale | S10 | Average | Yes | No | 1.00--5.00 (overall avg) | No |
| 12 | SL-7 | Servant Leadership Scale -- Short Form | S11 | Average | No | No | 1.00--7.00 | No |
| 13 | BRS | Brief Resilience Scale | S12 | Mean | No | Yes (items 2, 4, 6) | 1.00--5.00 | No |
| 14 | CDSE-SF | Career Decision Self-Efficacy Scale -- SF | S13 | Sum | Yes | No | 0--100 | No |
| 15 | ALQ-Self | Authentic Leadership Questionnaire -- Self | S14 | Average | Yes | No | 0--4.00 (overall avg) | No |
| 16 | CTDA | Critical Thinking Disposition Assessment | S15 | Average | Yes | No | 1.00--6.00 (overall avg) | No |
| 17 | SPCS-R | Sociopolitical Control Scale -- Revised | S16 | Average | Yes | No | 1.00--5.00 (overall avg) | No |

### Subscale Summary

| Short Code | Subscale Names | Subscale Range | Subscale Scoring |
|-----------|---------------|---------------|-----------------|
| MLQ | Presence of Meaning, Search for Meaning | 5--35 each | Sum |
| AGQ-R | Mastery-Approach (MAp), Performance-Approach (PAp), Mastery-Avoidance (MAv), Performance-Avoidance (PAv) | 1.00--7.00 each | Average |
| SWBS | Religious Well-Being (RWB), Existential Well-Being (EWB) | 10--60 each | Sum |
| Grit-S | Consistency of Interest (CI), Perseverance of Effort (PE) | 1.00--5.00 each | Average |
| ESE | Marketing, Innovation, Management, Risk-Taking, Financial Control | 1.00--5.00 each | Average |
| CDSE-SF | Self-Appraisal, Occupational Information, Goal Selection, Planning, Problem Solving | 0--20 each | Sum |
| ALQ-Self | Self-Awareness (SA), Relational Transparency (RT), Internalized Moral Perspective (IMP), Balanced Processing (BP) | 0--4.00 each | Average |
| CTDA | Open-Mindedness, Analyticity, Systematicity, Truth-Seeking, Inquisitiveness | 1.00--6.00 each | Average |
| SPCS-R | Leadership Competence (LC), Policy Control (PC) | 1.00--5.00 each | Average |

---

## 3. Reverse Scoring Logic

The general formula for reverse scoring is:

```
reversedScore = scaleMax + scaleMin - rawValue
```

### Per-Instrument Reverse Scoring

#### MLQ (Session 1)
- **Scale range:** 1--7
- **Reversed items:** Item 9 only
- **Formula:** `reversed = 7 + 1 - raw = 8 - raw`
- **Example:** raw 2 becomes 6

#### SWBS (Session 3) -- SPECIAL CASE
- **Scale range:** 1--6
- **ALL items are effectively reverse-scored** to achieve "higher = better" convention
- **Negatively worded items (1, 2, 5, 6, 9, 12, 13, 16, 18):** Reverse: `7 - raw` (i.e., 1 becomes 6, 6 becomes 1)
- **Positively worded items (3, 4, 7, 8, 10, 11, 14, 15, 17, 19, 20):** Also reverse from the original SA=1 convention: `7 - raw`
- **Net effect:** The original response scale has SA=1 and SD=6, so reversing ALL items makes every item scored 1--6 where 6 = highest well-being
- **Implementation note:** Mark ALL 20 items as `isReversed: true` in the template. The engine reverses using `scaleMax + scaleMin - raw = 6 + 1 - raw = 7 - raw`.

#### GAD-7 (Session 4)
- No reversed items

#### DSES (Session 5) -- SPECIAL CASE
- **Items 1--15:** Scale range 1--6. ALL are reverse-scored: `7 - raw` (so 1="Many times a day" becomes 6, and 6="Never" becomes 1)
- **Item 16:** Scale range 1--4. Reverse-scored differently: `5 - raw` (so 1="Not close at all" becomes 4, and 4="As close as possible" becomes 1)
- **Implementation note:** Mark items 1--15 as `isReversed: true` with `responseOptions` values 1--6. Mark item 16 as `isReversed: true` with `responseOptions` values 1--4. The engine must compute `scaleMax + scaleMin` per item (not globally), so use per-item option ranges.

#### GSE (Session 6)
- No reversed items

#### FSES (Session 7) -- ALL ITEMS REVERSED
- **Scale range:** 1--4
- **ALL 6 items are reverse-scored:** `5 - raw`
- **Rationale:** All items are negatively worded (e.g., "It is hard to stick to my spending plan..."). Reversing makes higher = greater financial self-efficacy.
- **Implementation:** Mark all 6 items as `isReversed: true`

#### RAS-A and RAS-B (Session 8)
- **Scale range:** 1--5
- **Reversed items:** Items 4 and 7 (both versions)
- **Formula:** `6 - raw`

#### Grit-S (Session 9)
- **Scale range:** 1--5
- **Reversed items:** Items 1, 3, 5, 7 (all Consistency of Interest items)
- **Formula:** `6 - raw`

#### ESE (Session 10)
- No reversed items

#### SL-7 (Session 11)
- No reversed items

#### BRS (Session 12)
- **Scale range:** 1--5
- **Reversed items:** Items 2, 4, 6
- **Formula:** `6 - raw`

#### CDSE-SF (Session 13)
- No reversed items

#### ALQ-Self (Session 14)
- No reversed items

#### CTDA (Session 15)
- No reversed items

#### SPCS-R (Session 16)
- No reversed items

---

## 4. Subscale Computation

### MLQ (Session 1) -- Subscale-Only Instrument

| Subscale | Items | Method | Range |
|---------|-------|--------|-------|
| Presence of Meaning | 1, 4, 5, 6, 9(R) | Sum | 5--35 |
| Search for Meaning | 2, 3, 7, 8, 10 | Sum | 5--35 |

**No total score.** The two subscales are interpreted independently via a 2x2 matrix.

### AGQ-R (Session 2) -- Subscale-Only Instrument

| Subscale | Items | Method | Range |
|---------|-------|--------|-------|
| Mastery-Approach (MAp) | 1, 3, 7 | Average | 1--7 |
| Performance-Approach (PAp) | 2, 4, 8 | Average | 1--7 |
| Mastery-Avoidance (MAv) | 5, 9, 11 | Average | 1--7 |
| Performance-Avoidance (PAv) | 6, 10, 12 | Average | 1--7 |

**No total score.** The four subscales form a 2x2 matrix and are interpreted together.

### SWBS (Session 3)

| Subscale | Items | Method | Range |
|---------|-------|--------|-------|
| Religious Well-Being (RWB) | 1(R), 3(R), 5(R), 7(R), 9(R), 11(R), 13(R), 15(R), 17(R), 19(R) | Sum | 10--60 |
| Existential Well-Being (EWB) | 2(R), 4(R), 6(R), 8(R), 10(R), 12(R), 14(R), 16(R), 18(R), 20(R) | Sum | 10--60 |
| **Overall SWB** | **RWB + EWB** | **Sum** | **20--120** |

### Grit-S (Session 9)

| Subscale | Items | Method | Range |
|---------|-------|--------|-------|
| Consistency of Interest (CI) | 1(R), 3(R), 5(R), 7(R) | Average | 1--5 |
| Perseverance of Effort (PE) | 2, 4, 6, 8 | Average | 1--5 |
| **Overall Grit** | **All 8 items (after reversing)** | **Average** | **1--5** |

### ESE (Session 10)

| Subscale | Items | Method | Range |
|---------|-------|--------|-------|
| Marketing | 1--5 | Average | 1--5 |
| Innovation | 6--12 | Average | 1--5 |
| Management | 13--16 | Average | 1--5 |
| Risk-Taking | 17--20 | Average | 1--5 |
| Financial Control | 21--23 | Average | 1--5 |
| **Overall ESE** | **All 23 items** | **Average** | **1--5** |

### CDSE-SF (Session 13)

| Subscale | Items | Method | Range |
|---------|-------|--------|-------|
| Self-Appraisal | 1--5 | Sum | 0--20 |
| Occupational Information | 6--10 | Sum | 0--20 |
| Goal Selection | 11--15 | Sum | 0--20 |
| Planning | 16--20 | Sum | 0--20 |
| Problem Solving | 21--25 | Sum | 0--20 |
| **Total CDSE** | **All 25 items** | **Sum** | **0--100** |

### ALQ-Self (Session 14)

| Subscale | Items | Method | Range |
|---------|-------|--------|-------|
| Self-Awareness (SA) | 1--4 | Average | 0--4 |
| Relational Transparency (RT) | 5--9 | Average | 0--4 |
| Internalized Moral Perspective (IMP) | 10--13 | Average | 0--4 |
| Balanced Processing (BP) | 14--16 | Average | 0--4 |
| **Overall ALQ** | **All 16 items** | **Average** | **0--4** |

### CTDA (Session 15)

| Subscale | Items | Method | Range |
|---------|-------|--------|-------|
| Open-Mindedness | 1--4 | Average | 1--6 |
| Analyticity | 5--8 | Average | 1--6 |
| Systematicity | 9--12 | Average | 1--6 |
| Truth-Seeking | 13--16 | Average | 1--6 |
| Inquisitiveness | 17--20 | Average | 1--6 |
| **Overall CTDA** | **All 20 items** | **Average** | **1--6** |

### SPCS-R (Session 16)

| Subscale | Items | Method | Range |
|---------|-------|--------|-------|
| Leadership Competence (LC) | 1--8 | Average | 1--5 |
| Policy Control (PC) | 9--17 | Average | 1--5 |
| **Overall SPCS** | **All 17 items** | **Average** | **1--5** |

---

## 5. Severity Band Matching

For each instrument, this section defines which score drives severity and the exact bands.

### GAD-7 (Session 4) -- Total Score Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Minimal anxiety | 0 | 4 | `none` | Green (#00D632) |
| Mild anxiety | 5 | 9 | `none` | Amber (#F59E0B) |
| Moderate anxiety | 10 | 14 | `mentor_notify` | Orange (#E65100) |
| Severe anxiety | 15 | 21 | `admin_review` | Red (#EF4444) |

### SWBS (Session 3) -- Overall SWB Drives Primary Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Low | 20 | 40 | `admin_review` | Red (#EF4444) |
| Moderate Low | 41 | 70 | `none` | Amber (#F59E0B) |
| Moderate High | 71 | 99 | `none` | Green (#00D632) |
| High | 100 | 120 | `none` | Green (#00D632) |

**Additional subscale flag:** RWB < 20 triggers `mentor_notify`

### DSES (Session 5) -- Reversed Total Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Infrequent | 16 | 34 | `mentor_notify` | Orange (#E65100) |
| Occasional | 35 | 54 | `none` | Amber (#F59E0B) |
| Frequent | 55 | 74 | `none` | Green (#00D632) |
| Very frequent | 75 | 94 | `none` | Green (#00D632) |

**Additional flag:** Score < 30 triggers `mentor_notify`

### GSE (Session 6) -- Total Score Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Low | 10 | 20 | `mentor_notify` | Orange (#E65100) |
| Moderate | 21 | 30 | `none` | Amber (#F59E0B) |
| High | 31 | 40 | `none` | Green (#00D632) |

**Additional flags:**
- Score <= 15 triggers `mentor_notify`
- Score <= 10 triggers `admin_review`

### FSES (Session 7) -- Reversed Total Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Low | 6 | 12 | `mentor_notify` | Orange (#E65100) |
| Moderate | 13 | 18 | `none` | Amber (#F59E0B) |
| High | 19 | 24 | `none` | Green (#00D632) |

**Additional flag:** Score <= 9 triggers `mentor_notify`

### RAS-A / RAS-B (Session 8) -- Mean Score Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Very Low | 1.00 | 1.99 | `admin_review` (A only) / `mentor_notify` (B) | Red (#EF4444) |
| Low | 2.00 | 2.99 | `mentor_notify` | Orange (#E65100) |
| Moderate | 3.00 | 3.99 | `none` | Amber (#F59E0B) |
| High | 4.00 | 5.00 | `none` | Green (#00D632) |

**Additional flags:**
- Mean <= 2.0 triggers `mentor_notify`
- Mean <= 1.5 (Version A only) triggers `admin_review`

### Grit-S (Session 9) -- Overall Grit Average Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Low grit | 1.00 | 1.99 | `admin_review` | Red (#EF4444) |
| Below average | 2.00 | 2.99 | `mentor_notify` | Orange (#E65100) |
| Moderate | 3.00 | 3.49 | `none` | Amber (#F59E0B) |
| Gritty | 3.50 | 4.09 | `none` | Green (#00D632) |
| Very gritty | 4.10 | 5.00 | `none` | Green (#00D632) |

**Additional flags:**
- Overall Grit < 2.5 triggers `mentor_notify`
- PE < 2.0 triggers `admin_review`

### ESE (Session 10) -- Overall Average Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Very Low | 1.00 | 1.99 | `mentor_notify` | Orange (#E65100) |
| Low | 2.00 | 2.99 | `none` | Amber (#F59E0B) |
| Moderate | 3.00 | 3.99 | `none` | Green (#00D632) |
| High | 4.00 | 5.00 | `none` | Green (#00D632) |

**Additional flag:** Overall ESE < 2.0 triggers `mentor_notify`

### SL-7 (Session 11) -- Average Score Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Very Low | 1.00 | 2.49 | `mentor_notify` | Orange (#E65100) |
| Low | 2.50 | 3.99 | `none` | Amber (#F59E0B) |
| Moderate | 4.00 | 5.49 | `none` | Green (#00D632) |
| High | 5.50 | 7.00 | `none` | Green (#00D632) |

**Additional flag:** Average < 3.0 triggers `mentor_notify`

### BRS (Session 12) -- Mean Score Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Low resilience | 1.00 | 2.99 | `mentor_notify` | Orange (#E65100) |
| Normal resilience | 3.00 | 4.30 | `none` | Amber (#F59E0B) |
| High resilience | 4.31 | 5.00 | `none` | Green (#00D632) |

**Additional flags:**
- Mean < 2.5 triggers `mentor_notify`
- Mean < 2.0 triggers `admin_review`

### CDSE-SF (Session 13) -- Total Sum Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Very Low | 0 | 24 | `mentor_notify` | Orange (#E65100) |
| Low | 25 | 49 | `none` | Amber (#F59E0B) |
| Moderate | 50 | 79 | `none` | Green (#00D632) |
| High | 80 | 100 | `none` | Green (#00D632) |

**Additional flag:** Total < 30 triggers `mentor_notify`

### ALQ-Self (Session 14) -- Overall Average Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Very Low | 0.00 | 0.99 | `mentor_notify` | Orange (#E65100) |
| Low | 1.00 | 1.99 | `mentor_notify` | Orange (#E65100) |
| Moderate | 2.00 | 2.99 | `none` | Amber (#F59E0B) |
| High | 3.00 | 4.00 | `none` | Green (#00D632) |

**Additional flags:**
- Overall < 1.5 triggers `mentor_notify`
- IMP < 1.0 triggers `mentor_notify`

### CTDA (Session 15) -- Overall Average Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Very weak | 1.00 | 2.99 | `admin_review` | Red (#EF4444) |
| Weak disposition | 3.00 | 3.99 | `mentor_notify` | Orange (#E65100) |
| Moderate disposition | 4.00 | 4.99 | `none` | Amber (#F59E0B) |
| Strong disposition | 5.00 | 6.00 | `none` | Green (#00D632) |

**Additional flag:** Truth-Seeking < 3.0 triggers `mentor_notify`

### SPCS-R (Session 16) -- Overall Average Drives Severity

| Band Label | Min | Max | Flag Behavior | Color |
|-----------|-----|-----|--------------|-------|
| Very Low | 1.00 | 1.99 | `mentor_notify` | Orange (#E65100) |
| Low | 2.00 | 2.99 | `none` | Amber (#F59E0B) |
| Moderate | 3.00 | 3.99 | `none` | Green (#00D632) |
| High | 4.00 | 5.00 | `none` | Green (#00D632) |

**Additional flag:** Overall < 2.5 triggers `mentor_notify`

### MLQ (Session 1) -- 2x2 Matrix Interpretation (SPECIAL)

MLQ does NOT use linear severity bands. Instead, it uses a 2x2 matrix of Presence and Search subscales.

| Presence Score | Search Score | Interpretation | Flag |
|:---:|:---:|---|---|
| 25--35 (High) | 5--20 (Low) | Clear purpose, not actively searching | `none` |
| 25--35 (High) | 21--35 (High) | Has purpose but still exploring (healthy) | `none` |
| 5--24 (Low) | 25--35 (High) | Actively searching, hasn't found clarity yet | `none` |
| 5--24 (Low) | 5--20 (Low) | Neither clear purpose nor actively seeking | See below |

**Flag logic:**
- Presence < 15 AND Search < 15 --> `admin_review` (deep disengagement)
- Presence < 15 AND Search >= 25 --> `none` (expected for incoming beneficiaries)

### AGQ-R (Session 2) -- 2x2 Matrix Interpretation (SPECIAL)

AGQ-R does NOT use linear severity bands. Subscales are interpreted in a 2x2 matrix.

**Flag logic (subscale averages):**
- PAv >= 5.5 --> `mentor_notify` (avoids challenging goals out of fear)
- MAp < 3.0 AND PAv >= 5.0 --> `admin_review` (combined low motivation and high fear)

**Ideal profile:** High MAp, moderate-to-low PAv
**Concerning profile:** Low MAp + High PAv

---

## 6. Special Cases

### 6.1 MLQ -- No Total Score, 2x2 Matrix

- The engine must NOT compute a total score
- Store `totalScore` as 0 or null equivalent
- Store subscale scores: `{ "Presence of Meaning": <sum>, "Search for Meaning": <sum> }`
- Severity matching uses the 2x2 matrix above, not linear bands
- The `severityBand` field stores a composite label like "High Presence / Low Search"
- The `interpretation` field stores the matrix cell text

### 6.2 AGQ-R -- No Total Score, 2x2 Subscale Matrix

- The engine must NOT compute a total score
- Store `totalScore` as 0 or null equivalent
- Store subscale scores: `{ "Mastery-Approach": <avg>, "Performance-Approach": <avg>, "Mastery-Avoidance": <avg>, "Performance-Avoidance": <avg> }`
- Severity matching uses subscale-level flag logic
- The `severityBand` field stores a profile descriptor like "High MAp / High PAv"
- The `interpretation` field describes the profile

### 6.3 DSES -- Mixed Scale Ranges

- Items 1--15: response options 1--6 (6-point frequency scale)
- Item 16: response options 1--4 (4-point closeness scale)
- ALL items reverse-scored, but the scale max differs:
  - Items 1--15: `scaleMax = 6`, `scaleMin = 1`, reversed = `7 - raw`
  - Item 16: `scaleMax = 4`, `scaleMin = 1`, reversed = `5 - raw`
- The engine MUST compute `scaleMax + scaleMin` per item, not globally from the first item
- **Required engine change:** Iterate each item's `responseOptions` to determine that item's min/max, rather than using a single global value

### 6.4 SWBS -- All Items Reverse-Scored

- The original scale has SA=1, SD=6 for all items
- To achieve "higher = better," ALL 20 items are reverse-scored: `7 - raw`
- Both negatively worded items (1, 2, 5, 6, 9, 12, 13, 16, 18) and positively worded items are reversed
- This is because the original scale direction has 1="Strongly Agree" and 6="Strongly Disagree"
- After reversal, a positively worded item like "I believe that God loves me" scored as SA gets 6 (best), and a negatively worded item like "I don't find much satisfaction in private prayer" scored as SA gets 1 (worst -- agreement with a negative statement)
- **Implementation:** Set `isReversed: true` on all 20 items in the template

### 6.5 RAS -- Score Is MEAN, Not Sum

- After reversing items 4 and 7, compute the MEAN of all 7 items
- Range: 1.00--5.00 (not 7--35)
- Severity bands use decimal ranges
- **Both RAS-A and RAS-B use identical scoring logic** with different items

### 6.6 BRS -- Score Is MEAN, Not Sum

- After reversing items 2, 4, 6, compute the MEAN of all 6 items
- Range: 1.00--5.00 (not 6--30)
- Severity bands use decimal ranges

### 6.7 FSES -- All Items Reverse-Scored

- All 6 items are negatively worded
- All 6 items have `isReversed: true`
- Scale: 1--4, reversed: `5 - raw`
- Total is sum of reversed values: 6--24

### 6.8 RAS-A vs RAS-B -- Same Scoring, Different Items

- The platform asks beneficiaries which version to take before displaying items
- Scoring logic is identical for both versions
- Items 4 and 7 are reverse-scored in both
- Both use mean scoring
- Flag thresholds differ slightly: RAS-A has `admin_review` at <= 1.5 (may indicate abusive relationship); RAS-B does not

---

## 7. Enhancements Needed

### 7.1 Support Average (Mean) Scoring

**Current:** The engine always sums. `totalScore += score` for each item.

**Needed:** Add a `scoringMethod` field to the template: `"sum"` or `"average"`.

```typescript
// Template-level config
scoringMethod: "sum" | "average"

// After computing item scores:
if (template.scoringMethod === "average") {
  totalScore = totalScore / answeredItemCount;
} else {
  // totalScore remains the sum
}
```

**Instruments using average:** AGQ-R, Grit-S, ESE, SL-7, RAS-A, RAS-B, BRS, ALQ-Self, CTDA, SPCS-R

### 7.2 Support Subscale-Only Instruments

**Current:** The engine always computes a `totalScore` and matches severity against it.

**Needed:** Add a `hasTotal` boolean to the template (or derive from `scoringMethod`).

For MLQ and AGQ-R:
- Set `totalScore` to 0 in the score record
- Severity matching uses subscale scores only
- The template needs a `severityLogic` field that can express conditional/matrix logic

### 7.3 Per-Item Scale Range Computation

**Current:** `maxOptionValue` and `minOptionValue` are computed from the first item only.

**Needed:** Compute per-item min/max from each item's `responseOptions`.

```typescript
for (const item of template.items) {
  const itemMax = Math.max(...item.responseOptions.map(o => o.value));
  const itemMin = Math.min(...item.responseOptions.map(o => o.value));

  let score: number;
  if (item.isReversed) {
    score = itemMax + itemMin - rawAnswer;
  } else {
    score = rawAnswer;
  }
  // ...
}
```

This fixes DSES (items 1-15 have max=6, item 16 has max=4).

### 7.4 Subscale Scoring Method

**Current:** Subscale scores are always computed as sums.

**Needed:** Add a `subscaleScoringMethod` field (or per-subscale method) to support average-scored subscales.

```typescript
// Template-level or per-subscale config
subscaleScoringMethod: "sum" | "average"

// In subscale computation:
for (const subscale of template.subscales) {
  let total = 0;
  let count = 0;
  for (const itemNum of subscale.itemNumbers) {
    total += itemScores[itemNum] || 0;
    count++;
  }
  if (template.subscaleScoringMethod === "average") {
    subscaleScores[subscale.name] = total / count;
  } else {
    subscaleScores[subscale.name] = total;
  }
}
```

### 7.5 Conditional Severity Logic

**Current:** Severity is matched by finding the first band where `totalScore >= band.min && totalScore <= band.max`.

**Needed:** Support for:

1. **Matrix-based severity** (MLQ, AGQ-R) -- severity determined by combinations of subscale scores
2. **Subscale-level flags** -- additional flags triggered by individual subscale values
3. **Multi-condition flags** -- flags that depend on combinations (e.g., AGQ-R: MAp < 3.0 AND PAv >= 5.0)

**Proposed schema extension for `assessmentTemplates`:**

```typescript
// New optional field on assessmentTemplates
severityLogic: v.optional(v.object({
  type: v.union(
    v.literal("total_score"),      // current behavior
    v.literal("subscale_matrix"),   // MLQ, AGQ-R
  ),
  // For subscale_matrix type:
  matrixRules: v.optional(v.array(v.object({
    conditions: v.array(v.object({
      subscale: v.string(),
      operator: v.union(v.literal("gte"), v.literal("lte"), v.literal("lt"), v.literal("gt")),
      value: v.number(),
    })),
    label: v.string(),
    flagBehavior: v.union(v.literal("none"), v.literal("mentor_notify"), v.literal("admin_review")),
    interpretation: v.string(),
  }))),
  // Additional subscale-level flags (for instruments that have both total severity and subscale flags)
  subscaleFlags: v.optional(v.array(v.object({
    subscale: v.string(),
    operator: v.union(v.literal("gte"), v.literal("lte"), v.literal("lt"), v.literal("gt")),
    value: v.number(),
    flagBehavior: v.union(v.literal("none"), v.literal("mentor_notify"), v.literal("admin_review")),
    note: v.string(),
  }))),
}))
```

### 7.6 Cross-Instrument Comparison Logic (Appendix A)

**Not yet implemented.** This requires a new query/computation layer that:

1. Loads all scores for a given beneficiary across all instruments
2. Matches predefined cross-instrument patterns
3. Produces alerts or insights

**Patterns from Appendix A:**

| Pattern | Instruments | Condition | Alert |
|---------|------------|-----------|-------|
| Vision + Purpose | MLQ + Grit-S | Low Presence + Low Overall Grit | Has no direction and doesn't persist |
| Trust + Anxiety | SWBS + GAD-7 | Low SWB + High GAD-7 | Spiritual well-being not buffering anxiety |
| Self-Belief Chain | GSE + FSES + ESE | Low GSE + Low FSES or Low ESE | General low confidence extends to specific domains |
| Leadership Arc | SL-7 + ALQ + SPCS | All low | Leadership development not progressing |
| Resilience + Grit | BRS + Grit-S | Low BRS + Low PE | Cannot bounce back and doesn't persist |
| Emotional Maturity | GAD-7 + RAS + BRS | High GAD-7 + Low RAS + Low BRS | Anxiety + relational distress + low resilience |
| Critical + Spiritual | CTDA + DSES + SWBS | Low CTDA + Low DSES + Low SWBS | Neither thinking critically nor grounded spiritually |
| Career Readiness | CDSE + ESE + Grit-S + AGQ-R | Low CDSE + Low ESE + Low Grit + High PAv | Completely unready for career |

**Implementation approach:** A server-side function that runs post-scoring or on-demand, querying all scores for a userId and evaluating pattern rules.

### 7.7 Schema Additions Required

The `assessmentTemplates` table needs these new optional fields:

```typescript
scoringMethod: v.optional(v.union(v.literal("sum"), v.literal("average"))),
subscaleScoringMethod: v.optional(v.union(v.literal("sum"), v.literal("average"))),
hasTotal: v.optional(v.boolean()),   // false for MLQ, AGQ-R
severityLogic: v.optional(/* see 7.5 */),
displayTexts: v.optional(v.array(v.object({
  bandLabel: v.string(),
  beneficiaryText: v.string(),   // empathetic, non-clinical language
  clinicalDisclaimer: v.optional(v.boolean()),
}))),
```

The `assessmentScores` table needs:

```typescript
// totalScore already exists; for mean-scored instruments, store the mean (not sum)
// subscaleScores already exists as Record<string, number>
// Add:
subscaleFlags: v.optional(v.array(v.object({
  subscale: v.string(),
  flagBehavior: v.union(v.literal("none"), v.literal("mentor_notify"), v.literal("admin_review")),
  note: v.string(),
}))),
crossInstrumentAlerts: v.optional(v.array(v.object({
  pattern: v.string(),
  description: v.string(),
}))),
```

---

## 8. Scoring Engine Pseudocode (Enhanced)

```
function scoreAssessment(template, answers):
  // 1. Compute item scores with per-item reverse scoring
  itemScores = {}
  for each item in template.items:
    raw = answers[item.itemNumber]
    if raw is undefined: continue

    itemMax = max(item.responseOptions.map(o => o.value))
    itemMin = min(item.responseOptions.map(o => o.value))

    if item.isReversed:
      score = itemMax + itemMin - raw
    else:
      score = raw

    itemScores[item.itemNumber] = score

  // 2. Compute total score (if applicable)
  totalScore = 0
  answeredCount = size(itemScores)
  hasTotal = template.hasTotal !== false  // default true

  if hasTotal:
    totalScore = sum(values(itemScores))
    if template.scoringMethod == "average":
      totalScore = totalScore / answeredCount

  // 3. Compute subscale scores
  subscaleScores = {}
  if template.subscales:
    method = template.subscaleScoringMethod || template.scoringMethod || "sum"
    for each subscale in template.subscales:
      items = subscale.itemNumbers.map(n => itemScores[n]).filter(defined)
      total = sum(items)
      if method == "average":
        subscaleScores[subscale.name] = total / items.length
      else:
        subscaleScores[subscale.name] = total

  // 4. Determine severity band and flags
  severityBand = undefined
  flagBehavior = "none"
  interpretation = undefined
  subscaleFlags = []

  if template.severityLogic?.type == "subscale_matrix":
    // Evaluate matrix rules against subscale scores
    for each rule in template.severityLogic.matrixRules:
      if all conditions in rule.conditions match subscaleScores:
        severityBand = rule.label
        flagBehavior = max(flagBehavior, rule.flagBehavior)
        interpretation = rule.interpretation
        break
  else:
    // Standard total-score band matching
    for each band in template.severityBands:
      if totalScore >= band.min AND totalScore <= band.max:
        severityBand = band.label
        flagBehavior = band.flagBehavior || "none"
        break

  // 5. Check subscale-level flags
  if template.severityLogic?.subscaleFlags:
    for each flag in template.severityLogic.subscaleFlags:
      subscaleValue = subscaleScores[flag.subscale]
      if evaluate(subscaleValue, flag.operator, flag.value):
        subscaleFlags.push({ subscale: flag.subscale, flagBehavior: flag.flagBehavior, note: flag.note })
        flagBehavior = max(flagBehavior, flag.flagBehavior)

  // 6. Build interpretation text
  if not interpretation:
    if hasTotal:
      interpretation = "Total score: {totalScore}."
    else:
      interpretation = "Subscale scores: " + formatSubscales(subscaleScores)

  return {
    totalScore,
    subscaleScores,
    severityBand,
    flagBehavior,
    interpretation,
    subscaleFlags
  }
```

**Flag priority:** `admin_review` > `mentor_notify` > `none`. If multiple flags fire, the highest priority wins for the top-level `flagBehavior`.

---

## 9. Testing Matrix

Each instrument should be tested with at minimum:

1. **All minimum responses** -- produces lowest possible score
2. **All maximum responses** -- produces highest possible score
3. **Reverse-score verification** -- ensure reversed items compute correctly
4. **Boundary testing** -- scores at exact boundaries between severity bands
5. **Subscale correctness** -- verify each subscale sums/averages the right items
6. **Flag verification** -- confirm correct flag behavior at each threshold
7. **Mean vs. sum** -- verify RAS, BRS, Grit-S, etc. produce decimal ranges, not integer sums
8. **MLQ/AGQ-R matrix** -- verify 2x2 interpretation logic with all four quadrants
9. **DSES mixed scales** -- verify item 16 uses scale max of 4 while items 1-15 use scale max of 6
10. **SWBS full reversal** -- verify all 20 items are reversed and total ranges 20-120

---

*End of Scoring Engine Specification*
