# Supabase Database Setup Guide

## 🚀 Quick Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project" 
   - Create a new project

2. **Get Your Credentials**
   - Go to Settings → API
   - Copy your Project URL and anon/public key
   - Add them to your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Run the Database Migration**
   - Copy the SQL below and run it in your Supabase SQL Editor
   - This creates all tables, triggers, and audit functions

## 📊 Database Schema SQL

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    -- This function is called by triggers but we handle auditing in the application
    -- Just return the appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_name TEXT NOT NULL,
    address_id UUID NOT NULL REFERENCES addresses(address_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    department_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_name TEXT NOT NULL,
    location_id UUID REFERENCES locations(location_id) ON DELETE SET NULL,
    head_id UUID, -- Will reference employees(employee_id)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title TEXT NOT NULL,
    min_salary NUMERIC(10,2),
    max_salary NUMERIC(10,2),
    job_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    address_id UUID REFERENCES addresses(address_id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(job_id) ON DELETE SET NULL,
    hire_date DATE DEFAULT CURRENT_DATE,
    manager_id UUID REFERENCES employees(employee_id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for department head
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_head_id 
FOREIGN KEY (head_id) REFERENCES employees(employee_id) ON DELETE SET NULL;

-- Salaries table
CREATE TABLE IF NOT EXISTS salaries (
    salary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Project Assignments table
CREATE TABLE IF NOT EXISTS employee_project_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    assigned_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, project_id)
);

-- Attendances table
CREATE TABLE IF NOT EXISTS attendances (
    attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'leave', 'half_day')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
    leave_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'vacation', 'personal', 'maternity', 'paternity', 'emergency')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    review_date DATE DEFAULT CURRENT_DATE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trainings table
CREATE TABLE IF NOT EXISTS trainings (
    training_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    trainer_name TEXT,
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Trainings table
CREATE TABLE IF NOT EXISTS employee_trainings (
    employee_training_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES trainings(training_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, training_id)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID,
    user_email TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    reason TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_job_id ON employees(job_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_salaries_employee_id ON salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendances_employee_id ON attendances(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON salaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_project_assignments_updated_at BEFORE UPDATE ON employee_project_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON attendances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_trainings_updated_at BEFORE UPDATE ON employee_trainings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit triggers (these call the function but actual auditing is handled in the application)
CREATE TRIGGER audit_addresses AFTER INSERT OR UPDATE OR DELETE ON addresses FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_locations AFTER INSERT OR UPDATE OR DELETE ON locations FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_departments AFTER INSERT OR UPDATE OR DELETE ON departments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_jobs AFTER INSERT OR UPDATE OR DELETE ON jobs FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_employees AFTER INSERT OR UPDATE OR DELETE ON employees FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_salaries AFTER INSERT OR UPDATE OR DELETE ON salaries FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_employee_project_assignments AFTER INSERT OR UPDATE OR DELETE ON employee_project_assignments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_attendances AFTER INSERT OR UPDATE OR DELETE ON attendances FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_leaves AFTER INSERT OR UPDATE OR DELETE ON leaves FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_performance_reviews AFTER INSERT OR UPDATE OR DELETE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_trainings AFTER INSERT OR UPDATE OR DELETE ON trainings FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_employee_trainings AFTER INSERT OR UPDATE OR DELETE ON employee_trainings FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Enable Row Level Security (RLS)
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Allow all for authenticated users)
CREATE POLICY "Allow all for authenticated users" ON addresses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON locations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON departments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON jobs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON employees FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON salaries FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON employee_project_assignments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON attendances FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON leaves FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON performance_reviews FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON trainings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON employee_trainings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON audit_logs FOR SELECT TO authenticated USING (true);
```

## 🔐 Authentication Setup

The system uses Supabase's built-in authentication. To enable user access:

1. **Enable Email Authentication**
   - Go to Authentication → Settings
   - Enable "Email" provider
   - Disable "Confirm email" for development

2. **Create Test Users**
   - Go to Authentication → Users
   - Click "Add user"
   - Create test accounts for your team

## 🛡️ Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Audit Trail**: Complete change tracking in `audit_logs` table
- **Data Integrity**: Foreign key constraints and check constraints
- **User Attribution**: All changes linked to authenticated users

## 📈 Features Enabled

✅ **Complete CRUD Operations**: All 13 entity types with full database persistence
✅ **Audit Logging**: Every change tracked in Supabase
✅ **Entity Restoration**: Point-in-time recovery from audit history
✅ **Change History Viewer**: Complete modification timeline
✅ **Advanced Search**: Query capabilities across all entities
✅ **Real-time Updates**: Immediate database synchronization
✅ **Data Integrity**: Referential integrity and constraints
✅ **User Security**: Authentication and authorization

## 🔄 How It Works

1. **CRUD Operations**: All create, read, update, delete operations go directly to Supabase
2. **Audit Trail**: Every change is logged to the `audit_logs` table with full context
3. **Entity Restoration**: Historical states are reconstructed from audit logs and applied to the database
4. **Fallback System**: If Supabase is unavailable, the system falls back to in-memory storage

This provides a production-ready, scalable, and fully auditable employee management system with complete data persistence and recovery capabilities.