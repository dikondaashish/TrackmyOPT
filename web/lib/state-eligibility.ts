/**
 * State Insurance Eligibility Data for F-1/OPT/STEM OPT Students
 * 
 * Based on comprehensive January 2026 research.
 * 
 * CRITICAL REALITY CHECK:
 * - NO STATE offers truly "free" health insurance to F-1/OPT students as primary benefit
 * - F-1/OPT students are non-immigrants with temporary status
 * - State Medicaid programs generally EXCLUDE non-immigrants from coverage
 * - PRIMARY RECOMMENDATION: University SHIP or Private International Student Insurance
 */

// 2026 Federal Poverty Level thresholds
export const FPL_2026 = {
    single: {
        fpl100: 15650,
        fpl138: 21597,
        fpl200: 31300,
        fpl250: 39125,
        fpl266: 41629,
    }
};

export type EligibilityStatus =
    | 'LIMITED_POSSIBLE'   // Very limited possibility (e.g., OR 19-25)
    | 'UNDER_19_ONLY'      // Only if under 19
    | 'PREGNANCY_ONLY'     // Only if pregnant
    | 'WAITLIST'           // Enrollment frozen (WA adults)
    | 'PROGRAM_ENDED'      // Program no longer available (MN)
    | 'EMERGENCY_ONLY'     // Emergency Medicaid only (most states)
    | 'NOT_ELIGIBLE';      // No state coverage available

export type StateTier = 'LIMITED' | 'EMERGENCY_ONLY';

export interface StateEligibilityConfig {
    programName: string;
    programLink: string;
    tier: StateTier;
    coverageUnder19: boolean;
    coveragePregnant: boolean;
    coverageAge19to25: 'possible' | 'waitlist' | 'ended' | 'no';
    coverageAge26plus: 'possible' | 'waitlist' | 'ended' | 'no';
    incomeLimitFPL: number;
    status2026: string; // Current status as of Jan 2026
    benefits: string[];
    importantNotes: string[];
    enrollmentStatus: 'active' | 'frozen' | 'ended' | 'limited';
}

// States with VERY LIMITED coverage options for F-1 students
// Based on January 2026 research - most states offer NO coverage
const LIMITED_STATES: Record<string, StateEligibilityConfig> = {
    CA: {
        programName: "Medi-Cal",
        programLink: "https://www.coveredca.com/",
        tier: 'LIMITED',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        status2026: "Enrollment FROZEN for adults 19+ starting Jan 1, 2026",
        benefits: [
            "Full-scope coverage for under 19",
            "Pregnancy coverage available",
            "Dental and vision (under 19)",
            "Mental health services"
        ],
        importantNotes: [
            "⚠️ Adults 19+ are NOT eligible as of January 2026",
            "Under 19 ONLY: Full eligibility under SB 75",
            "Pregnant: Full coverage + 12 months postpartum",
            "Emergency Medi-Cal available for all ages"
        ],
        enrollmentStatus: 'frozen',
    },
    OR: {
        programName: "Oregon Health Plan (Healthier Oregon)",
        programLink: "https://healthcare.oregon.gov/",
        tier: 'LIMITED',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to25: 'possible',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        status2026: "ACTIVE (F-1 qualification unclear)",
        benefits: [
            "$0 premium if eligible",
            "Medical care",
            "Dental services",
            "Mental health",
            "Vision care",
            "Prescription drugs"
        ],
        importantNotes: [
            "⚠️ F-1 student eligibility is UNCLEAR",
            "Ages 19-25 may qualify under Healthier Oregon",
            "Program doesn't explicitly exclude F-1 students",
            "Worth trying, but approval NOT guaranteed"
        ],
        enrollmentStatus: 'active',
    },
    WA: {
        programName: "Apple Health",
        programLink: "https://www.wahealthplanfinder.org/",
        tier: 'LIMITED',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to25: 'waitlist',
        coverageAge26plus: 'waitlist',
        incomeLimitFPL: 138,
        status2026: "WAITLIST for adults (enrollment cap reached July 2024)",
        benefits: [
            "$0 monthly cost if eligible",
            "Doctor & hospital care",
            "Prescriptions covered",
            "Mental health services"
        ],
        importantNotes: [
            "⚠️ Adult enrollment cap reached July 2024",
            "Under 19: NO CAP - still available",
            "Pregnant: NO CAP - still available",
            "Adults: Can join waitlist only"
        ],
        enrollmentStatus: 'frozen',
    },
    MN: {
        programName: "MinnesotaCare",
        programLink: "https://www.mnsure.org/",
        tier: 'LIMITED',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to25: 'ended',
        coverageAge26plus: 'ended',
        incomeLimitFPL: 200,
        status2026: "❌ ENDED Jan 1, 2026 for undocumented/non-resident adults 18+",
        benefits: [],
        importantNotes: [
            "❌ PROGRAM ENDED for adults as of January 1, 2026",
            "No longer available for non-resident adults 18+",
            "Children under 18 may still qualify",
            "Check state website for latest updates"
        ],
        enrollmentStatus: 'ended',
    },
    NY: {
        programName: "Essential Plan",
        programLink: "https://nystateofhealth.ny.gov/",
        tier: 'LIMITED',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to25: 'possible',
        coverageAge26plus: 'possible',
        incomeLimitFPL: 250, // Up to $39,000/year
        status2026: "ACTIVE for 'lawfully present' immigrants up to 250% FPL",
        benefits: [
            "$0 or low monthly premium",
            "No deductible",
            "Doctor visits covered",
            "Prescriptions included",
            "Mental health services"
        ],
        importantNotes: [
            "⚠️ Available for 'lawfully present' immigrants",
            "F-1 'lawfully present' status is UNCLEAR",
            "Income limit: ~$39,000/year (250% FPL)",
            "Worth applying if in New York"
        ],
        enrollmentStatus: 'active',
    },
};

