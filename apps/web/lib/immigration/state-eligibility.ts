/**
 * State Insurance Eligibility Data for F-1/OPT/STEM OPT Students
 *
 * VERIFIED: October 18, 2026 against state agency and federal sources.
 *
 * F-1/OPT holders are "lawfully present" nonimmigrants. They have never been
 * eligible for federally funded adult Medicaid, so adult coverage only exists
 * where a state pays for it (NY Essential Plan, Oregon Health Plan) or through
 * subsidized marketplace plans.
 *
 * KEY DATES (H.R.1, Public Law 119-21):
 * - Jan 1, 2026: No premium tax credits for lawfully present immigrants under 100% FPL
 * - Jul 1, 2026: NY Essential Plan income limit cut from 250% to 200% FPL
 * - Oct 1, 2026: Federal Medicaid limited to green card holders, Cuban/Haitian
 *   entrants and COFA migrants (children and pregnant people at state option)
 * - Jan 1, 2027: Premium tax credits (and NY Essential Plan / MA ConnectorCare
 *   federal funding) end for F-1, OPT, and other nonimmigrant visa holders
 */

// 2026 HHS poverty guidelines (single person, 48 states + DC), effective Jan 13, 2026
export const FPL_2026 = {
    single: {
        fpl100: 15960,
        fpl138: 22025,
        fpl200: 31920,
        fpl250: 39900,
        fpl300: 47880,
        fpl400: 63840,
    }
};

// Children and pregnancy coverage limits vary by state; 200% FPL is a conservative guide.
const CHILD_PREGNANT_INCOME_LIMIT_FPL = 200;

function fplDollars(percent: number): number {
    return Math.round((FPL_2026.single.fpl100 * percent) / 100);
}

type EligibilityStatus =
    | 'ELIGIBLE'           // Eligible for state program with residency
    | 'POSSIBLY_ELIGIBLE'  // May qualify - worth applying
    | 'PROGRAM_ENDING'     // Coverage or subsidies ending soon (MA Dec 31, 2026)
    | 'EMERGENCY_ONLY'     // Emergency Medicaid only
    | 'NOT_ELIGIBLE';      // No state coverage available

type StateTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

interface StateEligibilityConfig {
    programName: string;
    programLink: string;
    tier: StateTier;
    phone?: string;
    // Program shown to children under 19 and pregnant people, when it differs
    childPregnantProgramName?: string;
    // Eligibility by category
    eligibleWithResidency: boolean;  // Can F-1 students access with residency?
    eligibleUnder19: boolean;
    eligiblePregnant: boolean;
    eligibleAdult19Plus: 'yes' | 'possible' | 'ending' | 'no';
    // Income limits for adults 19+
    incomeLimitFPL: number;          // Max FPL percentage (e.g., 200 for 200% FPL)
    incomeLimitDollars: number;      // Max annual income in dollars
    // Coverage details
    premiumCost: string;             // e.g., "$0", "$0-$50/mo", "$0-$200/mo"
    benefits: string[];
    // Status
    status2026: string;
    enrollmentStatus: 'active' | 'ending' | 'closed' | 'limited';
    endingLabel?: string;            // Shown on the PROGRAM_ENDING card
    adultReason?: string;            // Why adults 19+ are (or are not) eligible
    // Warnings
    importantNotes: string[];
    deadlineWarning?: string;
}

