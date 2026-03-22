---
name: "Entrepreneurial Self-Efficacy Scale"
shortCode: "ESE"
session: 10
pillar: "financial_career"
author: "Chen, Greene & Crick, 1998"
totalItems: 23
scoringMethod: "average"
hasSubscales: true
hasReversedItems: false
adaptationNotes: "Attribution corrected from De Noble, Jung & Ehrlich (1999) to Chen, Greene & Crick (1998). The 5-subscale structure (Marketing, Innovation, Management, Risk-Taking, Financial Control) with 23 items originates from Chen et al. (1998). De Noble et al. (1999) developed a separate ESE measure with 6 different subscales (new product/opportunity development, innovative environment, investor relations, purpose definition, unexpected challenges, human capital development)."
---

# ESE — Entrepreneurial Self-Efficacy Scale

## Response Scale
| Value | Label |
|:---:|---|
| 1 | Completely disagree |
| 2 | Somewhat disagree |
| 3 | Neither agree nor disagree |
| 4 | Somewhat agree |
| 5 | Completely agree |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | I can identify the need for a new product or service. | Marketing | No |
| 2 | I can design a product or service that will satisfy customer needs. | Marketing | No |
| 3 | I can determine a competitive price for a new product or service. | Marketing | No |
| 4 | I can identify a target market for a new product or service. | Marketing | No |
| 5 | I can develop and use contacts and connections to get sales. | Marketing | No |
| 6 | I can generate a new idea for a product or service. | Innovation | No |
| 7 | I can identify new areas for potential growth. | Innovation | No |
| 8 | I can design a new product or service. | Innovation | No |
| 9 | I can create a new venture from an innovative idea. | Innovation | No |
| 10 | I can discover new ways to improve existing products or services. | Innovation | No |
| 11 | I can brainstorm new ways to do things better. | Innovation | No |
| 12 | I can make new approaches work when others have failed. | Innovation | No |
| 13 | I can supervise employees or team members effectively. | Management | No |
| 14 | I can organize and maintain the financial records of a venture. | Management | No |
| 15 | I can manage the day-to-day operations of a business. | Management | No |
| 16 | I can read and interpret financial statements. | Management | No |
| 17 | I can take calculated risks with uncertain outcomes. | Risk-Taking | No |
| 18 | I can make decisions under conditions of uncertainty. | Risk-Taking | No |
| 19 | I can take responsibility for my own business decisions. | Risk-Taking | No |
| 20 | I can commit significant resources to pursue an opportunity. | Risk-Taking | No |
| 21 | I can manage my personal finances to support business needs. | Financial Control | No |
| 22 | I can secure the financial resources needed to start a venture. | Financial Control | No |
| 23 | I can maintain financial control of a business. | Financial Control | No |

## Subscales
| Subscale | Items | Scoring Method | Range |
|---|---|---|---|
| Marketing | 1, 2, 3, 4, 5 | average | 1-5 |
| Innovation | 6, 7, 8, 9, 10, 11, 12 | average | 1-5 |
| Management | 13, 14, 15, 16 | average | 1-5 |
| Risk-Taking | 17, 18, 19, 20 | average | 1-5 |
| Financial Control | 21, 22, 23 | average | 1-5 |

## Reverse Scoring
- No reverse-scored items.

## Total Score
- Method: Average of all 23 items
- Range: 1.00-5.00

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 4.0-5.0 | High | none | "You show strong confidence in your entrepreneurial abilities." |
| 3.0-3.9 | Moderate | none | "You have reasonable entrepreneurial confidence. Practice and experience will grow this further." |
| 2.0-2.9 | Low | mentor_notify | "You have limited confidence in some entrepreneurial areas. Targeted development will help." |
| 1.0-1.9 | Very Low | mentor_notify | "You have significant doubt about entrepreneurial activities. Foundational training may help before entrepreneurial engagement." |

## Flag Thresholds
- Overall ESE < 2.0 -> `mentor_notify` -- very low entrepreneurial confidence across the board
- No `admin_review` -- low entrepreneurial self-efficacy is normal for many students and addressed by the session content

## Interpretation Notes
- Cross-references: Low Risk-Taking + High GAD-7 (Session 4) suggests anxiety is driving avoidance of entrepreneurial risk; connect to Session 3 trust work. Low Financial Control + Low FSES (Session 7) indicates financial confidence gap persists. Low Innovation + Low GSE (Session 6) indicates broader self-efficacy issue, not just entrepreneurial.
- Growth tracking: Re-administer after Session 13 (career readiness) to see if entrepreneurial confidence has grown alongside career preparation.

