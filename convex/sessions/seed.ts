import { internalMutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const SESSIONS: Array<{
  sessionNumber: number;
  title: string;
  pillar: string;
  description: string;
  status: "draft";
}> = [
  {
    sessionNumber: 1,
    title: "See the Vision",
    pillar: "spiritual_development",
    description:
      "Discovering God's Purpose for Your Life. Scripture: Habakkuk 2:2\u20133; Proverbs 29:18. The anchor session \u2014 every subsequent session references the vision statement written here.",
    status: "draft",
  },
  {
    sessionNumber: 2,
    title: "Goal Setting",
    pillar: "financial_career",
    description:
      "Writing the Vision and Making It Plain. Scripture: Habakkuk 2:2; Proverbs 16:3; Philippians 3:14. Translates Session 1\u2019s vision statement into actionable SMART goals across all life areas.",
    status: "draft",
  },
  {
    sessionNumber: 3,
    title: "Trust in the Lord",
    pillar: "spiritual_development",
    description:
      "Building Deep Trust in God Through Uncertainty. Scripture: Proverbs 3:5\u20136; Isaiah 26:3\u20134; Psalm 37:5. Addresses the spiritual posture needed to hold vision and goals \u2014 open hands, trusting God for the outcome.",
    status: "draft",
  },
  {
    sessionNumber: 4,
    title: "Dealing with Anxiety",
    pillar: "emotional_development",
    description:
      "Managing Fear and Building Emotional Resilience. Scripture: Philippians 4:6\u20137; 1 Peter 5:7; Matthew 6:25\u201334. Provides practical tools alongside spiritual foundation for understanding and managing anxiety.",
    status: "draft",
  },
  {
    sessionNumber: 5,
    title: "Fasting and Prayer",
    pillar: "spiritual_development",
    description:
      "Deepening Intimacy with God Through Spiritual Disciplines. Scripture: Matthew 6:16\u201318; Isaiah 58:6\u201312; Joel 2:12. Deepens the spiritual engine through fasting and prayer, connecting to the foundation\u2019s Isaiah 58 mandate.",
    status: "draft",
  },
  {
    sessionNumber: 6,
    title: "A Jar of Oil (Start With What You Have)",
    pillar: "financial_career",
    description:
      "Resourcefulness and Asset Maximization. Scripture: 2 Kings 4:1\u20137; Matthew 25:14\u201330; Zechariah 4:10. Flips the scarcity narrative and challenges beneficiaries to see and use what they already have.",
    status: "draft",
  },
  {
    sessionNumber: 7,
    title: "Financial Management",
    pillar: "financial_career",
    description:
      "Stewardship, Budgeting, and Building Wealth. Scripture: Proverbs 21:5; Luke 14:28\u201330; Malachi 3:10. Teaches how to protect, grow, and steward resources wisely through hands-on budgeting and biblical financial principles.",
    status: "draft",
  },
  {
    sessionNumber: 8,
    title: "Am I in Love?",
    pillar: "emotional_development",
    description:
      "Biblical Wisdom for Relationships and Emotional Readiness. Scripture: 1 Corinthians 13:4\u20138; Ephesians 5:1\u20132; Song of Solomon 2:7. Provides a biblical framework for evaluating relationships, understanding love vs. infatuation, and developing healthy boundaries.",
    status: "draft",
  },
  {
    sessionNumber: 9,
    title: "Be a Doer",
    pillar: "spiritual_development",
    description:
      "From Knowledge to Action \u2014 The Midpoint Challenge. Scripture: James 1:22\u201325; Matthew 7:24\u201327; Luke 6:46\u201349. The pivot point of the curriculum \u2014 a spiritual audit of Sessions 1\u20138, moving from knowledge to action.",
    status: "draft",
  },
  {
    sessionNumber: 10,
    title: "Entrepreneurship",
    pillar: "financial_career",
    description:
      "Building Something With What You\u2019ve Learned. Scripture: Proverbs 31:16\u201318; Ecclesiastes 11:6; Genesis 2:15. Develops an entrepreneurial mindset, validates business ideas, and teaches launching a venture rooted in biblical principles.",
    status: "draft",
  },
  {
    sessionNumber: 11,
    title: "The Path to Greatness",
    pillar: "discipleship_leadership",
    description:
      "Redefining Success as Servant Leadership. Scripture: Mark 10:42\u201345; Philippians 2:3\u20138; Matthew 23:11\u201312. Challenges cultural narratives about success by presenting Jesus\u2019 definition of greatness \u2014 servant leadership.",
    status: "draft",
  },
  {
    sessionNumber: 12,
    title: "Adapting Through Challenges",
    pillar: "discipleship_leadership",
    description:
      "Resilience, Adaptability, and Growth Through Adversity. Scripture: Romans 5:3\u20135; James 1:2\u20134; Genesis 50:20. Normalizes adversity and reframes it as God\u2019s development tool, building practical resilience strategies.",
    status: "draft",
  },
  {
    sessionNumber: 13,
    title: "My Career Checklist",
    pillar: "financial_career",
    description:
      "Practical Career Preparation for Life After School. Scripture: Colossians 3:23\u201324; Proverbs 22:29; Ecclesiastes 9:10. Practical career preparation including resume development, interview strategies, and professional networking.",
    status: "draft",
  },
  {
    sessionNumber: 14,
    title: "Authentic Leadership",
    pillar: "discipleship_leadership",
    description:
      "Leading From Values Under Pressure. Scripture: 1 Timothy 4:12; Titus 2:7\u20138; 2 Corinthians 4:2. Advanced leadership development preparing beneficiaries to lead from values with self-awareness and relational transparency.",
    status: "draft",
  },
  {
    sessionNumber: 15,
    title: "Research in the Age of A.I.",
    pillar: "discipleship_leadership",
    description:
      "Critical Thinking and Discernment in a Changing World. Scripture: Proverbs 18:15; Acts 17:11; 1 Thessalonians 5:21. Sharpens critical thinking and biblical discernment in a world of AI and misinformation.",
    status: "draft",
  },
  {
    sessionNumber: 16,
    title: "Becoming an Influencer",
    pillar: "discipleship_leadership",
    description:
      "Using Your Platform to Impact Your Generation. Scripture: Matthew 5:14\u201316; Daniel 12:3; 2 Timothy 2:2. The final session \u2014 brings the curriculum full circle, teaching beneficiaries to use their platforms for genuine impact and commit to mentoring the next cohort.",
    status: "draft",
  },
];

/**
 * Seeds the Pioneer Cohort 2025.
 * Skips creation if an active cohort already exists.
 */
export const seedCohort = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("cohorts")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(1);

    if (existing.length > 0) {
      return { created: false, cohortId: existing[0]._id };
    }

    const cohortId = await ctx.db.insert("cohorts", {
      name: "Pioneer Cohort 2025",
      description:
        "The inaugural cohort of TheOyinbooke Foundation's beneficiary program. Covers all 16 sessions across spiritual development, emotional resilience, financial literacy, career readiness, and discipleship leadership.",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { created: true, cohortId };
  },
});