// TIER 1: Best options - adult F-1/OPT holders CAN enroll with state residency
const TIER_1_STATES: Record<string, StateEligibilityConfig> = {
    NY: {
        programName: "Essential Plan",
        programLink: "https://nystateofhealth.ny.gov/",
        phone: "1-855-355-5777",
        tier: 'TIER_1',
        childPregnantProgramName: "Medicaid / Child Health Plus",
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'yes',
        incomeLimitFPL: 200,
        incomeLimitDollars: fplDollars(200),
        premiumCost: "$0",
        benefits: [
            "$0 monthly premium",
            "No deductible",
            "Doctor visits and prescriptions",
            "Mental health services",
            "Dental and vision included",
            "Emergency care"
        ],
        status2026: "ACTIVE - income limit cut to 200% FPL on Jul 1, 2026",
        enrollmentStatus: 'active',
        adultReason: "Visa holders aged 21-64 who live in New York can enroll in the Essential Plan with income up to 200% FPL. Ages 19-20 apply for Medicaid instead.",
        importantNotes: [
            "[YES] F-1/OPT holders who live in NY can enroll (ages 21-64)",
            "Income limit dropped from 250% to 200% FPL on Jul 1, 2026",
            "Show NY residency: lease, utility bill, employment letter",
            "Enrollment is open all year"
        ],
        deadlineWarning: "Federal funding for visa holders in the Essential Plan ends Jan 1, 2027 under H.R.1. New York has not confirmed 2027 eligibility for visa holders, so check NY State of Health before renewing.",
    },
    OR: {
        programName: "Oregon Health Plan (Healthier Oregon)",
        programLink: "https://www.oregon.gov/oha/hsd/ohp/pages/healthier-oregon.aspx",
        tier: 'TIER_1',
        childPregnantProgramName: "Oregon Health Plan",
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'yes',
        incomeLimitFPL: 138,
        incomeLimitDollars: fplDollars(138),
        premiumCost: "$0",
        benefits: [
            "$0 premium",
            "Medical care",
            "Dental services",
            "Mental health",
            "Vision care"
        ],
        status2026: "ACTIVE - covers people with student visas regardless of immigration status",
        enrollmentStatus: 'active',
        adultReason: "Oregon covers residents regardless of immigration status, including people with student visas, with income up to 138% FPL.",
        importantNotes: [
            "[YES] Healthier Oregon covers people with student visas",
            "Must live in Oregon and meet income limits",
            "Jan 2027: visa holders move to OHP Open Card with the same benefits"
        ],
        deadlineWarning: "In January 2027, Oregon moves visa holders from Healthier Oregon to OHP Open Card. Benefits stay the same, but check that your doctors accept Open Card.",
    },
};

// TIER 2: Children and pregnant coverage, with limited or ending adult options
const TIER_2_STATES: Record<string, StateEligibilityConfig> = {
    MA: {
        programName: "ConnectorCare",
        programLink: "https://www.mahealthconnector.org/",
        tier: 'TIER_2',
        childPregnantProgramName: "MassHealth",
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'ending',
        incomeLimitFPL: CHILD_PREGNANT_INCOME_LIMIT_FPL,
        incomeLimitDollars: fplDollars(CHILD_PREGNANT_INCOME_LIMIT_FPL),
        premiumCost: "$0-$200/mo",
        benefits: [
            "MassHealth for children and pregnant people",
            "ConnectorCare subsidized plans through Dec 31, 2026",
            "Health Safety Net for hospital care"
        ],
        status2026: "ConnectorCare subsidies for visa holders end Dec 31, 2026",
        enrollmentStatus: 'ending',
        endingLabel: "Subsidies end Dec 31, 2026",
        adultReason: "Adult F-1/OPT holders get MassHealth Limited (emergencies only). ConnectorCare subsidies for visa holders with income at least 100% FPL end Dec 31, 2026. From Jan 1, 2027, only green card holders, Cuban/Haitian entrants and COFA migrants keep premium help.",
        importantNotes: [
            "[YES] Under 19 and pregnant: full MassHealth",
            "Ages 19-20 with income up to 150% FPL: MassHealth Standard",
            "[NO] Adults 21+: MassHealth Limited (emergency only)",
            "ConnectorCare for visa holders ends Dec 31, 2026"
        ],
        deadlineWarning: "Massachusetts Health Connector open enrollment for 2027 runs Oct 23 - Dec 23, 2026. Visa holders can still buy a plan, but without ConnectorCare or tax credit help.",
    },
    CA: {
        programName: "Medi-Cal",
        programLink: "https://benefitscal.com/",
        tier: 'TIER_2',
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'no',
        incomeLimitFPL: CHILD_PREGNANT_INCOME_LIMIT_FPL,
        incomeLimitDollars: fplDollars(CHILD_PREGNANT_INCOME_LIMIT_FPL),
        premiumCost: "FREE",
        benefits: [
            "Full coverage for under 19",
            "Full pregnancy and postpartum coverage",
            "Mental health services"
        ],
        status2026: "FROZEN for new adults 19+ with unsatisfactory immigration status (Jan 1, 2026)",
        enrollmentStatus: 'closed',
        adultReason: "Medi-Cal stopped enrolling new adults 19+ with unsatisfactory immigration status on Jan 1, 2026. Adults can still get restricted (emergency and pregnancy) Medi-Cal.",
        importantNotes: [
            "[NO] New adults 19+: enrollment frozen since Jan 1, 2026",
            "[YES] Under 19: Full eligibility",
            "[YES] Pregnant: Full coverage through 12 months postpartum",
            "Consider private insurance for adults 19+"
        ],
    },
    WA: {
        programName: "Apple Health",
        programLink: "https://www.wahealthplanfinder.org/",
        tier: 'TIER_2',
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'no',
        incomeLimitFPL: CHILD_PREGNANT_INCOME_LIMIT_FPL,
        incomeLimitDollars: fplDollars(CHILD_PREGNANT_INCOME_LIMIT_FPL),
        premiumCost: "FREE",
        benefits: [
            "Apple Health for Kids regardless of status",
            "Pregnancy coverage regardless of status",
            "Doctor & hospital care",
            "Prescriptions covered"
        ],
        status2026: "Apple Health Expansion CLOSED to new adult enrollees",
        enrollmentStatus: 'closed',
        adultReason: "Apple Health Expansion, the adult program for immigrants, is closed to new enrollees and has no open waitlist.",
        importantNotes: [
            "[NO] Adults 19+: Apple Health Expansion closed to new enrollees",
            "[YES] Under 19: Apple Health for Kids",
            "[YES] Pregnant: covered regardless of status",
            "Get private insurance for adults"
        ],
    },
};

