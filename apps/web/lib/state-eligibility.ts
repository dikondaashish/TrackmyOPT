/**
 * State Insurance Eligibility Data for F-1/OPT/STEM OPT Students
 * 
 * UPDATED: January 2026 - RESIDENCY-BASED ACCESS
 * 
 * KEY FINDING: F-1 students who establish residency in certain states
 * CAN access state health insurance programs if they:
 * 1. Establish legal residency in that state
 * 2. Have lawful status (F-1 visa = lawfully present)
 * 3. Meet income requirements (vary by state)
 * 
 * IMPORTANT DEADLINES:
 * - Oct 1, 2026: Medicaid for non-citizen adults severely restricted (H.R.1)
 * - Jan 1, 2027: Premium Tax Credits eliminated for most lawfully present immigrants
 */

// 2026 Federal Poverty Level thresholds (single person)
export const FPL_2026 = {
    single: {
        fpl100: 15650,
        fpl138: 21597,
        fpl200: 31300,
        fpl250: 39125,
        fpl300: 46950,
        fpl400: 62600,
    }
};

export type EligibilityStatus =
    | 'ELIGIBLE'           // Eligible for state program with residency
    | 'POSSIBLY_ELIGIBLE'  // May qualify - worth applying
    | 'UNDER_19_ONLY'      // Only if under 19
    | 'PREGNANCY_ONLY'     // Only if pregnant
    | 'WAITLIST'           // Enrollment frozen (WA adults)
    | 'PROGRAM_ENDING'     // Program ending soon (VT Oct 2026)
    | 'EMERGENCY_ONLY'     // Emergency Medicaid only
    | 'NOT_ELIGIBLE';      // No state coverage available

export type StateTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export interface StateEligibilityConfig {
    programName: string;
    programLink: string;
    tier: StateTier;
    phone?: string;
    // Eligibility by category
    eligibleWithResidency: boolean;  // Can F-1 students access with residency?
    eligibleUnder19: boolean;
    eligiblePregnant: boolean;
    eligibleAdult19Plus: 'yes' | 'possible' | 'waitlist' | 'ending' | 'no';
    // Income limits
    incomeLimitFPL: number;          // Max FPL percentage (e.g., 250 for 250% FPL)
    incomeLimitDollars: number;      // Max annual income in dollars
    // Coverage details
    premiumCost: string;             // e.g., "$0", "$0-$50/mo", "$0-$200/mo"
    benefits: string[];
    // Status
    status2026: string;
    enrollmentStatus: 'active' | 'waitlist' | 'ending' | 'frozen' | 'limited';
    // Warnings
    importantNotes: string[];
    deadlineWarning?: string;
}

// TIER 1: Best options - F-1 students CAN access with residency
const TIER_1_STATES: Record<string, StateEligibilityConfig> = {
    NY: {
        programName: "Essential Plan",
        programLink: "https://nystateofhealth.ny.gov/",
        phone: "1-855-355-5777",
        tier: 'TIER_1',
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'yes',
        incomeLimitFPL: 250,
        incomeLimitDollars: 39125,
        premiumCost: "$0-$50/mo",
        benefits: [
            "$0 or low monthly premiums",
            "No deductible",
            "Doctor visits covered",
            "Prescriptions included",
            "Mental health services",
            "Emergency care"
        ],
        status2026: "ACTIVE [YES] - Best option for F-1 students",
        enrollmentStatus: 'active',
        importantNotes: [
            "[YES] F-1 students with NY residency CAN enroll",
            "Establish residency: lease, utility bill, employment letter",
            "F-1 visa = 'Lawfully Present' status",
            "Income up to $39,125/year qualifies",
            "May not need University SHIP if approved"
        ],
    },
    MA: {
        programName: "MassHealth / ConnectorCare",
        programLink: "https://www.mass.gov/masshealth",
        phone: "1-800-841-2900",
        tier: 'TIER_1',
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'yes',
        incomeLimitFPL: 400,
        incomeLimitDollars: 62600,
        premiumCost: "$0-$200/mo",
        benefits: [
            "MassHealth Standard: FREE (if eligible)",
            "ConnectorCare: $0-$200/mo subsidized plans",
            "Medical, mental health, prescriptions",
            "Dental and vision coverage",
            "Health Safety Net for emergencies"
        ],
        status2026: "ACTIVE [YES] (changes Oct 1, 2026)",
        enrollmentStatus: 'active',
        importantNotes: [
            "[YES] F-1 with MA residency CAN enroll",
            "Income < $21,750: Likely MassHealth (FREE)",
            "Income $21,750 - $62,600: ConnectorCare (Subsidized)",
            "F-1 visa = 'Lawfully Present' status"
        ],
        deadlineWarning: "[!] DEADLINE: Oct 1, 2026 - Medicaid changes under H.R.1 may affect F-1 eligibility",
    },
    CO: {
        programName: "Health First Colorado",
        programLink: "https://peak.colorado.gov/",
        phone: "1-800-221-3943",
        tier: 'TIER_1',
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'possible',
        incomeLimitFPL: 138,
        incomeLimitDollars: 21597,
        premiumCost: "FREE",
        benefits: [
            "FREE - no premiums, copays, deductibles",
            "All medical services",
            "Mental health coverage",
            "Prescriptions",
            "Dental care",
            "Emergency Medicaid for all ages"
        ],
        status2026: "ACTIVE",
        enrollmentStatus: 'active',
        importantNotes: [
            "[YES] Under 19: Full coverage eligible",
            "[YES] Pregnant: Full coverage eligible (all ages)",
            "[YES] All ages: Emergency Medicaid available",
            "F-1 = 'Lawfully Present' status",
            "No 183-day residency minimum required"
        ],
    },
};

