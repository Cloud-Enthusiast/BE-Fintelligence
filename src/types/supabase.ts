
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      loan_applicants: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone_number: string
          address: string
          date_of_birth: string
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone_number?: string
          address?: string
          date_of_birth: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone_number?: string
          address?: string
          date_of_birth?: string
          created_at?: string
        }
        Relationships: []
      }
      loan_eligibility_assessments: {
        Row: {
          id: string
          applicant_id: string
          business_name: string
          business_type: string
          years_in_business: number
          annual_revenue: number
          credit_score: number
          loan_amount: number
          purpose: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          applicant_id: string
          business_name: string
          business_type: string
          years_in_business: number
          annual_revenue: number
          credit_score: number
          loan_amount: number
          purpose: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          applicant_id?: string
          business_name?: string
          business_type?: string
          years_in_business?: number
          annual_revenue?: number
          credit_score?: number
          loan_amount?: number
          purpose?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    CompositeTypes: {}
  }
}
