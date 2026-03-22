---
name: "Daily Spiritual Experience Scale"
shortCode: "DSES"
session: 5
pillar: "spiritual_development"
author: "Underwood & Teresi, 2002"
totalItems: 16
scoringMethod: "sum"
hasSubscales: false
hasReversedItems: true
---

# DSES — Daily Spiritual Experience Scale

## Response Scale
Items 1-15 rated on a 6-point frequency scale:

| Value | Label |
|:---:|---|
| 1 | Many times a day |
| 2 | Every day |
| 3 | Most days |
| 4 | Some days |
| 5 | Once in a while |
| 6 | Never or almost never |

Item 16 rated on a 4-point scale:

| Value | Label |
|:---:|---|
| 1 | Not close at all |
| 2 | Somewhat close |
| 3 | Very close |
| 4 | As close as possible |

## Items
| # | Item Text | Subscale | Reversed |
|:---:|---|---|:---:|
| 1 | I feel God's presence. | null | Yes |
| 2 | I experience a connection to all of life. | null | Yes |
| 3 | During worship or at other times when connecting with God, I feel joy which lifts me out of my daily concerns. | null | Yes |
| 4 | I find strength in my religion or spirituality. | null | Yes |
| 5 | I find comfort in my religion or spirituality. | null | Yes |
| 6 | I feel deep inner peace or harmony. | null | Yes |
| 7 | I ask for God's help in the midst of daily activities. | null | Yes |
| 8 | I feel guided by God in the midst of daily activities. | null | Yes |
| 9 | I feel God's love for me, directly. | null | Yes |
| 10 | I feel God's love for me, through others. | null | Yes |
| 11 | I am spiritually touched by the beauty of creation. | null | Yes |
| 12 | I feel thankful for my blessings. | null | Yes |
| 13 | I feel a selfless caring for others. | null | Yes |
| 14 | I accept others even when they do things I think are wrong. | null | Yes |
| 15 | I desire to be closer to God or in union with the divine. | null | Yes |
| 16 | In general, how close do you feel to God? | null | Yes |

## Subscales
None. Single total score (after reversal).

## Reverse Scoring
- Items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
- Method for items 1-15: On 6-point scale, subtract from 7: 1→6, 2→5, 3→4, 4→3, 5→2, 6→1
- Method for item 16: On 4-point scale, subtract from 5: 1→4, 2→3, 3→2, 4→1
- Platform uses reversed scoring (higher = better) for consistency with all other instruments and for intuitive display on growth charts.

## Total Score
- Method: Sum of all 16 reversed items
- Range: 16-94

## Severity Bands
| Range | Label | Flag | Platform Display Text |
|:---:|---|---|---|
| 75-94 | Very frequent | none | "Rich, active spiritual life. Experiences God's presence, love, and guidance daily." |
| 55-74 | Frequent | none | "Regular spiritual experiences. Solid foundation with room for deeper practices." |
| 35-54 | Occasional | none | "Some spiritual awareness but not a daily practice. Session 5's disciplines can transform this." |
| 16-34 | Infrequent | mentor_notify | "Rarely experiences spiritual connection in daily life. This session is critical for building foundational disciplines." |

## Flag Thresholds
- Score < 30 (reversed) → `mentor_notify` — very low daily spiritual engagement
- No `admin_review` flag — spiritual dryness is not a crisis, but it does need pastoral attention

## Interpretation Notes
- For items 1-15, LOWER original scores = MORE FREQUENT spiritual experiences. Reversal makes higher = better for intuitive platform display.
- Item 16 uses a different response scale (4-point closeness scale) and is reversed separately.
- Ideal pre/post instrument for Session 5. Re-administer at Session 9 and Session 16 to track whether spiritual disciplines are taking root in daily life.
- Unlike the SWBS which measures overall spiritual well-being, the DSES captures the day-to-day spiritual life that fasting and prayer aim to deepen.

## Convex Seed Data (JSON)
```json
{
  "name": "Daily Spiritual Experience Scale",
  "shortCode": "DSES",
  "version": 1,
  "status": "published",
  "description": "Measures the frequency of ordinary spiritual experiences — closeness to God, gratitude, compassion, awareness of divine presence. Captures the day-to-day spiritual life that fasting and prayer aim to deepen.",
  "sourceCitation": "Underwood, L. G., & Teresi, J. A. (2002). The Daily Spiritual Experience Scale: Development, theoretical description, reliability, exploratory factor analysis, and preliminary construct validity using health-related data. Annals of Behavioral Medicine, 24(1), 22–33.",
  "pillar": "spiritual_development",
  "sessionNumber": 5,
  "items": [
    {
      "itemNumber": 1,
      "text": "I feel God's presence.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 2,
      "text": "I experience a connection to all of life.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 3,
      "text": "During worship or at other times when connecting with God, I feel joy which lifts me out of my daily concerns.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 4,
      "text": "I find strength in my religion or spirituality.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 5,
      "text": "I find comfort in my religion or spirituality.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 6,
      "text": "I feel deep inner peace or harmony.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 7,
      "text": "I ask for God's help in the midst of daily activities.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 8,
      "text": "I feel guided by God in the midst of daily activities.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 9,
      "text": "I feel God's love for me, directly.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 10,
      "text": "I feel God's love for me, through others.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 11,
      "text": "I am spiritually touched by the beauty of creation.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 12,
      "text": "I feel thankful for my blessings.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 13,
      "text": "I feel a selfless caring for others.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 14,
      "text": "I accept others even when they do things I think are wrong.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 15,
      "text": "I desire to be closer to God or in union with the divine.",
      "isReversed": true,
      "responseOptions": [
        { "label": "Many times a day", "value": 1 },
        { "label": "Every day", "value": 2 },
        { "label": "Most days", "value": 3 },
        { "label": "Some days", "value": 4 },
        { "label": "Once in a while", "value": 5 },
        { "label": "Never or almost never", "value": 6 }
      ]
    },
    {
      "itemNumber": 16,
      "text": "In general, how close do you feel to God?",
      "isReversed": true,
      "responseOptions": [
        { "label": "Not close at all", "value": 1 },
        { "label": "Somewhat close", "value": 2 },
        { "label": "Very close", "value": 3 },
        { "label": "As close as possible", "value": 4 }
      ]
    }
  ],
  "severityBands": [
    {
      "label": "Infrequent",
      "min": 16,
      "max": 34,
      "flagBehavior": "mentor_notify"
    },
    {
      "label": "Occasional",
      "min": 35,
      "max": 54,
      "flagBehavior": "none"
    },
    {
      "label": "Frequent",
      "min": 55,
      "max": 74,
      "flagBehavior": "none"
    },
    {
      "label": "Very frequent",
      "min": 75,
      "max": 94,
      "flagBehavior": "none"
    }
  ],
  "totalScoreRange": {
    "min": 16,
    "max": 94
  }
}
```
