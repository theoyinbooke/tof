# TheOyinbooke Foundation — Sessions & Psychometric Assessment Reference

> This document is the authoritative reference for all 16 curriculum sessions, their mapped psychometric instruments, questionnaire items, scoring engines, and interpretation guides. It is designed to be consumed by the platform's assessment system and by facilitators delivering the curriculum.

---

## How to Use This Document

Each session entry contains:

1. **Session Overview** — title, pillar, theme, scripture, and how it connects to the curriculum arc
2. **Mapped Instrument** — the validated psychometric tool, its source, and why it was chosen
3. **Questionnaire Items** — the full set of questions as they should appear to beneficiaries
4. **Response Scale** — how each item is rated
5. **Scoring Engine** — the exact computation logic for total scores, subscales, and reverse-scored items
6. **Interpretation Guide** — what the scores mean, severity bands, flag thresholds, and how to communicate results
7. **References** — original academic sources for the instrument

For the platform: each instrument's items, scales, and scoring logic map directly to the `assessmentTemplates` table in the Convex schema. The `items` array, `subscales` array, `severityBands` array, and `totalScoringMethod` field can be populated directly from this document.

---

## Curriculum Arc Overview

| Phase | Sessions | Focus |
|---|---|---|
| **Foundation** | 1–3 | Vision, goals, and trust in God |
| **Preparation** | 4–6 | Emotional resilience, spiritual depth, discovering resources |
| **Stewardship** | 7–9 | Managing money, navigating relationships, the call to action |
| **Building** | 10–12 | Entrepreneurship, redefining greatness, growing through adversity |
| **Launching** | 13–16 | Career readiness, authentic leadership, critical thinking, influence |

---

---

# SESSION 1: See the Vision

**Pillar:** Spiritual Development
**Theme:** Discovering God's Purpose for Your Life
**Scripture:** Habakkuk 2:2–3; Proverbs 29:18
**Curriculum Position:** This is the anchor session. Every subsequent session references the vision statement written here.

**Key Topics:**
- Biblical foundations of vision (Habakkuk 2:2, Proverbs 29:18, Jeremiah 29:11)
- Spiritual discernment — learning to hear God's voice
- Identifying and overcoming vision blockers (fear, comparison, past failures)
- Writing a personal vision statement
- Aligning academic pursuits with God's calling

**Expected Outcomes:**
- Written personal vision statement
- Clarity on how current education connects to God's purpose
- 90-day action plan toward the vision

**Bridge Forward:** Session 2 turns this vision into concrete, measurable goals.

---

## Assessment: Meaning in Life Questionnaire (MLQ)

**Author:** Michael F. Steger, Patricia Frazier, Shigehiro Oishi, Matthew Kaler
**Published:** 2006, Journal of Counseling Psychology, 53(1), 80–93
**Why this instrument:** Directly measures whether a person has clarity of purpose (Presence) and whether they are actively seeking it (Search). This maps perfectly to Session 1's goal of helping beneficiaries discern God's vision for their lives.
**Public availability:** Freely available for research and non-commercial use. Full instrument published in the original paper and on the author's website (www.michaelfsteger.com).

### Response Scale

All items rated on a 7-point scale:

| Value | Label |
|:---:|---|
| 1 | Absolutely Untrue |
| 2 | Mostly Untrue |
| 3 | Somewhat Untrue |
| 4 | Can't Say True or False |
| 5 | Somewhat True |
| 6 | Mostly True |
| 7 | Absolutely True |

### Questionnaire Items

| # | Item Text | Subscale |
|:---:|---|---|
| 1 | I understand my life's meaning. | Presence |
| 2 | I am looking for something that makes my life feel meaningful. | Search |
| 3 | I am always looking to find my life's purpose. | Search |
| 4 | My life has a clear sense of purpose. | Presence |
| 5 | I have a good sense of what makes my life meaningful. | Presence |
| 6 | I have discovered a satisfying life purpose. | Presence |
| 7 | I am always searching for something that makes my life feel significant. | Search |
| 8 | I am seeking a purpose or mission for my life. | Search |
| 9 | My life has no clear purpose. | Presence |
| 10 | I am searching for meaning in my life. | Search |

### Scoring Engine

**Reverse-scored items:** Item 9 (reverse on 7-point scale: 1→7, 2→6, 3→5, 4→4, 5→3, 6→2, 7→1)

**Subscale computation:**
- **Presence of Meaning:** Sum of items 1, 4, 5, 6, 9(R). Range: 5–35
- **Search for Meaning:** Sum of items 2, 3, 7, 8, 10. Range: 5–35

**No total score is computed.** The two subscales are interpreted independently.

### Interpretation Guide

| Presence Score | Search Score | Interpretation | Platform Display |
|:---:|:---:|---|---|
| 25–35 | 5–20 | Clear purpose, not actively searching. This person knows why they are here. | "You have a strong sense of purpose and meaning in your life." |
| 25–35 | 21–35 | Has purpose but still exploring. Healthy — they are grounded but open to growth. | "You have a sense of purpose and are continuing to explore what makes your life meaningful." |
| 5–24 | 25–35 | Actively searching but hasn't found clarity yet. Session 1 is exactly what they need. | "You are actively searching for your life's purpose. This session is designed to help you find clarity." |
| 5–24 | 5–20 | Neither clear purpose nor actively seeking. May indicate apathy, depression, or disengagement. | "You may be feeling uncertain about your direction. This is a starting point — let's explore this together." |

**Flag thresholds:**
- Presence < 15 AND Search < 15 → `admin_review` — may indicate deeper disengagement requiring attention
- Presence < 15 AND Search ≥ 25 → `none` — this is expected for incoming beneficiaries; they are seeking

**Growth tracking:** Re-administer after Session 9 (midpoint) and Session 16 (completion). Presence should increase over the curriculum. Search may decrease (they found it) or remain high (continued healthy exploration).

### References

- Steger, M. F., Frazier, P., Oishi, S., & Kaler, M. (2006). The Meaning in Life Questionnaire: Assessing the presence of and search for meaning in life. *Journal of Counseling Psychology*, 53(1), 80–93.
- Steger, M. F., & Shin, J. Y. (2010). The relevance of the Meaning in Life Questionnaire to therapeutic practice. *International Forum for Logotherapy*, 33, 95–104.

---

---

# SESSION 2: Goal Setting

**Pillar:** Financial & Career Development
**Theme:** Writing the Vision and Making It Plain
**Scripture:** Habakkuk 2:2; Proverbs 16:3; Philippians 3:14
**Curriculum Position:** Translates Session 1's vision statement into actionable SMART goals across all life areas.

**Key Topics:**
- From vision to goals: translating Session 1's output into targets
- SMART goals rooted in biblical wisdom
- Life area balance: spiritual, academic, financial, relational, and career goals
- Building a tracking system and overcoming procrastination
- Accountability structures

**Expected Outcomes:**
- Comprehensive goal framework covering all life areas
- 90-day action plan with weekly milestones
- Accountability partnership with a fellow beneficiary

**Bridge Forward:** Session 3 addresses what happens when the path toward these goals feels uncertain.

---

## Assessment: Achievement Goal Questionnaire — Revised (AGQ-R)

**Author:** Andrew J. Elliot, Kou Murayama
**Published:** 2008, Journal of Educational Psychology, 100(3), 613–628
**Why this instrument:** Measures four types of goal orientation. Identifies whether a beneficiary approaches goals for growth (mastery-approach) or avoids them out of fear of failure (performance-avoidance). Directly reveals goal-setting posture.
**Public availability:** Published in full in the original paper. Widely used in educational research.

### Response Scale

All items rated on a 7-point scale:

| Value | Label |
|:---:|---|
| 1 | Not at all true of me |
| 2 | — |
| 3 | — |
| 4 | Somewhat true of me |
| 5 | — |
| 6 | — |
| 7 | Very true of me |

### Questionnaire Items

| # | Item Text | Subscale |
|:---:|---|---|
| 1 | My aim is to completely master the material presented in my studies. | Mastery-Approach |
| 2 | I am striving to do well compared to other students. | Performance-Approach |
| 3 | My goal is to learn as much as possible. | Mastery-Approach |
| 4 | I am striving to perform better than others in my class or peer group. | Performance-Approach |
| 5 | My aim is to avoid learning less than I possibly could. | Mastery-Avoidance |
| 6 | My goal is to avoid performing poorly compared to others. | Performance-Avoidance |
| 7 | I am striving to understand the content of my studies as thoroughly as possible. | Mastery-Approach |
| 8 | My aim is to perform well relative to other students. | Performance-Approach |
| 9 | My aim is to avoid learning less than it is possible to learn. | Mastery-Avoidance |
| 10 | I am striving to avoid performing worse than others. | Performance-Avoidance |
| 11 | My goal is to avoid not learning all that I can. | Mastery-Avoidance |
| 12 | My goal is to avoid performing poorly compared to my peers. | Performance-Avoidance |

### Scoring Engine

**Reverse-scored items:** None

**Subscale computation (average method):**
- **Mastery-Approach (MAp):** Average of items 1, 3, 7. Range: 1–7
- **Performance-Approach (PAp):** Average of items 2, 4, 8. Range: 1–7
- **Mastery-Avoidance (MAv):** Average of items 5, 9, 11. Range: 1–7
- **Performance-Avoidance (PAv):** Average of items 6, 10, 12. Range: 1–7

**No total score.** The four subscales form a 2×2 matrix and are interpreted together.

### Interpretation Guide

| Subscale | High Score (≥5.0) | Low Score (<3.5) |
|---|---|---|
| **Mastery-Approach** | Ideal. Motivated by learning and growth. | May lack intrinsic motivation for learning. |
| **Performance-Approach** | Competitive. Wants to outperform peers. Not harmful but can be fragile. | Not driven by comparison. Healthy if MAp is high. |
| **Mastery-Avoidance** | Fears not learning enough. Anxious about missing out. | Relaxed about learning gaps. |
| **Performance-Avoidance** | Fears failure and looking bad. Avoids challenges. **Needs attention.** | Not paralyzed by fear of failure. Healthy. |

