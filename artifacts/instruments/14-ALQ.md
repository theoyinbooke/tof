---
name: "Authentic Leadership Self-Assessment Questionnaire"
shortCode: "ALQ"
session: 14
pillar: "discipleship_leadership"
author: "Walumbwa, Avolio, Gardner, Wernsing & Peterson, 2008"
totalItems: 16
scoringMethod: "average"
hasSubscales: true
hasReversedItems: false
---

# ALQ — Authentic Leadership Self-Assessment Questionnaire

## Response Scale
| Value | Label |
|:---:|---|
| 0 | Not at all |
| 1 | Once in a while |
| 2 | Sometimes |
| 3 | Fairly often |
| 4 | Frequently, if not always |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | I can list my three greatest strengths. | Self-Awareness | No |
| 2 | I can list my three greatest weaknesses. | Self-Awareness | No |
| 3 | I seek feedback from others to improve how I interact with them. | Self-Awareness | No |
| 4 | I accept the feelings I have about myself. | Self-Awareness | No |
| 5 | I say exactly what I mean. | Relational Transparency | No |
| 6 | I admit my mistakes to others. | Relational Transparency | No |
| 7 | I openly share my feelings with others. | Relational Transparency | No |
| 8 | I let others know who I truly am as a person. | Relational Transparency | No |
| 9 | I tell the truth even when it is not easy. | Relational Transparency | No |
| 10 | I show consistency between my beliefs and actions. | Internalized Moral Perspective | No |
| 11 | I make decisions based on my core values. | Internalized Moral Perspective | No |
| 12 | I resist pressure to do things contrary to my beliefs. | Internalized Moral Perspective | No |
| 13 | I am guided by ethical principles in my decision-making. | Internalized Moral Perspective | No |
| 14 | I listen carefully to different viewpoints before reaching a conclusion. | Balanced Processing | No |
| 15 | I seek out information that challenges my own position. | Balanced Processing | No |
| 16 | I consider other people's perspectives before making decisions. | Balanced Processing | No |

## Subscales
| Subscale | Items | Scoring Method | Range |
|---|---|---|---|
| Self-Awareness (SA) | 1, 2, 3, 4 | average | 0-4 |
| Relational Transparency (RT) | 5, 6, 7, 8, 9 | average | 0-4 |
| Internalized Moral Perspective (IMP) | 10, 11, 12, 13 | average | 0-4 |
| Balanced Processing (BP) | 14, 15, 16 | average | 0-4 |

## Reverse Scoring
- No reverse-scored items.

## Total Score
- Method: Average of all 16 items
- Range: 0.00-4.00

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 3.0-4.0 | High | none | "You consistently lead from values with self-awareness and transparency." |
| 2.0-2.9 | Moderate | none | "You are developing authenticity. Some areas are strong; others need intentional growth." |
| 1.0-1.9 | Low | mentor_notify | "You have limited authentic leadership practices. Significant growth opportunity through this session." |
| 0-0.9 | Very Low | mentor_notify | "You rarely practice authentic leadership. Let's explore what leading from values looks like." |

## Flag Thresholds
- Overall < 1.5 -> `mentor_notify` -- low authentic leadership practices
- IMP < 1.0 -> `mentor_notify` -- very low moral grounding in leadership decisions

## Interpretation Notes
- Subscale insight: High IMP + Low RT = has values but doesn't share them openly (may be seen as guarded). Low SA + High RT = open but lacks self-understanding (transparent without being wise). Low BP = doesn't consider other viewpoints (risk of blind spots).
- Cross-references: Compare with SL-7 (Session 11) for servant leadership orientation and SPCS-R (Session 16) for influence readiness. The leadership arc should show servant orientation -> authentic practice -> influence readiness.
- Growth tracking: This is the second instrument in the leadership arc (SL-7 -> ALQ -> SPCS-R). Track progression across all three.

