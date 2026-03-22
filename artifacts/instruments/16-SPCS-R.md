---
name: "Sociopolitical Control Scale — Revised"
shortCode: "SPCS-R"
session: 16
pillar: "discipleship_leadership"
author: "Peterson, Lowe, Aquilino & Schneider, 2006"
totalItems: 17
scoringMethod: "average"
hasSubscales: true
hasReversedItems: false
---

# SPCS-R — Sociopolitical Control Scale Revised

## Response Scale
| Value | Label |
|:---:|---|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Neither agree nor disagree |
| 4 | Agree |
| 5 | Strongly agree |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | I am often a leader in groups. | Leadership Competence | No |
| 2 | I would prefer to be a leader rather than a follower. | Leadership Competence | No |
| 3 | I can usually organize people to get things done. | Leadership Competence | No |
| 4 | Other people usually follow my ideas. | Leadership Competence | No |
| 5 | I find it very easy to talk in front of a group. | Leadership Competence | No |
| 6 | I like to work on solving community problems. | Leadership Competence | No |
| 7 | I enjoy being part of organizations that make a difference. | Leadership Competence | No |
| 8 | I like trying new and creative ways to influence others. | Leadership Competence | No |
| 9 | People like me can influence government decisions. | Policy Control | No |
| 10 | I believe that my community has influence over government decisions. | Policy Control | No |
| 11 | People like me have the ability to participate in community decision-making. | Policy Control | No |
| 12 | My opinion is important in my community. | Policy Control | No |
| 13 | People in my community can shape government policies if they organize together. | Policy Control | No |
| 14 | People like me can make an impact on issues that affect our community. | Policy Control | No |
| 15 | I believe that the voice of ordinary people matters in making change happen. | Policy Control | No |
| 16 | I can contribute to making my community a better place. | Policy Control | No |
| 17 | I believe that organized groups of ordinary people can make a real difference. | Policy Control | No |

## Subscales
| Subscale | Items | Scoring Method | Range |
|---|---|---|---|
| Leadership Competence (LC) | 1, 2, 3, 4, 5, 6, 7, 8 | average | 1-5 |
| Policy Control (PC) | 9, 10, 11, 12, 13, 14, 15, 16, 17 | average | 1-5 |

## Reverse Scoring
- No reverse-scored items.

## Total Score
- Method: Average of all 17 items
- Range: 1.00-5.00

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 4.0-5.0 | High | none | "You have strong confidence in leading and influencing. You are ready to use your platform for impact." |
| 3.0-3.9 | Moderate | none | "You have developing confidence. This session will build specific skills to convert this into action." |
| 2.0-2.9 | Low | mentor_notify | "You have limited belief in your ability to lead or influence. You may feel powerless or insignificant." |
| 1.0-1.9 | Very Low | mentor_notify | "You do not yet see yourself as a leader or influencer. You need encouragement and small wins to build confidence." |

## Flag Thresholds
- Overall < 2.5 -> `mentor_notify` -- doesn't see themselves as capable of influence; end-of-curriculum concern
- LC < 2.0 -> Note for facilitator -- this person may need encouragement to step into influence

## Interpretation Notes
- Subscale insight: High LC + Low PC = confident in leading people but doesn't believe the system can be changed (needs hope and examples). Low LC + High PC = believes change is possible but doesn't see themselves as the one to lead it (reconnect to Session 11 servant leadership and Session 14 authentic leadership). Both high = ready to influence (Session 16 gives practical tools). Both low = the curriculum should have moved these scores; if still low, review what happened across Sessions 1-15.
- Growth tracking: Compare with GSE (Session 6) for general self-efficacy and SL-7 (Session 11) for servant leadership. The arc should show growing self-belief and service orientation culminating in readiness to influence.
- This is the final instrument in the leadership arc: SL-7 (servant orientation) -> ALQ (authentic practice) -> SPCS-R (influence readiness).
- Post-curriculum re-assessment: SPCS-R is one of the five instruments re-administered at program completion to measure overall growth.

## Convex Seed Data (JSON)
```json
{
  "name": "Sociopolitical Control Scale - Revised",
  "shortCode": "SPCS-R",
  "version": 1,
  "status": "published",
  "description": "Measures both the confidence to lead (Leadership Competence) and the belief that you can influence systems and communities (Policy Control). Together these indicate readiness to be an influencer with substance, not just a content creator with followers.",
  "sourceCitation": "Peterson, N. A., Lowe, J. B., Aquilino, M. L., & Schneider, J. E. (2006). Linking social cohesion and gender to intrapersonal and interactional empowerment: Support and new implications for theory. American Journal of Community Psychology, 38(3-4), 287-297.",
  "pillar": "discipleship_leadership",
  "sessionNumber": 16,
  "items": [
    {
      "itemNumber": 1,
      "text": "I am often a leader in groups.",
      "subscale": "Leadership Competence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "I would prefer to be a leader rather than a follower.",
      "subscale": "Leadership Competence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "I can usually organize people to get things done.",
      "subscale": "Leadership Competence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "Other people usually follow my ideas.",
      "subscale": "Leadership Competence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I find it very easy to talk in front of a group.",
      "subscale": "Leadership Competence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I like to work on solving community problems.",
      "subscale": "Leadership Competence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I enjoy being part of organizations that make a difference.",
      "subscale": "Leadership Competence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "I like trying new and creative ways to influence others.",
      "subscale": "Leadership Competence",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "People like me can influence government decisions.",
      "subscale": "Policy Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "I believe that my community has influence over government decisions.",
      "subscale": "Policy Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 11,
      "text": "People like me have the ability to participate in community decision-making.",
      "subscale": "Policy Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 12,
      "text": "My opinion is important in my community.",
      "subscale": "Policy Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 13,
      "text": "People in my community can shape government policies if they organize together.",
      "subscale": "Policy Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 14,
      "text": "People like me can make an impact on issues that affect our community.",
      "subscale": "Policy Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 15,
      "text": "I believe that the voice of ordinary people matters in making change happen.",
      "subscale": "Policy Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 16,
      "text": "I can contribute to making my community a better place.",
      "subscale": "Policy Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 17,
      "text": "I believe that organized groups of ordinary people can make a real difference.",
      "subscale": "Policy Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Strongly disagree", "value": 1 },
        { "label": "Disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Agree", "value": 4 },
        { "label": "Strongly agree", "value": 5 }
      ]
    }
  ],
  "subscales": [
    { "name": "Leadership Competence", "itemNumbers": [1, 2, 3, 4, 5, 6, 7, 8] },
    { "name": "Policy Control", "itemNumbers": [9, 10, 11, 12, 13, 14, 15, 16, 17] }
  ],
  "severityBands": [
    { "label": "Very Low", "min": 1.0, "max": 1.9, "flagBehavior": "mentor_notify" },
    { "label": "Low", "min": 2.0, "max": 2.9, "flagBehavior": "mentor_notify" },
    { "label": "Moderate", "min": 3.0, "max": 3.9, "flagBehavior": "none" },
    { "label": "High", "min": 4.0, "max": 5.0, "flagBehavior": "none" }
  ],
  "totalScoreRange": { "min": 1, "max": 5 }
}
```
