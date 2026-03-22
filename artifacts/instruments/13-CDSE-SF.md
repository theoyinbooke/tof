---
name: "Career Decision Self-Efficacy Scale — Short Form"
shortCode: "CDSE-SF"
session: 13
pillar: "financial_career"
author: "Betz, Klein & Taylor, 1996; revised Betz, Hammond & Multon, 2005"
totalItems: 25
scoringMethod: "sum"
hasSubscales: true
hasReversedItems: false
adaptationNotes: "Response scale updated from 0-4 to 1-5 to match the 2005 revision by Betz, Hammond & Multon. The original 1996 short form used a 10-point scale; the 2005 revision shortened it to a 5-level scale (1 = No confidence at all, 5 = Complete confidence). All score ranges, severity bands, and flag thresholds updated proportionally."
---

# CDSE-SF — Career Decision Self-Efficacy Scale Short Form

## Response Scale
| Value | Label |
|:---:|---|
| 1 | No confidence at all |
| 2 | Very little confidence |
| 3 | Moderate confidence |
| 4 | Much confidence |
| 5 | Complete confidence |

## Items

**Instructions:** "How much confidence do you have that you could accomplish each of the following tasks?"

| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | Accurately assess my abilities. | Self-Appraisal | No |
| 2 | Determine what my ideal job would be. | Self-Appraisal | No |
| 3 | Decide what I value most in an occupation. | Self-Appraisal | No |
| 4 | Identify some reasonable career alternatives if I was unable to get my first choice. | Self-Appraisal | No |
| 5 | Recognize the strengths and limitations of my qualifications. | Self-Appraisal | No |
| 6 | Find information about career fields that interest me. | Occupational Information | No |
| 7 | Identify employers and companies relevant to my career possibilities. | Occupational Information | No |
| 8 | Find out the employment trends for a career area over the next 10 years. | Occupational Information | No |
| 9 | Talk to someone already working in a field I am interested in. | Occupational Information | No |
| 10 | Find information about postgraduate training programs. | Occupational Information | No |
| 11 | Select one career from a list of potential careers I am considering. | Goal Selection | No |
| 12 | Determine the steps needed to successfully enter my chosen career. | Goal Selection | No |
| 13 | Choose a career that will fit my preferred lifestyle. | Goal Selection | No |
| 14 | Choose a career that will fit my interests. | Goal Selection | No |
| 15 | Select one occupation from a list of potential occupations. | Goal Selection | No |
| 16 | Make a plan of my goals for the next five years. | Planning | No |
| 17 | Determine the steps I need to take to successfully complete my chosen course of study. | Planning | No |
| 18 | Prepare a good resume. | Planning | No |
| 19 | Successfully manage the interview process. | Planning | No |
| 20 | Identify the right people to help me in my career development. | Planning | No |
| 21 | Change my career if I were not satisfied with my first choice. | Problem Solving | No |
| 22 | Persistently work at my career goal even when I get frustrated. | Problem Solving | No |
| 23 | Handle the pressure of making important career decisions. | Problem Solving | No |
| 24 | Overcome barriers that stand between me and my career goals. | Problem Solving | No |
| 25 | Navigate the job market successfully. | Problem Solving | No |

## Subscales
| Subscale | Items | Scoring Method | Range |
|---|---|---|---|
| Self-Appraisal | 1, 2, 3, 4, 5 | sum | 5-25 |
| Occupational Information | 6, 7, 8, 9, 10 | sum | 5-25 |
| Goal Selection | 11, 12, 13, 14, 15 | sum | 5-25 |
| Planning | 16, 17, 18, 19, 20 | sum | 5-25 |
| Problem Solving | 21, 22, 23, 24, 25 | sum | 5-25 |

## Reverse Scoring
- No reverse-scored items.

## Total Score
- Method: Sum of all 25 items
- Range: 25-125

## Severity Bands

### Per Subscale
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 21-25 | High | none | "You are strong in this career competency. Ready to act." |
| 15-20 | Moderate | none | "You have some confidence. Session 13's practical exercises will strengthen this." |
| 9-14 | Low | mentor_notify | "You have limited confidence in this area. Targeted work during the session will help." |
| 5-8 | Very Low | mentor_notify | "This is a significant gap. One-on-one career coaching is recommended." |

### Total Score
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 105-125 | High | none | "You are career-ready. You show confidence across all decision-making areas." |
| 80-104 | Moderate | none | "You are developing career readiness. This session addresses the gaps." |
| 50-79 | Low | mentor_notify | "You need significant career preparation. Let's work through this together." |
| 25-49 | Very Low | mentor_notify | "You may feel overwhelmed by career decisions. Intensive support is available." |

## Flag Thresholds
- Total < 55 -> `mentor_notify` -- very low career readiness; needs extra career coaching
- Any single subscale = 5-7 -> flag that specific area for the facilitator

## Interpretation Notes
- Cross-reference with Session 2 AGQ-R: High performance-avoidance + low CDSE Planning = afraid of career failure and doesn't have a plan. Connect to Session 3 trust work.
- Cross-reference with ESE (Session 10): Low CDSE + low ESE suggests broad confidence gap in career/entrepreneurship domains.
- Growth tracking: Compare with Grit-S (Session 9) for follow-through capacity alongside career confidence.

