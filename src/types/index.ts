export interface AuditRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'QUERY';
  timestamp: Date;
  userId: string;
  userName: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: Record<string, any>;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email: string;
  phoneNumber: string;
  addressId: string;
  departmentId: string;
  jobId: string;
  hireDate: Date;
  managerId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  departmentName: string;
  locationId: string;
  headId?: string;
  budget: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  jobTitle: string;
  minSalary: number;
  maxSalary: number;
  jobDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Salary {
  id: string;
  employeeId: string;
  amount: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  projectName: string;
  startDate: Date;
  endDate?: Date;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  departmentId: string;
  budget: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeProjectAssignment {
  id: string;
  employeeId: string;
  projectId: string;
  role: string;
  assignedDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'REMOVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALF_DAY';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Leave {
  id: string;
  employeeId: string;
  leaveType: 'SICK' | 'VACATION' | 'PERSONAL' | 'MATERNITY' | 'PATERNITY' | 'EMERGENCY';
  startDate: Date;
  endDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewDate: Date;
  rating: number; // 1-5 scale
  comments: string;
  goals: string;
  achievements: string;
  areasForImprovement: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Training {
  id: string;
  trainingTitle: string;
  description: string;
  startDate: Date;
  endDate: Date;
  trainerName: string;
  departmentId: string;
  maxParticipants: number;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeTraining {
  id: string;
  employeeId: string;
  trainingId: string;
  status: 'ENROLLED' | 'COMPLETED' | 'DROPPED' | 'IN_PROGRESS';
  enrollmentDate: Date;
  completionDate?: Date;
  score?: number;
  certificate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  locationName: string;
  addressId: string;
  capacity: number;
  facilities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditConfig {
  enableAuditing: boolean;
  auditedEntities: string[];
  auditedActions: string[];
  retentionPeriod: number;
  logQueries: boolean;
  logCreates: boolean;
  logUpdates: boolean;
  logDeletes: boolean;
}

export interface QueryFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
  value2?: any;
}

export interface SearchQuery {
  entityType: string;
  filters: QueryFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}