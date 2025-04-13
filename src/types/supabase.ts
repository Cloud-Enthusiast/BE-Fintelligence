
import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

// Extend the database type with our specific tables
export interface Database extends GeneratedDatabase {
  public: {
    Tables: {
      loan_applicants: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone_number: string;
          address: string;
          date_of_birth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone_number?: string;
          address?: string;
          date_of_birth?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone_number?: string;
          address?: string;
          date_of_birth?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      loan_eligibility_assessments: {
        Row: {
          id: string;
          applicant_id: string | null;
          business_name: string;
          monthly_income: number;
          annual_revenue: number;
          existing_loan_amount: number;
          credit_score: number;
          requested_loan_amount: number;
          requested_loan_term_months: number;
          business_type: string;
          eligibility_score: number;
          is_eligible: boolean;
          ineligibility_reason: string | null;
          assessment_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          applicant_id?: string | null;
          business_name?: string;
          monthly_income?: number;
          annual_revenue?: number;
          existing_loan_amount?: number;
          credit_score?: number;
          requested_loan_amount?: number;
          requested_loan_term_months?: number;
          business_type?: string;
          eligibility_score?: number;
          is_eligible?: boolean;
          ineligibility_reason?: string | null;
          assessment_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          applicant_id?: string | null;
          business_name?: string;
          monthly_income?: number;
          annual_revenue?: number;
          existing_loan_amount?: number;
          credit_score?: number;
          requested_loan_amount?: number;
          requested_loan_term_months?: number;
          business_type?: string;
          eligibility_score?: number;
          is_eligible?: boolean;
          ineligibility_reason?: string | null;
          assessment_status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loan_eligibility_assessments_applicant_id_fkey";
            columns: ["applicant_id"];
            referencedRelation: "loan_applicants";
            referencedColumns: ["id"];
          }
        ];
      };
      // Add any other tables from the generated type here
      profiles: GeneratedDatabase['public']['Tables']['profiles'];
      loan_applications: GeneratedDatabase['public']['Tables']['loan_applications'];
    };
    Views: GeneratedDatabase['public']['Views'];
    Functions: GeneratedDatabase['public']['Functions'];
    Enums: GeneratedDatabase['public']['Enums'];
  };
}