## References
- **Primary:** Chen, C. C., Greene, P. G., & Crick, A. (1998). Does entrepreneurial self-efficacy distinguish entrepreneurs from managers? *Journal of Business Venturing*, 13(4), 295-316.
- **Secondary:** De Noble, A. F., Jung, D., & Ehrlich, S. B. (1999). Entrepreneurial self-efficacy: The development of a measure and its relationship to entrepreneurial action. *Frontiers of Entrepreneurship Research*, Babson College. *(Note: De Noble et al. developed a separate 6-subscale ESE measure; the 5-subscale structure used here is from Chen et al., 1998.)*

## Convex Seed Data (JSON)
```json
{
  "name": "Entrepreneurial Self-Efficacy Scale",
  "shortCode": "ESE",
  "version": 1,
  "status": "published",
  "description": "Measures self-efficacy across five specific entrepreneurial competencies: marketing, innovation, management, risk-taking, and financial control. Reveals exactly which areas of entrepreneurship a beneficiary feels confident in and which need development.",
  "sourceCitation": "Chen, C. C., Greene, P. G., & Crick, A. (1998). Does entrepreneurial self-efficacy distinguish entrepreneurs from managers? Journal of Business Venturing, 13(4), 295-316.",
  "adaptationNotes": "Attribution corrected from De Noble, Jung & Ehrlich (1999) to Chen, Greene & Crick (1998). The 5-subscale structure (Marketing, Innovation, Management, Risk-Taking, Financial Control) with 23 items originates from Chen et al. (1998). De Noble et al. (1999) developed a separate ESE measure with 6 different subscales.",
  "pillar": "financial_career",
  "sessionNumber": 10,
  "items": [
    {
      "itemNumber": 1,
      "text": "I can identify the need for a new product or service.",
      "subscale": "Marketing",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "I can design a product or service that will satisfy customer needs.",
      "subscale": "Marketing",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "I can determine a competitive price for a new product or service.",
      "subscale": "Marketing",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "I can identify a target market for a new product or service.",
      "subscale": "Marketing",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I can develop and use contacts and connections to get sales.",
      "subscale": "Marketing",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I can generate a new idea for a product or service.",
      "subscale": "Innovation",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I can identify new areas for potential growth.",
      "subscale": "Innovation",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "I can design a new product or service.",
      "subscale": "Innovation",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "I can create a new venture from an innovative idea.",
      "subscale": "Innovation",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "I can discover new ways to improve existing products or services.",
      "subscale": "Innovation",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 11,
      "text": "I can brainstorm new ways to do things better.",
      "subscale": "Innovation",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 12,
      "text": "I can make new approaches work when others have failed.",
      "subscale": "Innovation",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 13,
      "text": "I can supervise employees or team members effectively.",
      "subscale": "Management",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 14,
      "text": "I can organize and maintain the financial records of a venture.",
      "subscale": "Management",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 15,
      "text": "I can manage the day-to-day operations of a business.",
      "subscale": "Management",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 16,
      "text": "I can read and interpret financial statements.",
      "subscale": "Management",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 17,
      "text": "I can take calculated risks with uncertain outcomes.",
      "subscale": "Risk-Taking",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 18,
      "text": "I can make decisions under conditions of uncertainty.",
      "subscale": "Risk-Taking",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 19,
      "text": "I can take responsibility for my own business decisions.",
      "subscale": "Risk-Taking",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 20,
      "text": "I can commit significant resources to pursue an opportunity.",
      "subscale": "Risk-Taking",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 21,
      "text": "I can manage my personal finances to support business needs.",
      "subscale": "Financial Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 22,
      "text": "I can secure the financial resources needed to start a venture.",
      "subscale": "Financial Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    },
    {
      "itemNumber": 23,
      "text": "I can maintain financial control of a business.",
      "subscale": "Financial Control",
      "isReversed": false,
      "responseOptions": [
        { "label": "Completely disagree", "value": 1 },
        { "label": "Somewhat disagree", "value": 2 },
        { "label": "Neither agree nor disagree", "value": 3 },
        { "label": "Somewhat agree", "value": 4 },
        { "label": "Completely agree", "value": 5 }
      ]
    }
  ],
  "subscales": [
    { "name": "Marketing", "itemNumbers": [1, 2, 3, 4, 5] },
    { "name": "Innovation", "itemNumbers": [6, 7, 8, 9, 10, 11, 12] },
    { "name": "Management", "itemNumbers": [13, 14, 15, 16] },
    { "name": "Risk-Taking", "itemNumbers": [17, 18, 19, 20] },
    { "name": "Financial Control", "itemNumbers": [21, 22, 23] }
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
