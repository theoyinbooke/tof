---
name: "Relationship Assessment Scale — Version A (In Relationship)"
shortCode: "RAS-A"
session: 8
pillar: "emotional_development"
author: "Hendrick, 1988"
totalItems: 7
scoringMethod: "average"
hasSubscales: false
hasReversedItems: true
---

# RAS-A — Relationship Assessment Scale — Version A (In Relationship)

## Response Scale
Items rated on a 5-point scale with item-specific anchors:

| Value | General Label |
|:---:|---|
| 1 | Low (poorly / not much / never) |
| 2 | — |
| 3 | Average |
| 4 | — |
| 5 | High (extremely well / very much / very often) |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | How well does your partner meet your needs? | null | No |
| 2 | In general, how satisfied are you with your relationship? | null | No |
| 3 | How good is your relationship compared to most? | null | No |
| 4 | How often do you wish you hadn't gotten into this relationship? | null | Yes |
| 5 | To what extent has your relationship met your original expectations? | null | No |
| 6 | How much do you love your partner? | null | No |
| 7 | How many problems are there in your relationship? | null | Yes |

## Subscales
None. Single mean score.

## Reverse Scoring
- Items: [4, 7]
- Method: On 5-point scale: 1→5, 2→4, 3→3, 4→2, 5→1

## Total Score
- Method: Mean of all 7 items (after reversing items 4 and 7)
- Range: 1.00-5.00

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 1.0-1.9 | Very Low | admin_review | "Serious relational distress. We encourage you to speak with your mentor about what you are experiencing." |
| 2.0-2.9 | Low | mentor_notify | "Significant relational concerns. May benefit from deeper exploration in mentorship." |
| 3.0-3.9 | Moderate | none | "Adequate relationship satisfaction but with some concerns or growth areas. Session 8 content can strengthen foundations." |
| 4.0-5.0 | High | none | "Strong relationship satisfaction. Healthy emotional posture." |

## Flag Thresholds
- Mean <= 2.0 → `mentor_notify` — significant relational distress warranting check-in
- Mean <= 1.5 (Version A only) → `admin_review` — may indicate abusive or very harmful relationship dynamics

## Interpretation Notes
- This is Version A, for beneficiaries who are currently in a romantic relationship.
- The platform should ask beneficiaries which version to take (A: in a relationship, B: single) before displaying items.
- Brief, validated measure of relationship quality and satisfaction.

## Convex Seed Data (JSON)
```json
{
  "name": "Relationship Assessment Scale — Version A (In Relationship)",
  "shortCode": "RAS-A",
  "version": 1,
  "status": "published",
  "description": "Brief, validated measure of relationship quality and satisfaction. For beneficiaries currently in a romantic relationship.",
  "sourceCitation": "Hendrick, S. S. (1988). A generic measure of relationship satisfaction. Journal of Marriage and the Family, 50, 93–98.",
  "pillar": "emotional_development",
  "sessionNumber": 8,
  "items": [
    {
      "itemNumber": 1,
      "text": "How well does your partner meet your needs?",
      "isReversed": false,
      "responseOptions": [
        { "label": "Poorly", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Average", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Extremely well", "value": 5 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "In general, how satisfied are you with your relationship?",
      "isReversed": false,
      "responseOptions": [
        { "label": "Unsatisfied", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Average", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Extremely satisfied", "value": 5 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "How good is your relationship compared to most?",
      "isReversed": false,
      "responseOptions": [
        { "label": "Poor", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Average", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Excellent", "value": 5 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "How often do you wish you hadn't gotten into this relationship?",
      "isReversed": true,
      "responseOptions": [
        { "label": "Never", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Average", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very often", "value": 5 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "To what extent has your relationship met your original expectations?",
      "isReversed": false,
      "responseOptions": [
        { "label": "Hardly at all", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Average", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Completely", "value": 5 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "How much do you love your partner?",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not much", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Average", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very much", "value": 5 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "How many problems are there in your relationship?",
      "isReversed": true,
      "responseOptions": [
        { "label": "Very few", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Average", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very many", "value": 5 }
      ]
    }
  ],
  "severityBands": [
    {
      "label": "Very Low",
      "min": 1,
      "max": 1,
      "flagBehavior": "admin_review"
    },
    {
      "label": "Low",
      "min": 2,
      "max": 2,
      "flagBehavior": "mentor_notify"
    },
    {
      "label": "Moderate",
      "min": 3,
      "max": 3,
      "flagBehavior": "none"
    },
    {
      "label": "High",
      "min": 4,
      "max": 5,
      "flagBehavior": "none"
    }
  ],
  "totalScoreRange": {
    "min": 1,
    "max": 5
  }
}
```
