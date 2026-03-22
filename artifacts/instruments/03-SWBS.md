---
name: "Spiritual Well-Being Scale"
shortCode: "SWBS"
session: 3
pillar: "spiritual_development"
author: "Paloutzian & Ellison, 1982"
totalItems: 20
scoringMethod: "sum"
hasSubscales: true
hasReversedItems: true
---

# SWBS — Spiritual Well-Being Scale

## Response Scale
| Value | Label |
|:---:|---|
| 1 | Strongly Agree |
| 2 | Moderately Agree |
| 3 | Agree |
| 4 | Disagree |
| 5 | Moderately Disagree |
| 6 | Strongly Disagree |

Note: For positively worded items, scoring is reversed so that higher values = higher well-being. For negatively worded items, the same reversal applies. Net effect: after all transformations, every item is scored 1-6 where 6 = highest well-being.

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | I don't find much satisfaction in private prayer with God. | RWB | Yes |
| 2 | I don't know who I am, where I came from, or where I am going. | EWB | Yes |
| 3 | I believe that God loves me and cares about me. | RWB | No |
| 4 | I feel that life is a positive experience. | EWB | No |
| 5 | I believe that God is impersonal and not interested in my daily situations. | RWB | Yes |
| 6 | I feel unsettled about my future. | EWB | Yes |
| 7 | I have a personally meaningful relationship with God. | RWB | No |
| 8 | I feel very fulfilled and satisfied with life. | EWB | No |
| 9 | I don't get much personal strength and support from my God. | RWB | Yes |
| 10 | I feel a sense of well-being about the direction my life is headed in. | EWB | No |
| 11 | I believe that God is concerned about my problems. | RWB | No |
| 12 | I don't enjoy much about life. | EWB | Yes |
| 13 | I don't have a personally satisfying relationship with God. | RWB | Yes |
| 14 | I feel good about my future. | EWB | No |
| 15 | My relationship with God helps me not to feel lonely. | RWB | No |
| 16 | I feel that life is full of conflict and unhappiness. | EWB | Yes |
| 17 | I feel most fulfilled when I am in close communion with God. | RWB | No |
| 18 | Life doesn't have much meaning. | EWB | Yes |
| 19 | My relation with God contributes to my sense of well-being. | RWB | No |
| 20 | I believe there is some real purpose for my life. | EWB | No |

## Subscales
| Subscale | Items | Scoring Method | Range |
|---|---|---|---|
| Religious Well-Being (RWB) | 1(R), 3, 5(R), 7, 9(R), 11, 13(R), 15, 17, 19 | sum | 10-60 |
| Existential Well-Being (EWB) | 2(R), 4, 6(R), 8, 10, 12(R), 14, 16(R), 18(R), 20 | sum | 10-60 |
| Overall SWB | RWB + EWB | sum | 20-120 |

## Reverse Scoring
- Items: [1, 2, 5, 6, 9, 12, 13, 16, 18]
- Method: On 6-point scale: 1→6, 2→5, 3→4, 4→3, 5→2, 6→1
- Note: For positively worded items (3, 4, 7, 8, 10, 11, 14, 15, 17, 19, 20), the scale is also inverted so SA=6, SD=1. Net effect: all items scored 1-6 where 6 = highest well-being.

## Total Score
- Method: Sum of all 20 items (after all scoring transformations)
- Range: 20-120

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 20-40 | Low | admin_review | "Low spiritual well-being. May indicate spiritual disconnection, crisis, or unresolved questions about faith and purpose." |
| 41-70 | Moderate Low | none | "Some spiritual awareness but significant room for growth. Common for incoming beneficiaries." |
| 71-99 | Moderate High | none | "Healthy spiritual life with room for deeper intimacy with God." |
| 100-120 | High | none | "Strong spiritual well-being. Deep relationship with God and sense of life purpose." |

## Flag Thresholds
- Overall SWB < 40 → `admin_review` — very low spiritual well-being indicating possible crisis
- RWB < 20 → `mentor_notify` — very low connection with God

