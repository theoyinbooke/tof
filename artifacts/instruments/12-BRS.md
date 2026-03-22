---
name: "Brief Resilience Scale"
shortCode: "BRS"
session: 12
pillar: "discipleship_leadership"
author: "Smith, Dalen, Wiggins, Steger & Tooley, 2008"
totalItems: 6
scoringMethod: "average"
hasSubscales: false
hasReversedItems: true
---

# BRS — Brief Resilience Scale

## Response Scale
| Value | Label |
|:---:|---|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Neutral |
| 4 | Agree |
| 5 | Strongly agree |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | I tend to bounce back quickly after hard times. | null | No |
| 2 | I have a hard time making it through stressful events. | null | Yes |
| 3 | It does not take me long to recover from a stressful event. | null | No |
| 4 | It is hard for me to snap back when something bad happens. | null | Yes |
| 5 | I usually come through difficult times with little trouble. | null | No |
| 6 | I tend to take a long time to get over set-backs in my life. | null | Yes |

## Subscales
No subscales. Single total score.

## Reverse Scoring
- Items: [2, 4, 6]
- Method: On 5-point scale: 1->5, 2->4, 3->3, 4->2, 5->1

## Total Score
- Method: Mean of all 6 items (after reversing items 2, 4, 6)
- Range: 1.00-5.00

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 4.31-5.00 | High resilience | none | "You bounce back quickly from adversity. You have a strong ability to recover and adapt." |
| 3.00-4.30 | Normal resilience | none | "You have typical resilience. You can recover from setbacks with reasonable time and support." |
| 1.00-2.99 | Low resilience | mentor_notify | "You may struggle to recover from adversity. The tools from this session can help build your resilience." |

## Flag Thresholds
- Mean < 2.5 -> `mentor_notify` -- low resilience; may need extra support during challenges
- Mean < 2.0 -> `admin_review` -- very low; consider whether counseling referral is appropriate

## Interpretation Notes
- Cross-reference with GAD-7 (Session 4): Low resilience + high anxiety is a particularly concerning combination.
- Cross-reference with Grit-S (Session 9): Low resilience + low perseverance suggests the beneficiary may be at risk of dropping out when challenges arise.
- Growth tracking: Re-administer at Session 16 (completion). Resilience should increase over the curriculum's second half as beneficiaries face and overcome real challenges.

## Convex Seed Data (JSON)
```json
{
  "name": "Brief Resilience Scale",
  "shortCode": "BRS",
  "version": 1,
  "status": "published",
  "description": "Measures the ability to bounce back from stress — the core of resilience. Only 6 items, making it efficient. Well-validated and widely used across cultures.",
  "sourceCitation": "Smith, B. W., Dalen, J., Wiggins, K., Steger, A., & Tooley, B. N. (2008). The Brief Resilience Scale: Assessing the ability to bounce back. International Journal of Behavioral Medicine, 15, 194-200.",
  "pillar": "discipleship_leadership",
  "sessionNumber": 12,
  "items": [
    {
      "itemNumber": 1,
      "text": "I tend to bounce back quickly after hard times.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neutral", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "I have a hard time making it through stressful events.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neutral", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "It does not take me long to recover from a stressful event.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neutral", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "It is hard for me to snap back when something bad happens.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neutral", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I usually come through difficult times with little trouble.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neutral", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I tend to take a long time to get over set-backs in my life.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neutral", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    }
  ],
  "severityBands": [
    { "label": "Low resilience", "min": 1.0, "max": 2.99, "flagBehavior": "mentor_notify" },
    { "label": "Normal resilience", "min": 3.0, "max": 4.3, "flagBehavior": "none" },
    { "label": "High resilience", "min": 4.31, "max": 5.0, "flagBehavior": "none" }
  ],
  "totalScoreRange": { "min": 1, "max": 5 }
}
```
