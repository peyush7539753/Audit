import { 
  Employee, Department, Job, Salary, Project, EmployeeProjectAssignment,
  Attendance, Leave, PerformanceReview, Training, EmployeeTraining,
  Address, Location, AuditRecord 
} from '../types';

export const addresses: Address[] = [
  {
    id: 'addr-1',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'addr-2',
    street: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90210',
    country: 'USA',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'addr-3',
    street: '789 Corporate Blvd',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60601',
    country: 'USA',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'addr-4',
    street: '321 Tech Park Drive',
    city: 'Austin',
    state: 'TX',
    postalCode: '73301',
    country: 'USA',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const locations: Location[] = [
  {
    id: 'loc-1',
    locationName: 'New York Headquarters',
    addressId: 'addr-1',
    capacity: 500,
    facilities: ['Conference Rooms', 'Cafeteria', 'Gym', 'Parking'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'loc-2',
    locationName: 'Los Angeles Office',
    addressId: 'addr-2',
    capacity: 200,
    facilities: ['Conference Rooms', 'Cafeteria', 'Parking'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'loc-3',
    locationName: 'Chicago Branch',
    addressId: 'addr-3',
    capacity: 150,
    facilities: ['Conference Rooms', 'Parking'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const departments: Department[] = [
  {
    id: 'dept-1',
    departmentName: 'Engineering',
    locationId: 'loc-1',
    headId: 'emp-1',
    budget: 2500000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dept-2',
    departmentName: 'Human Resources',
    locationId: 'loc-1',
    headId: 'emp-2',
    budget: 800000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dept-3',
    departmentName: 'Marketing',
    locationId: 'loc-2',
    budget: 1200000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dept-4',
    departmentName: 'Finance',
    locationId: 'loc-1',
    budget: 900000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const jobs: Job[] = [
  {
    id: 'job-1',
    jobTitle: 'Senior Software Engineer',
    minSalary: 80000,
    maxSalary: 120000,
    jobDescription: 'Lead software development projects and mentor junior developers',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'job-2',
    jobTitle: 'HR Manager',
    minSalary: 60000,
    maxSalary: 90000,
    jobDescription: 'Manage human resources operations and employee relations',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'job-3',
    jobTitle: 'Marketing Specialist',
    minSalary: 45000,
    maxSalary: 70000,
    jobDescription: 'Develop and execute marketing campaigns',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'job-4',
    jobTitle: 'Financial Analyst',
    minSalary: 55000,
    maxSalary: 80000,
    jobDescription: 'Analyze financial data and prepare reports',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const employees: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1985-06-15'),
    gender: 'MALE',
    email: 'john.doe@company.com',
    phoneNumber: '+1-555-0123',
    addressId: 'addr-1',
    departmentId: 'dept-1',
    jobId: 'job-1',
    hireDate: new Date('2023-03-15'),
    status: 'ACTIVE',
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'emp-2',
    employeeId: 'EMP002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: new Date('1988-09-22'),
    gender: 'FEMALE',
    email: 'sarah.johnson@company.com',
    phoneNumber: '+1-555-0456',
    addressId: 'addr-2',
    departmentId: 'dept-2',
    jobId: 'job-2',
    hireDate: new Date('2023-06-01'),
    managerId: 'emp-1',
    status: 'ACTIVE',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01')
  },
  {
    id: 'emp-3',
    employeeId: 'EMP003',
    firstName: 'Michael',
    lastName: 'Brown',
    dateOfBirth: new Date('1990-12-03'),
    gender: 'MALE',
    email: 'michael.brown@company.com',
    phoneNumber: '+1-555-0789',
    addressId: 'addr-3',
    departmentId: 'dept-3',
    jobId: 'job-3',
    hireDate: new Date('2023-08-15'),
    managerId: 'emp-1',
    status: 'ACTIVE',
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2023-08-15')
  }
];

export const salaries: Salary[] = [
  {
    id: 'sal-1',
    employeeId: 'emp-1',
    amount: 95000,
    effectiveFrom: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'sal-2',
    employeeId: 'emp-2',
    amount: 75000,
    effectiveFrom: new Date('2023-06-01'),
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01')
  },
  {
    id: 'sal-3',
    employeeId: 'emp-3',
    amount: 58000,
    effectiveFrom: new Date('2023-08-15'),
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2023-08-15')
  }
];

export const projects: Project[] = [
  {
    id: 'proj-1',
    projectName: 'Employee Management System',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    status: 'IN_PROGRESS',
    departmentId: 'dept-1',
    budget: 500000,
    description: 'Comprehensive employee management and audit system',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'proj-2',
    projectName: 'Marketing Campaign Q2',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-06-30'),
    status: 'PLANNING',
    departmentId: 'dept-3',
    budget: 200000,
    description: 'Q2 marketing campaign for product launch',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  }
];

export const employeeProjectAssignments: EmployeeProjectAssignment[] = [
  {
    id: 'assign-1',
    employeeId: 'emp-1',
    projectId: 'proj-1',
    role: 'Project Lead',
    assignedDate: new Date('2024-01-15'),
    status: 'ACTIVE',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'assign-2',
    employeeId: 'emp-3',
    projectId: 'proj-2',
    role: 'Marketing Coordinator',
    assignedDate: new Date('2024-03-15'),
    status: 'ACTIVE',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  }
];

export const attendances: Attendance[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    date: new Date('2024-01-15'),
    checkInTime: new Date('2024-01-15T09:00:00'),
    checkOutTime: new Date('2024-01-15T17:30:00'),
    status: 'PRESENT',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    date: new Date('2024-01-15'),
    checkInTime: new Date('2024-01-15T08:45:00'),
    checkOutTime: new Date('2024-01-15T17:15:00'),
    status: 'PRESENT',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const leaves: Leave[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-2',
    leaveType: 'VACATION',
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-20'),
    status: 'APPROVED',
    reason: 'Family vacation',
    approvedBy: 'emp-1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05')
  }
];

export const performanceReviews: PerformanceReview[] = [
  {
    id: 'review-1',
    employeeId: 'emp-2',
    reviewerId: 'emp-1',
    reviewDate: new Date('2024-01-30'),
    rating: 4,
    comments: 'Excellent performance in HR management',
    goals: 'Improve employee engagement metrics',
    achievements: 'Successfully implemented new onboarding process',
    areasForImprovement: 'Enhance data analysis skills',
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30')
  }
];

export const trainings: Training[] = [
  {
    id: 'train-1',
    trainingTitle: 'Leadership Development',
    description: 'Advanced leadership skills for managers',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-05'),
    trainerName: 'Dr. Jane Smith',
    departmentId: 'dept-2',
    maxParticipants: 20,
    cost: 5000,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 'train-2',
    trainingTitle: 'Technical Skills Workshop',
    description: 'Latest technologies and best practices',
    startDate: new Date('2024-04-15'),
    endDate: new Date('2024-04-17'),
    trainerName: 'John Tech',
    departmentId: 'dept-1',
    maxParticipants: 15,
    cost: 3000,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  }
];

export const employeeTrainings: EmployeeTraining[] = [
  {
    id: 'emp-train-1',
    employeeId: 'emp-2',
    trainingId: 'train-1',
    status: 'ENROLLED',
    enrollmentDate: new Date('2024-02-20'),
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: 'emp-train-2',
    employeeId: 'emp-1',
    trainingId: 'train-2',
    status: 'ENROLLED',
    enrollmentDate: new Date('2024-03-10'),
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  }
];

export const auditRecords: AuditRecord[] = [
  {
    id: 'audit-1',
    entityType: 'Employee',
    entityId: 'emp-1',
    action: 'UPDATE',
    timestamp: new Date('2024-01-10T10:30:00Z'),
    userId: 'user-1',
    userName: 'Admin User',
    changes: [
      {
        field: 'email',
        oldValue: 'john.doe.old@company.com',
        newValue: 'john.doe@company.com'
      }
    ],
    metadata: {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    id: 'audit-2',
    entityType: 'Salary',
    entityId: 'sal-1',
    action: 'CREATE',
    timestamp: new Date('2024-01-01T09:00:00Z'),
    userId: 'user-1',
    userName: 'Admin User',
    changes: [
      {
        field: 'amount',
        oldValue: null,
        newValue: 95000
      }
    ],
    metadata: {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    id: 'audit-3',
    entityType: 'Leave',
    entityId: 'leave-1',
    action: 'UPDATE',
    timestamp: new Date('2024-02-05T14:15:00Z'),
    userId: 'user-1',
    userName: 'Admin User',
    changes: [
      {
        field: 'status',
        oldValue: 'PENDING',
        newValue: 'APPROVED'
      }
    ],
    metadata: {
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (MacOS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0'
    }
  }
];