// Children/pregnant only states (lawfully present or regardless of status)
const CHILDREN_PREGNANT_STATES = ['CO', 'VT', 'IL', 'CT', 'NJ', 'ME', 'RI', 'UT', 'MD', 'DC', 'MN'];

// Default config for children/pregnant states
const CHILDREN_PREGNANT_CONFIG: StateEligibilityConfig = {
    programName: "State Medicaid",
    programLink: "",
    tier: 'TIER_2',
    eligibleWithResidency: true,
    eligibleUnder19: true,
    eligiblePregnant: true,
    eligibleAdult19Plus: 'no',
    incomeLimitFPL: CHILD_PREGNANT_INCOME_LIMIT_FPL,
    incomeLimitDollars: fplDollars(CHILD_PREGNANT_INCOME_LIMIT_FPL),
    premiumCost: "FREE",
    benefits: [
        "Coverage for children under 19",
        "Pregnancy coverage",
        "Preventive care for children"
    ],
    status2026: "Limited - children & pregnant only",
    enrollmentStatus: 'limited',
    importantNotes: [
        "[YES] Under 19: May qualify",
        "[YES] Pregnant: Coverage available",
        "[NO] Adults 19+ (not pregnant): NOT eligible",
        "Consider private insurance for adults"
    ],
};

// No coverage states config
const NO_COVERAGE_CONFIG: StateEligibilityConfig = {
    programName: "Emergency Medicaid Only",
    programLink: "",
    tier: 'TIER_3',
    eligibleWithResidency: false,
    eligibleUnder19: false,
    eligiblePregnant: true,
    eligibleAdult19Plus: 'no',
    incomeLimitFPL: 0,
    incomeLimitDollars: 0,
    premiumCost: "N/A",
    benefits: [
        "Emergency medical conditions only",
        "Emergency labor and delivery",
        "Severe injury or illness"
    ],
    status2026: "[NO] No state-funded programs for adult F-1/OPT holders",
    enrollmentStatus: 'limited',
    importantNotes: [
        "[NO] No state-funded coverage for adult visa holders",
        "Marketplace plans have no tax credits for visa holders from Jan 1, 2027",
        "Use University SHIP or private insurance"
    ],
};

// State names mapping
const STATE_NAMES: Record<string, string> = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
    MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
    NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
    SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
    VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
    DC: "Washington D.C."
};

