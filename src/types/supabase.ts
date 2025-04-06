
import { Database as OriginalDatabase } from '@/integrations/supabase/types';

// Extend the original Database type with our tables
export interface Database extends OriginalDatabase {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_id: string | null;
          role: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          role?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string | null;
          role?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      loan_applications: {
        Row: {
          id: string;
          applicant_id: string | null;
          business_id: string | null;
          loan_amount: number;
          loan_term: number;
          existing_loan_amount: number;
          credit_score: number;
          eligibility_score: number;
          is_eligible: boolean;
          rejection_reason: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          business_name?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          business_type?: string | null;
          annual_revenue?: number | null;
          monthly_income?: number | null;
        };
        Insert: {
          id?: string;
          applicant_id?: string | null;
          business_id?: string | null;
          loan_amount: number;
          loan_term: number;
          existing_loan_amount: number;
          credit_score: number;
          eligibility_score: number;
          is_eligible: boolean;
          rejection_reason?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          business_name?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          business_type?: string | null;
          annual_revenue?: number | null;
          monthly_income?: number | null;
        };
        Update: {
          id?: string;
          applicant_id?: string | null;
          business_id?: string | null;
          loan_amount?: number;
          loan_term?: number;
          existing_loan_amount?: number;
          credit_score?: number;
          eligibility_score?: number;
          is_eligible?: boolean;
          rejection_reason?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          business_name?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          business_type?: string | null;
          annual_revenue?: number | null;
          monthly_income?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
