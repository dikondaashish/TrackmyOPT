export type JourneyStatus = "applying_opt" | "on_opt" | "stem_opt" | null;

export type WizardStep =
  | "welcome"
  | "course"
  | "status"
  | "dates"
  | "receipt"
  | "finishing";