/**
 * Seeds all 16 sessions linked to the given cohort.
 * Skips any session whose sessionNumber already exists in the database.
 */
export const seedSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find the active cohort to link sessions to
    const activeCohort = await ctx.db
      .query("cohorts")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(1);

    const cohortId: Id<"cohorts"> | undefined = activeCohort[0]?._id;

    // Fetch all existing sessions to check for duplicates
    const existingSessions = await ctx.db.query("sessions").take(200);
    const existingNumbers = new Set(
      existingSessions.map((s) => s.sessionNumber),
    );

    let created = 0;
    let skipped = 0;

    for (const session of SESSIONS) {
      if (existingNumbers.has(session.sessionNumber)) {
        skipped++;
        continue;
      }

      await ctx.db.insert("sessions", {
        sessionNumber: session.sessionNumber,
        title: session.title,
        pillar: session.pillar,
        description: session.description,
        status: session.status,
        cohortId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      created++;
    }

    return { created, skipped };
  },
});

/**
 * Seeds both the cohort and all sessions in sequence.
 * Creates the cohort first, then links all sessions to it.
 */
export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    // --- Step 1: Seed cohort ---
    const existingCohorts = await ctx.db
      .query("cohorts")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(1);

    let cohortId: Id<"cohorts">;
    let cohortCreated: boolean;

    if (existingCohorts.length > 0) {
      cohortId = existingCohorts[0]._id;
      cohortCreated = false;
    } else {
      cohortId = await ctx.db.insert("cohorts", {
        name: "Pioneer Cohort 2025",
        description:
          "The inaugural cohort of TheOyinbooke Foundation's beneficiary program. Covers all 16 sessions across spiritual development, emotional resilience, financial literacy, career readiness, and discipleship leadership.",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      cohortCreated = true;
    }

    // --- Step 2: Seed sessions ---
    const existingSessions = await ctx.db.query("sessions").take(200);
    const existingNumbers = new Set(
      existingSessions.map((s) => s.sessionNumber),
    );

    let sessionsCreated = 0;
    let sessionsSkipped = 0;

    for (const session of SESSIONS) {
      if (existingNumbers.has(session.sessionNumber)) {
        sessionsSkipped++;
        continue;
      }

      await ctx.db.insert("sessions", {
        sessionNumber: session.sessionNumber,
        title: session.title,
        pillar: session.pillar,
        description: session.description,
        status: session.status,
        cohortId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      sessionsCreated++;
    }

    return {
      cohort: { created: cohortCreated, cohortId },
      sessions: { created: sessionsCreated, skipped: sessionsSkipped },
    };
  },
});
