export type EVerifyStatus = "enrolled" | "terminated" | "suspended";

export interface EVerifyEmployerRecord {
  employer_name: string;
  dba_name: string | null;
  status: EVerifyStatus;
  enrollment_date: string | null;
  termination_date: string | null;
  workforce_size_band: string | null;
  hiring_site_states: string[];
}

export interface EVerifyLookupResponse {
  company: string;
  found: boolean;
  employer_name: string | null;
  dba_name: string | null;
  status: EVerifyStatus | null;
  enrollment_date: string | null;
  termination_date: string | null;
  workforce_size_band: string | null;
  hiring_site_states: string[];
  source: "cache" | "live";
  last_checked: string;
  message?: string;
}

export interface CachedEVerifyLookup {
  company: string;
  found: boolean;
  employer_name: string | null;
  dba_name: string | null;
  status: EVerifyStatus | null;
  enrollment_date: string | null;
  termination_date: string | null;
  workforce_size_band: string | null;
  hiring_site_states: string[];
  cached_at: string;
  message?: string;
}

export interface EVerifyUnavailableResponse {
  company: string;
  found: false;
  error: "lookup_unavailable";
  message: string;
}
