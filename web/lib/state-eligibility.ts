/**
 * State Insurance Eligibility Data for F-1/OPT/STEM OPT Students
 * 
 * Based on January 2026 research data.
 * 
 * CRITICAL: F-1 students are NOT eligible for federal Medicaid/CHIP.
 * Only state-funded programs in specific states may provide coverage.
 */

// 2026 Federal Poverty Level thresholds
export const FPL_2026 = {
    single: {
        fpl100: 15650,
        fpl138: 21597,
        fpl200: 31300,
        fpl266: 41629,
        fpl305: 47733,
        fpl318: 49767,
    }
};

export type EligibilityStatus =
    | 'FREE_ELIGIBLE'      // Fully eligible for free coverage
    | 'POSSIBLY_ELIGIBLE'  // Worth applying (e.g., OR 19-25)
    | 'WAITLIST'           // Enrollment frozen (WA adults)
    | 'PREGNANCY_ELIGIBLE' // Eligible because pregnant
    | 'UNDER_19_ELIGIBLE'  // Eligible because under 19
    | 'EMERGENCY_ONLY'     // Emergency Medicaid only
    | 'NOT_ELIGIBLE';      // No state coverage available

export type StateTier = 'TIER_1' | 'TIER_2' | 'EMERGENCY_ONLY';

export interface StateEligibilityConfig {
    programName: string;
    programLink: string;
    tier: StateTier;
    coverageUnder19: boolean;
    coveragePregnant: boolean;
    coverageAge19to21: 'yes' | 'possible' | 'waitlist' | 'no';
    coverageAge19to25: 'yes' | 'possible' | 'waitlist' | 'no';
    coverageAge26plus: 'yes' | 'possible' | 'waitlist' | 'no';
    incomeLimitFPL: number; // e.g., 138 for 138% FPL
    benefits: string[];
    importantNotes?: string[];
    enrollmentStatus?: 'open' | 'frozen' | 'limited';
}

// Tier 1: Best options for F-1 students
const TIER_1_STATES: Record<string, StateEligibilityConfig> = {
    CA: {
        programName: "Medi-Cal",
        programLink: "https://www.coveredca.com/",
        tier: 'TIER_1',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'possible', // Gray area per research
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: [
            "$0 monthly premium",
            "Full medical coverage (if eligible)",
            "Dental care included",
            "Vision coverage",
            "Mental health services",
            "Prescription drugs"
        ],
        importantNotes: [
            "As of Jan 2026, new enrollments frozen for undocumented adults 19+",
            "Under 19: Full eligibility under SB 75",
            "Age 19+: Emergency or pregnancy-only unless under 21 (gray area)",
            "Pregnant: Full coverage + 12 months postpartum"
        ],
        enrollmentStatus: 'limited',
    },
    OR: {
        programName: "Oregon Health Plan (Healthier Oregon)",
        programLink: "https://healthcare.oregon.gov/",
        tier: 'TIER_1',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'possible',
        coverageAge19to25: 'possible', // OHP doesn't explicitly exclude F-1 for 19-25
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: [
            "$0 premium",
            "Medical care",
            "Dental services",
            "Mental health",
            "Vision care",
            "Prescription drugs",
            "Transportation to appointments"
        ],
        importantNotes: [
            "Healthier Oregon: Ages 19-25 may qualify",
            "Program doesn't explicitly exclude F-1 students in 19-25 range",
            "Worth applying even with F-1 status",
            "Under 19 and 55+: Higher eligibility"
        ],
        enrollmentStatus: 'open',
    },
    WA: {
        programName: "Apple Health",
        programLink: "https://www.wahealthplanfinder.org/",
        tier: 'TIER_1',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'waitlist',
        coverageAge19to25: 'waitlist',
        coverageAge26plus: 'waitlist',
        incomeLimitFPL: 138,
        benefits: [
            "$0 monthly cost",
            "Doctor & hospital care",
            "Prescriptions covered",
            "Mental health services",
            "Preventive care",
            "Maternity care"
        ],
        importantNotes: [
            "Enrollment cap of 13,000 reached in July 2024",
            "Adults: Currently on WAITLIST",
            "Children under 19: NO CAP - still available",
            "Pregnant: NO CAP - still available",
            "Applications still accepted for waitlist"
        ],
        enrollmentStatus: 'frozen',
    },
};