**Ideal profile:** High MAp, moderate-to-low PAv
**Concerning profile:** Low MAp + High PAv — afraid of failure and not intrinsically motivated. Sessions 3 (Trust) and 4 (Anxiety) directly address this.

**Flag thresholds:**
- PAv average ≥ 5.5 → `mentor_notify` — this person may avoid challenging goals out of fear
- MAp average < 3.0 AND PAv average ≥ 5.0 → `admin_review` — combined low motivation and high fear

### References

- Elliot, A. J., & Murayama, K. (2008). On the measurement of achievement goals: Critique, illustration, and application. *Journal of Educational Psychology*, 100(3), 613–628.
- Elliot, A. J., & McGregor, H. A. (2001). A 2 × 2 achievement goal framework. *Journal of Personality and Social Psychology*, 80(3), 501–519.

---

---

# SESSION 3: Trust in the Lord

**Pillar:** Spiritual Development
**Theme:** Building Deep Trust in God Through Uncertainty
**Scripture:** Proverbs 3:5–6; Isaiah 26:3–4; Psalm 37:5
**Curriculum Position:** With vision and goals established, this session addresses the spiritual posture needed to hold them — open hands, trusting God for the outcome.

**Key Topics:**
- Biblical theology of trust — what it means and what it doesn't
- Trusting God through financial uncertainty
- Trust in academic and career decisions
- Building trust through prayer and obedience
- Trust vs. presumption

**Expected Outcomes:**
- Deepened faith and reliance on God
- Trust-based decision-making framework
- Personal trust-building plan integrated with Session 2 goals

**Bridge Forward:** Session 4 acknowledges that trust and anxiety often coexist.

---

## Assessment: Spiritual Well-Being Scale (SWBS)

**Author:** Raymond F. Paloutzian, Craig W. Ellison
**Published:** 1982. Described in Ellison, C. W. (1983). Spiritual well-being: Conceptualization and measurement. *Journal of Psychology and Theology*, 11(4), 330–340.
**Why this instrument:** The Religious Well-Being subscale directly measures the quality of one's relationship with God — satisfaction, trust, and connection. The Existential Well-Being subscale measures life purpose and satisfaction, complementing Session 1's MLQ.
**Public availability:** Widely used in pastoral and academic settings. Available for non-commercial research purposes.

### Response Scale

All items rated on a 6-point scale:

| Value | Label |
|:---:|---|
| 1 | Strongly Agree |
| 2 | Moderately Agree |
| 3 | Agree |
| 4 | Disagree |
| 5 | Moderately Disagree |
| 6 | Strongly Disagree |

**Note:** For positively worded items, scoring is reversed so that higher values = higher well-being. See scoring engine below.

### Questionnaire Items

| # | Item Text | Subscale |
|:---:|---|---|
| 1 | I don't find much satisfaction in private prayer with God. | RWB |
| 2 | I don't know who I am, where I came from, or where I am going. | EWB |
| 3 | I believe that God loves me and cares about me. | RWB |
| 4 | I feel that life is a positive experience. | EWB |
| 5 | I believe that God is impersonal and not interested in my daily situations. | RWB |
| 6 | I feel unsettled about my future. | EWB |
| 7 | I have a personally meaningful relationship with God. | RWB |
| 8 | I feel very fulfilled and satisfied with life. | EWB |
| 9 | I don't get much personal strength and support from my God. | RWB |
| 10 | I feel a sense of well-being about the direction my life is headed in. | EWB |
| 11 | I believe that God is concerned about my problems. | RWB |
| 12 | I don't enjoy much about life. | EWB |
| 13 | I don't have a personally satisfying relationship with God. | RWB |
| 14 | I feel good about my future. | EWB |
| 15 | My relationship with God helps me not to feel lonely. | RWB |
| 16 | I feel that life is full of conflict and unhappiness. | EWB |
| 17 | I feel most fulfilled when I am in close communion with God. | RWB |
| 18 | Life doesn't have much meaning. | EWB |
| 19 | My relation with God contributes to my sense of well-being. | RWB |
| 20 | I believe there is some real purpose for my life. | EWB |

RWB = Religious Well-Being, EWB = Existential Well-Being

### Scoring Engine

**Negatively worded items (reverse-score these):** 1, 2, 5, 6, 9, 12, 13, 16, 18

For negatively worded items: 1→6, 2→5, 3→4, 4→3, 5→2, 6→1

For positively worded items (3, 4, 7, 8, 10, 11, 14, 15, 17, 19, 20): score as-is but invert the scale so SA=6, SD=1. That is: 1→6, 2→5, 3→4, 4→3, 5→2, 6→1.

**Net effect:** After all transformations, every item is scored 1–6 where 6 = highest well-being.

**Subscale computation (sum):**
- **Religious Well-Being (RWB):** Sum of items 1(R), 3, 5(R), 7, 9(R), 11, 13(R), 15, 17, 19. Range: 10–60
- **Existential Well-Being (EWB):** Sum of items 2(R), 4, 6(R), 8, 10, 12(R), 14, 16(R), 18(R), 20. Range: 10–60
- **Overall SWB:** RWB + EWB. Range: 20–120

### Interpretation Guide

| Score Range | Level | Interpretation |
|:---:|---|---|
| 20–40 | Low | Low spiritual well-being. May indicate spiritual disconnection, crisis, or unresolved questions about faith and purpose. |
| 41–70 | Moderate Low | Some spiritual awareness but significant room for growth. Common for incoming beneficiaries. |
| 71–99 | Moderate High | Healthy spiritual life with room for deeper intimacy with God. |
| 100–120 | High | Strong spiritual well-being. Deep relationship with God and sense of life purpose. |

**Subscale interpretation:**
- High RWB + Low EWB: Strong relationship with God but struggling with life satisfaction — may need practical support (Sessions 6–7)
- Low RWB + High EWB: Life feels okay but spiritual foundation is weak — core of Session 3's work
- Low RWB + Low EWB: Both spiritual and existential struggles — needs comprehensive support

**Flag thresholds:**
- Overall SWB < 40 → `admin_review`
- RWB < 20 → `mentor_notify` — very low connection with God

### References

- Ellison, C. W. (1983). Spiritual well-being: Conceptualization and measurement. *Journal of Psychology and Theology*, 11(4), 330–340.
- Paloutzian, R. F., & Ellison, C. W. (1982). Loneliness, spiritual well-being and the quality of life. In L. A. Peplau & D. Perlman (Eds.), *Loneliness: A sourcebook of current theory, research and therapy*. New York: Wiley.
- Bufford, R. K., Paloutzian, R. F., & Ellison, C. W. (1991). Norms for the Spiritual Well-Being Scale. *Journal of Psychology and Theology*, 19, 56–70.

---

---

# SESSION 4: Dealing with Anxiety

**Pillar:** Emotional Development
**Theme:** Managing Fear and Building Emotional Resilience
**Scripture:** Philippians 4:6–7; 1 Peter 5:7; Matthew 6:25–34
**Curriculum Position:** Honestly acknowledges that trust and anxiety coexist. Provides practical tools alongside spiritual foundation.

**Key Topics:**
- Understanding anxiety biblically and psychologically
- Identifying personal triggers and patterns
- Practical coping: breathing, grounding, cognitive restructuring
- When and how to seek professional help
- Emotional resilience as spiritual practice

**Expected Outcomes:**
- Personal anxiety management toolkit
- Ability to identify triggers before escalation
- Support network awareness
- Connection between emotional health and trust (Session 3)

**Bridge Forward:** Session 5 deepens spiritual foundation through fasting and prayer.

---

## Assessment: Generalized Anxiety Disorder 7-Item Scale (GAD-7)

**Author:** Robert L. Spitzer, Kurt Kroenke, Janet B. W. Williams, Bernd Löwe
**Published:** 2006, Archives of Internal Medicine, 166(10), 1092–1097
**Why this instrument:** The gold standard screening tool for generalized anxiety. Brief (7 items), clinically validated, widely used worldwide. Clear severity cutoffs enable flagging beneficiaries who may need professional support.
**Public availability:** Freely available. No permission required for clinical or research use. Published by Pfizer with no copyright restrictions.

### Response Scale

"Over the last 2 weeks, how often have you been bothered by the following problems?"

| Value | Label |
|:---:|---|
| 0 | Not at all |
| 1 | Several days |
| 2 | More than half the days |
| 3 | Nearly every day |

### Questionnaire Items

| # | Item Text |
|:---:|---|
| 1 | Feeling nervous, anxious, or on edge |
| 2 | Not being able to stop or control worrying |
| 3 | Worrying too much about different things |
| 4 | Trouble relaxing |
| 5 | Being so restless that it is hard to sit still |
| 6 | Becoming easily annoyed or irritable |
| 7 | Feeling afraid, as if something awful might happen |

### Scoring Engine

**Reverse-scored items:** None

**Total score:** Sum of all 7 items. Range: 0–21

**No subscales.** Single total score.

### Interpretation Guide

| Total Score | Severity | Platform Display | Flag Level |
|:---:|---|---|---|
| 0–4 | Minimal anxiety | "Your anxiety levels are minimal. Keep up the healthy practices you have in place." | `none` |
| 5–9 | Mild anxiety | "You are experiencing mild anxiety. The coping strategies from this session can help you manage these feelings." | `none` |
| 10–14 | Moderate anxiety | "You are experiencing moderate anxiety. Consider discussing this with your mentor and exploring the coping tools from this session seriously." | `mentor_notify` |
| 15–21 | Severe anxiety | "Your anxiety levels are elevated. We strongly encourage you to speak with your mentor or a professional counselor. You are not alone in this." | `admin_review` |

**Important clinical note:** The GAD-7 is a screening tool, not a diagnostic instrument. Scores ≥ 10 suggest clinically significant anxiety that warrants further evaluation. The platform should never provide a diagnosis — only indicate that further support may be helpful.

