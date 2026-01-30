export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            blocked_emails: {
                Row: {
                    deleted_at: string | null
                    email: string
                    id: string
                    reason: string | null
                }
                Insert: {
                    deleted_at?: string | null
                    email: string
                    id?: string
                    reason?: string | null
                }
                Update: {
                    deleted_at?: string | null
                    email?: string
                    id?: string
                    reason?: string | null
                }
                Relationships: []
            }
            case_status: {
                Row: {
                    case_type: string | null
                    created_at: string | null
                    current_status: string | null
                    id: string
                    last_checked_at: string | null
                    last_status_change_at: string | null
                    notifications_enabled: boolean | null
                    receipt_number: string
                    received_date: string | null
                    status_history: Json | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    case_type?: string | null
                    created_at?: string | null
                    current_status?: string | null
                    id?: string
                    last_checked_at?: string | null
                    last_status_change_at?: string | null
                    notifications_enabled?: boolean | null
                    receipt_number: string
                    received_date?: string | null
                    status_history?: Json | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    case_type?: string | null
                    created_at?: string | null
                    current_status?: string | null
                    id?: string
                    last_checked_at?: string | null
                    last_status_change_at?: string | null
                    notifications_enabled?: boolean | null
                    receipt_number: string
                    received_date?: string | null
                    status_history?: Json | null
                    updated_at?: string | null
                    user_id: string
                }
                Relationships: []
            }
            h1b_sponsors: {
                Row: {
                    approvals_2021: number
                    approvals_2022: number
                    approvals_2023: number
                    approvals_2024: number
                    approvals_2025: number
                    common_roles: Json
                    created_at: string | null
                    h1b_dependent: boolean | null
                    id: string
                    industry: string
                    location: string
                    name: string
                    size: string
                    sponsorship_strength: string
                    total_approvals: number | null
                    updated_at: string | null
                    website: string
                    careers_url: string | null
                    address_line1: string | null
                    city: string | null
                    state: string | null
                    is_virtual_office: boolean | null
                    top_law_firm: string | null
                    entry_level_percent: number | null
                }
                Insert: {
                    approvals_2021?: number
                    approvals_2022?: number
                    approvals_2023?: number
                    approvals_2024?: number
                    approvals_2025?: number
                    common_roles?: Json
                    created_at?: string | null
                    h1b_dependent?: boolean | null
                    id: string
                    industry: string
                    location: string
                    name: string
                    size: string
                    sponsorship_strength: string
                    total_approvals?: number | null
                    updated_at?: string | null
                    website: string
                    careers_url?: string | null
                    address_line1?: string | null
                    city?: string | null
                    state?: string | null
                    is_virtual_office?: boolean | null
                    top_law_firm?: string | null
                    entry_level_percent?: number | null
                }
                Update: {
                    approvals_2021?: number
                    approvals_2022?: number
                    approvals_2023?: number
                    approvals_2024?: number
                    approvals_2025?: number
                    common_roles?: Json
                    created_at?: string | null
                    h1b_dependent?: boolean | null
                    id?: string
                    industry?: string
                    location?: string
                    name?: string
                    size?: string
                    sponsorship_strength?: string
                    total_approvals?: number | null
                    updated_at?: string | null
                    website?: string
                    careers_url?: string | null
                    address_line1?: string | null
                    city?: string | null
                    state?: string | null
                    is_virtual_office?: boolean | null
                    top_law_firm?: string | null
                    entry_level_percent?: number | null
                }
                Relationships: []
            }
            h1b_filings: {
                Row: {
                    agent_attorney_email: string | null
                    agent_attorney_name: string | null
                    begin_date: string | null
                    case_number: string
                    created_at: string | null
                    decision_date: string | null
                    employer_address1: string | null
                    employer_address2: string | null
                    employer_city: string | null
                    employer_country: string | null
                    employer_name: string | null
                    employer_phone: string | null
                    employer_poc_email: string | null
                    employer_poc_name: string | null
                    employer_postal_code: string | null
                    employer_state: string | null
                    end_date: string | null
                    full_time_position: string | null
                    id: string
                    job_title: string | null
                    lawfirm_name: string | null
                    naics_code: string | null
                    original_cert_date: string | null
                    prevailing_wage: number | null
                    pw_source: string | null
                    pw_source_year: number | null
                    pw_unit: string | null
                    pw_wage_level: string | null
                    received_date: string | null
                    secondary_entity: string | null
                    secondary_entity_business_name: string | null
                    soc_code: string | null
                    soc_title: string | null
                    sponsor_id: string | null
                    status: string | null
                    total_workers: number | null
                    visa_class: string | null
                    wage_rate_from: number | null
                    wage_rate_to: number | null
                    wage_unit: string | null
                    worksite_address1: string | null
                    worksite_address2: string | null
                    worksite_city: string | null
                    worksite_county: string | null
                    worksite_postal_code: string | null
                    worksite_state: string | null
                    worksite_workers: number | null
                    trade_name_dba: string | null
                    employer_poc_job_title: string | null
                    employer_poc_phone: string | null
                    employer_poc_phone_ext: string | null
                    employer_poc_address1: string | null
                    employer_poc_address2: string | null
                    employer_poc_city: string | null
                    employer_poc_state: string | null
                    employer_poc_postal_code: string | null
                    employer_poc_country: string | null
                    employer_poc_province: string | null
                    lawfirm_business_fein: string | null
                    state_of_highest_court: string | null
                    name_of_highest_state_court: string | null
                    agent_representing_employer: string | null
                    new_employment: number | null
                    continued_employment: number | null
                    change_previous_employment: number | null
                    new_concurrent_employment: number | null
                    change_employer: number | null
                    amended_petition: number | null
                    h_1b_dependent: string | null
                    willful_violator: string | null
                    support_h1b: string | null
                    appendix_a_attached: string | null
                    public_disclosure: string | null
                    preparer_last_name: string | null
                    preparer_first_name: string | null
                    preparer_middle_initial: string | null
                    preparer_business_name: string | null
                    preparer_email: string | null
                    total_worksite_locations: number | null
                    agree_to_lc_statement: string | null
                    statutory_basis: string | null
                    agent_attorney_city: string | null
                    agent_attorney_state: string | null
                    agent_attorney_postal_code: string | null
                    agent_attorney_phone: string | null
                    agent_attorney_phone_ext: string | null
                    agent_attorney_country: string | null
                    agent_attorney_province: string | null
                    employer_phone_ext: string | null
                    employer_fein: string | null
                    employer_province: string | null
                    agent_attorney_address1: string | null
                    agent_attorney_address2: string | null
                    pw_other_source: string | null
                    pw_other_year: number | null
                    pw_survey_publisher: string | null
                    pw_survey_name: string | null
                    pw_tracking_number: string | null
                }
                Insert: {
                    agent_attorney_email?: string | null
                    agent_attorney_name?: string | null
                    begin_date?: string | null
                    case_number: string
                    created_at?: string | null
                    decision_date?: string | null
                    employer_address1?: string | null
                    employer_address2?: string | null
                    employer_city?: string | null
                    employer_country?: string | null
                    employer_name?: string | null
                    employer_phone?: string | null
                    employer_poc_email?: string | null
                    employer_poc_name?: string | null
                    employer_postal_code?: string | null
                    employer_state?: string | null
                    end_date?: string | null
                    full_time_position?: string | null
                    id?: string
                    job_title?: string | null
                    lawfirm_name?: string | null
                    naics_code?: string | null
                    original_cert_date?: string | null
                    prevailing_wage?: number | null
                    pw_source?: string | null
                    pw_source_year?: number | null
                    pw_unit?: string | null
                    pw_wage_level?: string | null
                    received_date?: string | null
                    secondary_entity?: string | null
                    secondary_entity_business_name?: string | null
                    soc_code?: string | null
                    soc_title?: string | null
                    sponsor_id?: string | null
                    status?: string | null
                    total_workers?: number | null
                    visa_class?: string | null
                    wage_rate_from?: number | null
                    wage_rate_to?: number | null
                    wage_unit?: string | null
                    worksite_address1?: string | null
                    worksite_address2?: string | null
                    worksite_city?: string | null
                    worksite_county?: string | null
                    worksite_postal_code?: string | null
                    worksite_state?: string | null
                    worksite_workers?: number | null
                }
                Update: {
                    agent_attorney_email?: string | null
                    agent_attorney_name?: string | null
                    begin_date?: string | null
                    case_number?: string
                    created_at?: string | null
                    decision_date?: string | null
                    employer_address1?: string | null
                    employer_address2?: string | null
                    employer_city?: string | null
                    employer_country?: string | null
                    employer_name?: string | null
                    employer_phone?: string | null
                    employer_poc_email?: string | null
                    employer_poc_name?: string | null
                    employer_postal_code?: string | null
                    employer_state?: string | null
                    end_date?: string | null
                    full_time_position?: string | null
                    id?: string
                    job_title?: string | null
                    lawfirm_name?: string | null
                    naics_code?: string | null
                    original_cert_date?: string | null
                    prevailing_wage?: number | null
                    pw_source?: string | null
                    pw_source_year?: number | null
                    pw_unit?: string | null
                    pw_wage_level?: string | null
                    received_date?: string | null
                    secondary_entity?: string | null
                    secondary_entity_business_name?: string | null
                    soc_code?: string | null
                    soc_title?: string | null
                    sponsor_id?: string | null
                    status?: string | null
                    total_workers?: number | null
                    visa_class?: string | null
                    wage_rate_from?: number | null
                    wage_rate_to?: number | null
                    wage_unit?: string | null
                    worksite_address1?: string | null
                    worksite_address2?: string | null
                    worksite_city?: string | null
                    worksite_county?: string | null
                    worksite_postal_code?: string | null
                    worksite_state?: string | null
                    worksite_workers?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "h1b_filings_sponsor_id_fkey"
                        columns: ["sponsor_id"]
                        isOneToOne: false
                        referencedRelation: "h1b_sponsors"
                        referencedColumns: ["id"]
                    }
                ]
            }
            job_tracker: {
                Row: {
                    company: string
                    created_at: string | null
                    date_applied: string
                    id: string
                    job_title: string
                    location: string | null
                    notes: string | null
                    salary_range: string | null
                    status: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    company: string
                    created_at?: string | null
                    date_applied: string
                    id?: string
                    job_title: string
                    location?: string | null
                    notes?: string | null
                    salary_range?: string | null
                    status: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    company?: string
                    created_at?: string | null
                    date_applied?: string
                    id?: string
                    job_title?: string
                    location?: string | null
                    notes?: string | null
                    salary_range?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id: string
                }
                Relationships: []
            }
            opt_timeline: {
                Row: {
                    created_at: string | null
                    end_date: string
                    id: string
                    notes: string | null
                    start_date: string
                    status: string
                    title: string
                    type: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    end_date: string
                    id?: string
                    notes?: string | null
                    start_date: string
                    status: string
                    title: string
                    type: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    end_date?: string
                    id?: string
                    notes?: string | null
                    start_date?: string
                    status?: string
                    title?: string
                    type?: string
                    updated_at?: string | null
                    user_id: string
                }
                Relationships: []
            }
            phishing_scenarios: {
                Row: {
                    correct_answer: boolean
                    created_at: string | null
                    description: string
                    difficulty: string
                    explanation: string
                    id: string
                    scenario_text: string
                    title: string
                }
                Insert: {
                    correct_answer: boolean
                    created_at?: string | null
                    description: string
                    difficulty: string
                    explanation: string
                    id?: string
                    scenario_text: string
                    title: string
                }
                Update: {
                    correct_answer?: boolean
                    created_at?: string | null
                    description?: string
                    difficulty?: string
                    explanation?: string
                    id?: string
                    scenario_text?: string
                    title?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    full_name: string | null
                    id: string
                    updated_at: string | null
                    username: string | null
                    website: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    full_name?: string | null
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    website?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    full_name?: string | null
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    website?: string | null
                }
                Relationships: []
            }
            university_deadlines: {
                Row: {
                    created_at: string | null
                    deadline_date: string
                    description: string | null
                    id: string
                    is_active: boolean | null
                    program_name: string | null
                    term: string
                    title: string
                    university_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    deadline_date: string
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    program_name?: string | null
                    term: string
                    title: string
                    university_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    deadline_date?: string
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    program_name?: string | null
                    term?: string
                    title?: string
                    university_id?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            user_quiz_results: {
                Row: {
                    completed_at: string | null
                    id: string
                    scenario_id: string
                    user_answer: boolean
                    user_id: string
                }
                Insert: {
                    completed_at?: string | null
                    id?: string
                    scenario_id: string
                    user_answer: boolean
                    user_id: string
                }
                Update: {
                    completed_at?: string | null
                    id?: string
                    scenario_id?: string
                    user_answer?: boolean
                    user_id: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_quiz_results_scenario_id_fkey"
                        columns: ["scenario_id"]
                        isOneToOne: false
                        referencedRelation: "phishing_scenarios"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