## Convex Seed Data (JSON)
```json
{
  "name": "Authentic Leadership Self-Assessment Questionnaire",
  "shortCode": "ALQ",
  "version": 1,
  "status": "published",
  "description": "Measures four components of authentic leadership as a self-assessment: self-awareness, relational transparency, internalized moral perspective, and balanced processing. Directly relevant to leading from values under pressure.",
  "sourceCitation": "Walumbwa, F. O., Avolio, B. J., Gardner, W. L., Wernsing, T. S., & Peterson, S. J. (2008). Authentic leadership: Development and validation of a theory-based measure. Journal of Management, 34(1), 89-126.",
  "adaptationNotes": "This is an educational self-assessment adaptation. It uses item content inspired by Northouse (2018) textbook exercises and Neider & Schriesheim (2011) ALI, scored using the Walumbwa et al. (2008) ALQ response scale (0-4 frequency) and four-factor model (Self-Awareness 4 items, Relational Transparency 5 items, Internalized Moral Perspective 4 items, Balanced Processing 3 items). Not a verbatim reproduction of the proprietary ALQ. Suitable for educational assessment, not clinical research.",
  "licenseNotes": "Educational adaptation based on published four-factor model constructs. Not a reproduction of the proprietary ALQ by Mind Garden Inc.",
  "pillar": "discipleship_leadership",
  "sessionNumber": 14,
  "items": [
    {
      "itemNumber": 1,
      "text": "I can list my three greatest strengths.",
      "subscale": "Self-Awareness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "I can list my three greatest weaknesses.",
      "subscale": "Self-Awareness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "I seek feedback from others to improve how I interact with them.",
      "subscale": "Self-Awareness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "I accept the feelings I have about myself.",
      "subscale": "Self-Awareness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I say exactly what I mean.",
      "subscale": "Relational Transparency",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I admit my mistakes to others.",
      "subscale": "Relational Transparency",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I openly share my feelings with others.",
      "subscale": "Relational Transparency",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "I let others know who I truly am as a person.",
      "subscale": "Relational Transparency",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "I tell the truth even when it is not easy.",
      "subscale": "Relational Transparency",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "I show consistency between my beliefs and actions.",
      "subscale": "Internalized Moral Perspective",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 11,
      "text": "I make decisions based on my core values.",
      "subscale": "Internalized Moral Perspective",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 12,
      "text": "I resist pressure to do things contrary to my beliefs.",
      "subscale": "Internalized Moral Perspective",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 13,
      "text": "I am guided by ethical principles in my decision-making.",
      "subscale": "Internalized Moral Perspective",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 14,
      "text": "I listen carefully to different viewpoints before reaching a conclusion.",
      "subscale": "Balanced Processing",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 15,
      "text": "I seek out information that challenges my own position.",
      "subscale": "Balanced Processing",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    },
    {
      "itemNumber": 16,
      "text": "I consider other people's perspectives before making decisions.",
      "subscale": "Balanced Processing",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 0 },
        { "label": "Once in a while", "value": 1 },
        { "label": "Sometimes", "value": 2 },
        { "label": "Fairly often", "value": 3 },
        { "label": "Frequently, if not always", "value": 4 }
      ]
    }
  ],
  "subscales": [
    { "name": "Self-Awareness", "itemNumbers": [1, 2, 3, 4] },
    { "name": "Relational Transparency", "itemNumbers": [5, 6, 7, 8, 9] },
    { "name": "Internalized Moral Perspective", "itemNumbers": [10, 11, 12, 13] },
    { "name": "Balanced Processing", "itemNumbers": [14, 15, 16] }
  ],
  "severityBands": [
    { "label": "Very Low", "min": 0, "max": 0.9, "flagBehavior": "mentor_notify" },
    { "label": "Low", "min": 1.0, "max": 1.9, "flagBehavior": "mentor_notify" },
    { "label": "Moderate", "min": 2.0, "max": 2.9, "flagBehavior": "none" },
    { "label": "High", "min": 3.0, "max": 4.0, "flagBehavior": "none" }
  ],
  "totalScoreRange": { "min": 0, "max": 4 }
}
```
