---
name: "Short Grit Scale (Grit-S)"
shortCode: "GRIT-S"
session: 9
pillar: "spiritual_development"
author: "Duckworth & Quinn, 2009"
totalItems: 8
scoringMethod: "average"
hasSubscales: true
hasReversedItems: true
---

# GRIT-S — Short Grit Scale

## Response Scale
| Value | Label |
|:---:|---|
| 1 | Not at all like me |
| 2 | Not much like me |
| 3 | Somewhat like me |
| 4 | Mostly like me |
| 5 | Very much like me |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | New ideas and projects sometimes distract me from previous ones. | Consistency of Interest | Yes |
| 2 | Setbacks don't discourage me. | Perseverance of Effort | No |
| 3 | I have been obsessed with a certain idea or project for a short time but later lost interest. | Consistency of Interest | Yes |
| 4 | I am a hard worker. | Perseverance of Effort | No |
| 5 | I often set a goal but later choose to pursue a different one. | Consistency of Interest | Yes |
| 6 | I have difficulty maintaining my focus on projects that take more than a few months to complete. | Consistency of Interest | Yes |
| 7 | I finish whatever I begin. | Perseverance of Effort | No |
| 8 | I am diligent. | Perseverance of Effort | No |

## Subscales
| Subscale | Items | Scoring Method | Range |
|---|---|---|---|
| Consistency of Interest (CI) | 1(R), 3(R), 5(R), 6(R) | average | 1-5 |
| Perseverance of Effort (PE) | 2, 4, 7, 8 | average | 1-5 |

## Reverse Scoring
- Items: [1, 3, 5, 6]
- Method: On 5-point scale: 1->5, 2->4, 3->3, 4->2, 5->1

## Total Score
- Method: Average of all 8 items (after reversing items 1, 3, 5, 6)
- Range: 1.00-5.00

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 4.1-5.0 | Very gritty | none | "You show strong follow-through and sustained interest. You act on what you learn." |
| 3.5-4.0 | Gritty | none | "You have above-average perseverance. Solid foundation for continued growth." |
| 3.0-3.4 | Moderate | none | "You have average grit. Accountability structures can help you maintain momentum." |
| 2.0-2.9 | Below average | mentor_notify | "You may struggle with follow-through. The accountability structures from this session can help." |
| 1.0-1.9 | Low grit | admin_review | "You may find it difficult to maintain effort and interest. Let's build achievable goals together." |

## Flag Thresholds
- Overall Grit < 2.5 -> `mentor_notify` -- low follow-through, needs accountability support
- PE < 2.0 -> `admin_review` -- very low effort persistence, may indicate disengagement or burnout

## Interpretation Notes
- Subscale insight: High PE + Low CI = works hard but keeps changing direction (reconnect to Session 1 vision). Low PE + High CI = knows what they want but doesn't put in the work ("hearer not doer" from James). Low PE + Low CI = most concerning pattern.
- Growth tracking: Re-administer at Session 16 (completion). Compare with BRS (Session 12) for resilience + grit profile.
- Cross-references: Compare with MLQ (Session 1) for vision + purpose alignment. Low grit + low resilience (BRS) suggests risk of dropping out when challenges arise.

## Convex Seed Data (JSON)
```json
{
  "name": "Short Grit Scale (Grit-S)",
  "shortCode": "GRIT-S",
  "version": 1,
  "status": "published",
  "description": "Measures perseverance of effort and consistency of interest — the psychological measure of being a 'doer.' Directly captures whether someone follows through on commitments and sticks with what they start.",
  "sourceCitation": "Duckworth, A. L., & Quinn, P. D. (2009). Development and validation of the Short Grit Scale (Grit-S). Journal of Personality Assessment, 91(2), 166-174.",
  "pillar": "spiritual_development",
  "sessionNumber": 9,
  "items": [
    {
      "itemNumber": 1,
      "text": "New ideas and projects sometimes distract me from previous ones.",
      "subscale": "Consistency of Interest",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all like me", "value": 1 },
        { "label": "Not much like me", "value": 2 },
        { "label": "Somewhat like me", "value": 3 },
        { "label": "Mostly like me", "value": 4 },
        { "label": "Very much like me", "value": 5 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "Setbacks don't discourage me.",
      "subscale": "Perseverance of Effort",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all like me", "value": 1 },
        { "label": "Not much like me", "value": 2 },
        { "label": "Somewhat like me", "value": 3 },
        { "label": "Mostly like me", "value": 4 },
        { "label": "Very much like me", "value": 5 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "I have been obsessed with a certain idea or project for a short time but later lost interest.",
      "subscale": "Consistency of Interest",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all like me", "value": 1 },
        { "label": "Not much like me", "value": 2 },
        { "label": "Somewhat like me", "value": 3 },
        { "label": "Mostly like me", "value": 4 },
        { "label": "Very much like me", "value": 5 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "I am a hard worker.",
      "subscale": "Perseverance of Effort",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all like me", "value": 1 },
        { "label": "Not much like me", "value": 2 },
        { "label": "Somewhat like me", "value": 3 },
        { "label": "Mostly like me", "value": 4 },
        { "label": "Very much like me", "value": 5 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I often set a goal but later choose to pursue a different one.",
      "subscale": "Consistency of Interest",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all like me", "value": 1 },
        { "label": "Not much like me", "value": 2 },
        { "label": "Somewhat like me", "value": 3 },
        { "label": "Mostly like me", "value": 4 },
        { "label": "Very much like me", "value": 5 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I have difficulty maintaining my focus on projects that take more than a few months to complete.",
      "subscale": "Consistency of Interest",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all like me", "value": 1 },
        { "label": "Not much like me", "value": 2 },
        { "label": "Somewhat like me", "value": 3 },
        { "label": "Mostly like me", "value": 4 },
        { "label": "Very much like me", "value": 5 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I finish whatever I begin.",
      "subscale": "Perseverance of Effort",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all like me", "value": 1 },
        { "label": "Not much like me", "value": 2 },
        { "label": "Somewhat like me", "value": 3 },
        { "label": "Mostly like me", "value": 4 },
        { "label": "Very much like me", "value": 5 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "I am diligent.",
      "subscale": "Perseverance of Effort",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all like me", "value": 1 },
        { "label": "Not much like me", "value": 2 },
        { "label": "Somewhat like me", "value": 3 },
        { "label": "Mostly like me", "value": 4 },
        { "label": "Very much like me", "value": 5 }
      ]
    }
  ],
  "subscales": [
    {
      "name": "Consistency of Interest",
      "itemNumbers": [1, 3, 5, 6]
    },
    {
      "name": "Perseverance of Effort",
      "itemNumbers": [2, 4, 7, 8]
    }
  ],
  "severityBands": [
    { "label": "Low grit", "min": 1.0, "max": 1.9, "flagBehavior": "admin_review" },
    { "label": "Below average", "min": 2.0, "max": 2.9, "flagBehavior": "mentor_notify" },
    { "label": "Moderate", "min": 3.0, "max": 3.4, "flagBehavior": "none" },
    { "label": "Gritty", "min": 3.5, "max": 4.0, "flagBehavior": "none" },
    { "label": "Very gritty", "min": 4.1, "max": 5.0, "flagBehavior": "none" }
  ],
  "totalScoreRange": { "min": 1, "max": 5 }
}
```