## Convex Seed Data (JSON)
```json
{
  "name": "Career Decision Self-Efficacy Scale - Short Form",
  "shortCode": "CDSE-SF",
  "version": 1,
  "status": "published",
  "description": "Measures confidence across five specific career decision-making tasks: self-appraisal, occupational information, goal selection, planning, and problem solving. Pinpoints exactly where a beneficiary needs career preparation help.",
  "sourceCitation": "Betz, N. E., Klein, K. L., & Taylor, K. M. (1996). Evaluation of a short form of the Career Decision-Making Self-Efficacy Scale. Journal of Career Assessment, 4(1), 47-57. Revised: Betz, N. E., Hammond, M. S., & Multon, K. D. (2005). Reliability and validity of five-level response continua for the Career Decision Self-Efficacy Scale. Journal of Career Assessment, 13(2), 131-149.",
  "adaptationNotes": "Response scale updated from 0-4 to 1-5 to align with the 2005 Betz, Hammond & Multon revision. Score ranges adjusted proportionally: total 25-125, subscales 5-25. Severity bands and flag thresholds recalculated accordingly.",
  "pillar": "financial_career",
  "sessionNumber": 13,
  "items": [
    {
      "itemNumber": 1,
      "text": "Accurately assess my abilities.",
      "subscale": "Self-Appraisal",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "Determine what my ideal job would be.",
      "subscale": "Self-Appraisal",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "Decide what I value most in an occupation.",
      "subscale": "Self-Appraisal",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "Identify some reasonable career alternatives if I was unable to get my first choice.",
      "subscale": "Self-Appraisal",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "Recognize the strengths and limitations of my qualifications.",
      "subscale": "Self-Appraisal",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "Find information about career fields that interest me.",
      "subscale": "Occupational Information",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "Identify employers and companies relevant to my career possibilities.",
      "subscale": "Occupational Information",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "Find out the employment trends for a career area over the next 10 years.",
      "subscale": "Occupational Information",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "Talk to someone already working in a field I am interested in.",
      "subscale": "Occupational Information",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "Find information about postgraduate training programs.",
      "subscale": "Occupational Information",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 11,
      "text": "Select one career from a list of potential careers I am considering.",
      "subscale": "Goal Selection",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 12,
      "text": "Determine the steps needed to successfully enter my chosen career.",
      "subscale": "Goal Selection",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 13,
      "text": "Choose a career that will fit my preferred lifestyle.",
      "subscale": "Goal Selection",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 14,
      "text": "Choose a career that will fit my interests.",
      "subscale": "Goal Selection",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 15,
      "text": "Select one occupation from a list of potential occupations.",
      "subscale": "Goal Selection",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 16,
      "text": "Make a plan of my goals for the next five years.",
      "subscale": "Planning",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 17,
      "text": "Determine the steps I need to take to successfully complete my chosen course of study.",
      "subscale": "Planning",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 18,
      "text": "Prepare a good resume.",
      "subscale": "Planning",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 19,
      "text": "Successfully manage the interview process.",
      "subscale": "Planning",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 20,
      "text": "Identify the right people to help me in my career development.",
      "subscale": "Planning",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 21,
      "text": "Change my career if I were not satisfied with my first choice.",
      "subscale": "Problem Solving",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 22,
      "text": "Persistently work at my career goal even when I get frustrated.",
      "subscale": "Problem Solving",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 23,
      "text": "Handle the pressure of making important career decisions.",
      "subscale": "Problem Solving",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 24,
      "text": "Overcome barriers that stand between me and my career goals.",
      "subscale": "Problem Solving",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    },
    {
      "itemNumber": 25,
      "text": "Navigate the job market successfully.",
      "subscale": "Problem Solving",
      "isReversed": false,
      "responseOptions": [
        { "label": "No confidence at all", "value": 1 },
        { "label": "Very little confidence", "value": 2 },
        { "label": "Moderate confidence", "value": 3 },
        { "label": "Much confidence", "value": 4 },
        { "label": "Complete confidence", "value": 5 }
      ]
    }
  ],
  "subscales": [
    { "name": "Self-Appraisal", "itemNumbers": [1, 2, 3, 4, 5] },
    { "name": "Occupational Information", "itemNumbers": [6, 7, 8, 9, 10] },
    { "name": "Goal Selection", "itemNumbers": [11, 12, 13, 14, 15] },
    { "name": "Planning", "itemNumbers": [16, 17, 18, 19, 20] },
    { "name": "Problem Solving", "itemNumbers": [21, 22, 23, 24, 25] }
  ],
  "severityBands": [
    { "label": "Very Low", "min": 25, "max": 49, "flagBehavior": "mentor_notify" },
    { "label": "Low", "min": 50, "max": 79, "flagBehavior": "mentor_notify" },
    { "label": "Moderate", "min": 80, "max": 104, "flagBehavior": "none" },
    { "label": "High", "min": 105, "max": 125, "flagBehavior": "none" }
  ],
  "totalScoreRange": { "min": 25, "max": 125 }
}
```
