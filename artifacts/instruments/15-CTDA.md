---
name: "Critical Thinking Disposition Assessment"
shortCode: "CTDA"
session: 15
pillar: "discipleship_leadership"
author: "Adapted from Facione, Facione & Sanchez, 1994 (APA Delphi Report constructs)"
totalItems: 20
scoringMethod: "average"
hasSubscales: true
hasReversedItems: false
---

# CTDA — Critical Thinking Disposition Assessment

## Response Scale
| Value | Label |
|:---:|---|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Slightly disagree |
| 4 | Slightly agree |
| 5 | Agree |
| 6 | Strongly agree |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | I am willing to change my mind when evidence suggests I should. | Open-Mindedness | No |
| 2 | I try to consider all sides of an issue before making a judgment. | Open-Mindedness | No |
| 3 | I respect the right of others to hold opinions different from mine. | Open-Mindedness | No |
| 4 | I find it easy to reconsider a position when presented with good arguments. | Open-Mindedness | No |
| 5 | I think through complex problems step by step. | Analyticity | No |
| 6 | I pay close attention to details when evaluating an argument. | Analyticity | No |
| 7 | I prefer situations where I need to use careful reasoning. | Analyticity | No |
| 8 | I enjoy solving problems that require deep analysis. | Analyticity | No |
| 9 | I approach problems in an orderly and organized way. | Systematicity | No |
| 10 | I follow a logical process when making important decisions. | Systematicity | No |
| 11 | I plan my approach before starting complex tasks. | Systematicity | No |
| 12 | I keep track of the steps I take when solving a problem. | Systematicity | No |
| 13 | I want to know the truth even when it is uncomfortable. | Truth-Seeking | No |
| 14 | I question information even when it comes from an authority figure. | Truth-Seeking | No |
| 15 | I am willing to investigate claims rather than accept them at face value. | Truth-Seeking | No |
| 16 | I prefer evidence over opinions when forming my views. | Truth-Seeking | No |
| 17 | I am curious about how things work. | Inquisitiveness | No |
| 18 | I enjoy learning new things even when they are not directly useful to me. | Inquisitiveness | No |
| 19 | I ask questions frequently to deepen my understanding. | Inquisitiveness | No |
| 20 | I actively seek out new knowledge and experiences. | Inquisitiveness | No |

## Subscales
| Subscale | Items | Scoring Method | Range |
|---|---|---|---|
| Open-Mindedness | 1, 2, 3, 4 | average | 1-6 |
| Analyticity | 5, 6, 7, 8 | average | 1-6 |
| Systematicity | 9, 10, 11, 12 | average | 1-6 |
| Truth-Seeking | 13, 14, 15, 16 | average | 1-6 |
| Inquisitiveness | 17, 18, 19, 20 | average | 1-6 |

## Reverse Scoring
- No reverse-scored items.

## Total Score
- Method: Average of all 20 items
- Range: 1.00-6.00

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 5.0-6.0 | Strong disposition | none | "You are naturally inclined to think critically. You will use AI tools wisely." |
| 4.0-4.9 | Moderate disposition | none | "You generally think critically but may have blind spots. This session will strengthen your approach." |
| 3.0-3.9 | Weak disposition | mentor_notify | "You have limited inclination toward critical thinking. You may be vulnerable to misinformation and AI over-reliance." |
| 1.0-2.9 | Very weak | admin_review | "You rarely engage in critical thinking. There is a high risk of accepting information uncritically." |

## Flag Thresholds
- Truth-Seeking < 3.0 -> `mentor_notify` -- vulnerable to misinformation; this person accepts information at face value
- Overall < 3.0 -> `admin_review` -- significant critical thinking gap

## Interpretation Notes
- Key subscale concern: Truth-Seeking < 3.0 is especially dangerous in the age of AI-generated content. Session 15 directly addresses this.
- Cross-references: Compare with DSES (Session 5) and SWBS (Session 3). The goal is to think critically while maintaining deep faith -- these should not be in opposition.
- Growth tracking: This instrument is especially relevant as AI becomes more prevalent. Re-administer at program completion to see if critical thinking disposition has strengthened.

