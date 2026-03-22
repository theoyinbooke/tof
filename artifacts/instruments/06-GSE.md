---
name: "General Self-Efficacy Scale"
shortCode: "GSE"
session: 6
pillar: "financial_career"
author: "Schwarzer & Jerusalem, 1995"
totalItems: 10
scoringMethod: "sum"
hasSubscales: false
hasReversedItems: false
---

# GSE — General Self-Efficacy Scale

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
| 1 | I can always manage to solve difficult problems if I try hard enough. | null | No |
| 2 | If someone opposes me, I can find the means and ways to get what I want. | null | No |
| 3 | It is easy for me to stick to my aims and accomplish my goals. | null | No |
| 4 | I am confident that I could deal efficiently with unexpected events. | null | No |
| 5 | Thanks to my resourcefulness, I know how to handle unforeseen situations. | null | No |
| 6 | I can solve most problems if I invest the necessary effort. | null | No |
| 7 | I can remain calm when facing difficulties because I can rely on my coping abilities. | null | No |
| 8 | When I am confronted with a problem, I can usually find several solutions. | null | No |
| 9 | If I am in trouble, I can usually think of a solution. | null | No |
| 10 | I can usually handle whatever comes my way. | null | No |

## Subscales
None. Single total score.

## Reverse Scoring
- Items: None
- Method: N/A

## Total Score
- Method: Sum of all 10 items
- Range: 10-40

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 10-20 | Low | mentor_notify | "Low confidence in ability to manage challenges. May see assets but not believe they can use them. Needs significant support and small wins." |
| 21-30 | Moderate | none | "Reasonable self-belief but may hesitate under pressure. Needs encouragement to take first steps." |
| 31-40 | High | none | "Strong self-efficacy. Believes in their ability to handle challenges and create results. Ready to act on their assets." |

## Flag Thresholds
- Score <= 15 → `mentor_notify` — very low self-efficacy, may need extra encouragement and smaller initial goals
- Score <= 10 → `admin_review` — extremely low; may indicate deeper issues (depression, learned helplessness)

## Interpretation Notes
- Self-efficacy is the psychological engine of resourcefulness. A person can identify their assets (Session 6's content) but still not believe they can use them. The GSE reveals that gap.
- Cross-reference: Compare with Session 4 GAD-7 score. High anxiety + low self-efficacy is a particularly difficult combination that needs targeted mentorship.
- Available in 33 languages, including Yoruba and several other Nigerian languages.

## Convex Seed Data (JSON)
```json
{
  "name": "General Self-Efficacy Scale",
  "shortCode": "GSE",
  "version": 1,
  "status": "published",
  "description": "Measures general self-efficacy — the belief that you can handle challenges and produce results. Reveals whether beneficiaries believe they can use the assets they identify in Session 6.",
  "sourceCitation": "Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy Scale. In J. Weinman, S. Wright, & M. Johnston (Eds.), Measures in health psychology: A user's portfolio. Causal and control beliefs (pp. 35–37). Windsor, UK: NFER-NELSON.",
  "pillar": "financial_career",
  "sessionNumber": 6,
  "items": [
    {
      "itemNumber": 1,
      "text": "I can always manage to solve difficult problems if I try hard enough.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "If someone opposes me, I can find the means and ways to get what I want.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "It is easy for me to stick to my aims and accomplish my goals.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "I am confident that I could deal efficiently with unexpected events.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "Thanks to my resourcefulness, I know how to handle unforeseen situations.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I can solve most problems if I invest the necessary effort.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I can remain calm when facing difficulties because I can rely on my coping abilities.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "When I am confronted with a problem, I can usually find several solutions.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "If I am in trouble, I can usually think of a solution.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all true", "value": 1 },
        { "label": "Hardly true", "value": 2 },
        { "label": "Moderately true", "value": 3 },
        { "label": "Exactly true", "value": 4 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "I can usually handle whatever comes my way.",
      "isReversed": false,
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
      "min": 10,
      "max": 20,
      "flagBehavior": "mentor_notify"
    },
    {
      "label": "Moderate",
      "min": 21,
      "max": 30,
      "flagBehavior": "none"
    },
    {
      "label": "High",
      "min": 31,
      "max": 40,
      "flagBehavior": "none"
    }
  ],
  "totalScoreRange": {
    "min": 10,
    "max": 40
  }
}
```