// Get Medicaid program name and link by state
function getStateMedicaidProgram(stateCode: string): { name?: string; link: string } {
    const programs: Record<string, { name?: string; link: string }> = {
        CO: { name: "Health First Colorado / CHP+", link: "https://www.healthfirstcolorado.gov/" },
        VT: { name: "Dr. Dynasaur", link: "https://portal.healthconnect.vermont.gov/" },
        IL: { link: "https://abe.illinois.gov/" },
        CT: { link: "https://www.accesshealthct.com/" },
        NJ: { link: "https://www.njfamilycare.org/" },
        ME: { link: "https://www.maine.gov/dhhs/ofi/programs-services/mainecare" },
        RI: { link: "https://healthyrhode.ri.gov/" },
        UT: { link: "https://medicaid.utah.gov/" },
        MD: { link: "https://www.marylandhealthconnection.gov/" },
        DC: { link: "https://dchealthlink.com/" },
        MN: { link: "https://www.mnsure.org/" },
    };
    return programs[stateCode] || { link: "" };
}

// Get state configuration
function getStateConfig(stateCode: string): StateEligibilityConfig {
    // Check Tier 1 states first
    if (TIER_1_STATES[stateCode]) {
        return TIER_1_STATES[stateCode];
    }

    // Check Tier 2 states
    if (TIER_2_STATES[stateCode]) {
        return TIER_2_STATES[stateCode];
    }

    // Check children/pregnant states
    if (CHILDREN_PREGNANT_STATES.includes(stateCode)) {
        const program = getStateMedicaidProgram(stateCode);
        return {
            ...CHILDREN_PREGNANT_CONFIG,
            programName: program.name ?? CHILDREN_PREGNANT_CONFIG.programName,
            programLink: program.link,
        };
    }

    // States without state-funded coverage for adult visa holders
    return NO_COVERAGE_CONFIG;
}

// Main eligibility calculator
interface EligibilityParams {
    stateCode: string;
    age: number;
    annualIncome: number;
    isPregnant: boolean;
    visaType: string;
}

interface EligibilityResult {
    status: EligibilityStatus;
    stateConfig: StateEligibilityConfig;
    stateName: string;
    eligibilityReason: string;
    recommendedAction: string;
    showStateProgram: boolean;
    showEmergencyInfo: boolean;
    incomeQualifies: boolean;
    deadlineWarning?: string;
}

