---
name: "Achievement Goal Questionnaire — Revised"
shortCode: "AGQ-R"
session: 2
pillar: "financial_career"
author: "Elliot & Murayama, 2008"
totalItems: 12
scoringMethod: "average"
hasSubscales: true
hasReversedItems: false
---

# AGQ-R — Achievement Goal Questionnaire — Revised

## Response Scale
| Value | Label |
|:---:|---|
| 1 | Not at all true of me |
| 2 | — |
| 3 | — |
| 4 | Somewhat true of me |
| 5 | — |
| 6 | — |
| 7 | Very true of me |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | My aim is to completely master the material presented in my studies. | Mastery-Approach | No |
| 2 | I am striving to do well compared to other students. | Performance-Approach | No |
| 3 | My goal is to learn as much as possible. | Mastery-Approach | No |
| 4 | My aim is to perform well relative to other students. | Performance-Approach | No |
| 5 | My aim is to avoid learning less than I possibly could. | Mastery-Avoidance | No |
| 6 | My goal is to avoid performing poorly compared to others. | Performance-Avoidance | No |
| 7 | I am striving to understand the content of my studies as thoroughly as possible. | Mastery-Approach | No |
| 8 | My goal is to perform better than the other students. | Performance-Approach | No |
| 9 | My aim is to avoid learning less than it is possible to learn. | Mastery-Avoidance | No |
| 10 | I am striving to avoid performing worse than others. | Performance-Avoidance | No |
| 11 | My goal is to avoid an incomplete understanding of the course material. | Mastery-Avoidance | No |
| 12 | I am striving to avoid doing worse than other students. | Performance-Avoidance | No |

## Subscales
| Subscale | Items | Scoring Method | Range |
|---|---|---|---|
| Mastery-Approach (MAp) | 1, 3, 7 | average | 1-7 |
| Performance-Approach (PAp) | 2, 4, 8 | average | 1-7 |
| Mastery-Avoidance (MAv) | 5, 9, 11 | average | 1-7 |
| Performance-Avoidance (PAv) | 6, 10, 12 | average | 1-7 |

## Reverse Scoring
- Items: None
- Method: N/A

## Total Score
- Method: No total score. The four subscales form a 2x2 matrix and are interpreted together.
- Range: N/A (each subscale ranges 1-7)

## Severity Bands
No single severity band — interpretation is by subscale profile:

| Subscale | High Score (>=5.0) | Low Score (<3.5) |
|---|---|---|
| Mastery-Approach | Ideal. Motivated by learning and growth. | May lack intrinsic motivation for learning. |
| Performance-Approach | Competitive. Wants to outperform peers. Not harmful but can be fragile. | Not driven by comparison. Healthy if MAp is high. |
| Mastery-Avoidance | Fears not learning enough. Anxious about missing out. | Relaxed about learning gaps. |
| Performance-Avoidance | Fears failure and looking bad. Avoids challenges. Needs attention. | Not paralyzed by fear of failure. Healthy. |

## Flag Thresholds
- PAv average >= 5.5 → `mentor_notify` — this person may avoid challenging goals out of fear
- MAp average < 3.0 AND PAv average >= 5.0 → `admin_review` — combined low motivation and high fear

## Interpretation Notes
- Ideal profile: High MAp, moderate-to-low PAv
- Concerning profile: Low MAp + High PAv — afraid of failure and not intrinsically motivated. Sessions 3 (Trust) and 4 (Anxiety) directly address this.
- The four subscales form a 2x2 achievement goal framework (approach vs. avoidance crossed with mastery vs. performance).

## Convex Seed Data (JSON)
```json
{
  "name": "Achievement Goal Questionnaire — Revised",
  "shortCode": "AGQ-R",
  "version": 1,
  "status": "published",
  "description": "Measures four types of goal orientation: mastery-approach, performance-approach, mastery-avoidance, and performance-avoidance. Identifies whether a beneficiary approaches goals for growth or avoids them out of fear of failure.",
  "sourceCitation": "Elliot, A. J., & Murayama, K. (2008). On the measurement of achievement goals: Critique, illustration, and application. Journal of Educational Psychology, 100(3), 613–628.",
  "pillar": "financial_career",
  "sessionNumber": 2,
  "items": [
    {
      "itemNumber": 1,
      "text": "My aim is to completely master the material presented in my studies.",
      "subscale": "Mastery-Approach",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "I am striving to do well compared to other students.",
      "subscale": "Performance-Approach",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "My goal is to learn as much as possible.",
      "subscale": "Mastery-Approach",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "My aim is to perform well relative to other students.",
      "subscale": "Performance-Approach",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "My aim is to avoid learning less than I possibly could.",
      "subscale": "Mastery-Avoidance",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "My goal is to avoid performing poorly compared to others.",
      "subscale": "Performance-Avoidance",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I am striving to understand the content of my studies as thoroughly as possible.",
      "subscale": "Mastery-Approach",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "My goal is to perform better than the other students.",
      "subscale": "Performance-Approach",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "My aim is to avoid learning less than it is possible to learn.",
      "subscale": "Mastery-Avoidance",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "I am striving to avoid performing worse than others.",
      "subscale": "Performance-Avoidance",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 11,
      "text": "My goal is to avoid an incomplete understanding of the course material.",
      "subscale": "Mastery-Avoidance",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    },
    {
      "itemNumber": 12,
      "text": "I am striving to avoid doing worse than other students.",
      "subscale": "Performance-Avoidance",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true of me", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "3", "value": 3 },
        { "label": "Somewhat true of me", "value": 4 },
        { "label": "5", "value": 5 },
        { "label": "6", "value": 6 },
        { "label": "Very true of me", "value": 7 }
      ]
    }
  ],
  "subscales": [
    {
      "name": "Mastery-Approach",
      "itemNumbers": [1, 3, 7]
    },
    {
      "name": "Performance-Approach",
      "itemNumbers": [2, 4, 8]
    },
    {
      "name": "Mastery-Avoidance",
      "itemNumbers": [5, 9, 11]
    },
    {
      "name": "Performance-Avoidance",
      "itemNumbers": [6, 10, 12]
    }
  ],
  "totalScoreRange": {
    "min": 1,
    "max": 7
  },
  "adaptationNotes": "Items 1 and 7 use 'my studies' in place of the original 'this class'/'this course' to better fit the Nigerian educational context where beneficiaries may not be in a single-class setting. All other items match the published Elliot & Murayama (2008) wording exactly."
}
```
