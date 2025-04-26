
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
