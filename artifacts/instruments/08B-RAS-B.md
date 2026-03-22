---
name: "Relationship Assessment Scale — Version B (Relational Readiness)"
shortCode: "RAS-B"
session: 8
pillar: "emotional_development"
author: "Adapted from Hendrick, 1988"
totalItems: 7
scoringMethod: "average"
hasSubscales: false
hasReversedItems: true
---

**Note:** Version B (Relational Readiness) is a custom adaptation created for TheOyinbooke Foundation. It is NOT part of the published Hendrick (1988) RAS. Items have been adapted to assess emotional readiness for relationships rather than current relationship satisfaction. This version has not been independently validated. Scoring follows the same methodology as Version A for consistency.

# RAS-B — Relationship Assessment Scale — Version B (Relational Readiness)

## Response Scale
Items rated on a 5-point scale:

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
| 1 | I have a clear understanding of what I need from a romantic partner. | null | No |
| 2 | In general, I feel emotionally prepared for a healthy relationship. | null | No |
| 3 | Compared to my peers, I believe I understand what makes relationships work. | null | No |
| 4 | I sometimes worry that I am not ready for a committed relationship. | null | Yes |
| 5 | My expectations for a future relationship are realistic and well-thought-out. | null | No |
| 6 | I feel confident in my ability to love and be loved. | null | No |
| 7 | I often feel anxious or confused about romantic relationships. | null | Yes |

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
| 1.0-1.9 | Very Low | mentor_notify | "Significant emotional unreadiness for relationships. This is worth exploring with your mentor." |
| 2.0-2.9 | Low | mentor_notify | "Some relational unreadiness. May benefit from deeper exploration in mentorship." |
| 3.0-3.9 | Moderate | none | "Adequate relational readiness with some growth areas. Session 8 content can strengthen foundations." |
| 4.0-5.0 | High | none | "Strong relational readiness. Healthy emotional posture toward future relationships." |

## Flag Thresholds
- Mean <= 2.0 → `mentor_notify` — significant emotional unreadiness warranting check-in
- No `admin_review` for Version B — unreadiness for relationships is not a crisis, but benefits from pastoral guidance

## Interpretation Notes
- This is Version B, for beneficiaries who are currently single. It assesses emotional readiness for relationships rather than current relationship quality.
- The platform should ask beneficiaries which version to take (A: in a relationship, B: single) before displaying items.
- Adapted from the original RAS to assess relational readiness and attachment awareness for single beneficiaries.

## Convex Seed Data (JSON)
```json
{
  "name": "Relationship Assessment Scale — Version B (Relational Readiness)",
  "shortCode": "RAS-B",
  "version": 1,
  "status": "published",
  "description": "Adapted version of the RAS that assesses emotional readiness for relationships rather than current relationship quality. For beneficiaries who are currently single.",
  "sourceCitation": "Adapted from Hendrick, S. S. (1988). A generic measure of relationship satisfaction. Journal of Marriage and the Family, 50, 93–98.",
  "adaptationNotes": "Custom adaptation of Hendrick (1988) RAS for single/not-in-relationship beneficiaries. Assesses relational readiness rather than relationship satisfaction. Not independently validated — interpret with caution.",
  "licenseNotes": "Version A items are from the published RAS (Hendrick, 1988). Version B items are custom adaptations created for educational use by TheOyinbooke Foundation.",
  "pillar": "emotional_development",
  "sessionNumber": 8,
  "items": [
    {
      "itemNumber": 1,
      "text": "I have a clear understanding of what I need from a romantic partner.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Somewhat", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very much", "value": 5 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "In general, I feel emotionally prepared for a healthy relationship.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Somewhat", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very much", "value": 5 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "Compared to my peers, I believe I understand what makes relationships work.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Somewhat", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very much", "value": 5 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "I sometimes worry that I am not ready for a committed relationship.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Never", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Sometimes", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very often", "value": 5 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "My expectations for a future relationship are realistic and well-thought-out.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Somewhat", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very much", "value": 5 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I feel confident in my ability to love and be loved.",
      "isReversed": false,
      "responseOptions": [
        { "label": "Not at all", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Somewhat", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very much", "value": 5 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I often feel anxious or confused about romantic relationships.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Never", "value": 1 },
        { "label": "2", "value": 2 },
        { "label": "Sometimes", "value": 3 },
        { "label": "4", "value": 4 },
        { "label": "Very often", "value": 5 }
      ]
    }
  ],
  "severityBands": [
    {
      "label": "Very Low",
      "min": 1,
      "max": 1,
      "flagBehavior": "mentor_notify"
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
