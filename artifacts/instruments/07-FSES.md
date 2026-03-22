---
name: "Financial Self-Efficacy Scale"
shortCode: "FSES"
session: 7
pillar: "financial_career"
author: "Lown, 2011"
totalItems: 6
scoringMethod: "sum"
hasSubscales: false
hasReversedItems: true
---

# FSES — Financial Self-Efficacy Scale

## Response Scale
| Value | Label |
|:---:|---|
| 1 | Not at all true |
| 2 | Hardly true |
| 3 | Moderately true |
| 4 | Exactly true |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | It is hard to stick to my spending plan when unexpected expenses arise. | null | Yes |
| 2 | It is challenging to make progress toward my financial goals. | null | Yes |
| 3 | When unexpected expenses occur, I usually have to use credit. | null | Yes |
| 4 | When faced with a financial challenge, I have a hard time figuring out a solution. | null | Yes |
| 5 | I lack confidence in my ability to manage my finances. | null | Yes |
| 6 | I worry about running out of money in retirement. | null | Yes |

## Subscales
None. Single total score.

## Reverse Scoring
- Items: [1, 2, 3, 4, 5, 6] (all items)
- Method: All items are negatively worded. On 4-point scale: 1→4, 2→3, 3→2, 4→1

## Total Score
- Method: Sum of all 6 reversed items. Higher = greater financial self-efficacy.
- Range: 6-24

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 6-12 | Low | mentor_notify | "Low financial confidence. Feels overwhelmed by money management. This session's practical budget workshop is essential." |
| 13-18 | Moderate | none | "Some financial confidence but uncertainty in certain areas. Session 7's practical tools will build this." |
| 19-24 | High | none | "Strong financial confidence. Believes they can manage money, handle surprises, and reach financial goals." |

## Flag Thresholds
- Score <= 9 → `mentor_notify` — very low financial confidence; may need one-on-one financial coaching
- No `admin_review` — financial anxiety is common and addressed by the session content

## Interpretation Notes
- Measures confidence in managing personal finances specifically — not general self-efficacy, but financial self-efficacy.
- Pre/post comparison directly shows whether Session 7's financial literacy content is building confidence.
- Growth tracking: Strong pre/post instrument. Re-administer after Session 10 (Entrepreneurship) to see if financial confidence extends to business contexts.

## Convex Seed Data (JSON)
```json
{
  "name": "Financial Self-Efficacy Scale",
  "shortCode": "FSES",
  "version": 1,
  "status": "published",
  "description": "Measures confidence in managing personal finances. Pre/post comparison directly shows whether Session 7's financial literacy content is building confidence.",
  "sourceCitation": "Lown, J. M. (2011). Development and validation of a financial self-efficacy scale. Journal of Financial Counseling and Planning, 22(2), 54–63.",
  "pillar": "financial_career",
  "sessionNumber": 7,
  "items": [
    {
      "itemNumber": 1,
      "text": "It is hard to stick to my spending plan when unexpected expenses arise.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "It is challenging to make progress toward my financial goals.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "When unexpected expenses occur, I usually have to use credit.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "When faced with a financial challenge, I have a hard time figuring out a solution.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I lack confidence in my ability to manage my finances.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I worry about running out of money in retirement.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    }
  ],
  "severityBands": [
    {
      "label": "Low",
      "min": 6,
      "max": 12,
      "flagBehavior": "mentor_notify"
    },
    {
      "label": "Moderate",
      "min": 13,
      "max": 18,
      "flagBehavior": "none"
    },
    {
      "label": "High",
      "min": 19,
      "max": 24,
      "flagBehavior": "none"
    }
  ],
  "totalScoreRange": {
    "min": 6,
    "max": 24
  }
}
```