// Tier 2: Children and pregnant coverage only
const TIER_2_STATES: Record<string, StateEligibilityConfig> = {
    IL: {
        programName: "All Kids / Medicaid",
        programLink: "https://abe.illinois.gov/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 318, // Up to 318% for children
        benefits: ["$0 monthly cost", "Doctor visits", "Hospital care", "Lab tests", "Prescriptions", "Preventive care"],
        importantNotes: ["All Kids covers children up to 318% FPL regardless of immigration status"],
    },
    MA: {
        programName: "MassHealth",
        programLink: "https://www.mass.gov/masshealth",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["$0 monthly premium", "Comprehensive medical", "Dental coverage", "Vision care", "Behavioral health", "Prescription drugs"],
        importantNotes: ["3 months retroactive coverage as of Jan 2026"],
    },
    NY: {
        programName: "Child Health Plus / Essential Plan",
        programLink: "https://nystateofhealth.ny.gov/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'possible', // Essential Plan for "lawfully present"
        coverageAge19to25: 'possible',
        coverageAge26plus: 'possible',
        incomeLimitFPL: 200,
        benefits: ["$0 monthly premium", "No deductible", "Doctor visits covered", "Prescriptions included", "Mental health services", "Dental & vision care"],
        importantNotes: ["Essential Plan available for 'lawfully present' - F-1 status unclear", "Child Health Plus: 100% FREE for children"],
    },
    MN: {
        programName: "MinnesotaCare",
        programLink: "https://www.mnsure.org/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'possible',
        coverageAge19to25: 'possible',
        coverageAge26plus: 'possible',
        incomeLimitFPL: 200,
        benefits: ["Low-cost coverage", "Doctor visits", "Hospital care", "Prescriptions", "Mental health", "Dental & vision"],
        importantNotes: ["Coverage up to 200% FPL regardless of immigration status", "F-1 eligibility uncertain but program doesn't explicitly exclude"],
    },
    CO: {
        programName: "Health First Colorado",
        programLink: "https://www.healthfirstcolorado.com/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["$0 premium", "Primary care", "Specialist care", "Hospital services", "Prescriptions", "Mental health"],
    },
    CT: {
        programName: "HUSKY Health",
        programLink: "https://www.accesshealthct.com/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["$0 premium", "Primary care", "Specialist visits", "Hospital care", "Mental health", "Prescriptions"],
    },
    VT: {
        programName: "Green Mountain Care",
        programLink: "https://portal.healthconnect.vermont.gov/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["$0 monthly cost", "Doctor visits", "Hospital care", "Prescriptions", "Mental health", "Preventive care"],
    },
    NJ: {
        programName: "NJ FamilyCare",
        programLink: "https://www.njfamilycare.org/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["$0 premium option", "Medical care", "Dental services", "Prescriptions", "Mental health", "Hospital care"],
    },
    ME: {
        programName: "MaineCare",
        programLink: "https://www.maine.gov/dhhs/ofi/programs-services/mainecare",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["$0 premium", "Medical care", "Prescriptions", "Mental health", "Preventive care"],
    },
    RI: {
        programName: "RIte Care",
        programLink: "https://healthyrhode.ri.gov/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["$0 premium", "Medical care", "Dental", "Prescriptions", "Mental health"],
    },
    UT: {
        programName: "Utah Medicaid",
        programLink: "https://medicaid.utah.gov/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["$0 premium", "Medical care", "Prescriptions", "Mental health", "Preventive care"],
    },
    DC: {
        programName: "DC Health Link",
        programLink: "https://dchealthlink.com/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["Affordable plans", "Primary care", "Specialist visits", "Prescriptions", "Preventive care", "Mental health"],
    },
    MD: {
        programName: "Maryland Health Connection",
        programLink: "https://www.marylandhealthconnection.gov/",
        tier: 'TIER_2',
        coverageUnder19: true,
        coveragePregnant: true,
        coverageAge19to21: 'no',
        coverageAge19to25: 'no',
        coverageAge26plus: 'no',
        incomeLimitFPL: 138,
        benefits: ["Low-cost plans", "Doctor visits", "Prescriptions", "Preventive care", "Mental health", "Hospital services"],
    },
};