export function calculateEligibility(params: EligibilityParams): EligibilityResult {
    const { stateCode, age, annualIncome, isPregnant, visaType } = params;
    const config = getStateConfig(stateCode);
    const stateName = STATE_NAMES[stateCode] || stateCode;

    // Check if income qualifies
    const incomeQualifies = annualIncome <= config.incomeLimitDollars || config.incomeLimitDollars === 0;
    const childPregnantLimit = fplDollars(CHILD_PREGNANT_INCOME_LIMIT_FPL);
    const childPregnantIncomeQualifies = annualIncome <= childPregnantLimit;
    const childPregnantConfig: StateEligibilityConfig = {
        ...config,
        programName: config.childPregnantProgramName ?? config.programName,
    };

    // Base result
    const baseResult: EligibilityResult = {
        status: 'NOT_ELIGIBLE',
        stateConfig: config,
        stateName,
        eligibilityReason: "",
        recommendedAction: "",
        showStateProgram: false,
        showEmergencyInfo: true,
        incomeQualifies,
        deadlineWarning: config.deadlineWarning,
    };

    // States without state-funded coverage for adult visa holders (Tier 3)
    if (config.tier === 'TIER_3') {
        return {
            ...baseResult,
            status: 'EMERGENCY_ONLY',
            eligibilityReason: `${stateName} does not offer a state-funded health program for adult F-1/OPT holders. Children and pregnant people with lawful status may still qualify for Medicaid or CHIP.`,
            recommendedAction: "Use University SHIP or a private OPT plan (ISO OPTima: $41-$123/mo).",
            showStateProgram: false,
        };
    }

    // Check pregnancy first (highest priority, all tiers)
    if (isPregnant && config.eligiblePregnant && childPregnantIncomeQualifies) {
        return {
            ...baseResult,
            status: 'ELIGIBLE',
            stateConfig: childPregnantConfig,
            eligibilityReason: `Pregnant people with ${stateName} residency and lawful status can qualify for ${childPregnantConfig.programName}. Income limits vary.`,
            recommendedAction: `Apply for ${childPregnantConfig.programName}. Includes pregnancy care + postpartum.`,
            showStateProgram: true,
        };
    }

    // Check under 19
    if (age < 19 && config.eligibleUnder19 && childPregnantIncomeQualifies) {
        return {
            ...baseResult,
            status: 'ELIGIBLE',
            stateConfig: childPregnantConfig,
            eligibilityReason: `Children under 19 with ${stateName} residency and lawful status can qualify for ${childPregnantConfig.programName}. Income limits vary.`,
            recommendedAction: `Apply for ${childPregnantConfig.programName}. Full coverage available.`,
            showStateProgram: true,
        };
    }

    // Adults 19+ eligibility by state
    if (age >= 19 && !isPregnant) {
        // Tier 1 states with adult eligibility
        if (config.tier === 'TIER_1' && config.eligibleWithResidency && incomeQualifies) {
            if (config.eligibleAdult19Plus === 'yes') {
                return {
                    ...baseResult,
                    status: 'ELIGIBLE',
                    eligibilityReason: `${config.adultReason ?? `F-1/OPT holders with ${stateName} residency can enroll in ${config.programName}.`} Income limit: $${config.incomeLimitDollars.toLocaleString()}/year.`,
                    recommendedAction: `Show ${stateName} residency (lease/utility bill), then apply. Cost: ${config.premiumCost}.`,
                    showStateProgram: true,
                };
            }
            if (config.eligibleAdult19Plus === 'possible') {
                return {
                    ...baseResult,
                    status: 'POSSIBLY_ELIGIBLE',
                    eligibilityReason: `F-1 students with ${stateName} residency may qualify for ${config.programName}. Worth applying.`,
                    recommendedAction: `Apply to ${config.programName}. Have backup private insurance ready if denied.`,
                    showStateProgram: true,
                };
            }
        }

        // Tier 2 states with limited access
        if (config.tier === 'TIER_2') {
            if (config.eligibleAdult19Plus === 'ending') {
                return {
                    ...baseResult,
                    status: 'PROGRAM_ENDING',
                    eligibilityReason: config.adultReason ?? `${config.programName} coverage for adult F-1/OPT holders is ending.`,
                    recommendedAction: "Line up private OPT insurance or employer coverage that starts by Jan 1, 2027.",
                    showStateProgram: true,
                };
            }
            if (config.eligibleAdult19Plus === 'possible') {
                return {
                    ...baseResult,
                    status: 'POSSIBLY_ELIGIBLE',
                    eligibilityReason: `${config.programName} may accept F-1 students. Eligibility is unclear.`,
                    recommendedAction: `Try applying to ${config.programName}. Have backup private insurance ready.`,
                    showStateProgram: true,
                };
            }
            if (config.eligibleAdult19Plus === 'no') {
                return {
                    ...baseResult,
                    status: 'NOT_ELIGIBLE',
                    eligibilityReason: config.adultReason ?? `${config.programName} is not available to adult F-1/OPT holders 19+ unless pregnant.`,
                    recommendedAction: "Use University SHIP or a private OPT plan (ISO OPTima: $41-$123/mo).",
                    showStateProgram: false,
                };
            }
        }
    }

    // Check income limit issue
    if (!incomeQualifies && config.incomeLimitDollars > 0) {
        return {
            ...baseResult,
            status: 'NOT_ELIGIBLE',
            eligibilityReason: `Your income exceeds the ${config.programName} limit of $${config.incomeLimitDollars.toLocaleString()}/year (${config.incomeLimitFPL}% FPL).`,
            recommendedAction: "Consider employer coverage if available, or private insurance plans.",
            showStateProgram: false,
        };
    }

    // Default: Not eligible
    return {
        ...baseResult,
        status: 'NOT_ELIGIBLE',
        eligibilityReason: `F-1 students in your situation are not eligible for ${stateName} state programs.`,
        recommendedAction: visaType === 'F-1'
            ? "Enroll in University SHIP (required by most schools) or purchase private insurance."
            : "Use employer coverage if available, or purchase private insurance.",
        showStateProgram: false,
    };
}
