import { 
  Employee, Department, Job, Salary, Project, EmployeeProjectAssignment,
  Attendance, Leave, PerformanceReview, Training, EmployeeTraining,
  Address, Location, QueryFilter, SearchQuery 
} from '../types';
import { 
  employees, departments, jobs, salaries, projects, employeeProjectAssignments,
  attendances, leaves, performanceReviews, trainings, employeeTrainings,
  addresses, locations 
} from '../data/mockData';
import { auditService } from './auditService';
import { supabaseService } from './supabaseService';
import { TABLES } from '../lib/supabase';

class DataService {
  // Use mock data as fallback for development
  private employees: Employee[] = [...employees];
  private departments: Department[] = [...departments];
  private jobs: Job[] = [...jobs];
  private salaries: Salary[] = [...salaries];
  private projects: Project[] = [...projects];
  private employeeProjectAssignments: EmployeeProjectAssignment[] = [...employeeProjectAssignments];
  private attendances: Attendance[] = [...attendances];
  private leaves: Leave[] = [...leaves];
  private performanceReviews: PerformanceReview[] = [...performanceReviews];
  private trainings: Training[] = [...trainings];
  private employeeTrainings: EmployeeTraining[] = [...employeeTrainings];
  private addresses: Address[] = [...addresses];
  private locations: Location[] = [...locations];
  
  private useSupabase = true; // Toggle for Supabase vs mock data