// Tier 2: Children and pregnant coverage only (most expansion states)
const CHILDREN_PREGNANT_STATES = [
    'IL', 'MA', 'CO', 'CT', 'VT', 'NJ', 'ME', 'RI', 'UT', 'DC', 'MD'
];

// Non-expansion states (Emergency Medicaid ONLY)
const NON_EXPANSION_STATES = [
    'AL', 'FL', 'GA', 'KS', 'MS', 'SC', 'TN', 'TX', 'WI', 'WY'
];

// Emergency-only default config
const EMERGENCY_ONLY_DEFAULT: StateEligibilityConfig = {
    programName: "Emergency Medicaid",
    programLink: "",
    tier: 'EMERGENCY_ONLY',
    coverageUnder19: false,
    coveragePregnant: true,
    coverageAge19to25: 'no',
    coverageAge26plus: 'no',
    incomeLimitFPL: 0,
    status2026: "Emergency care only",
    benefits: [
        "Emergency medical conditions",
        "Emergency labor and delivery",
        "Severe injury or illness"
    ],
    importantNotes: [
        "100% FREE for emergencies only",
        "No application needed - automatic at hospital",
        "Does NOT cover routine care",
        "Consider University SHIP or private insurance"
    ],
    enrollmentStatus: 'active',
};

