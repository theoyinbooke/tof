import { internalMutation } from "../_generated/server";

// 16 psychometric instruments for TheOyinbooke Foundation
// Each contains minimal sample items — full instruments should be populated by admin
const INSTRUMENTS = [
  { shortCode: "RSES", name: "Rosenberg Self-Esteem Scale", pillar: "personal_development", sessionNumber: 1, sourceCitation: "Rosenberg, M. (1965)", items: 10, description: "Measures global self-worth." },
  { shortCode: "PHQ-9", name: "Patient Health Questionnaire-9", pillar: "health_wellness", sessionNumber: 2, sourceCitation: "Kroenke et al. (2001)", items: 9, description: "Screens for depression severity." },
  { shortCode: "GAD-7", name: "Generalized Anxiety Disorder-7", pillar: "health_wellness", sessionNumber: 3, sourceCitation: "Spitzer et al. (2006)", items: 7, description: "Screens for generalized anxiety." },
  { shortCode: "SWLS", name: "Satisfaction with Life Scale", pillar: "personal_development", sessionNumber: 4, sourceCitation: "Diener et al. (1985)", items: 5, description: "Measures global life satisfaction." },
  { shortCode: "GRIT-S", name: "Grit Scale (Short)", pillar: "academic_excellence", sessionNumber: 5, sourceCitation: "Duckworth & Quinn (2009)", items: 8, description: "Measures perseverance and passion for long-term goals." },
  { shortCode: "CDSE-SF", name: "Career Decision Self-Efficacy Scale (Short)", pillar: "career_readiness", sessionNumber: 6, sourceCitation: "Betz et al. (1996)", items: 5, description: "Measures confidence in career decision-making." },
  { shortCode: "FLS", name: "Financial Literacy Scale", pillar: "financial_literacy", sessionNumber: 7, sourceCitation: "Lusardi & Mitchell (2008)", items: 5, description: "Measures financial knowledge and competency." },
  { shortCode: "PSS-10", name: "Perceived Stress Scale-10", pillar: "health_wellness", sessionNumber: 8, sourceCitation: "Cohen et al. (1983)", items: 10, description: "Measures perception of stress." },
  { shortCode: "MSPSS", name: "Multidimensional Scale of Perceived Social Support", pillar: "personal_development", sessionNumber: 9, sourceCitation: "Zimet et al. (1988)", items: 12, description: "Measures perceived social support from family, friends, and significant others." },
  { shortCode: "LOT-R", name: "Life Orientation Test-Revised", pillar: "personal_development", sessionNumber: 10, sourceCitation: "Scheier et al. (1994)", items: 10, description: "Measures dispositional optimism." },
  { shortCode: "SCS", name: "Self-Compassion Scale (Short)", pillar: "health_wellness", sessionNumber: 11, sourceCitation: "Raes et al. (2011)", items: 12, description: "Measures self-compassion." },
  { shortCode: "CRS", name: "Connor-Davidson Resilience Scale (Short)", pillar: "personal_development", sessionNumber: 12, sourceCitation: "Campbell-Sills & Stein (2007)", items: 10, description: "Measures resilience." },
  { shortCode: "GSE", name: "General Self-Efficacy Scale", pillar: "career_readiness", sessionNumber: 13, sourceCitation: "Schwarzer & Jerusalem (1995)", items: 10, description: "Measures general self-efficacy." },
  { shortCode: "PWI", name: "Personal Wellbeing Index", pillar: "health_wellness", sessionNumber: 14, sourceCitation: "International Wellbeing Group (2013)", items: 7, description: "Measures subjective wellbeing across domains." },
  { shortCode: "LCS", name: "Locus of Control Scale", pillar: "personal_development", sessionNumber: 15, sourceCitation: "Rotter (1966)", items: 10, description: "Measures internal vs external locus of control." },
  { shortCode: "EPOCH", name: "EPOCH Measure of Adolescent Wellbeing", pillar: "personal_development", sessionNumber: 16, sourceCitation: "Kern et al. (2016)", items: 20, description: "Measures five dimensions of adolescent wellbeing." },
];

function generateSampleItems(count: number) {
  const options = [
    { label: "Strongly Disagree", value: 1 },
    { label: "Disagree", value: 2 },
    { label: "Neutral", value: 3 },
    { label: "Agree", value: 4 },
    { label: "Strongly Agree", value: 5 },
  ];

  return Array.from({ length: count }, (_, i) => ({
    itemNumber: i + 1,
    text: `Item ${i + 1} — [Instrument text to be provided by admin]`,
    isReversed: false,
    responseOptions: options,
  }));
}

export const seedTemplates = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find an admin to assign as creator
    const admin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .take(1);

    if (admin.length === 0) {
      throw new Error("No admin user found. Create an admin user first.");
    }

    const adminId = admin[0]._id;
    let created = 0;

    for (const instrument of INSTRUMENTS) {
      // Skip if already exists
      const existing = await ctx.db
        .query("assessmentTemplates")
        .withIndex("by_shortCode", (q) => q.eq("shortCode", instrument.shortCode))
        .take(1);

      if (existing.length > 0) continue;

      const items = generateSampleItems(instrument.items);

      await ctx.db.insert("assessmentTemplates", {
        name: instrument.name,
        shortCode: instrument.shortCode,
        version: 1,
        status: "draft",
        description: instrument.description,
        sourceCitation: instrument.sourceCitation,
        pillar: instrument.pillar,
        sessionNumber: instrument.sessionNumber,
        items,
        createdBy: adminId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      created++;
    }

    return { created, total: INSTRUMENTS.length };
  },
});