**Growth tracking:** Re-administer at Session 9 (midpoint) and Session 16 (completion). Decreasing scores indicate the curriculum's emotional development components are working.

### References

- Spitzer, R. L., Kroenke, K., Williams, J. B. W., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: The GAD-7. *Archives of Internal Medicine*, 166(10), 1092–1097.
- Löwe, B., Decker, O., Müller, S., et al. (2008). Validation and standardization of the Generalized Anxiety Disorder Screener (GAD-7) in the general population. *Medical Care*, 46(3), 266–274.

---

---

# SESSION 5: Fasting and Prayer

**Pillar:** Spiritual Development
**Theme:** Deepening Intimacy with God Through Spiritual Disciplines
**Scripture:** Matthew 6:16–18; Isaiah 58:6–12; Joel 2:12
**Curriculum Position:** Deepens the spiritual engine after vision, goals, trust, and emotional awareness are established. Connects directly to the foundation's Isaiah 58 mandate.

**Key Topics:**
- Biblical foundations of fasting
- Types of fasts and choosing what's right
- Physical, emotional, and spiritual preparation
- Prayer strategies: structured, listening, intercessory
- Isaiah 58 connection: the fast God chooses
- Integrating spiritual disciplines into daily student life

**Expected Outcomes:**
- Completed a guided fast
- Deepened prayer life with practical rhythms
- Understanding of how disciplines connect to vision (1), trust (3), and anxiety management (4)

**Bridge Forward:** Session 6 shifts to practical stewardship — what resources do you already have?

---

## Assessment: Daily Spiritual Experience Scale (DSES)

**Author:** Lynn G. Underwood, Jeanne A. Teresi
**Published:** 2002, Annals of Behavioral Medicine, 24(1), 22–33
**Why this instrument:** Measures the frequency of ordinary spiritual experiences — closeness to God, gratitude, compassion, awareness of divine presence. Unlike the SWBS which measures overall spiritual well-being, the DSES captures the day-to-day spiritual life that fasting and prayer aim to deepen.
**Public availability:** Freely available from the author's website (www.dsescale.org). Available in multiple languages.

### Response Scale

Items 1–15 rated on a 6-point frequency scale:

| Value | Label |
|:---:|---|
| 1 | Many times a day |
| 2 | Every day |
| 3 | Most days |
| 4 | Some days |
| 5 | Once in a while |
| 6 | Never or almost never |

Item 16 rated on a 4-point scale:

| Value | Label |
|:---:|---|
| 1 | Not close at all |
| 2 | Somewhat close |
| 3 | Very close |
| 4 | As close as possible |

### Questionnaire Items

| # | Item Text |
|:---:|---|
| 1 | I feel God's presence. |
| 2 | I experience a connection to all of life. |
| 3 | During worship or at other times when connecting with God, I feel joy which lifts me out of my daily concerns. |
| 4 | I find strength in my religion or spirituality. |
| 5 | I find comfort in my religion or spirituality. |
| 6 | I feel deep inner peace or harmony. |
| 7 | I ask for God's help in the midst of daily activities. |
| 8 | I feel guided by God in the midst of daily activities. |
| 9 | I feel God's love for me, directly. |
| 10 | I feel God's love for me, through others. |
| 11 | I am spiritually touched by the beauty of creation. |
| 12 | I feel thankful for my blessings. |
| 13 | I feel a selfless caring for others. |
| 14 | I accept others even when they do things I think are wrong. |
| 15 | I desire to be closer to God or in union with the divine. |
| 16 | In general, how close do you feel to God? |

### Scoring Engine

**Reverse-scored items:** None for items 1–15. Item 16 is scored separately.

**Items 1–15:** For these items, LOWER scores = MORE FREQUENT spiritual experiences. To make interpretation intuitive (higher = better), reverse the scoring: subtract each response from 7.

Reversed scoring for items 1–15: response of 1→6, 2→5, 3→4, 4→3, 5→2, 6→1

**Item 16:** Reverse score by subtracting from 5: 1→4, 2→3, 3→2, 4→1

**Total score (reversed, higher = more spiritual experiences):**
Sum of all 16 reversed items. Range: 16–94

**Alternative: use original scoring where lower = more frequent. Either convention works as long as it is consistent across the platform.**

**Platform recommendation:** Use reversed scoring (higher = better) for consistency with all other instruments and for intuitive display on growth charts.

### Interpretation Guide

Using reversed scoring (higher = more frequent spiritual experiences):

| Score Range | Level | Interpretation |
|:---:|---|---|
| 75–94 | Very frequent | Rich, active spiritual life. Experiences God's presence, love, and guidance daily. |
| 55–74 | Frequent | Regular spiritual experiences. Solid foundation with room for deeper practices. |
| 35–54 | Occasional | Some spiritual awareness but not a daily practice. Sessions 5's disciplines can transform this. |
| 16–34 | Infrequent | Rarely experiences spiritual connection in daily life. This session is critical for building foundational disciplines. |

**Flag thresholds:**
- Score < 30 (reversed) → `mentor_notify` — very low daily spiritual engagement
- No `admin_review` flag — spiritual dryness is not a crisis, but it does need pastoral attention

**Growth tracking:** Ideal pre/post instrument for Session 5. Re-administer at Session 9 and Session 16 to track whether spiritual disciplines are taking root in daily life.

### References

- Underwood, L. G., & Teresi, J. A. (2002). The Daily Spiritual Experience Scale: Development, theoretical description, reliability, exploratory factor analysis, and preliminary construct validity using health-related data. *Annals of Behavioral Medicine*, 24(1), 22–33.
- Underwood, L. G. (2011). The Daily Spiritual Experience Scale: Overview and results. *Religions*, 2(1), 29–50.

---

---

# SESSION 6: A Jar of Oil (Start With What You Have)

**Pillar:** Financial & Career Development
**Theme:** Resourcefulness and Asset Maximization
**Scripture:** 2 Kings 4:1–7; Matthew 25:14–30; Zechariah 4:10
**Curriculum Position:** Flips the scarcity narrative. Challenges beneficiaries to see what they already have and start using it.

**Key Topics:**
- The widow's oil: obedience, resourcefulness, multiplication
- Personal asset inventory: skills, time, relationships, knowledge
- Monetizing existing skills
- Side hustles for students
- Connection to Session 2 goals

**Expected Outcomes:**
- Completed personal asset inventory
- At least one income generation plan
- Shift from scarcity to stewardship mindset

**Bridge Forward:** Session 7 teaches how to manage what you have.

---

## Assessment: General Self-Efficacy Scale (GSE)