// TIER 2: Limited access states
const TIER_2_STATES: Record<string, StateEligibilityConfig> = {
    CA: {
        programName: "Medi-Cal",
        programLink: "https://www.coveredca.com/",
        tier: 'TIER_2',
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'no',
        incomeLimitFPL: 138,
        incomeLimitDollars: 21597,
        premiumCost: "FREE",
        benefits: [
            "Full coverage for under 19",
            "Pregnancy/emergency coverage",
            "Dental and vision (under 19)",
            "Mental health services"
        ],
        status2026: "[!] FROZEN for adults 19+ (Jan 1, 2026)",
        enrollmentStatus: 'frozen',
        importantNotes: [
            "[NO] Adults 19+ NOT eligible (enrollment frozen Jan 2026)",
            "[YES] Under 19: Full eligibility",
            "[YES] Pregnant: Emergency/pregnancy services only",
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
        eligibleAdult19Plus: 'waitlist',
        incomeLimitFPL: 138,
        incomeLimitDollars: 21597,
        premiumCost: "FREE",
        benefits: [
            "$0 monthly cost",
            "Doctor & hospital care",
            "Prescriptions covered",
            "Mental health services"
        ],
        status2026: "[!] WAITLIST for adults (cap reached July 2024)",
        enrollmentStatus: 'waitlist',
        importantNotes: [
            "[!] Adults 19+: WAITLIST only (enrollment cap reached)",
            "[YES] Under 19: NO CAP - still available",
            "[YES] Pregnant: NO CAP - still available",
            "Get private insurance while waiting"
        ],
    },
    OR: {
        programName: "Oregon Health Plan",
        programLink: "https://healthcare.oregon.gov/",
        tier: 'TIER_2',
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'possible',
        incomeLimitFPL: 138,
        incomeLimitDollars: 21597,
        premiumCost: "FREE",
        benefits: [
            "$0 premium",
            "Medical care",
            "Dental services",
            "Mental health",
            "Vision care"
        ],
        status2026: "ACTIVE but F-1 eligibility unclear",
        enrollmentStatus: 'active',
        importantNotes: [
            "[!] F-1 eligibility NOT confirmed",
            "Program designed for undocumented immigrants",
            "Worth applying - have backup insurance ready",
            "Under 19: More likely to qualify"
        ],
    },
    VT: {
        programName: "Vermont Medicaid",
        programLink: "https://portal.healthconnect.vermont.gov/",
        tier: 'TIER_2',
        eligibleWithResidency: true,
        eligibleUnder19: true,
        eligiblePregnant: true,
        eligibleAdult19Plus: 'ending',
        incomeLimitFPL: 138,
        incomeLimitDollars: 21597,
        premiumCost: "FREE",
        benefits: [
            "Full Medicaid coverage",
            "Medical, mental health",
            "Prescriptions",
            "Preventive care"
        ],
        status2026: "[!] ENDING Oct 1, 2026 for adult F-1 students",
        enrollmentStatus: 'ending',
        importantNotes: [
            "[NO] ENDING: Adult F-1 coverage ends Oct 1, 2026",
            "[YES] Under 19: Coverage continues (not affected)",
            "Get private insurance before Oct 2026"
        ],
        deadlineWarning: "[!] DEADLINE: Oct 1, 2026 - Adult F-1 coverage ends",
    },
};

// Children/Pregnant only states (expansion states without F-1 adult programs)
const CHILDREN_PREGNANT_STATES = ['IL', 'CT', 'NJ', 'ME', 'RI', 'UT', 'MD', 'DC', 'MN'];

// Non-expansion states (NO coverage for F-1)
const NON_EXPANSION_STATES = ['AL', 'FL', 'GA', 'KS', 'MS', 'SC', 'TN', 'TX', 'WI', 'WY'];

// Default config for children/pregnant states
const CHILDREN_PREGNANT_CONFIG: StateEligibilityConfig = {
    programName: "State Medicaid",
    programLink: "",
    tier: 'TIER_2',
    eligibleWithResidency: true,
    eligibleUnder19: true,
    eligiblePregnant: true,
    eligibleAdult19Plus: 'no',
    incomeLimitFPL: 138,
    incomeLimitDollars: 21597,
    premiumCost: "FREE",
    benefits: [
        "Coverage for children under 19",
        "Pregnancy coverage regardless of status",
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
    status2026: "[NO] No state programs for F-1 students",
    enrollmentStatus: 'limited',
    importantNotes: [
        "[NO] This is a non-expansion state",
        "No Medicaid expansion for F-1 students",
        "ACA Marketplace expensive ($400-$800/mo)",
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

// Get Medicaid link by state
function getStateMedicaidLink(stateCode: string): string {
    const links: Record<string, string> = {
        IL: "https://abe.illinois.gov/",
        CT: "https://www.accesshealthct.com/",
        NJ: "https://www.njfamilycare.org/",
        ME: "https://www.maine.gov/dhhs/ofi/programs-services/mainecare",
        RI: "https://healthyrhode.ri.gov/",
        UT: "https://medicaid.utah.gov/",
        MD: "https://www.marylandhealthconnection.gov/",
        DC: "https://dchealthlink.com/",
        MN: "https://www.mnsure.org/",
    };
    return links[stateCode] || "";
}

// Get state configuration
export function getStateConfig(stateCode: string): StateEligibilityConfig {
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
        return {
            ...CHILDREN_PREGNANT_CONFIG,
            programLink: getStateMedicaidLink(stateCode),
        };
    }

    // Non-expansion states
    return NO_COVERAGE_CONFIG;
}

// Calculate age from DOB
export function calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Main eligibility calculator
export interface EligibilityParams {
    stateCode: string;
    age: number;
    annualIncome: number;
    isPregnant: boolean;
    visaType: string;
}

export interface EligibilityResult {
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

    // Non-expansion states (Tier 3)
    if (config.tier === 'TIER_3') {
        return {
            ...baseResult,
            status: 'EMERGENCY_ONLY',
            eligibilityReason: `${stateName} does not offer state health programs for F-1 students. This is a non-expansion state.`,
            recommendedAction: "Use University SHIP ($1,400-$4,500/yr) or private insurance (ISO: $31-$118/mo).",
            showStateProgram: false,
        };
    }

    // Check pregnancy first (highest priority, all tiers)
    if (isPregnant && config.eligiblePregnant && incomeQualifies) {
        return {
            ...baseResult,
            status: 'ELIGIBLE',
            eligibilityReason: `Pregnant individuals with ${stateName} residency qualify for ${config.programName}.`,
            recommendedAction: `Apply for ${config.programName}. Cost: ${config.premiumCost}. Includes pregnancy care + postpartum.`,
            showStateProgram: true,
        };
    }

    // Check under 19
    if (age < 19 && config.eligibleUnder19 && incomeQualifies) {
        return {
            ...baseResult,
            status: 'ELIGIBLE',
            eligibilityReason: `Children under 19 with ${stateName} residency qualify for ${config.programName}.`,
            recommendedAction: `Apply for ${config.programName}. Cost: ${config.premiumCost}. Full coverage available.`,
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
                    eligibilityReason: `F-1 students with ${stateName} residency CAN enroll in ${config.programName}. Income limit: $${config.incomeLimitDollars.toLocaleString()}/year.`,
                    recommendedAction: `Establish ${stateName} residency (lease/utility bill), then apply. Cost: ${config.premiumCost}.`,
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
            if (config.eligibleAdult19Plus === 'waitlist') {
                return {
                    ...baseResult,
                    status: 'WAITLIST',
                    eligibilityReason: `${config.programName} adult enrollment is frozen since July 2024. Only waitlist available.`,
                    recommendedAction: `Join waitlist if desired, but get private insurance NOW. Waitlist may take months.`,
                    showStateProgram: true,
                };
            }
            if (config.eligibleAdult19Plus === 'ending') {
                return {
                    ...baseResult,
                    status: 'PROGRAM_ENDING',
                    eligibilityReason: `${config.programName} adult coverage is ENDING Oct 1, 2026 for F-1 students.`,
                    recommendedAction: `Current enrollees: Get private insurance before Oct 2026. New applicants: Use private insurance.`,
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
                    eligibilityReason: `${config.programName} adult enrollment is NOT available for F-1 students 19+.`,
                    recommendedAction: `Use University SHIP or private insurance (ISO: $31-$118/mo, Compass: similar).`,
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
            eligibilityReason: `Your income exceeds ${config.programName} limit of $${config.incomeLimitDollars.toLocaleString()}/year (${config.incomeLimitFPL}% FPL).`,
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
            ? "Enroll in University SHIP (required by most schools) or purchase private insurance (ISO, Compass)."
            : "Use employer coverage if available, or purchase private insurance.",
        showStateProgram: false,
    };
}