// All other states: Emergency Medicaid only
const EMERGENCY_ONLY_DEFAULT: StateEligibilityConfig = {
    programName: "Emergency Medicaid",
    programLink: "",
    tier: 'EMERGENCY_ONLY',
    coverageUnder19: false,
    coveragePregnant: true, // Emergency labor/delivery covered
    coverageAge19to21: 'no',
    coverageAge19to25: 'no',
    coverageAge26plus: 'no',
    incomeLimitFPL: 0,
    benefits: [
        "Emergency medical conditions",
        "Emergency labor and delivery",
        "Severe injury or illness"
    ],
    importantNotes: [
        "100% FREE for emergencies",
        "No application needed - automatic at hospital",
        "Does NOT cover routine care"
    ],
};

// Get state configuration
export function getStateConfig(stateCode: string): StateEligibilityConfig {
    if (TIER_1_STATES[stateCode]) return TIER_1_STATES[stateCode];
    if (TIER_2_STATES[stateCode]) return TIER_2_STATES[stateCode];
    return EMERGENCY_ONLY_DEFAULT;
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
    showPublicChargeWarning: boolean;
}

export function calculateEligibility(params: EligibilityParams): EligibilityResult {
    const { stateCode, age, annualIncome, isPregnant } = params;
    const config = getStateConfig(stateCode);
    const incomeLimit = FPL_2026.single.fpl138;
    const isLowIncome = annualIncome <= incomeLimit;

    // State names
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
    const stateName = STATE_NAMES[stateCode] || stateCode;

    // Base result
    const baseResult: EligibilityResult = {
        status: 'NOT_ELIGIBLE',
        stateConfig: config,
        stateName,
        eligibilityReason: "",
        recommendedAction: "",
        showStateProgram: false,
        showEmergencyInfo: true,
        showPublicChargeWarning: true,
    };

    // Emergency-only states
    if (config.tier === 'EMERGENCY_ONLY') {
        return {
            ...baseResult,
            status: 'EMERGENCY_ONLY',
            eligibilityReason: `${stateName} does not offer state-funded health coverage for F-1 students.`,
            recommendedAction: "Consider private insurance plans. Emergency Medicaid is available for emergencies.",
            showStateProgram: false,
        };
    }

    // Check pregnancy first (highest priority)
    if (isPregnant && config.coveragePregnant && isLowIncome) {
        return {
            ...baseResult,
            status: 'PREGNANCY_ELIGIBLE',
            eligibilityReason: `Pregnant individuals qualify for ${config.programName} regardless of immigration status.`,
            recommendedAction: `Apply for ${config.programName} immediately. Coverage includes pregnancy + 12 months postpartum.`,
            showStateProgram: true,
        };
    }

    // Check under 19
    if (age < 19 && config.coverageUnder19 && isLowIncome) {
        return {
            ...baseResult,
            status: 'UNDER_19_ELIGIBLE',
            eligibilityReason: `Children under 19 qualify for ${config.programName} regardless of immigration status.`,
            recommendedAction: `Apply for ${config.programName}. Full coverage available.`,
            showStateProgram: true,
        };
    }

    // Age 19-21
    if (age >= 19 && age <= 21 && isLowIncome) {
        if (config.coverageAge19to21 === 'yes') {
            return {
                ...baseResult,
                status: 'FREE_ELIGIBLE',
                eligibilityReason: `Adults 19-21 may qualify for ${config.programName}.`,
                recommendedAction: `Apply for ${config.programName}.`,
                showStateProgram: true,
            };
        }
        if (config.coverageAge19to21 === 'possible') {
            return {
                ...baseResult,
                status: 'POSSIBLY_ELIGIBLE',
                eligibilityReason: `${config.programName} may accept F-1 students in the 19-21 age range. Worth applying.`,
                recommendedAction: `Submit an application to ${config.programName}. Eligibility is not guaranteed but worth trying.`,
                showStateProgram: true,
            };
        }
        if (config.coverageAge19to21 === 'waitlist') {
            return {
                ...baseResult,
                status: 'WAITLIST',
                eligibilityReason: `${config.programName} enrollment is currently frozen. You can join the waitlist.`,
                recommendedAction: `Submit an application to be added to the waitlist. Consider private insurance in the meantime.`,
                showStateProgram: true,
            };
        }
    }

    // Age 19-25
    if (age >= 19 && age <= 25 && isLowIncome) {
        if (config.coverageAge19to25 === 'yes') {
            return {
                ...baseResult,
                status: 'FREE_ELIGIBLE',
                eligibilityReason: `Adults 19-25 may qualify for ${config.programName}.`,
                recommendedAction: `Apply for ${config.programName}.`,
                showStateProgram: true,
            };
        }
        if (config.coverageAge19to25 === 'possible') {
            return {
                ...baseResult,
                status: 'POSSIBLY_ELIGIBLE',
                eligibilityReason: `${config.programName} may accept F-1 students ages 19-25. The program doesn't explicitly exclude F-1 visa holders.`,
                recommendedAction: `Apply to ${config.programName}. Even if F-1 isn't explicitly covered, it's worth trying.`,
                showStateProgram: true,
            };
        }
        if (config.coverageAge19to25 === 'waitlist') {
            return {
                ...baseResult,
                status: 'WAITLIST',
                eligibilityReason: `${config.programName} enrollment is currently frozen. Applications for waitlist still accepted.`,
                recommendedAction: `Submit an application to be added to the waitlist. Get private insurance while waiting.`,
                showStateProgram: true,
            };
        }
    }

    // Age 26+
    if (age >= 26 && isLowIncome) {
        if (config.coverageAge26plus === 'yes') {
            return {
                ...baseResult,
                status: 'FREE_ELIGIBLE',
                eligibilityReason: `Adults 26+ may qualify for ${config.programName}.`,
                recommendedAction: `Apply for ${config.programName}.`,
                showStateProgram: true,
            };
        }
        if (config.coverageAge26plus === 'possible') {
            return {
                ...baseResult,
                status: 'POSSIBLY_ELIGIBLE',
                eligibilityReason: `${config.programName} may accept applications from adults 26+.`,
                recommendedAction: `Try applying to ${config.programName}. Consider private insurance as backup.`,
                showStateProgram: true,
            };
        }
        if (config.coverageAge26plus === 'waitlist') {
            return {
                ...baseResult,
                status: 'WAITLIST',
                eligibilityReason: `${config.programName} enrollment for adults is currently frozen.`,
                recommendedAction: `Join the waitlist. Private insurance recommended while waiting.`,
                showStateProgram: true,
            };
        }
    }

    // Default: Not eligible for state program
    return {
        ...baseResult,
        status: 'NOT_ELIGIBLE',
        eligibilityReason: isLowIncome
            ? `F-1 students in your age group (${age}) are not eligible for ${config.programName}.`
            : `Your income exceeds the eligibility threshold for ${config.programName}.`,
        recommendedAction: "Consider private insurance plans from our trusted partners.",
        showStateProgram: false,
    };
}
