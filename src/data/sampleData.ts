import { 
  Employee, 
  Department, 
  Job, 
  Address, 
  Location, 
  Project, 
  Salary,
  Attendance,
  Leave,
  PerformanceReview,
  Training,
  EmployeeTraining,
  EmployeeProjectAssignment
} from '../types';

// Sample Addresses
export const sampleAddresses: Address[] = [
  {
    address_id: '550e8400-e29b-41d4-a716-446655440001',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    address_id: '550e8400-e29b-41d4-a716-446655440002',
    street: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    postal_code: '90210',
    country: 'USA',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    address_id: '550e8400-e29b-41d4-a716-446655440003',
    street: '789 Pine Road',
    city: 'Chicago',
    state: 'IL',
    postal_code: '60601',
    country: 'USA',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
];

// Sample Locations
export const sampleLocations: Location[] = [
  {
    location_id: '550e8400-e29b-41d4-a716-446655440011',
    location_name: 'New York Headquarters',
    address_id: '550e8400-e29b-41d4-a716-446655440001',
    capacity: 500,
    facilities: ['Conference Rooms', 'Cafeteria', 'Gym', 'Parking'],
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    location_id: '550e8400-e29b-41d4-a716-446655440012',
    location_name: 'Los Angeles Office',
    address_id: '550e8400-e29b-41d4-a716-446655440002',
    capacity: 200,
    facilities: ['Conference Rooms', 'Cafeteria', 'Parking'],
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
];

// Sample Jobs
export const sampleJobs: Job[] = [
  {
    job_id: '550e8400-e29b-41d4-a716-446655440021',
    job_title: 'Software Engineer',
    min_salary: 80000,
    max_salary: 120000,
    job_description: 'Develop and maintain software applications',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    job_id: '550e8400-e29b-41d4-a716-446655440022',
    job_title: 'Product Manager',
    min_salary: 90000,
    max_salary: 140000,
    job_description: 'Manage product development lifecycle',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    job_id: '550e8400-e29b-41d4-a716-446655440023',
    job_title: 'HR Manager',
    min_salary: 70000,
    max_salary: 100000,
    job_description: 'Manage human resources operations',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    job_id: '550e8400-e29b-41d4-a716-446655440024',
    job_title: 'Marketing Specialist',
    min_salary: 60000,
    max_salary: 85000,
    job_description: 'Execute marketing campaigns and strategies',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
];

// Sample Departments
export const sampleDepartments: Department[] = [
  {
    department_id: '550e8400-e29b-41d4-a716-446655440031',
    department_name: 'Engineering',
    location_id: '550e8400-e29b-41d4-a716-446655440011',
    head_id: null, // Will be set after employees are created
    budget: 2000000,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    department_id: '550e8400-e29b-41d4-a716-446655440032',
    department_name: 'Product',
    location_id: '550e8400-e29b-41d4-a716-446655440011',
    head_id: null,
    budget: 1500000,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    department_id: '550e8400-e29b-41d4-a716-446655440033',
    department_name: 'Human Resources',
    location_id: '550e8400-e29b-41d4-a716-446655440011',
    head_id: null,
    budget: 800000,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    department_id: '550e8400-e29b-41d4-a716-446655440034',
    department_name: 'Marketing',
    location_id: '550e8400-e29b-41d4-a716-446655440012',
    head_id: null,
    budget: 1200000,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
];

// Sample Employees
export const sampleEmployees: Employee[] = [
  {
    employee_id: '550e8400-e29b-41d4-a716-446655440041',
    first_name: 'John',
    last_name: 'Doe',
    dob: new Date('1990-05-15'),
    gender: 'MALE',
    email: 'john.doe@company.com',
    phone_number: '+1-555-0101',
    address_id: '550e8400-e29b-41d4-a716-446655440001',
    department_id: '550e8400-e29b-41d4-a716-446655440031',
    job_id: '550e8400-e29b-41d4-a716-446655440021',
    hire_date: new Date('2023-01-15'),
    manager_id: null,
    status: 'ACTIVE',
    created_at: new Date('2023-01-15'),
    updated_at: new Date('2023-01-15')
  },
  {
    employee_id: '550e8400-e29b-41d4-a716-446655440042',
    first_name: 'Jane',
    last_name: 'Smith',
    dob: new Date('1988-08-22'),
    gender: 'FEMALE',
    email: 'jane.smith@company.com',
    phone_number: '+1-555-0102',
    address_id: '550e8400-e29b-41d4-a716-446655440002',
    department_id: '550e8400-e29b-41d4-a716-446655440032',
    job_id: '550e8400-e29b-41d4-a716-446655440022',
    hire_date: new Date('2022-03-10'),
    manager_id: null,
    status: 'ACTIVE',
    created_at: new Date('2022-03-10'),
    updated_at: new Date('2022-03-10')
  },
  {
    employee_id: '550e8400-e29b-41d4-a716-446655440043',
    first_name: 'Mike',
    last_name: 'Johnson',
    dob: new Date('1985-12-03'),
    gender: 'MALE',
    email: 'mike.johnson@company.com',
    phone_number: '+1-555-0103',
    address_id: '550e8400-e29b-41d4-a716-446655440003',
    department_id: '550e8400-e29b-41d4-a716-446655440033',
    job_id: '550e8400-e29b-41d4-a716-446655440023',
    hire_date: new Date('2021-06-01'),
    manager_id: null,
    status: 'ACTIVE',
    created_at: new Date('2021-06-01'),
    updated_at: new Date('2021-06-01')
  },
  {
    employee_id: '550e8400-e29b-41d4-a716-446655440044',
    first_name: 'Sarah',
    last_name: 'Wilson',
    dob: new Date('1992-04-18'),
    gender: 'FEMALE',
    email: 'sarah.wilson@company.com',
    phone_number: '+1-555-0104',
    address_id: '550e8400-e29b-41d4-a716-446655440002',
    department_id: '550e8400-e29b-41d4-a716-446655440034',
    job_id: '550e8400-e29b-41d4-a716-446655440024',
    hire_date: new Date('2023-09-15'),
    manager_id: null,
    status: 'ACTIVE',
    created_at: new Date('2023-09-15'),
    updated_at: new Date('2023-09-15')
  }
];

// Sample Salaries
export const sampleSalaries: Salary[] = [
  {
    salary_id: '550e8400-e29b-41d4-a716-446655440051',
    employee_id: '550e8400-e29b-41d4-a716-446655440041',
    amount: 95000,
    effective_from: new Date('2023-01-15'),
    effective_to: null,
    created_at: new Date('2023-01-15'),
    updated_at: new Date('2023-01-15')
  },
  {
    salary_id: '550e8400-e29b-41d4-a716-446655440052',
    employee_id: '550e8400-e29b-41d4-a716-446655440042',
    amount: 115000,
    effective_from: new Date('2022-03-10'),
    effective_to: null,
    created_at: new Date('2022-03-10'),
    updated_at: new Date('2022-03-10')
  },
  {
    salary_id: '550e8400-e29b-41d4-a716-446655440053',
    employee_id: '550e8400-e29b-41d4-a716-446655440043',
    amount: 85000,
    effective_from: new Date('2021-06-01'),
    effective_to: null,
    created_at: new Date('2021-06-01'),
    updated_at: new Date('2021-06-01')
  },
  {
    salary_id: '550e8400-e29b-41d4-a716-446655440054',
    employee_id: '550e8400-e29b-41d4-a716-446655440044',
    amount: 72000,
    effective_from: new Date('2023-09-15'),
    effective_to: null,
    created_at: new Date('2023-09-15'),
    updated_at: new Date('2023-09-15')
  }
];

// Sample Projects
export const sampleProjects: Project[] = [
  {
    project_id: '550e8400-e29b-41d4-a716-446655440061',
    project_name: 'Mobile App Development',
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-06-30'),
    status: 'IN_PROGRESS',
    department_id: '550e8400-e29b-41d4-a716-446655440031',
    budget: 500000,
    description: 'Develop a new mobile application for customer engagement',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    project_id: '550e8400-e29b-41d4-a716-446655440062',
    project_name: 'Website Redesign',
    start_date: new Date('2024-02-01'),
    end_date: new Date('2024-04-30'),
    status: 'IN_PROGRESS',
    department_id: '550e8400-e29b-41d4-a716-446655440034',
    budget: 150000,
    description: 'Complete redesign of company website',
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-01')
  },
  {
    project_id: '550e8400-e29b-41d4-a716-446655440063',
    project_name: 'HR System Upgrade',
    start_date: new Date('2023-10-01'),
    end_date: new Date('2024-01-31'),
    status: 'COMPLETED',
    department_id: '550e8400-e29b-41d4-a716-446655440033',
    budget: 200000,
    description: 'Upgrade existing HR management system',
    created_at: new Date('2023-10-01'),
    updated_at: new Date('2024-01-31')
  }
];

// Export all sample data
export const sampleData = {
  addresses: sampleAddresses,
  locations: sampleLocations,
  departments: sampleDepartments,
  jobs: sampleJobs,
  employees: sampleEmployees,
  salaries: sampleSalaries,
  projects: sampleProjects,
  attendances: [] as Attendance[],
  leaves: [] as Leave[],
  performanceReviews: [] as PerformanceReview[],
  trainings: [] as Training[],
  employeeTrainings: [] as EmployeeTraining[],
  employeeProjectAssignments: [] as EmployeeProjectAssignment[]
};