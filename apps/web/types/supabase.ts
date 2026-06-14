export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
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
          change_log: Json | null
          consecutive_failures: number
          created_at: string | null
          current_status: string | null
          id: string
          last_check_error_code: string | null
          last_check_error_message: string | null
          last_check_failed_at: string | null
          last_checked_at: string | null
          last_status_change_at: string | null
          last_status_viewed_at: string | null
          status_last_changed_at: string | null
          last_change_alert_suppressed: boolean
          notifications_enabled: boolean | null
          receipt_number: string
          received_date: string | null
          is_primary: boolean
          label: string | null
          status_history: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          case_type?: string | null
          change_log?: Json | null
          consecutive_failures?: number
          created_at?: string | null
          current_status?: string | null
          id?: string
          last_check_error_code?: string | null
          last_check_error_message?: string | null
          last_check_failed_at?: string | null
          last_checked_at?: string | null
          last_status_change_at?: string | null
          last_status_viewed_at?: string | null
          status_last_changed_at?: string | null
          last_change_alert_suppressed?: boolean
          notifications_enabled?: boolean | null
          receipt_number: string
          received_date?: string | null
          is_primary?: boolean
          label?: string | null
          status_history?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          case_type?: string | null
          change_log?: Json | null
          consecutive_failures?: number
          created_at?: string | null
          current_status?: string | null
          id?: string
          last_check_error_code?: string | null
          last_check_error_message?: string | null
          last_check_failed_at?: string | null
          last_checked_at?: string | null
          last_status_change_at?: string | null
          last_status_viewed_at?: string | null
          status_last_changed_at?: string | null
          last_change_alert_suppressed?: boolean
          notifications_enabled?: boolean | null
          receipt_number?: string
          received_date?: string | null
          is_primary?: boolean
          label?: string | null
          status_history?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_passcodes: {
        Row: {
          auto_lock_timeout: number | null
          created_at: string | null
          failed_attempts: number | null
          id: string
          locked_until: string | null
          lockout_duration: number | null
          passcode_hash: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_lock_timeout?: number | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          locked_until?: string | null
          lockout_duration?: number | null
          passcode_hash: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_lock_timeout?: number | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          locked_until?: string | null
          lockout_duration?: number | null
          passcode_hash?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_reminders: {
        Row: {
          created_at: string | null
          document_id: string
          email_sent: boolean | null
          id: string
          notification_sent: boolean | null
          reminder_message: string
          reminder_type: string
          send_at: string
          sent_at: string | null
          sms_sent: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          email_sent?: boolean | null
          id?: string
          notification_sent?: boolean | null
          reminder_message: string
          reminder_type: string
          send_at: string
          sent_at?: string | null
          sms_sent?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          email_sent?: boolean | null
          id?: string
          notification_sent?: boolean | null
          reminder_message?: string
          reminder_type?: string
          send_at?: string
          sent_at?: string | null
          sms_sent?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_reminders_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_analysis_date: string | null
          ai_analyzed: boolean | null
          ai_confidence: number | null
          category: string | null
          created_at: string | null
          deleted_at: string | null
          document_type: string
          expiry_date: string | null
          extracted_fields: Json | null
          extracted_text: string | null
          file_name: string
          file_size: number
          file_type: string
          filename: string
          id: string
          issue_date: string | null
          notes: string | null
          raw_ocr_text: string | null
          s3_bucket: string
          s3_key: string
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis_date?: string | null
          ai_analyzed?: boolean | null
          ai_confidence?: number | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document_type: string
          expiry_date?: string | null
          extracted_fields?: Json | null
          extracted_text?: string | null
          file_name: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          raw_ocr_text?: string | null
          s3_bucket: string
          s3_key: string
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis_date?: string | null
          ai_analyzed?: boolean | null
          ai_confidence?: number | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string
          expiry_date?: string | null
          extracted_fields?: Json | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          raw_ocr_text?: string | null
          s3_bucket?: string
          s3_key?: string
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          created_at: string | null
          email_address: string
          email_enabled: boolean | null
          email_verified: boolean | null
          id: string
          opt_apply_reminders: boolean | null
          opt_clock_reminders: boolean | null
          stem_apply_reminders: boolean | null
          stem_clock_reminders: boolean | null
          updated_at: string | null
          user_id: string
          verification_sent_at: string | null
          verification_token: string | null
        }
        Insert: {
          created_at?: string | null
          email_address: string
          email_enabled?: boolean | null
          email_verified?: boolean | null
          id?: string
          opt_apply_reminders?: boolean | null
          opt_clock_reminders?: boolean | null
          stem_apply_reminders?: boolean | null
          stem_clock_reminders?: boolean | null
          updated_at?: string | null
          user_id: string
          verification_sent_at?: string | null
          verification_token?: string | null
        }
        Update: {
          created_at?: string | null
          email_address?: string
          email_enabled?: boolean | null
          email_verified?: boolean | null
          id?: string
          opt_apply_reminders?: boolean | null
          opt_clock_reminders?: boolean | null
          stem_apply_reminders?: boolean | null
          stem_clock_reminders?: boolean | null
          updated_at?: string | null
          user_id?: string
          verification_sent_at?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          body_html: string | null
          body_text: string | null
          clicked_at: string | null
          created_at: string | null
          email_address: string
          email_data: Json | null
          email_subject: string | null
          email_type: string
          error_message: string | null
          id: string
          opened_at: string | null
          provider_message_id: string | null
          retry_count: number
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email_address: string
          email_data?: Json | null
          email_subject?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_message_id?: string | null
          retry_count?: number
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email_address?: string
          email_data?: Json | null
          email_subject?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_message_id?: string | null
          retry_count?: number
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      employment_spans: {
        Row: {
          created_at: string | null
          employer_name: string | null
          end_date: string | null
          id: string
          start_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          employer_name?: string | null
          end_date?: string | null
          id?: string
          start_date: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          employer_name?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      export_otps: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          locked_until: string | null
          otp_hash: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          locked_until?: string | null
          otp_hash: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          locked_until?: string | null
          otp_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      extension_uninstall_feedback: {
        Row: {
          additional_feedback: string
          created_at: string
          follow_up_answers: Json
          id: string
          ip_address: string | null
          reasons: Json
          sub_options: Json
          submitted_at: string
          user_agent: string | null
        }
        Insert: {
          additional_feedback?: string
          created_at?: string
          follow_up_answers?: Json
          id?: string
          ip_address?: string | null
          reasons?: Json
          sub_options?: Json
          submitted_at?: string
          user_agent?: string | null
        }
        Update: {
          additional_feedback?: string
          created_at?: string
          follow_up_answers?: Json
          id?: string
          ip_address?: string | null
          reasons?: Json
          sub_options?: Json
          submitted_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      h1b_filings: {
        Row: {
          agent_attorney_address1: string | null
          agent_attorney_address2: string | null
          agent_attorney_city: string | null
          agent_attorney_country: string | null
          agent_attorney_email: string | null
          agent_attorney_name: string | null
          agent_attorney_phone: string | null
          agent_attorney_phone_ext: string | null
          agent_attorney_postal_code: string | null
          agent_attorney_province: string | null
          agent_attorney_state: string | null
          agent_representing_employer: string | null
          agree_to_lc_statement: string | null
          amended_petition: number | null
          appendix_a_attached: string | null
          begin_date: string | null
          case_number: string
          change_employer: number | null
          change_previous_employment: number | null
          continued_employment: number | null
          created_at: string | null
          decision_date: string | null
          employer_address1: string | null
          employer_address2: string | null
          employer_city: string | null
          employer_country: string | null
          employer_fein: string | null
          employer_name: string | null
          employer_phone: string | null
          employer_phone_ext: string | null
          employer_poc_address1: string | null
          employer_poc_address2: string | null
          employer_poc_city: string | null
          employer_poc_country: string | null
          employer_poc_email: string | null
          employer_poc_job_title: string | null
          employer_poc_name: string | null
          employer_poc_phone: string | null
          employer_poc_phone_ext: string | null
          employer_poc_postal_code: string | null
          employer_poc_province: string | null
          employer_poc_state: string | null
          employer_postal_code: string | null
          employer_province: string | null
          employer_state: string | null
          end_date: string | null
          full_time_position: string | null
          h_1b_dependent: string | null
          id: string
          job_title: string | null
          lawfirm_business_fein: string | null
          lawfirm_name: string | null
          naics_code: string | null
          name_of_highest_state_court: string | null
          new_concurrent_employment: number | null
          new_employment: number | null
          original_cert_date: string | null
          preparer_business_name: string | null
          preparer_email: string | null
          preparer_first_name: string | null
          preparer_last_name: string | null
          preparer_middle_initial: string | null
          prevailing_wage: number | null
          public_disclosure: string | null
          pw_other_source: string | null
          pw_other_year: number | null
          pw_source: string | null
          pw_source_year: number | null
          pw_survey_name: string | null
          pw_survey_publisher: string | null
          pw_tracking_number: string | null
          pw_unit: string | null
          pw_wage_level: string | null
          received_date: string | null
          secondary_entity: string | null
          secondary_entity_business_name: string | null
          soc_code: string | null
          soc_title: string | null
          sponsor_id: string | null
          state_of_highest_court: string | null
          status: string | null
          statutory_basis: string | null
          support_h1b: string | null
          total_workers: number | null
          total_worksite_locations: number | null
          trade_name_dba: string | null
          visa_class: string | null
          wage_rate_from: number | null
          wage_rate_to: number | null
          wage_unit: string | null
          willful_violator: string | null
          worksite_address1: string | null
          worksite_address2: string | null
          worksite_city: string | null
          worksite_county: string | null
          worksite_postal_code: string | null
          worksite_state: string | null
          worksite_workers: number | null
        }
        Insert: {
          agent_attorney_address1?: string | null
          agent_attorney_address2?: string | null
          agent_attorney_city?: string | null
          agent_attorney_country?: string | null
          agent_attorney_email?: string | null
          agent_attorney_name?: string | null
          agent_attorney_phone?: string | null
          agent_attorney_phone_ext?: string | null
          agent_attorney_postal_code?: string | null
          agent_attorney_province?: string | null
          agent_attorney_state?: string | null
          agent_representing_employer?: string | null
          agree_to_lc_statement?: string | null
          amended_petition?: number | null
          appendix_a_attached?: string | null
          begin_date?: string | null
          case_number: string
          change_employer?: number | null
          change_previous_employment?: number | null
          continued_employment?: number | null
          created_at?: string | null
          decision_date?: string | null
          employer_address1?: string | null
          employer_address2?: string | null
          employer_city?: string | null
          employer_country?: string | null
          employer_fein?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          employer_phone_ext?: string | null
          employer_poc_address1?: string | null
          employer_poc_address2?: string | null
          employer_poc_city?: string | null
          employer_poc_country?: string | null
          employer_poc_email?: string | null
          employer_poc_job_title?: string | null
          employer_poc_name?: string | null
          employer_poc_phone?: string | null
          employer_poc_phone_ext?: string | null
          employer_poc_postal_code?: string | null
          employer_poc_province?: string | null
          employer_poc_state?: string | null
          employer_postal_code?: string | null
          employer_province?: string | null
          employer_state?: string | null
          end_date?: string | null
          full_time_position?: string | null
          h_1b_dependent?: string | null
          id?: string
          job_title?: string | null
          lawfirm_business_fein?: string | null
          lawfirm_name?: string | null
          naics_code?: string | null
          name_of_highest_state_court?: string | null
          new_concurrent_employment?: number | null
          new_employment?: number | null
          original_cert_date?: string | null
          preparer_business_name?: string | null
          preparer_email?: string | null
          preparer_first_name?: string | null
          preparer_last_name?: string | null
          preparer_middle_initial?: string | null
          prevailing_wage?: number | null
          public_disclosure?: string | null
          pw_other_source?: string | null
          pw_other_year?: number | null
          pw_source?: string | null
          pw_source_year?: number | null
          pw_survey_name?: string | null
          pw_survey_publisher?: string | null
          pw_tracking_number?: string | null
          pw_unit?: string | null
          pw_wage_level?: string | null
          received_date?: string | null
          secondary_entity?: string | null
          secondary_entity_business_name?: string | null
          soc_code?: string | null
          soc_title?: string | null
          sponsor_id?: string | null
          state_of_highest_court?: string | null
          status?: string | null
          statutory_basis?: string | null
          support_h1b?: string | null
          total_workers?: number | null
          total_worksite_locations?: number | null
          trade_name_dba?: string | null
          visa_class?: string | null
          wage_rate_from?: number | null
          wage_rate_to?: number | null
          wage_unit?: string | null
          willful_violator?: string | null
          worksite_address1?: string | null
          worksite_address2?: string | null
          worksite_city?: string | null
          worksite_county?: string | null
          worksite_postal_code?: string | null
          worksite_state?: string | null
          worksite_workers?: number | null
        }
        Update: {
          agent_attorney_address1?: string | null
          agent_attorney_address2?: string | null
          agent_attorney_city?: string | null
          agent_attorney_country?: string | null
          agent_attorney_email?: string | null
          agent_attorney_name?: string | null
          agent_attorney_phone?: string | null
          agent_attorney_phone_ext?: string | null
          agent_attorney_postal_code?: string | null
          agent_attorney_province?: string | null
          agent_attorney_state?: string | null
          agent_representing_employer?: string | null
          agree_to_lc_statement?: string | null
          amended_petition?: number | null
          appendix_a_attached?: string | null
          begin_date?: string | null
          case_number?: string
          change_employer?: number | null
          change_previous_employment?: number | null
          continued_employment?: number | null
          created_at?: string | null
          decision_date?: string | null
          employer_address1?: string | null
          employer_address2?: string | null
          employer_city?: string | null
          employer_country?: string | null
          employer_fein?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          employer_phone_ext?: string | null
          employer_poc_address1?: string | null
          employer_poc_address2?: string | null
          employer_poc_city?: string | null
          employer_poc_country?: string | null
          employer_poc_email?: string | null
          employer_poc_job_title?: string | null
          employer_poc_name?: string | null
          employer_poc_phone?: string | null
          employer_poc_phone_ext?: string | null
          employer_poc_postal_code?: string | null
          employer_poc_province?: string | null
          employer_poc_state?: string | null
          employer_postal_code?: string | null
          employer_province?: string | null
          employer_state?: string | null
          end_date?: string | null
          full_time_position?: string | null
          h_1b_dependent?: string | null
          id?: string
          job_title?: string | null
          lawfirm_business_fein?: string | null
          lawfirm_name?: string | null
          naics_code?: string | null
          name_of_highest_state_court?: string | null
          new_concurrent_employment?: number | null
          new_employment?: number | null
          original_cert_date?: string | null
          preparer_business_name?: string | null
          preparer_email?: string | null
          preparer_first_name?: string | null
          preparer_last_name?: string | null
          preparer_middle_initial?: string | null
          prevailing_wage?: number | null
          public_disclosure?: string | null
          pw_other_source?: string | null
          pw_other_year?: number | null
          pw_source?: string | null
          pw_source_year?: number | null
          pw_survey_name?: string | null
          pw_survey_publisher?: string | null
          pw_tracking_number?: string | null
          pw_unit?: string | null
          pw_wage_level?: string | null
          received_date?: string | null
          secondary_entity?: string | null
          secondary_entity_business_name?: string | null
          soc_code?: string | null
          soc_title?: string | null
          sponsor_id?: string | null
          state_of_highest_court?: string | null
          status?: string | null
          statutory_basis?: string | null
          support_h1b?: string | null
          total_workers?: number | null
          total_worksite_locations?: number | null
          trade_name_dba?: string | null
          visa_class?: string | null
          wage_rate_from?: number | null
          wage_rate_to?: number | null
          wage_unit?: string | null
          willful_violator?: string | null
          worksite_address1?: string | null
          worksite_address2?: string | null
          worksite_city?: string | null
          worksite_county?: string | null
          worksite_postal_code?: string | null
          worksite_state?: string | null
          worksite_workers?: number | null
        }
        Relationships: []
      }
      h1b_sponsors: {
        Row: {
          address_line1: string | null
          approvals_2021: number | null
          approvals_2022: number | null
          approvals_2023: number | null
          approvals_2024: number | null
          approvals_2025: number | null
          careers_url: string | null
          city: string | null
          common_roles: string[] | null
          created_at: string | null
          entry_level_percent: number | null
          h1b_dependent: boolean | null
          id: string
          industry: string | null
          is_virtual_office: boolean | null
          location: string | null
          name: string
          size: string | null
          sponsorship_strength: string | null
          state: string | null
          top_law_firm: string | null
          total_approvals: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          approvals_2021?: number | null
          approvals_2022?: number | null
          approvals_2023?: number | null
          approvals_2024?: number | null
          approvals_2025?: number | null
          careers_url?: string | null
          city?: string | null
          common_roles?: string[] | null
          created_at?: string | null
          entry_level_percent?: number | null
          h1b_dependent?: boolean | null
          id: string
          industry?: string | null
          is_virtual_office?: boolean | null
          location?: string | null
          name: string
          size?: string | null
          sponsorship_strength?: string | null
          state?: string | null
          top_law_firm?: string | null
          total_approvals?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          approvals_2021?: number | null
          approvals_2022?: number | null
          approvals_2023?: number | null
          approvals_2024?: number | null
          approvals_2025?: number | null
          careers_url?: string | null
          city?: string | null
          common_roles?: string[] | null
          created_at?: string | null
          entry_level_percent?: number | null
          h1b_dependent?: boolean | null
          id?: string
          industry?: string | null
          is_virtual_office?: boolean | null
          location?: string | null
          name?: string
          size?: string | null
          sponsorship_strength?: string | null
          state?: string | null
          top_law_firm?: string | null
          total_approvals?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      insurance_eligibility_checks: {
        Row: {
          checked_at: string | null
          created_at: string | null
          date_of_birth: string | null
          gender: string | null
          has_employer_insurance: boolean | null
          id: string
          is_pregnant: boolean | null
          monthly_income: number | null
          state: string
          user_id: string | null
          visa_type: string
        }
        Insert: {
          checked_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          has_employer_insurance?: boolean | null
          id?: string
          is_pregnant?: boolean | null
          monthly_income?: number | null
          state: string
          user_id?: string | null
          visa_type: string
        }
        Update: {
          checked_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          has_employer_insurance?: boolean | null
          id?: string
          is_pregnant?: boolean | null
          monthly_income?: number | null
          state?: string
          user_id?: string | null
          visa_type?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applied_at: string | null
          archived_at: string | null
          company_name: string
          created_at: string
          id: string
          is_archived: boolean | null
          job_url: string | null
          location: string | null
          next_follow_up_at: string | null
          notes: string | null
          offer_deadline: string | null
          offer_salary: number | null
          offer_start_date: string | null
          previous_status: string | null
          role_title: string
          sponsor_h1b: boolean | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          archived_at?: string | null
          company_name: string
          created_at?: string
          id?: string
          is_archived?: boolean | null
          job_url?: string | null
          location?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          offer_deadline?: string | null
          offer_salary?: number | null
          offer_start_date?: string | null
          previous_status?: string | null
          role_title: string
          sponsor_h1b?: boolean | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          archived_at?: string | null
          company_name?: string
          created_at?: string
          id?: string
          is_archived?: boolean | null
          job_url?: string | null
          location?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          offer_deadline?: string | null
          offer_salary?: number | null
          offer_start_date?: string | null
          previous_status?: string | null
          role_title?: string
          sponsor_h1b?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_followups: {
        Row: {
          created_at: string
          followup_at: string
          followup_type: string
          id: string
          job_application_id: string
          notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          followup_at: string
          followup_type: string
          id?: string
          job_application_id: string
          notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          followup_at?: string
          followup_type?: string
          id?: string
          job_application_id?: string
          notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_followups_job_application_id_fkey"
            columns: ["job_application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_interviews: {
        Row: {
          created_at: string
          id: string
          interview_at: string
          job_application_id: string
          meeting_link: string | null
          notes: string | null
          round_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interview_at: string
          job_application_id: string
          meeting_link?: string | null
          notes?: string | null
          round_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interview_at?: string
          job_application_id?: string
          meeting_link?: string | null
          notes?: string | null
          round_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_interviews_job_application_id_fkey"
            columns: ["job_application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          position: number | null
          title: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          position?: number | null
          title: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          position?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          case_status_email: string | null
          created_at: string | null
          document_vault_email: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          case_status_email?: string | null
          created_at?: string | null
          document_vault_email?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          case_status_email?: string | null
          created_at?: string | null
          document_vault_email?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ocr_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          extracted_text: string | null
          file_name: string | null
          id: string
          s3_key: string
          status: string
          textract_job_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_name?: string | null
          id?: string
          s3_key: string
          status?: string
          textract_job_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_name?: string | null
          id?: string
          s3_key?: string
          status?: string
          textract_job_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opt_status: {
        Row: {
          created_at: string | null
          dso_recommendation_date: string | null
          last_updated_field: string | null
          most_recent_field: string | null
          opt_ead_end_date: string | null
          opt_start_date: string | null
          program_end_date: string | null
          stem_start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dso_recommendation_date?: string | null
          last_updated_field?: string | null
          most_recent_field?: string | null
          opt_ead_end_date?: string | null
          opt_start_date?: string | null
          program_end_date?: string | null
          stem_start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dso_recommendation_date?: string | null
          last_updated_field?: string | null
          most_recent_field?: string | null
          opt_ead_end_date?: string | null
          opt_start_date?: string | null
          program_end_date?: string | null
          stem_start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partnership_inquiries: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          role: string
          status: string | null
          university: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          role: string
          status?: string | null
          university: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          role?: string
          status?: string | null
          university?: string
        }
        Relationships: []
      }
      passcode_otps: {
        Row: {
          attempts: number
          created_at: string | null
          expires_at: string
          id: string
          locked_until: string | null
          new_passcode_hash: string
          otp_hash: string
          purpose: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number
          created_at?: string | null
          expires_at: string
          id?: string
          locked_until?: string | null
          new_passcode_hash: string
          otp_hash: string
          purpose?: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number
          created_at?: string | null
          expires_at?: string
          id?: string
          locked_until?: string | null
          new_passcode_hash?: string
          otp_hash?: string
          purpose?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          payment_method_type: string | null
          plan_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_method_type?: string | null
          plan_id?: string | null
          status: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_method_type?: string | null
          plan_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      policy_consents: {
        Row: {
          consent_method: string
          consented_at: string
          created_at: string | null
          id: string
          ip_address: string | null
          policy_type: string
          policy_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_method: string
          consented_at?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          policy_type: string
          policy_version: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_method?: string
          consented_at?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          policy_type?: string
          policy_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      policy_versions: {
        Row: {
          change_summary: string | null
          created_at: string | null
          current_version: string
          effective_date: string
          id: string
          policy_type: string
          requires_consent: boolean | null
          updated_at: string | null
        }
        Insert: {
          change_summary?: string | null
          created_at?: string | null
          current_version: string
          effective_date: string
          id?: string
          policy_type: string
          requires_consent?: boolean | null
          updated_at?: string | null
        }
        Update: {
          change_summary?: string | null
          created_at?: string | null
          current_version?: string
          effective_date?: string
          id?: string
          policy_type?: string
          requires_consent?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      uscis_case_cache: {
        Row: {
          case_type: string | null
          created_at: string
          current_status: string | null
          id: string
          is_valid: boolean
          last_scanned_at: string
          prefix: string
          received_date: string | null
          receipt_number: string
          scan_attempts: number
          serial: number
          status_date: string | null
        }
        Insert: {
          case_type?: string | null
          created_at?: string
          current_status?: string | null
          id?: string
          is_valid?: boolean
          last_scanned_at?: string
          prefix: string
          received_date?: string | null
          receipt_number: string
          scan_attempts?: number
          serial: number
          status_date?: string | null
        }
        Update: {
          case_type?: string | null
          created_at?: string
          current_status?: string | null
          id?: string
          is_valid?: boolean
          last_scanned_at?: string
          prefix?: string
          received_date?: string | null
          receipt_number?: string
          scan_attempts?: number
          serial?: number
          status_date?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          degree_level: string | null
          email: string | null
          first_name: string | null
          is_stem_eligible: boolean | null
          last_name: string | null
          major_name: string | null
          notification_email: string | null
          onboarding_completed: boolean
          opt_apply_email: string | null
          opt_clock_email: string | null
          plan_tier: string | null
          premium_purchased_at: string | null
          premium_status: boolean | null
          referred_by: string | null
          stem_apply_email: string | null
          stem_clock_email: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          subscription_expires_at: string | null
          timezone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          degree_level?: string | null
          email?: string | null
          first_name?: string | null
          is_stem_eligible?: boolean | null
          last_name?: string | null
          major_name?: string | null
          notification_email?: string | null
          onboarding_completed?: boolean
          opt_apply_email?: string | null
          opt_clock_email?: string | null
          plan_tier?: string | null
          premium_purchased_at?: string | null
          premium_status?: boolean | null
          referred_by?: string | null
          stem_apply_email?: string | null
          stem_clock_email?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_expires_at?: string | null
          timezone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          degree_level?: string | null
          email?: string | null
          first_name?: string | null
          is_stem_eligible?: boolean | null
          last_name?: string | null
          major_name?: string | null
          notification_email?: string | null
          onboarding_completed?: boolean
          opt_apply_email?: string | null
          opt_clock_email?: string | null
          plan_tier?: string | null
          premium_purchased_at?: string | null
          premium_status?: boolean | null
          referred_by?: string | null
          stem_apply_email?: string | null
          stem_clock_email?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_expires_at?: string | null
          timezone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          clicks: number
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          owner_email: string | null
          premium_conversions: number
          signups: number
        }
        Insert: {
          clicks?: number
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          owner_email?: string | null
          premium_conversions?: number
          signups?: number
        }
        Update: {
          clicks?: number
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          owner_email?: string | null
          premium_conversions?: number
          signups?: number
        }
        Relationships: []
      }
      resume_drafts: {
        Row: {
          created_at: string
          draft_key: string
          id: string
          payload: Json
          step: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft_key: string
          id?: string
          payload: Json
          step?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft_key?: string
          id?: string
          payload?: Json
          step?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_generations: {
        Row: {
          created_at: string
          credit_cost: number | null
          generation_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_cost?: number | null
          generation_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_cost?: number | null
          generation_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          file_path: string | null
          filename: string
          id: string
          is_parsed: boolean | null
          structured_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          filename: string
          id?: string
          is_parsed?: boolean | null
          structured_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          filename?: string
          id?: string
          is_parsed?: boolean | null
          structured_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      uscis_check_log: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_code: string | null
          error_message: string | null
          id: number
          receipt_number: string
          source: string
          success: boolean
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          id?: number
          receipt_number: string
          source: string
          success: boolean
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          id?: number
          receipt_number?: string
          source?: string
          success?: boolean
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          device_type: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_active_at: string | null
          location: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          device_type: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_active_at?: string | null
          location?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          device_type?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_active_at?: string | null
          location?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      document_expiry_overview: {
        Row: {
          expired: number | null
          expiring_30_days: number | null
          expiring_7_days: number | null
          expiring_90_days: number | null
          no_expiry: number | null
          total_documents: number | null
          user_id: string | null
          valid: number | null
        }
        Relationships: []
      }
      email_delivery_stats: {
        Row: {
          bounced: number | null
          clicked: number | null
          delivered: number | null
          delivery_rate: number | null
          email_type: string | null
          failed: number | null
          open_rate: number | null
          opened: number | null
          total_sent: number | null
        }
        Relationships: []
      }
      premium_stats: {
        Row: {
          premium_percentage: number | null
          total_free_users: number | null
          total_premium_users: number | null
          total_users: number | null
        }
        Relationships: []
      }
      revenue_stats: {
        Row: {
          failed_payments: number | null
          refunded_payments: number | null
          total_revenue_cents: number | null
          total_revenue_dollars: number | null
          total_successful_payments: number | null
          unique_paying_users: number | null
        }
        Relationships: []
      }
      sponsor_intelligence_agg: {
        Row: {
          employer_address1: string | null
          employer_city: string | null
          employer_state: string | null
          entry_level_percent: number | null
          name: string | null
          sponsor_id: string | null
          top_law_firm: string | null
        }
        Relationships: []
      }
      user_activity_summary: {
        Row: {
          documents_count: number | null
          email: string | null
          emails_sent: number | null
          employment_records: number | null
          last_opt_update: string | null
          premium_status: boolean | null
          signup_date: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_document_reminders: {
        Args: {
          p_document_id: string
          p_document_name: string
          p_expiry_date: string
          p_user_id: string
        }
        Returns: undefined
      }
      get_document_expiry_status: { Args: { expiry: string }; Returns: string }
      get_premium_users_for_daily_email: {
        Args: never
        Returns: {
          email: string
          email_address: string
          first_name: string
          last_name: string
          premium_purchased_at: string
          user_id: string
        }[]
      }
      get_sponsor_intelligence: {
        Args: { target_ids: string[] }
        Returns: {
          employer_address1: string
          employer_city: string
          employer_state: string
          entry_level_percent: number
          sponsor_id: string
          top_law_firm: string
        }[]
      }
      increment_referral_clicks: {
        Args: { ref_code: string }
        Returns: undefined
      }
      increment_referral_conversions: {
        Args: { ref_code: string }
        Returns: undefined
      }
      increment_referral_signups: {
        Args: { ref_code: string }
        Returns: undefined
      }
      upgrade_user_to_premium: {
        Args: {
          p_stripe_customer_id: string
          p_stripe_payment_intent_id: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