**Author:** Ralf Schwarzer, Matthias Jerusalem
**Published:** 1995. Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy Scale. In J. Weinman, S. Wright, & M. Johnston (Eds.), *Measures in health psychology: A user's portfolio*, 35–37.
**Why this instrument:** Self-efficacy — the belief that you can handle challenges and produce results — is the psychological engine of resourcefulness. A person can identify their assets (Session 6's content) but still not believe they can use them. The GSE reveals that gap.
**Public availability:** Freely available in 33 languages, including Yoruba and several other Nigerian languages. No permission required.

### Response Scale

| Value | Label |
|:---:|---|
| 1 | Not at all true |
| 2 | Hardly true |
| 3 | Moderately true |
| 4 | Exactly true |

### Questionnaire Items

| # | Item Text |
|:---:|---|
| 1 | I can always manage to solve difficult problems if I try hard enough. |
| 2 | If someone opposes me, I can find the means and ways to get what I want. |
| 3 | It is easy for me to stick to my aims and accomplish my goals. |
| 4 | I am confident that I could deal efficiently with unexpected events. |
| 5 | Thanks to my resourcefulness, I know how to handle unforeseen situations. |
| 6 | I can solve most problems if I invest the necessary effort. |
| 7 | I can remain calm when facing difficulties because I can rely on my coping abilities. |
| 8 | When I am confronted with a problem, I can usually find several solutions. |
| 9 | If I am in trouble, I can usually think of a solution. |
| 10 | I can usually handle whatever comes my way. |

### Scoring Engine

**Reverse-scored items:** None

**Total score:** Sum of all 10 items. Range: 10–40

**No subscales.**

### Interpretation Guide

| Score Range | Level | Interpretation |
|:---:|---|---|
| 31–40 | High | Strong self-efficacy. Believes in their ability to handle challenges and create results. Ready to act on their assets. |
| 21–30 | Moderate | Reasonable self-belief but may hesitate under pressure. Needs encouragement to take first steps. |
| 10–20 | Low | Low confidence in ability to manage challenges. May see assets but not believe they can use them. Needs significant support and small wins. |

**Flag thresholds:**
- Score ≤ 15 → `mentor_notify` — very low self-efficacy, may need extra encouragement and smaller initial goals
- Score ≤ 10 → `admin_review` — extremely low; may indicate deeper issues (depression, learned helplessness)

**Cross-reference:** Compare with Session 4 GAD-7 score. High anxiety + low self-efficacy is a particularly difficult combination that needs targeted mentorship.

### References

- Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy Scale. In J. Weinman, S. Wright, & M. Johnston (Eds.), *Measures in health psychology: A user's portfolio. Causal and control beliefs* (pp. 35–37). Windsor, UK: NFER-NELSON.
- Scholz, U., Doña, B. G., Sud, S., & Schwarzer, R. (2002). Is general self-efficacy a universal construct? *European Journal of Psychological Assessment*, 18(3), 242–251.

---

---

# SESSION 7: Financial Management

**Pillar:** Financial & Career Development
**Theme:** Stewardship, Budgeting, and Building Wealth
**Scripture:** Proverbs 21:5; Luke 14:28–30; Malachi 3:10
**Curriculum Position:** Builds on Session 6's asset awareness. Now teaches how to protect, grow, and steward resources wisely.

**Key Topics:**
- Biblical stewardship: God owns it, you manage it
- Building a personal budget (hands-on workshop)
- Avoiding debt traps
- Emergency funds
- Tithing and generosity as financial principles
- Investing basics for beginners

**Expected Outcomes:**
- Working personal budget
- Savings plan with targets
- Debt avoidance strategy
- Financial framework connected to vision (1) and goals (2)

**Bridge Forward:** Session 8 addresses relationships — equally important and often equally mismanaged.

---

## Assessment: Financial Self-Efficacy Scale (FSES)

**Author:** Jean M. Lown
**Published:** 2011, Journal of Financial Counseling and Planning, 22(2), 54–63
**Why this instrument:** Measures confidence in managing personal finances specifically — not general self-efficacy, but financial self-efficacy. Pre/post comparison directly shows whether Session 7's financial literacy content is building confidence.
**Public availability:** Published in peer-reviewed journal. Items freely available.

### Response Scale

| Value | Label |
|:---:|---|
| 1 | Not at all true |
| 2 | Hardly true |
| 3 | Moderately true |
| 4 | Exactly true |

### Questionnaire Items

| # | Item Text |
|:---:|---|
| 1 | It is hard to stick to my spending plan when unexpected expenses arise. |
| 2 | It is challenging to make progress toward my financial goals. |
| 3 | When unexpected expenses occur, I usually have to use credit. |
| 4 | When faced with a financial challenge, I have a hard time figuring out a solution. |
| 5 | I lack confidence in my ability to manage my finances. |
| 6 | I worry about running out of money in retirement. |

### Scoring Engine

**All items are reverse-scored:** These are all negatively worded. Reverse the scale: 1→4, 2→3, 3→2, 4→1.

**Total score:** Sum of all 6 reversed items. Range: 6–24. Higher = greater financial self-efficacy.

**No subscales.**

### Interpretation Guide

| Score Range | Level | Interpretation |
|:---:|---|---|
| 19–24 | High | Strong financial confidence. Believes they can manage money, handle surprises, and reach financial goals. |
| 13–18 | Moderate | Some financial confidence but uncertainty in certain areas. Session 7's practical tools will build this. |
| 6–12 | Low | Low financial confidence. Feels overwhelmed by money management. This session's practical budget workshop is essential. |

**Flag thresholds:**
- Score ≤ 9 → `mentor_notify` — very low financial confidence; may need one-on-one financial coaching
- No `admin_review` — financial anxiety is common and addressed by the session content

**Growth tracking:** Strong pre/post instrument. Re-administer after Session 10 (Entrepreneurship) to see if financial confidence extends to business contexts.

### References

- Lown, J. M. (2011). Development and validation of a financial self-efficacy scale. *Journal of Financial Counseling and Planning*, 22(2), 54–63.

---

---

# SESSION 8: Am I in Love?

**Pillar:** Emotional Development
**Theme:** Biblical Wisdom for Relationships and Emotional Readiness
**Scripture:** 1 Corinthians 13:4–8; Ephesians 5:1–2; Song of Solomon 2:7
**Curriculum Position:** Midway through the curriculum, addresses one of the most powerful forces in a young person's life. Protects what's been built in Sessions 1–7.

**Key Topics:**
- God's design for love (1 Corinthians 13)
- Infatuation vs. love
- Emotional readiness assessment
- Healthy boundaries
- Heartbreak recovery (connecting to Sessions 1 and 4)

**Expected Outcomes:**
- Clarity on personal relational readiness
- Biblical framework for evaluating relationships
- Boundary-setting skills
- Awareness of how relationships impact vision, goals, finances

**Bridge Forward:** Session 9 asks the hard question — are you doing anything with what you've learned?

---

## Assessment: Relationship Assessment Scale (RAS)

**Author:** Susan S. Hendrick
**Published:** 1988, Journal of Social and Personal Relationships, 5(1), 93–117
**Why this instrument:** Brief, validated measure of relationship quality. For beneficiaries in relationships, it measures satisfaction. For those who are single, an adapted version assesses relational readiness and attachment awareness.
**Public availability:** Freely available for non-commercial use. Published in full in the original paper.

### Response Scale

Items rated on a 5-point scale with item-specific anchors:

| Value | General Label |
|:---:|---|
| 1 | Low (poorly / not much / never) |
| 2 | — |
| 3 | Average |
| 4 | — |
| 5 | High (extremely well / very much / very often) |

### Questionnaire Items — Version A (Currently in a Relationship)

| # | Item Text | Reverse |
|:---:|---|:---:|
| 1 | How well does your partner meet your needs? | No |
| 2 | In general, how satisfied are you with your relationship? | No |
| 3 | How good is your relationship compared to most? | No |
| 4 | How often do you wish you hadn't gotten into this relationship? | Yes |
| 5 | To what extent has your relationship met your original expectations? | No |
| 6 | How much do you love your partner? | No |
| 7 | How many problems are there in your relationship? | Yes |

### Questionnaire Items — Version B (Currently Single — Relational Readiness)

This adapted version assesses emotional readiness for relationships rather than current relationship quality. Use when the beneficiary indicates they are not currently in a romantic relationship.

| # | Item Text | Reverse |
|:---:|---|:---:|
| 1 | I have a clear understanding of what I need from a romantic partner. | No |
| 2 | In general, I feel emotionally prepared for a healthy relationship. | No |
| 3 | Compared to my peers, I believe I understand what makes relationships work. | No |
| 4 | I sometimes worry that I am not ready for a committed relationship. | Yes |
| 5 | My expectations for a future relationship are realistic and well-thought-out. | No |
| 6 | I feel confident in my ability to love and be loved. | No |
| 7 | I often feel anxious or confused about romantic relationships. | Yes |

### Scoring Engine

**Reverse-scored items:** Items 4 and 7 (both versions). Reverse: 1→5, 2→4, 3→3, 4→2, 5→1

**Total score:** Mean of all 7 items (after reversing 4 and 7). Range: 1.00–5.00

**No subscales.**

### Interpretation Guide

| Mean Score | Level | Interpretation |
|:---:|---|---|
| 4.0–5.0 | High | Strong relationship satisfaction (A) or relational readiness (B). Healthy emotional posture. |
| 3.0–3.9 | Moderate | Adequate but with some concerns or growth areas. Session 8 content can strengthen foundations. |
| 2.0–2.9 | Low | Significant relational concerns (A) or unreadiness (B). May benefit from deeper exploration in mentorship. |
| 1.0–1.9 | Very Low | Serious relational distress or significant emotional unreadiness. |

**Flag thresholds:**
- Mean ≤ 2.0 → `mentor_notify` — significant relational distress or unreadiness warranting check-in
- Mean ≤ 1.5 (Version A) → `admin_review` — may indicate abusive or very harmful relationship dynamics

**Note:** The platform should ask beneficiaries which version to take (A: in a relationship, B: single) before displaying items.

### References

- Hendrick, S. S. (1988). A generic measure of relationship satisfaction. *Journal of Marriage and the Family*, 50, 93–98.
- Hendrick, S. S., Dicke, A., & Hendrick, C. (1998). The Relationship Assessment Scale. *Journal of Social and Personal Relationships*, 15, 137–142.

---

---

# SESSION 9: Be a Doer

**Pillar:** Spiritual Development
**Theme:** From Knowledge to Action — The Midpoint Challenge
**Scripture:** James 1:22–25; Matthew 7:24–27; Luke 6:46–49
**Curriculum Position:** THE PIVOT POINT. A spiritual audit of Sessions 1–8. Everything after this builds on action, not just knowledge.

**Key Topics:**
- The danger of hearing without doing (James 1:22–25)
- Midpoint audit: reviewing all commitments from Sessions 1–8
- Identifying obedience gaps
- Building sustainable accountability
- The house on rock vs. sand

**Expected Outcomes:**
- Honest self-assessment across all previous sessions
- Updated action plan addressing identified gaps
- Strengthened accountability partnerships
- Renewed commitment to application

**Bridge Forward:** Session 10 channels that commitment into building something tangible.

---

## Assessment: Short Grit Scale (Grit-S)

**Author:** Angela L. Duckworth, Patrick D. Quinn
**Published:** 2009, Journal of Personality Assessment, 91(2), 166–174
**Why this instrument:** Grit — perseverance of effort and consistency of interest — is the psychological measure of being a "doer." The Perseverance of Effort subscale directly captures whether someone follows through on commitments. The Consistency of Interest subscale reveals whether they stick with what they start.
**Public availability:** Freely available from the author's website (angeladuckworth.com/grit-scale).

### Response Scale

| Value | Label |
|:---:|---|
| 1 | Not at all like me |
| 2 | Not much like me |
| 3 | Somewhat like me |
| 4 | Mostly like me |
| 5 | Very much like me |

### Questionnaire Items

| # | Item Text | Subscale | Reverse |
|:---:|---|---|:---:|
| 1 | New ideas and projects sometimes distract me from previous ones. | Consistency of Interest | Yes |
| 2 | Setbacks don't discourage me. I don't give up easily. | Perseverance of Effort | No |
| 3 | I often set a goal but later choose to pursue a different one. | Consistency of Interest | Yes |
| 4 | I am a hard worker. | Perseverance of Effort | No |
| 5 | I have difficulty maintaining my focus on projects that take more than a few months to complete. | Consistency of Interest | Yes |
| 6 | I finish whatever I begin. | Perseverance of Effort | No |
| 7 | My interests change from year to year. | Consistency of Interest | Yes |
| 8 | I am diligent. I never give up. | Perseverance of Effort | No |

### Scoring Engine

**Reverse-scored items:** 1, 3, 5, 7. Reverse: 1→5, 2→4, 3→3, 4→2, 5→1

**Subscale computation (average):**
- **Consistency of Interest (CI):** Average of items 1(R), 3(R), 5(R), 7(R). Range: 1–5
- **Perseverance of Effort (PE):** Average of items 2, 4, 6, 8. Range: 1–5
- **Overall Grit:** Average of all 8 items (after reversing). Range: 1–5

### Interpretation Guide

| Overall Grit | Level | Interpretation |
|:---:|---|---|
| 4.1–5.0 | Very gritty | Strong follow-through and sustained interest. This person acts on what they learn. |
| 3.5–4.0 | Gritty | Above average perseverance. Solid foundation for continued growth. |
| 3.0–3.4 | Moderate | Average grit. May need accountability structures to maintain momentum. |
| 2.0–2.9 | Below average | Struggles with follow-through. Session 9's accountability structures are critical. |
| 1.0–1.9 | Low grit | Significant difficulty maintaining effort and interest. Needs intensive support and very small, achievable goals. |

**Subscale insight:**
- High PE + Low CI: Works hard but keeps changing direction. Needs focus and commitment to vision (reconnect to Session 1)
- Low PE + High CI: Knows what they want but doesn't put in the work. The "hearer not doer" that James warns about
- Low PE + Low CI: Neither sustained effort nor sustained direction. Most concerning pattern

**Flag thresholds:**
- Overall Grit < 2.5 → `mentor_notify` — low follow-through, needs accountability support
- PE < 2.0 → `admin_review` — very low effort persistence, may indicate disengagement or burnout

### References

- Duckworth, A. L., & Quinn, P. D. (2009). Development and validation of the Short Grit Scale (Grit-S). *Journal of Personality Assessment*, 91(2), 166–174.
- Duckworth, A. L., Peterson, C., Matthews, M. D., & Kelly, D. R. (2007). Grit: Perseverance and passion for long-term goals. *Journal of Personality and Social Psychology*, 92(6), 1087–1101.

---

---

# SESSION 10: Entrepreneurship

**Pillar:** Financial & Career Development
**Theme:** Building Something With What You've Learned
**Scripture:** Proverbs 31:16–18; Ecclesiastes 11:6; Genesis 2:15
**Curriculum Position:** Integrates Sessions 2 (goals), 6 (assets), 7 (financial management), and 9 (action).

**Key Topics:**
- Entrepreneurial mindset vs. employee mindset
- Idea validation
- Business model basics
- Market research
- Launching with what you have (Session 6 callback)
- Biblical entrepreneurship: excellence, integrity, service

**Expected Outcomes:**
- Validated business idea or concept
- Basic business plan
- Revenue model understanding
- Connection to financial goals (Session 2)

**Bridge Forward:** Session 11 asks what kind of person you are becoming in the process.

---

## Assessment: Entrepreneurial Self-Efficacy Scale (ESE)

**Author:** Alex F. De Noble, Don Jung, Sanford B. Ehrlich
**Published:** 1999, Presented at Babson Entrepreneurship Research Conference. Refined in subsequent publications.
**Why this instrument:** Measures self-efficacy across five specific entrepreneurial competencies. Reveals exactly which areas of entrepreneurship a beneficiary feels confident in and which need development.
**Public availability:** Published in academic proceedings and widely cited. Items available in published literature.

### Response Scale

| Value | Label |
|:---:|---|
| 1 | Completely disagree |
| 2 | Somewhat disagree |
| 3 | Neither agree nor disagree |
| 4 | Somewhat agree |
| 5 | Completely agree |

### Questionnaire Items

| # | Item Text | Subscale |
|:---:|---|---|
| 1 | I can identify the need for a new product or service. | Marketing |
| 2 | I can design a product or service that will satisfy customer needs. | Marketing |
| 3 | I can determine a competitive price for a new product or service. | Marketing |
| 4 | I can identify a target market for a new product or service. | Marketing |
| 5 | I can develop and use contacts and connections to get sales. | Marketing |
| 6 | I can generate a new idea for a product or service. | Innovation |
| 7 | I can identify new areas for potential growth. | Innovation |
| 8 | I can design a new product or service. | Innovation |
| 9 | I can create a new venture from an innovative idea. | Innovation |
| 10 | I can discover new ways to improve existing products or services. | Innovation |
| 11 | I can brainstorm new ways to do things better. | Innovation |
| 12 | I can make new approaches work when others have failed. | Innovation |
| 13 | I can supervise employees or team members effectively. | Management |
| 14 | I can organize and maintain the financial records of a venture. | Management |
| 15 | I can manage the day-to-day operations of a business. | Management |
| 16 | I can read and interpret financial statements. | Management |
| 17 | I can take calculated risks with uncertain outcomes. | Risk-Taking |
| 18 | I can make decisions under conditions of uncertainty. | Risk-Taking |
| 19 | I can take responsibility for my own business decisions. | Risk-Taking |
| 20 | I can commit significant resources to pursue an opportunity. | Risk-Taking |
| 21 | I can manage my personal finances to support business needs. | Financial Control |
| 22 | I can secure the financial resources needed to start a venture. | Financial Control |
| 23 | I can maintain financial control of a business. | Financial Control |

### Scoring Engine

**Reverse-scored items:** None

**Subscale computation (average):**
- **Marketing:** Average of items 1–5. Range: 1–5
- **Innovation:** Average of items 6–12. Range: 1–5
- **Management:** Average of items 13–16. Range: 1–5
- **Risk-Taking:** Average of items 17–20. Range: 1–5
- **Financial Control:** Average of items 21–23. Range: 1–5
- **Overall ESE:** Average of all 23 items. Range: 1–5

### Interpretation Guide

| Subscale Average | Level | Interpretation |
|:---:|---|---|
| 4.0–5.0 | High | Strong confidence in this entrepreneurial competency. |
| 3.0–3.9 | Moderate | Reasonable confidence. Will grow with practice and experience. |
| 2.0–2.9 | Low | Limited confidence. Needs targeted development in this area. |
| 1.0–1.9 | Very Low | Significant doubt. May need foundational training before entrepreneurial engagement. |

**Cross-references:**
- Low Risk-Taking + High GAD-7 (Session 4) → anxiety is driving avoidance of entrepreneurial risk; connect to Session 3 trust work
- Low Financial Control + Low FSES (Session 7) → financial confidence gap persists; may need additional financial coaching
- Low Innovation + Low GSE (Session 6) → broader self-efficacy issue, not just entrepreneurial

**Flag thresholds:**
- Overall ESE < 2.0 → `mentor_notify` — very low entrepreneurial confidence across the board
- No `admin_review` — low entrepreneurial self-efficacy is normal for many students and addressed by the session content

### References

- De Noble, A. F., Jung, D., & Ehrlich, S. B. (1999). Entrepreneurial self-efficacy: The development of a measure and its relationship to entrepreneurial action. In R. D. Reynolds et al. (Eds.), *Frontiers of Entrepreneurship Research*. Babson College.
- Chen, C. C., Greene, P. G., & Crick, A. (1998). Does entrepreneurial self-efficacy distinguish entrepreneurs from managers? *Journal of Business Venturing*, 13(4), 295–316.

---

---

# SESSION 11: The Path to Greatness

**Pillar:** Discipleship & Leadership
**Theme:** Redefining Success as Servant Leadership
**Scripture:** Mark 10:42–45; Philippians 2:3–8; Matthew 23:11–12
**Curriculum Position:** Shifts from skills to character. Challenges cultural narratives about success.

**Key Topics:**
- Jesus' definition of greatness vs. the world's definition
- Servant leadership
- Character over credentials
- Finding your leadership voice
- Building legacy (connecting to Session 1 vision)

**Expected Outcomes:**
- Written personal leadership philosophy
- Leadership development plan
- Shift from self-advancement to community service

**Bridge Forward:** Session 12 tests this leadership through adversity.

---

## Assessment: Servant Leadership Scale — Short Form (SL-7)

**Author:** Robert C. Liden, Sandy J. Wayne, Hao Zhao, David Henderson
**Published:** 2015, The Leadership Quarterly, 26(2), 254–269
**Why this instrument:** Measures seven dimensions of servant leadership in just 7 items — efficient and directly relevant to Session 11's theme of redefining greatness as service.
**Public availability:** Published in The Leadership Quarterly. Items available in the original paper.

### Response Scale

| Value | Label |
|:---:|---|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Somewhat disagree |
| 4 | Neither agree nor disagree |
| 5 | Somewhat agree |
| 6 | Agree |
| 7 | Strongly agree |

### Questionnaire Items

These items are adapted for self-assessment (original is other-rated). Phrased as "I..." statements to measure the beneficiary's own servant leadership orientation.

| # | Item Text | Dimension |
|:---:|---|---|
| 1 | I care about the emotional well-being of others around me. | Emotional Healing |
| 2 | I emphasize the importance of giving back to the community. | Creating Value for Community |
| 3 | I can tell when something is going wrong before others notice. | Conceptual Skills |
| 4 | I give others the freedom to handle difficult situations in their own way. | Empowering |
| 5 | I make the personal development of others a priority. | Helping Subordinates Grow |
| 6 | I put others' best interests ahead of my own. | Putting Subordinates First |
| 7 | I hold myself to high ethical standards in everything I do. | Behaving Ethically |

### Scoring Engine

**Reverse-scored items:** None

**Total score:** Average of all 7 items. Range: 1–7

**Individual item analysis:** Each item represents a distinct dimension. Low scores on individual items identify specific areas for growth.

### Interpretation Guide

| Average Score | Level | Interpretation |
|:---:|---|---|
| 5.5–7.0 | High | Strong servant leadership orientation. Naturally inclined to lead through service. |
| 4.0–5.4 | Moderate | Growing servant leadership mindset. Session 11 will deepen and solidify this. |
| 2.5–3.9 | Low | More self-oriented than service-oriented in leadership approach. This session is transformative for this score range. |
| 1.0–2.4 | Very Low | Significantly self-focused leadership posture. May need to first address underlying mindsets. |

**Flag thresholds:**
- Average < 3.0 → `mentor_notify` — very self-oriented leadership posture; mentorship conversation needed
- Item 6 (Putting Others First) score of 1 or 2 → Note for facilitator

### References

- Liden, R. C., Wayne, S. J., Meuser, J. D., Hu, J., Wu, J., & Liao, C. (2015). Servant leadership: Validation of a short form of the SL-28. *The Leadership Quarterly*, 26(2), 254–269.
- Liden, R. C., Wayne, S. J., Zhao, H., & Henderson, D. (2008). Servant leadership: Development of a multidimensional measure and multi-level assessment. *The Leadership Quarterly*, 19, 161–177.

---

---

# SESSION 12: Adapting Through Challenges

**Pillar:** Discipleship & Leadership
**Theme:** Resilience, Adaptability, and Growth Through Adversity
**Scripture:** Romans 5:3–5; James 1:2–4; Genesis 50:20
**Curriculum Position:** Normalizes adversity and reframes it as God's development tool. Connects to trust (Session 3) and anxiety tools (Session 4).

**Key Topics:**
- Psychology of change and resistance
- Biblical resilience (Joseph, Paul, David)
- Reframing challenges
- Practical adaptation strategies
- Building antifragility

**Expected Outcomes:**
- Personal resilience toolkit
- Challenge navigation framework
- Testimony of overcoming
- Understanding that setbacks don't disqualify vision (Session 1)

**Bridge Forward:** Session 13 gets practical with career preparation.

---

## Assessment: Brief Resilience Scale (BRS)

**Author:** Bruce W. Smith, Jeanne Dalen, Kathryn Wiggins, Alexis Steger, Bernard N. Tooley
**Published:** 2008, International Journal of Behavioral Medicine, 15, 194–200
**Why this instrument:** Measures the ability to bounce back from stress — the core of resilience. Only 6 items, making it efficient. Well-validated and widely used across cultures.
**Public availability:** Freely available for non-commercial use. Published in full in the original paper.

### Response Scale

| Value | Label |
|:---:|---|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Neutral |
| 4 | Agree |
| 5 | Strongly agree |

### Questionnaire Items

| # | Item Text | Reverse |
|:---:|---|:---:|
| 1 | I tend to bounce back quickly after hard times. | No |
| 2 | I have a hard time making it through stressful events. | Yes |
| 3 | It does not take me long to recover from a stressful event. | No |
| 4 | It is hard for me to snap back when something bad happens. | Yes |
| 5 | I usually come through difficult times with little trouble. | No |
| 6 | I tend to take a long time to get over set-backs in my life. | Yes |

### Scoring Engine

**Reverse-scored items:** 2, 4, 6. Reverse: 1→5, 2→4, 3→3, 4→2, 5→1

**Total score:** Mean of all 6 items (after reversing). Range: 1.00–5.00

**No subscales.**

### Interpretation Guide

| Mean Score | Level | Interpretation |
|:---:|---|---|
| 4.31–5.00 | High resilience | Bounces back quickly from adversity. Strong ability to recover and adapt. |
| 3.00–4.30 | Normal resilience | Typical resilience. Can recover from setbacks with reasonable time and support. |
| 1.00–2.99 | Low resilience | Struggles to recover from adversity. May get stuck in difficult periods. Needs additional support. |

**Flag thresholds:**
- Mean < 2.5 → `mentor_notify` — low resilience; may need extra support during challenges
- Mean < 2.0 → `admin_review` — very low; consider whether counseling referral is appropriate

**Cross-reference:** Compare with GAD-7 (Session 4). Low resilience + high anxiety is a particularly concerning combination. Also compare with Grit-S (Session 9) — low resilience + low perseverance suggests the beneficiary may be at risk of dropping out when challenges arise.

### References

- Smith, B. W., Dalen, J., Wiggins, K., Steger, A., & Tooley, B. N. (2008). The Brief Resilience Scale: Assessing the ability to bounce back. *International Journal of Behavioral Medicine*, 15, 194–200.
- Rodríguez-Rey, R., Alonso-Tapia, J., & Hernansaiz-Garrido, H. (2016). Reliability and validity of the Brief Resilience Scale (BRS) Spanish version. *Psychological Assessment*, 28(5), e101–e110.

---

---

# SESSION 13: My Career Checklist

**Pillar:** Financial & Career Development
**Theme:** Practical Career Preparation for Life After School
**Scripture:** Colossians 3:23–24; Proverbs 22:29; Ecclesiastes 9:10
**Curriculum Position:** Every previous session has been building toward this. The career search is the visible expression of vision, skills, and character.

**Key Topics:**
- Career assessment aligned with vision (Session 1)
- Resume development
- LinkedIn optimization
- Interview strategies
- Salary negotiation
- Networking with authenticity

**Expected Outcomes:**
- Optimized resume and LinkedIn profile
- Career checklist with timeline
- Interview preparation
- Professional network expansion strategy

**Bridge Forward:** Session 14 develops the leader who walks into that career.

---

## Assessment: Career Decision Self-Efficacy Scale — Short Form (CDSE-SF)

**Author:** Nancy E. Betz, Karen L. Klein, Gail S. Taylor
**Published:** 1996, Journal of Career Assessment, 4(1), 47–57. Based on Taylor & Betz (1983).
**Why this instrument:** Measures confidence across five specific career decision-making tasks. Pinpoints exactly where a beneficiary needs career preparation help — not just "are you confident" but "which specific career skill do you lack confidence in?"
**Public availability:** Widely used in career counseling research. Items published in multiple papers.

### Response Scale

| Value | Label |
|:---:|---|
| 0 | No confidence at all |
| 1 | Very little confidence |
| 2 | Moderate confidence |
| 3 | Much confidence |
| 4 | Complete confidence |

### Questionnaire Items

**Instructions:** "How much confidence do you have that you could accomplish each of the following tasks?"

| # | Item Text | Subscale |
|:---:|---|---|
| 1 | Accurately assess my abilities. | Self-Appraisal |
| 2 | Determine what my ideal job would be. | Self-Appraisal |
| 3 | Decide what I value most in an occupation. | Self-Appraisal |
| 4 | Identify some reasonable career alternatives if I was unable to get my first choice. | Self-Appraisal |
| 5 | Recognize the strengths and limitations of my qualifications. | Self-Appraisal |
| 6 | Find information about career fields that interest me. | Occupational Information |
| 7 | Identify employers and companies relevant to my career possibilities. | Occupational Information |
| 8 | Find out the employment trends for a career area over the next 10 years. | Occupational Information |
| 9 | Talk to someone already working in a field I am interested in. | Occupational Information |
| 10 | Find information about postgraduate training programs. | Occupational Information |
| 11 | Select one career from a list of potential careers I am considering. | Goal Selection |
| 12 | Determine the steps needed to successfully enter my chosen career. | Goal Selection |
| 13 | Choose a career that will fit my preferred lifestyle. | Goal Selection |
| 14 | Choose a career that will fit my interests. | Goal Selection |
| 15 | Select one occupation from a list of potential occupations. | Goal Selection |
| 16 | Make a plan of my goals for the next five years. | Planning |
| 17 | Determine the steps I need to take to successfully complete my chosen course of study. | Planning |
| 18 | Prepare a good resume. | Planning |
| 19 | Successfully manage the interview process. | Planning |
| 20 | Identify the right people to help me in my career development. | Planning |
| 21 | Change my career if I were not satisfied with my first choice. | Problem Solving |
| 22 | Persistently work at my career goal even when I get frustrated. | Problem Solving |
| 23 | Handle the pressure of making important career decisions. | Problem Solving |
| 24 | Overcome barriers that stand between me and my career goals. | Problem Solving |
| 25 | Navigate the job market successfully. | Problem Solving |

### Scoring Engine

**Reverse-scored items:** None

**Subscale computation (sum):**
- **Self-Appraisal:** Sum of items 1–5. Range: 0–20
- **Occupational Information:** Sum of items 6–10. Range: 0–20
- **Goal Selection:** Sum of items 11–15. Range: 0–20
- **Planning:** Sum of items 16–20. Range: 0–20
- **Problem Solving:** Sum of items 21–25. Range: 0–20
- **Total CDSE:** Sum of all 25 items. Range: 0–100

### Interpretation Guide

**Per subscale:**

| Subscale Sum | Level | Interpretation |
|:---:|---|---|
| 16–20 | High confidence | Strong in this career competency. Ready to act. |
| 10–15 | Moderate | Some confidence. Will benefit from Session 13's practical exercises. |
| 5–9 | Low | Limited confidence. This area needs targeted work during the session. |
| 0–4 | Very Low | Significant gap. One-on-one career coaching recommended. |

**Total score:**

| Total | Level | Interpretation |
|:---:|---|---|
| 80–100 | High | Career-ready. Confident across all decision-making areas. |
| 50–79 | Moderate | Developing career readiness. Session 13 addresses the gaps. |
| 25–49 | Low | Significant career preparation needed. |
| 0–24 | Very Low | Overwhelmed by career decisions. Needs intensive support. |

**Flag thresholds:**
- Total < 30 → `mentor_notify` — very low career readiness; needs extra career coaching
- Any single subscale = 0–2 → flag that specific area for the facilitator

**Cross-reference:** Compare with Session 2 AGQ-R. High performance-avoidance + low CDSE Planning = afraid of career failure and doesn't have a plan. Connect to Session 3 trust work.

### References

- Betz, N. E., Klein, K. L., & Taylor, K. M. (1996). Evaluation of a short form of the Career Decision-Making Self-Efficacy Scale. *Journal of Career Assessment*, 4(1), 47–57.
- Taylor, K. M., & Betz, N. E. (1983). Applications of self-efficacy theory to the understanding and treatment of career indecision. *Journal of Vocational Behavior*, 22, 63–81.

---

---

# SESSION 14: Authentic Leadership

**Pillar:** Discipleship & Leadership
**Theme:** Leading From Values Under Pressure
**Scripture:** 1 Timothy 4:12; Titus 2:7–8; 2 Corinthians 4:2
**Curriculum Position:** Advanced leadership development. Prepares beneficiaries for the reality of leading in workplaces and communities.

**Key Topics:**
- Authentic vs. performative leadership
- Leadership identity
- Ethical decision-making
- Vulnerable leadership
- Building trust in professional settings (Session 3 callback)
- Leading diverse teams

**Expected Outcomes:**
- Written leadership identity statement
- Ethical decision-making framework
- Peer coaching relationships
- Connection to servant leadership (Session 11) and career readiness (Session 13)

**Bridge Forward:** Session 15 sharpens the mind behind the leadership.

---

## Assessment: Authentic Leadership Self-Assessment Questionnaire (ALQ-Self)

**Author:** Based on Walumbwa, F. O., Avolio, B. J., Gardner, W. L., Wernsing, T. S., & Peterson, S. J.
**Published:** 2008, Journal of Management, 34(1), 89–126
**Why this instrument:** Measures four components of authentic leadership as a self-assessment. Directly relevant to Session 14's focus on leading from values.
**Public availability:** Widely published constructs. Self-assessment adaptation based on published four-factor model.

### Response Scale

| Value | Label |
|:---:|---|
| 0 | Not at all |
| 1 | Once in a while |
| 2 | Sometimes |
| 3 | Fairly often |
| 4 | Frequently, if not always |

### Questionnaire Items

| # | Item Text | Subscale |
|:---:|---|---|
| 1 | I can list my three greatest strengths. | Self-Awareness |
| 2 | I can list my three greatest weaknesses. | Self-Awareness |
| 3 | I seek feedback from others to improve how I interact with them. | Self-Awareness |
| 4 | I accept the feelings I have about myself. | Self-Awareness |
| 5 | I say exactly what I mean. | Relational Transparency |
| 6 | I admit my mistakes to others. | Relational Transparency |
| 7 | I openly share my feelings with others. | Relational Transparency |
| 8 | I let others know who I truly am as a person. | Relational Transparency |
| 9 | I tell the truth even when it is not easy. | Relational Transparency |
| 10 | I show consistency between my beliefs and actions. | Internalized Moral Perspective |
| 11 | I make decisions based on my core values. | Internalized Moral Perspective |
| 12 | I resist pressure to do things contrary to my beliefs. | Internalized Moral Perspective |
| 13 | I am guided by ethical principles in my decision-making. | Internalized Moral Perspective |
| 14 | I listen carefully to different viewpoints before reaching a conclusion. | Balanced Processing |
| 15 | I seek out information that challenges my own position. | Balanced Processing |
| 16 | I consider other people's perspectives before making decisions. | Balanced Processing |

### Scoring Engine

**Reverse-scored items:** None

**Subscale computation (average):**
- **Self-Awareness (SA):** Average of items 1–4. Range: 0–4
- **Relational Transparency (RT):** Average of items 5–9. Range: 0–4
- **Internalized Moral Perspective (IMP):** Average of items 10–13. Range: 0–4
- **Balanced Processing (BP):** Average of items 14–16. Range: 0–4
- **Overall ALQ:** Average of all 16 items. Range: 0–4

### Interpretation Guide

| Average | Level | Interpretation |
|:---:|---|---|
| 3.0–4.0 | High | Strong authentic leadership. Consistently leads from values with self-awareness and transparency. |
| 2.0–2.9 | Moderate | Developing authenticity. Some areas are strong; others need intentional growth. |
| 1.0–1.9 | Low | Limited authentic leadership practices. Significant growth opportunity through Session 14. |
| 0–0.9 | Very Low | Rarely practices authentic leadership. May be leading performatively or not leading at all. |

**Subscale insight:**
- High IMP + Low RT: Has values but doesn't share them openly. May be seen as guarded or political
- Low SA + High RT: Open but lacks self-understanding. May be transparent without being wise
- Low BP: Doesn't consider other viewpoints. Risk of blind spots in leadership

**Flag thresholds:**
- Overall < 1.5 → `mentor_notify`
- IMP < 1.0 → `mentor_notify` — very low moral grounding in leadership decisions

### References

- Walumbwa, F. O., Avolio, B. J., Gardner, W. L., Wernsing, T. S., & Peterson, S. J. (2008). Authentic leadership: Development and validation of a theory-based measure. *Journal of Management*, 34(1), 89–126.
- Neider, L. L., & Schriesheim, C. A. (2011). The Authentic Leadership Inventory (ALI): Development and empirical tests. *The Leadership Quarterly*, 22, 1146–1164.

---

---

# SESSION 15: Research in the Age of A.I.

**Pillar:** Discipleship & Leadership
**Theme:** Critical Thinking and Discernment in a Changing World
**Scripture:** Proverbs 18:15; Acts 17:11; 1 Thessalonians 5:21
**Curriculum Position:** Sharpens the mind behind the leadership. In a world of misinformation and AI, the leader who thinks critically lasts.

**Key Topics:**
- AI as tool, not replacement for thinking
- Research skills for the AI era
- Information literacy
- Ethical AI use
- Biblical discernment applied to technology (Acts 17:11)
- Practical AI tools for research and productivity

**Expected Outcomes:**
- Personal AI research toolkit
- Enhanced critical thinking skills
- Ethical framework for AI use
- Ability to leverage technology without being controlled by it

**Bridge Forward:** Session 16 sends you out to use everything you've built.

---

## Assessment: Critical Thinking Disposition Assessment (CTDA)

**Author:** Adapted from Facione, P. A., Facione, N. C., & Sanchez, C. A. (1994), drawing on the Delphi consensus constructs.
**Published:** Based on American Philosophical Association Delphi Report (1990) constructs. Multiple implementations available.
**Why this instrument:** Measures disposition toward critical thinking — not just ability but inclination. Relevant because AI makes information access easy; the differentiator is whether someone is inclined to question, analyze, and verify.
**Public availability:** Adapted versions based on published Delphi consensus constructs are freely available for educational use.

### Response Scale

| Value | Label |
|:---:|---|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Slightly disagree |
| 4 | Slightly agree |
| 5 | Agree |
| 6 | Strongly agree |

### Questionnaire Items

| # | Item Text | Subscale |
|:---:|---|---|
| 1 | I am willing to change my mind when evidence suggests I should. | Open-Mindedness |
| 2 | I try to consider all sides of an issue before making a judgment. | Open-Mindedness |
| 3 | I respect the right of others to hold opinions different from mine. | Open-Mindedness |
| 4 | I find it easy to reconsider a position when presented with good arguments. | Open-Mindedness |
| 5 | I think through complex problems step by step. | Analyticity |
| 6 | I pay close attention to details when evaluating an argument. | Analyticity |
| 7 | I prefer situations where I need to use careful reasoning. | Analyticity |
| 8 | I enjoy solving problems that require deep analysis. | Analyticity |
| 9 | I approach problems in an orderly and organized way. | Systematicity |
| 10 | I follow a logical process when making important decisions. | Systematicity |
| 11 | I plan my approach before starting complex tasks. | Systematicity |
| 12 | I keep track of the steps I take when solving a problem. | Systematicity |
| 13 | I want to know the truth even when it is uncomfortable. | Truth-Seeking |
| 14 | I question information even when it comes from an authority figure. | Truth-Seeking |
| 15 | I am willing to investigate claims rather than accept them at face value. | Truth-Seeking |
| 16 | I prefer evidence over opinions when forming my views. | Truth-Seeking |
| 17 | I am curious about how things work. | Inquisitiveness |
| 18 | I enjoy learning new things even when they are not directly useful to me. | Inquisitiveness |
| 19 | I ask questions frequently to deepen my understanding. | Inquisitiveness |
| 20 | I actively seek out new knowledge and experiences. | Inquisitiveness |

### Scoring Engine

**Reverse-scored items:** None

**Subscale computation (average):**
- **Open-Mindedness:** Average of items 1–4. Range: 1–6
- **Analyticity:** Average of items 5–8. Range: 1–6
- **Systematicity:** Average of items 9–12. Range: 1–6
- **Truth-Seeking:** Average of items 13–16. Range: 1–6
- **Inquisitiveness:** Average of items 17–20. Range: 1–6
- **Overall CTDA:** Average of all 20 items. Range: 1–6

### Interpretation Guide

| Average | Level | Interpretation |
|:---:|---|---|
| 5.0–6.0 | Strong disposition | Naturally inclined to think critically. Will use AI tools wisely. |
| 4.0–4.9 | Moderate disposition | Generally thinks critically but may have blind spots. Session 15 strengthens this. |
| 3.0–3.9 | Weak disposition | Limited inclination toward critical thinking. Vulnerable to misinformation and AI over-reliance. |
| 1.0–2.9 | Very weak | Rarely engages in critical thinking. High risk of accepting information uncritically. |

**Key subscale concern:** Truth-Seeking < 3.0 — this person accepts information at face value. In the age of AI-generated content, this is dangerous. Session 15 directly addresses this.

**Flag thresholds:**
- Truth-Seeking < 3.0 → `mentor_notify` — vulnerable to misinformation
- Overall < 3.0 → `admin_review` — significant critical thinking gap

### References

- Facione, P. A. (1990). *Critical thinking: A statement of expert consensus for purposes of educational assessment and instruction (The Delphi Report)*. California Academic Press.
- Facione, P. A., Facione, N. C., & Sanchez, C. A. (1994). Critical thinking disposition as a measure of competent clinical judgment: The development of the California Critical Thinking Disposition Inventory. *Journal of Nursing Education*, 33, 345–350.

---

---

# SESSION 16: Becoming an Influencer

**Pillar:** Discipleship & Leadership
**Theme:** Using Your Platform to Impact Your Generation
**Scripture:** Matthew 5:14–16; Daniel 12:3; 2 Timothy 2:2
**Curriculum Position:** The final session. Brings the entire curriculum full circle. The light shown to you must now shine through you.

**Key Topics:**
- Influence as stewardship — your story is not just for you
- Finding your niche
- Content strategy and platform selection
- Authentic storytelling (including Session 12 struggles)
- Substance over vanity metrics
- 2 Timothy 2:2: pass what you received to faithful people

**Expected Outcomes:**
- Personal content and influence strategy
- Active presence on at least one platform
- Commitment to mentoring the next cohort
- Understanding of how influence connects to vision (Session 1) and the Isaiah 58:12 mandate

**Bridge Forward:** This is not the end. As alumni, you carry the mandate forward.

---

## Assessment: Sociopolitical Control Scale — Revised (SPCS-R)

**Author:** N. Andrew Peterson, Robert J. Lowe, Mary L. Aquilino, John B. Schneider
**Published:** 2006, Journal of Community Psychology, 34(5), 523–545. Revision of Zimmerman & Zahniser (1991).
**Why this instrument:** Measures both the confidence to lead (Leadership Competence) and the belief that you can influence systems and communities (Policy Control). Together these indicate readiness to be an influencer with substance, not just a content creator with followers.
**Public availability:** Freely available for research. Published in full in the original paper.

### Response Scale

| Value | Label |
|:---:|---|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Neither agree nor disagree |
| 4 | Agree |
| 5 | Strongly agree |

### Questionnaire Items

| # | Item Text | Subscale |
|:---:|---|---|
| 1 | I am often a leader in groups. | Leadership Competence |
| 2 | I would prefer to be a leader rather than a follower. | Leadership Competence |
| 3 | I can usually organize people to get things done. | Leadership Competence |
| 4 | Other people usually follow my ideas. | Leadership Competence |
| 5 | I find it very easy to talk in front of a group. | Leadership Competence |
| 6 | I like to work on solving community problems. | Leadership Competence |
| 7 | I enjoy being part of organizations that make a difference. | Leadership Competence |
| 8 | I like trying new and creative ways to influence others. | Leadership Competence |
| 9 | People like me can influence government decisions. | Policy Control |
| 10 | I believe that my community has influence over government decisions. | Policy Control |
| 11 | People like me have the ability to participate in community decision-making. | Policy Control |
| 12 | My opinion is important in my community. | Policy Control |
| 13 | People in my community can shape government policies if they organize together. | Policy Control |
| 14 | People like me can make an impact on issues that affect our community. | Policy Control |
| 15 | I believe that the voice of ordinary people matters in making change happen. | Policy Control |
| 16 | I can contribute to making my community a better place. | Policy Control |
| 17 | I believe that organized groups of ordinary people can make a real difference. | Policy Control |

### Scoring Engine

**Reverse-scored items:** None

**Subscale computation (average):**
- **Leadership Competence (LC):** Average of items 1–8. Range: 1–5
- **Policy Control (PC):** Average of items 9–17. Range: 1–5
- **Overall SPCS:** Average of all 17 items. Range: 1–5

### Interpretation Guide

| Subscale Average | Level | Interpretation |
|:---:|---|---|
| 4.0–5.0 | High | Strong confidence in leading and influencing. Ready to use their platform for impact. |
| 3.0–3.9 | Moderate | Developing confidence. Session 16 will build specific skills to convert this into action. |
| 2.0–2.9 | Low | Limited belief in their ability to lead or influence. May feel powerless or insignificant. |
| 1.0–1.9 | Very Low | Does not see themselves as a leader or influencer. Needs significant encouragement and small wins. |

**Subscale insight:**
- High LC + Low PC: Confident in leading people but doesn't believe the system can be changed. Needs hope and examples
- Low LC + High PC: Believes change is possible but doesn't see themselves as the one to lead it. Session 11 (servant leadership) and Session 14 (authentic leadership) work may need reinforcement
- Both high: Ready to influence. Session 16 gives them the practical tools
- Both low: The curriculum should have moved these scores. If still low, review what happened across Sessions 1–15

**Flag thresholds:**
- Overall < 2.5 → `mentor_notify` — doesn't see themselves as capable of influence; end-of-curriculum concern
- LC < 2.0 → Note for facilitator — this person may need encouragement to step into influence

**Growth tracking:** Compare with Session 6 GSE (general self-efficacy) and Session 11 SL-7 (servant leadership). The arc should show growing self-belief and service orientation culminating in readiness to influence.

### References

- Peterson, N. A., Lowe, J. B., Aquilino, M. L., & Schneider, J. E. (2006). Linking social cohesion and gender to intrapersonal and interactional empowerment: Support and new implications for theory. *Journal of Community Psychology*, 34(5), 523–545.
- Zimmerman, M. A., & Zahniser, J. H. (1991). Refinements of sphere-specific measures of perceived control: Development of a sociopolitical control scale. *Journal of Community Psychology*, 19, 189–204.

---

---

# Appendix A: Cross-Session Assessment Matrix

This matrix shows how assessment results connect across sessions, enabling holistic beneficiary profiling.

| Connection Pattern | Instruments | What It Reveals |
|---|---|---|
| Vision + Purpose | MLQ (S1) + Grit-S (S9) | Does the person have purpose AND follow through on it? |
| Trust + Anxiety | SWBS (S3) + GAD-7 (S4) | Is spiritual well-being buffering anxiety, or are both low? |
| Self-Belief Chain | GSE (S6) + FSES (S7) + ESE (S10) | Does general confidence extend to financial and entrepreneurial domains? |
| Leadership Arc | SL-7 (S11) + ALQ (S14) + SPCS (S16) | Servant orientation → authentic practice → influence readiness |
| Resilience + Grit | BRS (S12) + Grit-S (S9) | Can they bounce back AND sustain effort? Both needed. |
| Emotional Maturity | GAD-7 (S4) + RAS (S8) + BRS (S12) | Anxiety levels, relational health, and resilience together reveal emotional maturity |
| Critical Thinking + Spiritual Depth | CTDA (S15) + DSES (S5) + SWBS (S3) | Can they think critically while maintaining deep faith? |
| Career Readiness Full Picture | CDSE-SF (S13) + ESE (S10) + Grit-S (S9) + AGQ-R (S2) | Career confidence + entrepreneurial skills + follow-through + goal orientation |

---

# Appendix B: Assessment Administration Calendar

For bi-weekly sessions, here is the assessment delivery timeline:

| Week | Session | Assessment Sent | Assessment Due | Session Date |
|:---:|---|---|---|---|
| 0 | — | MLQ (Session 1 pre-assessment) | Week 1 | — |
| 1 | Session 1: See the Vision | — | — | Week 1 |
| 2 | — | AGQ-R (Session 2 pre-assessment) | Week 3 | — |
| 3 | Session 2: Goal Setting | — | — | Week 3 |
| 4 | — | SWBS (Session 3 pre-assessment) | Week 5 | — |
| 5 | Session 3: Trust in the Lord | — | — | Week 5 |
| ... | *Pattern continues...* | *Sent 1 week before each session* | *Due by session date* | *Every 2 weeks* |
| 31 | Session 16: Becoming an Influencer | — | — | Week 31 |
| 32 | — | Full battery re-assessment (selected instruments) | Week 33 | — |

**Post-curriculum re-assessment:** At program completion, re-administer MLQ, GAD-7, Grit-S, GSE, and SPCS to measure overall growth across vision, anxiety, perseverance, self-efficacy, and influence readiness.

---

# Appendix C: Platform Seed Data Format

Each assessment template should be seeded into Convex using this structure. Example for GAD-7:

```json
{
  "name": "GAD-7",
  "instrument": "Generalized Anxiety Disorder 7-Item Scale",
  "author": "Spitzer, Kroenke, Williams & Löwe, 2006",
  "description": "Screens for generalized anxiety severity over the past two weeks.",
  "pillar": "emotional",
  "totalItems": 7,
  "items": [
    { "number": 1, "text": "Feeling nervous, anxious, or on edge", "scaleMin": 0, "scaleMax": 3, "scaleMinLabel": "Not at all", "scaleMaxLabel": "Nearly every day", "isReversed": false, "subscale": null },
    { "number": 2, "text": "Not being able to stop or control worrying", "scaleMin": 0, "scaleMax": 3, "scaleMinLabel": "Not at all", "scaleMaxLabel": "Nearly every day", "isReversed": false, "subscale": null },
    { "number": 3, "text": "Worrying too much about different things", "scaleMin": 0, "scaleMax": 3, "scaleMinLabel": "Not at all", "scaleMaxLabel": "Nearly every day", "isReversed": false, "subscale": null },
    { "number": 4, "text": "Trouble relaxing", "scaleMin": 0, "scaleMax": 3, "scaleMinLabel": "Not at all", "scaleMaxLabel": "Nearly every day", "isReversed": false, "subscale": null },
    { "number": 5, "text": "Being so restless that it is hard to sit still", "scaleMin": 0, "scaleMax": 3, "scaleMinLabel": "Not at all", "scaleMaxLabel": "Nearly every day", "isReversed": false, "subscale": null },
    { "number": 6, "text": "Becoming easily annoyed or irritable", "scaleMin": 0, "scaleMax": 3, "scaleMinLabel": "Not at all", "scaleMaxLabel": "Nearly every day", "isReversed": false, "subscale": null },
    { "number": 7, "text": "Feeling afraid, as if something awful might happen", "scaleMin": 0, "scaleMax": 3, "scaleMinLabel": "Not at all", "scaleMaxLabel": "Nearly every day", "isReversed": false, "subscale": null }
  ],
  "subscales": null,
  "totalScoringMethod": "sum",
  "severityBands": [
    { "label": "Minimal anxiety", "min": 0, "max": 4, "color": "#2E7D32", "flagLevel": "none" },
    { "label": "Mild anxiety", "min": 5, "max": 9, "color": "#F9A825", "flagLevel": "none" },
    { "label": "Moderate anxiety", "min": 10, "max": 14, "color": "#E65100", "flagLevel": "mentor_notify" },
    { "label": "Severe anxiety", "min": 15, "max": 21, "color": "#C62828", "flagLevel": "admin_review" }
  ],
  "interpretationNotes": "The GAD-7 is a screening tool, not a diagnostic instrument. Scores ≥10 suggest clinically significant anxiety. The platform should never provide a diagnosis.",
  "isActive": true
}
```

Use this pattern to create seed data for all 16 instruments. The full item lists, subscale definitions, reverse-scoring flags, and severity bands are all specified in the session entries above.

---

*"Thou shalt raise up the foundations of many generations."* — Isaiah 58:12