// Children/Pregnant only config
const CHILDREN_PREGNANT_CONFIG: StateEligibilityConfig = {
    programName: "State Medicaid",
    programLink: "",
    tier: 'LIMITED',
    coverageUnder19: true,
    coveragePregnant: true,
    coverageAge19to25: 'no',
    coverageAge26plus: 'no',
    incomeLimitFPL: 138,
    status2026: "Children and pregnant individuals only",
    benefits: [
        "Coverage for children under 19",
        "Pregnancy coverage regardless of status",
        "Preventive care for children"
    ],
    importantNotes: [
        "Adults 19+ are NOT eligible",
        "Children under 19: May qualify regardless of status",
        "Pregnant: Coverage available in most states",
        "Consider private insurance for adults"
    ],
    enrollmentStatus: 'limited',
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

// Get state configuration
export function getStateConfig(stateCode: string): StateEligibilityConfig {
    // Check specific limited states first
    if (LIMITED_STATES[stateCode]) {
        return LIMITED_STATES[stateCode];
    }

    // Check children/pregnant states
    if (CHILDREN_PREGNANT_STATES.includes(stateCode)) {
        return {
            ...CHILDREN_PREGNANT_CONFIG,
            programLink: getStateMedicaidLink(stateCode),
        };
    }

    // All other states: Emergency Medicaid only
    return EMERGENCY_ONLY_DEFAULT;
}

// Get Medicaid link by state
function getStateMedicaidLink(stateCode: string): string {
    const links: Record<string, string> = {
        IL: "https://abe.illinois.gov/",
        MA: "https://www.mass.gov/masshealth",
        CO: "https://www.healthfirstcolorado.com/",
        CT: "https://www.accesshealthct.com/",
        VT: "https://portal.healthconnect.vermont.gov/",
        NJ: "https://www.njfamilycare.org/",
        ME: "https://www.maine.gov/dhhs/ofi/programs-services/mainecare",
        RI: "https://healthyrhode.ri.gov/",
        UT: "https://medicaid.utah.gov/",
        DC: "https://dchealthlink.com/",
        MD: "https://www.marylandhealthconnection.gov/",
    };
    return links[stateCode] || "";
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
    primaryRecommendation: 'SHIP' | 'PRIVATE_INSURANCE' | 'EMPLOYER' | 'STATE_PROGRAM';
    warningMessage?: string;
}

export function calculateEligibility(params: EligibilityParams): EligibilityResult {
    const { stateCode, age, annualIncome, isPregnant, visaType } = params;
    const config = getStateConfig(stateCode);
    const incomeLimit = FPL_2026.single.fpl138;
    const isLowIncome = annualIncome <= incomeLimit;
    const stateName = STATE_NAMES[stateCode] || stateCode;

    // Base result - default to private insurance recommendation
    const baseResult: EligibilityResult = {
        status: 'NOT_ELIGIBLE',
        stateConfig: config,
        stateName,
        eligibilityReason: "",
        recommendedAction: "",
        showStateProgram: false,
        showEmergencyInfo: true,
        primaryRecommendation: visaType === 'F-1' ? 'SHIP' : 'PRIVATE_INSURANCE',
        warningMessage: "⚠️ State programs have very limited eligibility for F-1/OPT students. Private insurance is recommended.",
    };

    // Check for ended program (MN)
    if (config.enrollmentStatus === 'ended' && age >= 18) {
        return {
            ...baseResult,
            status: 'PROGRAM_ENDED',
            eligibilityReason: `${config.programName} coverage for adults ENDED as of January 1, 2026.`,
            recommendedAction: "Consider University SHIP or private international student insurance.",
            showStateProgram: true,
        };
    }

    // Emergency-only states
    if (config.tier === 'EMERGENCY_ONLY') {
        return {
            ...baseResult,
            status: 'EMERGENCY_ONLY',
            eligibilityReason: `${stateName} does not offer state-funded health coverage for F-1/OPT students.`,
            recommendedAction: "Consider University SHIP ($1,400-$4,500/yr) or private international student insurance ($372-$2,000/yr).",
            showStateProgram: false,
        };
    }

    // Check pregnancy first (highest priority)
    if (isPregnant && config.coveragePregnant && isLowIncome) {
        return {
            ...baseResult,
            status: 'PREGNANCY_ONLY',
            eligibilityReason: `Pregnant individuals may qualify for ${config.programName} regardless of immigration status.`,
            recommendedAction: `Apply for ${config.programName}. Coverage includes pregnancy + postpartum care.`,
            showStateProgram: true,
            primaryRecommendation: 'STATE_PROGRAM',
            warningMessage: undefined,
        };
    }

    // Check under 19
    if (age < 19 && config.coverageUnder19 && isLowIncome) {
        return {
            ...baseResult,
            status: 'UNDER_19_ONLY',
            eligibilityReason: `Children under 19 may qualify for ${config.programName} regardless of immigration status.`,
            recommendedAction: `Apply for ${config.programName}. Full coverage may be available.`,
            showStateProgram: true,
            primaryRecommendation: 'STATE_PROGRAM',
            warningMessage: undefined,
        };
    }

    // Oregon special case: 19-25 may qualify
    if (stateCode === 'OR' && age >= 19 && age <= 25 && isLowIncome) {
        return {
            ...baseResult,
            status: 'LIMITED_POSSIBLE',
            eligibilityReason: `Oregon's Healthier Oregon program may accept F-1 students ages 19-25. Eligibility is unclear.`,
            recommendedAction: `Worth applying to Oregon Health Plan, but have backup private insurance ready.`,
            showStateProgram: true,
            warningMessage: "⚠️ F-1 eligibility is NOT confirmed. Apply but prepare private insurance as backup.",
        };
    }

    // NY Essential Plan: lawfully present unclear
    if (stateCode === 'NY' && isLowIncome) {
        return {
            ...baseResult,
            status: 'LIMITED_POSSIBLE',
            eligibilityReason: `NY Essential Plan is available for "lawfully present" immigrants. F-1 status interpretation varies.`,
            recommendedAction: `Apply to NY Essential Plan. If denied, use private international student insurance.`,
            showStateProgram: true,
            warningMessage: "⚠️ 'Lawfully present' interpretation for F-1 students varies. Have backup plan ready.",
        };
    }

    // Washington waitlist
    if (stateCode === 'WA' && age >= 19 && isLowIncome) {
        return {
            ...baseResult,
            status: 'WAITLIST',
            eligibilityReason: `Apple Health adult enrollment is FROZEN since July 2024. Only waitlist available.`,
            recommendedAction: `Join waitlist if desired, but get private insurance NOW. Waitlist may take months/years.`,
            showStateProgram: true,
            warningMessage: "⚠️ Enrollment cap reached. Private insurance strongly recommended.",
        };
    }

    // California frozen for adults
    if (stateCode === 'CA' && age >= 19 && !isPregnant) {
        return {
            ...baseResult,
            status: 'NOT_ELIGIBLE',
            eligibilityReason: `Medi-Cal enrollment for adults 19+ is FROZEN as of January 2026.`,
            recommendedAction: "Consider University SHIP or private international student insurance (ISO, Compass).",
            showStateProgram: false,
            warningMessage: "❌ California Medi-Cal is NOT available for F-1/OPT adults 19+.",
        };
    }

    // Default: Not eligible for state program
    return {
        ...baseResult,
        status: 'NOT_ELIGIBLE',
        eligibilityReason: isLowIncome
            ? `F-1/OPT students in your age group are generally NOT eligible for state Medicaid programs.`
            : `Your income and immigration status make you ineligible for state Medicaid programs.`,
        recommendedAction: visaType === 'F-1'
            ? "Enroll in University SHIP (required by most schools) or purchase private international student insurance."
            : "Purchase private international student insurance (ISO, Compass) or get employer coverage if available.",
        showStateProgram: false,
    };
}
