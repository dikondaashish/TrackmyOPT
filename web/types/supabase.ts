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
                }
                Insert: {
                    approvals_2021?: number
                    approvals_2022?: number
                    approvals_2023?: number
                    approvals_2024?: number
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
                }
                Update: {
                    approvals_2021?: number
                    approvals_2022?: number
                    approvals_2023?: number
                    approvals_2024?: number
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
                }
                Relationships: []
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
