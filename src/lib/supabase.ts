import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  ADDRESSES: 'addresses',
  LOCATIONS: 'locations', 
  DEPARTMENTS: 'departments',
  JOBS: 'jobs',
  EMPLOYEES: 'employees',
  SALARIES: 'salaries',
  PROJECTS: 'projects',
  EMPLOYEE_PROJECT_ASSIGNMENTS: 'employee_project_assignments',
  ATTENDANCES: 'attendances',
  LEAVES: 'leaves',
  PERFORMANCE_REVIEWS: 'performance_reviews',
  TRAININGS: 'trainings',
  EMPLOYEE_TRAININGS: 'employee_trainings',
  AUDIT_LOGS: 'audit_logs'
} as const

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          address_id: string
          street: string
          city: string
          state: string
          postal_code: string
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          address_id?: string
          street: string
          city: string
          state: string
          postal_code: string
          country: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          address_id?: string
          street?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          location_id: string
          location_name: string
          address_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          location_id?: string
          location_name: string
          address_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          location_id?: string
          location_name?: string
          address_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          department_id: string
          department_name: string
          location_id: string | null
          head_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          department_id?: string
          department_name: string
          location_id?: string | null
          head_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          department_id?: string
          department_name?: string
          location_id?: string | null
          head_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          job_id: string
          job_title: string
          min_salary: number | null
          max_salary: number | null
          job_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          job_id?: string
          job_title: string
          min_salary?: number | null
          max_salary?: number | null
          job_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          job_id?: string
          job_title?: string
          min_salary?: number | null
          max_salary?: number | null
          job_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          employee_id: string
          first_name: string
          last_name: string
          dob: string | null
          gender: string | null
          email: string
          phone_number: string | null
          address_id: string | null
          department_id: string | null
          job_id: string | null
          hire_date: string
          manager_id: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          employee_id?: string
          first_name: string
          last_name: string
          dob?: string | null
          gender?: string | null
          email: string
          phone_number?: string | null
          address_id?: string | null
          department_id?: string | null
          job_id?: string | null
          hire_date?: string
          manager_id?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          employee_id?: string
          first_name?: string
          last_name?: string
          dob?: string | null
          gender?: string | null
          email?: string
          phone_number?: string | null
          address_id?: string | null
          department_id?: string | null
          job_id?: string | null
          hire_date?: string
          manager_id?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      salaries: {
        Row: {
          salary_id: string
          employee_id: string
          amount: number
          effective_from: string
          effective_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          salary_id?: string
          employee_id: string
          amount: number
          effective_from?: string
          effective_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          salary_id?: string
          employee_id?: string
          amount?: number
          effective_from?: string
          effective_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          project_id: string
          project_name: string
          start_date: string
          end_date: string | null
          status: string | null
          department_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          project_id?: string
          project_name: string
          start_date: string
          end_date?: string | null
          status?: string | null
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_id?: string
          project_name?: string
          start_date?: string
          end_date?: string | null
          status?: string | null
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employee_project_assignments: {
        Row: {
          assignment_id: string
          employee_id: string
          project_id: string
          role: string
          assigned_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          assignment_id?: string
          employee_id: string
          project_id: string
          role: string
          assigned_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          employee_id?: string
          project_id?: string
          role?: string
          assigned_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      attendances: {
        Row: {
          attendance_id: string
          employee_id: string
          date: string
          check_in_time: string | null
          check_out_time: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          attendance_id?: string
          employee_id: string
          date: string
          check_in_time?: string | null
          check_out_time?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          attendance_id?: string
          employee_id?: string
          date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leaves: {
        Row: {
          leave_id: string
          employee_id: string
          leave_type: string
          start_date: string
          end_date: string
          status: string | null
          reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          leave_id?: string
          employee_id: string
          leave_type: string
          start_date: string
          end_date: string
          status?: string | null
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          leave_id?: string
          employee_id?: string
          leave_type?: string
          start_date?: string
          end_date?: string
          status?: string | null
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      performance_reviews: {
        Row: {
          review_id: string
          employee_id: string
          reviewer_id: string
          review_date: string
          rating: number | null
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          review_id?: string
          employee_id: string
          reviewer_id: string
          review_date?: string
          rating?: number | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          review_id?: string
          employee_id?: string
          reviewer_id?: string
          review_date?: string
          rating?: number | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trainings: {
        Row: {
          training_id: string
          training_title: string
          description: string | null
          start_date: string
          end_date: string | null
          trainer_name: string | null
          department_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          training_id?: string
          training_title: string
          description?: string | null
          start_date: string
          end_date?: string | null
          trainer_name?: string | null
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          training_id?: string
          training_title?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          trainer_name?: string | null
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employee_trainings: {
        Row: {
          employee_training_id: string
          employee_id: string
          training_id: string
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          employee_training_id?: string
          employee_id: string
          training_id: string
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          employee_training_id?: string
          employee_id?: string
          training_id?: string
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: string
          old_values: any | null
          new_values: any | null
          changed_fields: string[] | null
          user_id: string | null
          user_email: string | null
          timestamp: string
          ip_address: string | null
          user_agent: string | null
          reason: string | null
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: string
          old_values?: any | null
          new_values?: any | null
          changed_fields?: string[] | null
          user_id?: string | null
          user_email?: string | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
          reason?: string | null
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: string
          old_values?: any | null
          new_values?: any | null
          changed_fields?: string[] | null
          user_id?: string | null
          user_email?: string | null
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
          reason?: string | null
        }
      }
    }
  }
}