## Convex Seed Data (JSON)
```json
{
  "name": "Critical Thinking Disposition Assessment",
  "shortCode": "CTDA",
  "version": 1,
  "status": "published",
  "description": "Measures disposition toward critical thinking — not just ability but inclination. Covers open-mindedness, analyticity, systematicity, truth-seeking, and inquisitiveness. Relevant because AI makes information access easy; the differentiator is whether someone is inclined to question, analyze, and verify.",
  "sourceCitation": "Adapted from Facione, P. A., Facione, N. C., & Sanchez, C. A. (1994). Critical thinking disposition as a measure of competent clinical judgment. Journal of Nursing Education, 33, 345-350. Based on APA Delphi Report (1990) constructs.",
  "pillar": "discipleship_leadership",
  "sessionNumber": 15,
  "items": [
    {
      "itemNumber": 1,
      "text": "I am willing to change my mind when evidence suggests I should.",
      "subscale": "Open-Mindedness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "I try to consider all sides of an issue before making a judgment.",
      "subscale": "Open-Mindedness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "I respect the right of others to hold opinions different from mine.",
      "subscale": "Open-Mindedness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "I find it easy to reconsider a position when presented with good arguments.",
      "subscale": "Open-Mindedness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I think through complex problems step by step.",
      "subscale": "Analyticity",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I pay close attention to details when evaluating an argument.",
      "subscale": "Analyticity",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I prefer situations where I need to use careful reasoning.",
      "subscale": "Analyticity",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "I enjoy solving problems that require deep analysis.",
      "subscale": "Analyticity",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "I approach problems in an orderly and organized way.",
      "subscale": "Systematicity",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "I follow a logical process when making important decisions.",
      "subscale": "Systematicity",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 11,
      "text": "I plan my approach before starting complex tasks.",
      "subscale": "Systematicity",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 12,
      "text": "I keep track of the steps I take when solving a problem.",
      "subscale": "Systematicity",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 13,
      "text": "I want to know the truth even when it is uncomfortable.",
      "subscale": "Truth-Seeking",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 14,
      "text": "I question information even when it comes from an authority figure.",
      "subscale": "Truth-Seeking",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 15,
      "text": "I am willing to investigate claims rather than accept them at face value.",
      "subscale": "Truth-Seeking",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 16,
      "text": "I prefer evidence over opinions when forming my views.",
      "subscale": "Truth-Seeking",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 17,
      "text": "I am curious about how things work.",
      "subscale": "Inquisitiveness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 18,
      "text": "I enjoy learning new things even when they are not directly useful to me.",
      "subscale": "Inquisitiveness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 19,
      "text": "I ask questions frequently to deepen my understanding.",
      "subscale": "Inquisitiveness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    },
    {
      "itemNumber": 20,
      "text": "I actively seek out new knowledge and experiences.",
      "subscale": "Inquisitiveness",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Slightly disagree", "value": 3 },
        { "label": "Slightly agree", "value": 4 },
        { "label": "Agree", "value": 5 },
        { "label": "Strongly agree", "value": 6 }
      ]
    }
  ],
  "subscales": [
    { "name": "Open-Mindedness", "itemNumbers": [1, 2, 3, 4] },
    { "name": "Analyticity", "itemNumbers": [5, 6, 7, 8] },
    { "name": "Systematicity", "itemNumbers": [9, 10, 11, 12] },
    { "name": "Truth-Seeking", "itemNumbers": [13, 14, 15, 16] },
    { "name": "Inquisitiveness", "itemNumbers": [17, 18, 19, 20] }
  ],
  "severityBands": [
    { "label": "Very weak", "min": 1.0, "max": 2.9, "flagBehavior": "admin_review" },
    { "label": "Weak disposition", "min": 3.0, "max": 3.9, "flagBehavior": "mentor_notify" },
    { "label": "Moderate disposition", "min": 4.0, "max": 4.9, "flagBehavior": "none" },
    { "label": "Strong disposition", "min": 5.0, "max": 6.0, "flagBehavior": "none" }
  ],
  "totalScoreRange": { "min": 1, "max": 6 }
}
```
