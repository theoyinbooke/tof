---
name: "Meaning in Life Questionnaire"
shortCode: "MLQ"
session: 1
pillar: "spiritual_development"
author: "Steger, Frazier, Oishi, & Kaler, 2006"
totalItems: 10
scoringMethod: "sum"
hasSubscales: true
hasReversedItems: true
---

# MLQ — Meaning in Life Questionnaire

## Response Scale
| Value | Label |
|:---:|---|
| 1 | Absolutely Untrue |
| 2 | Mostly Untrue |
| 3 | Somewhat Untrue |
| 4 | Can't Say True or False |
| 5 | Somewhat True |
| 6 | Mostly True |
| 7 | Absolutely True |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | I understand my life's meaning. | Presence | No |
| 2 | I am looking for something that makes my life feel meaningful. | Search | No |
| 3 | I am always looking to find my life's purpose. | Search | No |
| 4 | My life has a clear sense of purpose. | Presence | No |
| 5 | I have a good sense of what makes my life meaningful. | Presence | No |
| 6 | I have discovered a satisfying life purpose. | Presence | No |
| 7 | I am always searching for something that makes my life feel significant. | Search | No |
| 8 | I am seeking a purpose or mission for my life. | Search | No |
| 9 | My life has no clear purpose. | Presence | Yes |
| 10 | I am searching for meaning in my life. | Search | No |

## Subscales
| Subscale | Items | Scoring Method | Range |
|---|---|---|---|
| Presence of Meaning | 1, 4, 5, 6, 9(R) | sum | 5-35 |
| Search for Meaning | 2, 3, 7, 8, 10 | sum | 5-35 |

## Reverse Scoring
- Items: [9]
- Method: On 7-point scale: 1→7, 2→6, 3→5, 4→4, 5→3, 6→2, 7→1

## Total Score
- Method: No total score is computed. The two subscales are interpreted independently.
- Range: N/A (subscales each range 5-35)

## Severity Bands
No single severity band table — interpretation is based on the 2×2 matrix of Presence × Search scores:

| Presence Score | Search Score | Interpretation | Platform Display Text |
|:---:|:---:|---|---|
| 25-35 | 5-20 | Clear purpose, not actively searching. | "You have a strong sense of purpose and meaning in your life." |
| 25-35 | 21-35 | Has purpose but still exploring. Healthy. | "You have a sense of purpose and are continuing to explore what makes your life meaningful." |
| 5-24 | 25-35 | Actively searching but hasn't found clarity yet. | "You are actively searching for your life's purpose. This session is designed to help you find clarity." |
| 5-24 | 5-20 | Neither clear purpose nor actively seeking. | "You may be feeling uncertain about your direction. This is a starting point — let's explore this together." |

## Flag Thresholds
- Presence < 15 AND Search < 15 → `admin_review` — may indicate deeper disengagement requiring attention
- Presence < 15 AND Search >= 25 → `none` — this is expected for incoming beneficiaries; they are seeking

## Interpretation Notes
- No total score is computed. The two subscales form a 2×2 interpretation matrix.
- Growth tracking: Re-administer after Session 9 (midpoint) and Session 16 (completion). Presence should increase over the curriculum. Search may decrease (they found it) or remain high (continued healthy exploration).
- The MLQ is the anchor assessment — it maps directly to Session 1's goal of helping beneficiaries discern God's vision for their lives.

## Convex Seed Data (JSON)
```json
{
  "name": "Meaning in Life Questionnaire",
  "shortCode": "MLQ",
  "version": 1,
  "status": "published",
  "description": "Measures whether a person has clarity of purpose (Presence) and whether they are actively seeking it (Search). Maps directly to Session 1's goal of helping beneficiaries discern God's vision for their lives.",
  "sourceCitation": "Steger, M. F., Frazier, P., Oishi, S., & Kaler, M. (2006). The Meaning in Life Questionnaire: Assessing the presence of and search for meaning in life. Journal of Counseling Psychology, 53(1), 80–93.",
  "pillar": "spiritual_development",
  "sessionNumber": 1,
  "items": [
    {
      "itemNumber": 1,
      "text": "I understand my life's meaning.",
      "subscale": "Presence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "I am looking for something that makes my life feel meaningful.",
      "subscale": "Search",
      "isReversed": false,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "I am always looking to find my life's purpose.",
      "subscale": "Search",
      "isReversed": false,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "My life has a clear sense of purpose.",
      "subscale": "Presence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I have a good sense of what makes my life meaningful.",
      "subscale": "Presence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I have discovered a satisfying life purpose.",
      "subscale": "Presence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I am always searching for something that makes my life feel significant.",
      "subscale": "Search",
      "isReversed": false,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "I am seeking a purpose or mission for my life.",
      "subscale": "Search",
      "isReversed": false,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "My life has no clear purpose.",
      "subscale": "Presence",
      "isReversed": true,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "I am searching for meaning in my life.",
      "subscale": "Search",
      "isReversed": false,
      "responseOptions": [
        { "label": "Absolutely Untrue", "value": 1 },
        { "label": "Mostly Untrue", "value": 2 },
        { "label": "Somewhat Untrue", "value": 3 },
        { "label": "Can't Say True or False", "value": 4 },
        { "label": "Somewhat True", "value": 5 },
        { "label": "Mostly True", "value": 6 },
        { "label": "Absolutely True", "value": 7 }
      ]
    }
  ],
  "subscales": [
    {
      "name": "Presence",
      "itemNumbers": [1, 4, 5, 6, 9]
    },
    {
      "name": "Search",
      "itemNumbers": [2, 3, 7, 8, 10]
    }
  ],
  "severityBands": [
    {
      "label": "Low Presence + Low Search",
      "min": 0,
      "max": 14,
      "flagBehavior": "admin_review"
    }
  ],
  "totalScoreRange": {
    "min": 5,
    "max": 35
  }
}
```