  // Generic CRUD operations with Supabase integration
  private async createEntity<T extends { id: string; createdAt: Date; updatedAt: Date }>(
    collection: T[],
    entityData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
    entityType: string,
    tableName: string,
    idField: string
  ): Promise<T> {
    const newEntity = {
      ...entityData,
      id: `${entityType.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    } as T;
    
    if (this.useSupabase) {
      try {
        const created = await supabaseService.create<T>(tableName, entityType, newEntity);
        
        // Log audit record
        await auditService.logAction(entityType, created.id, 'CREATE', [
          { field: 'entity', oldValue: null, newValue: `Created new ${entityType}` }
        ], 'current-user', 'Current User');
        
        return created;
      } catch (error) {
        console.error(`Supabase create failed for ${entityType}, using fallback:`, error);
        // Fallback to in-memory
        collection.push(newEntity);
        await auditService.logAction(entityType, newEntity.id, 'CREATE', [
          { field: 'entity', oldValue: null, newValue: `Created new ${entityType} (fallback)` }
        ], 'current-user', 'Current User');
        return newEntity;
      }
    } else {
      // Use in-memory storage
      collection.push(newEntity);
      await auditService.logAction(entityType, newEntity.id, 'CREATE', [
        { field: 'entity', oldValue: null, newValue: `Created new ${entityType}` }
      ], 'current-user', 'Current User');
      return newEntity;
    }
  }

  private async updateEntity<T extends { id: string; updatedAt: Date }>(
    collection: T[],
    id: string,
    updates: Partial<T>,
    entityType: string,
    tableName: string,
    idField: string
  ): Promise<T | null> {
    if (this.useSupabase) {
      try {
        const oldEntity = await supabaseService.getById<T>(tableName, entityType, id, idField);
        if (!oldEntity) return null;
        
        const updated = await supabaseService.update<T>(tableName, entityType, id, idField, updates);
        if (!updated) return null;
        
        // Calculate changes for audit
        const changes = Object.entries(updates).map(([field, newValue]) => ({
          field,
          oldValue: (oldEntity as any)[field],
          newValue
        }));

        await auditService.logAction(entityType, id, 'UPDATE', changes, 'current-user', 'Current User');
        return updated;
      } catch (error) {
        console.error(`Supabase update failed for ${entityType}, using fallback:`, error);
        // Fallback to in-memory
        const index = collection.findIndex(item => item.id === id);
        if (index === -1) return null;

        const oldEntity = { ...collection[index] };
        const updatedEntity = { ...oldEntity, ...updates, updatedAt: new Date() };
        
        const changes = Object.entries(updates).map(([field, newValue]) => ({
          field,
          oldValue: (oldEntity as any)[field],
          newValue
        }));

        collection[index] = updatedEntity;
        await auditService.logAction(entityType, id, 'UPDATE', changes, 'current-user', 'Current User');
        return updatedEntity;
      }
    } else {
      // Use in-memory storage
      const index = collection.findIndex(item => item.id === id);
      if (index === -1) return null;

      const oldEntity = { ...collection[index] };
      const updatedEntity = { ...oldEntity, ...updates, updatedAt: new Date() };
      
      const changes = Object.entries(updates).map(([field, newValue]) => ({
        field,
        oldValue: (oldEntity as any)[field],
        newValue
      }));

      collection[index] = updatedEntity;
      await auditService.logAction(entityType, id, 'UPDATE', changes, 'current-user', 'Current User');
      return updatedEntity;
    }
  }

  private async deleteEntity<T extends { id: string }>(
    collection: T[],
    id: string,
    entityType: string,
    tableName: string,
    idField: string
  ): Promise<boolean> {
    if (this.useSupabase) {
      try {
        const success = await supabaseService.delete(tableName, entityType, id, idField);
        await auditService.logAction(entityType, id, 'DELETE', [
          { field: 'entity', oldValue: `${entityType} record`, newValue: null }
        ], 'current-user', 'Current User');
        return success;
      } catch (error) {
        console.error(`Supabase delete failed for ${entityType}, using fallback:`, error);
        // Fallback to in-memory
        const index = collection.findIndex(item => item.id === id);
        if (index === -1) return false;

        collection.splice(index, 1);
        await auditService.logAction(entityType, id, 'DELETE', [
          { field: 'entity', oldValue: `${entityType} record (fallback)`, newValue: null }
        ], 'current-user', 'Current User');
        return true;
      }
    } else {
      // Use in-memory storage
      const index = collection.findIndex(item => item.id === id);
      if (index === -1) return false;

      collection.splice(index, 1);
      await auditService.logAction(entityType, id, 'DELETE', [
        { field: 'entity', oldValue: `${entityType} record`, newValue: null }
      ], 'current-user', 'Current User');
      return true;
    }
  }

  private async getAllEntities<T>(
    collection: T[],
    entityType: string,
    tableName: string
  ): Promise<T[]> {
    if (this.useSupabase) {
      try {
        return await supabaseService.getAll<T>(tableName, entityType);
      } catch (error) {
        console.error(`Supabase getAll failed for ${entityType}, using fallback:`, error);
        return [...collection];
      }
    } else {
      return [...collection];
    }
  }

  private async getEntityById<T>(
    collection: T[],
    id: string,
    entityType: string,
    tableName: string,
    idField: string
  ): Promise<T | null> {
    if (this.useSupabase) {
      try {
        return await supabaseService.getById<T>(tableName, entityType, id, idField);
      } catch (error) {
        console.error(`Supabase getById failed for ${entityType}, using fallback:`, error);
        return collection.find((item: any) => item.id === id) || null;
      }
    } else {
      return collection.find((item: any) => item.id === id) || null;
    }
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return this.getAllEntities(this.employees, 'Employee', TABLES.EMPLOYEES);
  }

  getEmployee(id: string): Employee | null {
    return this.employees.find(emp => emp.id === id) || null;
  }

  async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    return this.createEntity(this.employees, employee, 'Employee', TABLES.EMPLOYEES, 'employee_id');
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
    return this.updateEntity(this.employees, id, updates, 'Employee', TABLES.EMPLOYEES, 'employee_id');
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.deleteEntity(this.employees, id, 'Employee', TABLES.EMPLOYEES, 'employee_id');
  }

  // Department operations
  getDepartments(): Department[] {
    return [...this.departments];
  }

  getDepartment(id: string): Department | null {
    return this.departments.find(dept => dept.id === id) || null;
  }

  async createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    return this.createEntity(this.departments, department, 'Department', TABLES.DEPARTMENTS, 'department_id');
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | null> {
    return this.updateEntity(this.departments, id, updates, 'Department', TABLES.DEPARTMENTS, 'department_id');
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.deleteEntity(this.departments, id, 'Department', TABLES.DEPARTMENTS, 'department_id');
  }

  // Job operations
  getJobs(): Job[] {
    return [...this.jobs];
  }

  getJob(id: string): Job | null {
    return this.jobs.find(job => job.id === id) || null;
  }

  async createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    return this.createEntity(this.jobs, job, 'Job', TABLES.JOBS, 'job_id');
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    return this.updateEntity(this.jobs, id, updates, 'Job', TABLES.JOBS, 'job_id');
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.deleteEntity(this.jobs, id, 'Job', TABLES.JOBS, 'job_id');
  }

  // Salary operations
  getSalaries(): Salary[] {
    return [...this.salaries];
  }

  getSalary(id: string): Salary | null {
    return this.salaries.find(salary => salary.id === id) || null;
  }

  getEmployeeSalaries(employeeId: string): Salary[] {
    return this.salaries.filter(salary => salary.employeeId === employeeId);
  }

  async createSalary(salary: Omit<Salary, 'id' | 'createdAt' | 'updatedAt'>): Promise<Salary> {
    return this.createEntity(this.salaries, salary, 'Salary', TABLES.SALARIES, 'salary_id');
  }

  async updateSalary(id: string, updates: Partial<Salary>): Promise<Salary | null> {
    return this.updateEntity(this.salaries, id, updates, 'Salary', TABLES.SALARIES, 'salary_id');
  }

  async deleteSalary(id: string): Promise<boolean> {
    return this.deleteEntity(this.salaries, id, 'Salary', TABLES.SALARIES, 'salary_id');
  }

  // Project operations
  getProjects(): Project[] {
    return [...this.projects];
  }

  getProject(id: string): Project | null {
    return this.projects.find(proj => proj.id === id) || null;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return this.createEntity(this.projects, project, 'Project', TABLES.PROJECTS, 'project_id');
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    return this.updateEntity(this.projects, id, updates, 'Project', TABLES.PROJECTS, 'project_id');
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.deleteEntity(this.projects, id, 'Project', TABLES.PROJECTS, 'project_id');
  }

  // Employee Project Assignment operations
  getEmployeeProjectAssignments(): EmployeeProjectAssignment[] {
    return [...this.employeeProjectAssignments];
  }

  getEmployeeProjectAssignment(id: string): EmployeeProjectAssignment | null {
    return this.employeeProjectAssignments.find(assignment => assignment.id === id) || null;
  }

  getEmployeeAssignments(employeeId: string): EmployeeProjectAssignment[] {
    return this.employeeProjectAssignments.filter(assignment => assignment.employeeId === employeeId);
  }

  async createEmployeeProjectAssignment(assignment: Omit<EmployeeProjectAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeProjectAssignment> {
    return this.createEntity(this.employeeProjectAssignments, assignment, 'EmployeeProjectAssignment', TABLES.EMPLOYEE_PROJECT_ASSIGNMENTS, 'assignment_id');
  }

  async updateEmployeeProjectAssignment(id: string, updates: Partial<EmployeeProjectAssignment>): Promise<EmployeeProjectAssignment | null> {
    return this.updateEntity(this.employeeProjectAssignments, id, updates, 'EmployeeProjectAssignment', TABLES.EMPLOYEE_PROJECT_ASSIGNMENTS, 'assignment_id');
  }

  async deleteEmployeeProjectAssignment(id: string): Promise<boolean> {
    return this.deleteEntity(this.employeeProjectAssignments, id, 'EmployeeProjectAssignment', TABLES.EMPLOYEE_PROJECT_ASSIGNMENTS, 'assignment_id');
  }

  // Attendance operations
  getAttendances(): Attendance[] {
    return [...this.attendances];
  }

  getAttendance(id: string): Attendance | null {
    return this.attendances.find(attendance => attendance.id === id) || null;
  }

  getEmployeeAttendances(employeeId: string): Attendance[] {
    return this.attendances.filter(attendance => attendance.employeeId === employeeId);
  }

  async createAttendance(attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Attendance> {
    return this.createEntity(this.attendances, attendance, 'Attendance', TABLES.ATTENDANCES, 'attendance_id');
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | null> {
    return this.updateEntity(this.attendances, id, updates, 'Attendance', TABLES.ATTENDANCES, 'attendance_id');
  }

  async deleteAttendance(id: string): Promise<boolean> {
    return this.deleteEntity(this.attendances, id, 'Attendance', TABLES.ATTENDANCES, 'attendance_id');
  }

  // Leave operations
  getLeaves(): Leave[] {
    return [...this.leaves];
  }

  getLeave(id: string): Leave | null {
    return this.leaves.find(leave => leave.id === id) || null;
  }

  getEmployeeLeaves(employeeId: string): Leave[] {
    return this.leaves.filter(leave => leave.employeeId === employeeId);
  }

  async createLeave(leave: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>): Promise<Leave> {
    return this.createEntity(this.leaves, leave, 'Leave', TABLES.LEAVES, 'leave_id');
  }

  async updateLeave(id: string, updates: Partial<Leave>): Promise<Leave | null> {
    return this.updateEntity(this.leaves, id, updates, 'Leave', TABLES.LEAVES, 'leave_id');
  }

  async deleteLeave(id: string): Promise<boolean> {
    return this.deleteEntity(this.leaves, id, 'Leave', TABLES.LEAVES, 'leave_id');
  }

  // Performance Review operations
  getPerformanceReviews(): PerformanceReview[] {
    return [...this.performanceReviews];
  }

  getPerformanceReview(id: string): PerformanceReview | null {
    return this.performanceReviews.find(review => review.id === id) || null;
  }

  getEmployeeReviews(employeeId: string): PerformanceReview[] {
    return this.performanceReviews.filter(review => review.employeeId === employeeId);
  }

  async createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceReview> {
    return this.createEntity(this.performanceReviews, review, 'PerformanceReview', TABLES.PERFORMANCE_REVIEWS, 'review_id');
  }

  async updatePerformanceReview(id: string, updates: Partial<PerformanceReview>): Promise<PerformanceReview | null> {
    return this.updateEntity(this.performanceReviews, id, updates, 'PerformanceReview', TABLES.PERFORMANCE_REVIEWS, 'review_id');
  }

  async deletePerformanceReview(id: string): Promise<boolean> {
    return this.deleteEntity(this.performanceReviews, id, 'PerformanceReview', TABLES.PERFORMANCE_REVIEWS, 'review_id');
  }

  // Training operations
  getTrainings(): Training[] {
    return [...this.trainings];
  }

  getTraining(id: string): Training | null {
    return this.trainings.find(training => training.id === id) || null;
  }

  async createTraining(training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>): Promise<Training> {
    return this.createEntity(this.trainings, training, 'Training', TABLES.TRAININGS, 'training_id');
  }

  async updateTraining(id: string, updates: Partial<Training>): Promise<Training | null> {
    return this.updateEntity(this.trainings, id, updates, 'Training', TABLES.TRAININGS, 'training_id');
  }

  async deleteTraining(id: string): Promise<boolean> {
    return this.deleteEntity(this.trainings, id, 'Training', TABLES.TRAININGS, 'training_id');
  }

  // Employee Training operations
  getEmployeeTrainings(): EmployeeTraining[] {
    return [...this.employeeTrainings];
  }

  getEmployeeTraining(id: string): EmployeeTraining | null {
    return this.employeeTrainings.find(empTraining => empTraining.id === id) || null;
  }

  getEmployeeTrainingRecords(employeeId: string): EmployeeTraining[] {
    return this.employeeTrainings.filter(empTraining => empTraining.employeeId === employeeId);
  }

  async createEmployeeTraining(empTraining: Omit<EmployeeTraining, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeTraining> {
    return this.createEntity(this.employeeTrainings, empTraining, 'EmployeeTraining', TABLES.EMPLOYEE_TRAININGS, 'employee_training_id');
  }

  async updateEmployeeTraining(id: string, updates: Partial<EmployeeTraining>): Promise<EmployeeTraining | null> {
    return this.updateEntity(this.employeeTrainings, id, updates, 'EmployeeTraining', TABLES.EMPLOYEE_TRAININGS, 'employee_training_id');
  }

  async deleteEmployeeTraining(id: string): Promise<boolean> {
    return this.deleteEntity(this.employeeTrainings, id, 'EmployeeTraining', TABLES.EMPLOYEE_TRAININGS, 'employee_training_id');
  }

  // Address operations
  getAddresses(): Address[] {
    return [...this.addresses];
  }

  getAddress(id: string): Address | null {
    return this.addresses.find(addr => addr.id === id) || null;
  }

  async createAddress(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    return this.createEntity(this.addresses, address, 'Address', TABLES.ADDRESSES, 'address_id');
  }

  async updateAddress(id: string, updates: Partial<Address>): Promise<Address | null> {
    return this.updateEntity(this.addresses, id, updates, 'Address', TABLES.ADDRESSES, 'address_id');
  }

  async deleteAddress(id: string): Promise<boolean> {
    return this.deleteEntity(this.addresses, id, 'Address', TABLES.ADDRESSES, 'address_id');
  }

  // Location operations
  getLocations(): Location[] {
    return [...this.locations];
  }

  getLocation(id: string): Location | null {
    return this.locations.find(loc => loc.id === id) || null;
  }

  async createLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
    return this.createEntity(this.locations, location, 'Location', TABLES.LOCATIONS, 'location_id');
  }

  async updateLocation(id: string, updates: Partial<Location>): Promise<Location | null> {
    return this.updateEntity(this.locations, id, updates, 'Location', TABLES.LOCATIONS, 'location_id');
  }

  async deleteLocation(id: string): Promise<boolean> {
    return this.deleteEntity(this.locations, id, 'Location', TABLES.LOCATIONS, 'location_id');
  }

  // Advanced search
  async searchEmployees(query: SearchQuery): Promise<Employee[]> {
    let results = this.employees;

    query.filters.forEach(filter => {
      results = results.filter(employee => this.applyFilter(employee, filter));
    });

    if (query.sortBy) {
      results.sort((a, b) => {
        const aValue = (a as any)[query.sortBy!];
        const bValue = (b as any)[query.sortBy!];
        const modifier = query.sortOrder === 'desc' ? -1 : 1;
        return aValue > bValue ? modifier : -modifier;
      });
    }

    await auditService.logAction('Employee', 'search', 'QUERY', [
      { field: 'searchQuery', oldValue: null, newValue: JSON.stringify(query) }
    ], 'current-user', 'Current User');

    const offset = query.offset || 0;
    const limit = query.limit || 100;
    return results.slice(offset, offset + limit);
  }

  private applyFilter(entity: any, filter: QueryFilter): boolean {
    const fieldValue = entity[filter.field];
    
    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    switch (filter.operator) {
      case 'equals':
        return fieldValue === filter.value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
      case 'startsWith':
        return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
      case 'endsWith':
        return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
      case 'greaterThan':
        return fieldValue > filter.value;
      case 'lessThan':
        return fieldValue < filter.value;
      case 'between':
        return fieldValue >= filter.value && fieldValue <= filter.value2;
      default:
        return false;
    }
  }

  // Entity restoration with Supabase
  async restoreEntityToDatabase(entityType: string, entityId: string, restoredData: any): Promise<boolean> {
    const tableMapping = {
      'Employee': { table: TABLES.EMPLOYEES, idField: 'employee_id' },
      'Department': { table: TABLES.DEPARTMENTS, idField: 'department_id' },
      'Job': { table: TABLES.JOBS, idField: 'job_id' },
      'Salary': { table: TABLES.SALARIES, idField: 'salary_id' },
      'Project': { table: TABLES.PROJECTS, idField: 'project_id' },
      'EmployeeProjectAssignment': { table: TABLES.EMPLOYEE_PROJECT_ASSIGNMENTS, idField: 'assignment_id' },
      'Attendance': { table: TABLES.ATTENDANCES, idField: 'attendance_id' },
      'Leave': { table: TABLES.LEAVES, idField: 'leave_id' },
      'PerformanceReview': { table: TABLES.PERFORMANCE_REVIEWS, idField: 'review_id' },
      'Training': { table: TABLES.TRAININGS, idField: 'training_id' },
      'EmployeeTraining': { table: TABLES.EMPLOYEE_TRAININGS, idField: 'employee_training_id' },
      'Address': { table: TABLES.ADDRESSES, idField: 'address_id' },
      'Location': { table: TABLES.LOCATIONS, idField: 'location_id' }
    };

    const mapping = tableMapping[entityType as keyof typeof tableMapping];
    if (!mapping) {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

    if (this.useSupabase) {
      try {
        return await supabaseService.restoreEntity(mapping.table, entityType, entityId, mapping.idField, restoredData);
      } catch (error) {
        console.error(`Supabase restore failed for ${entityType}:`, error);
        throw error;
      }
    } else {
      // Fallback to in-memory update
      return this.updateEntity(
        this.getCollectionByType(entityType),
        entityId,
        restoredData,
        entityType,
        mapping.table,
        mapping.idField
      ).then(result => !!result);
    }
  }

  private getCollectionByType(entityType: string): any[] {
    switch (entityType) {
      case 'Employee': return this.employees;
      case 'Department': return this.departments;
      case 'Job': return this.jobs;
      case 'Salary': return this.salaries;
      case 'Project': return this.projects;
      case 'EmployeeProjectAssignment': return this.employeeProjectAssignments;
      case 'Attendance': return this.attendances;
      case 'Leave': return this.leaves;
      case 'PerformanceReview': return this.performanceReviews;
      case 'Training': return this.trainings;
      case 'EmployeeTraining': return this.employeeTrainings;
      case 'Address': return this.addresses;
      case 'Location': return this.locations;
      default: return [];
    }
  }
}

export const dataService = new DataService();