## Interpretation Notes
- Subscale interpretation:
  - High RWB + Low EWB: Strong relationship with God but struggling with life satisfaction — may need practical support (Sessions 6-7)
  - Low RWB + High EWB: Life feels okay but spiritual foundation is weak — core of Session 3's work
  - Low RWB + Low EWB: Both spiritual and existential struggles — needs comprehensive support
- The RWB subscale directly measures the quality of one's relationship with God — satisfaction, trust, and connection.
- The EWB subscale measures life purpose and satisfaction, complementing Session 1's MLQ.

## Convex Seed Data (JSON)
```json
{
  "name": "Spiritual Well-Being Scale",
  "shortCode": "SWBS",
  "version": 1,
  "status": "published",
  "description": "Measures spiritual well-being across two dimensions: Religious Well-Being (relationship with God) and Existential Well-Being (life purpose and satisfaction). Complements Session 1's MLQ.",
  "sourceCitation": "Ellison, C. W. (1983). Spiritual well-being: Conceptualization and measurement. Journal of Psychology and Theology, 11(4), 330–340. Paloutzian, R. F., & Ellison, C. W. (1982).",
  "pillar": "spiritual_development",
  "sessionNumber": 3,
  "items": [
    {
      "itemNumber": 1,
      "text": "I don't find much satisfaction in private prayer with God.",
      "subscale": "RWB",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "I don't know who I am, where I came from, or where I am going.",
      "subscale": "EWB",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "I believe that God loves me and cares about me.",
      "subscale": "RWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "I feel that life is a positive experience.",
      "subscale": "EWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I believe that God is impersonal and not interested in my daily situations.",
      "subscale": "RWB",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I feel unsettled about my future.",
      "subscale": "EWB",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I have a personally meaningful relationship with God.",
      "subscale": "RWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "I feel very fulfilled and satisfied with life.",
      "subscale": "EWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "I don't get much personal strength and support from my God.",
      "subscale": "RWB",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "I feel a sense of well-being about the direction my life is headed in.",
      "subscale": "EWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 11,
      "text": "I believe that God is concerned about my problems.",
      "subscale": "RWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 12,
      "text": "I don't enjoy much about life.",
      "subscale": "EWB",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 13,
      "text": "I don't have a personally satisfying relationship with God.",
      "subscale": "RWB",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 14,
      "text": "I feel good about my future.",
      "subscale": "EWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 15,
      "text": "My relationship with God helps me not to feel lonely.",
      "subscale": "RWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 16,
      "text": "I feel that life is full of conflict and unhappiness.",
      "subscale": "EWB",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 17,
      "text": "I feel most fulfilled when I am in close communion with God.",
      "subscale": "RWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 18,
      "text": "Life doesn't have much meaning.",
      "subscale": "EWB",
      "isReversed": true,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 19,
      "text": "My relation with God contributes to my sense of well-being.",
      "subscale": "RWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    },
    {
      "itemNumber": 20,
      "text": "I believe there is some real purpose for my life.",
      "subscale": "EWB",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly Agree", "value": 1 },
        { "label": "Moderately Agree", "value": 2 },
        { "label": "Agree", "value": 3 },
        { "label": "Disagree", "value": 4 },
        { "label": "Moderately Disagree", "value": 5 },
        { "label": "Strongly Disagree", "value": 6 }
      ]
    }
  ],
  "subscales": [
    {
      "name": "RWB",
      "itemNumbers": [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    },
    {
      "name": "EWB",
      "itemNumbers": [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
    }
  ],
  "severityBands": [
    {
      "label": "Low",
      "min": 20,
      "max": 40,
      "flagBehavior": "admin_review"
    },
    {
      "label": "Moderate Low",
      "min": 41,
      "max": 70,
      "flagBehavior": "none"
    },
    {
      "label": "Moderate High",
      "min": 71,
      "max": 99,
      "flagBehavior": "none"
    },
    {
      "label": "High",
      "min": 100,
      "max": 120,
      "flagBehavior": "none"
    }
  ],
  "totalScoreRange": {
    "min": 20,
    "max": 120
  }
}
```
