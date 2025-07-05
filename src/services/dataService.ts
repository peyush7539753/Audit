import { supabaseService } from './supabaseService';
import { mockData } from '../data/mockData';
import { sampleData } from '../data/sampleData';
import { auditService } from './auditService';
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
  EmployeeProjectAssignment,
  AuditRecord
} from '../types';

type EntityType = 
  | 'Employee' 
  | 'Department' 
  | 'Job' 
  | 'Address' 
  | 'Location' 
  | 'Project' 
  | 'Salary' 
  | 'Attendance' 
  | 'Leave' 
  | 'PerformanceReview' 
  | 'Training' 
  | 'EmployeeTraining' 
  | 'EmployeeProjectAssignment';

type EntityMap = {
  Employee: Employee;
  Department: Department;
  Job: Job;
  Address: Address;
  Location: Location;
  Project: Project;
  Salary: Salary;
  Attendance: Attendance;
  Leave: Leave;
  PerformanceReview: PerformanceReview;
  Training: Training;
  EmployeeTraining: EmployeeTraining;
  EmployeeProjectAssignment: EmployeeProjectAssignment;
};

class DataService {
  private useSupabase = true;
  private initialized = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    if (this.initialized) return;
    
    try {
      // Test Supabase connection
      await supabaseService.testConnection();
      
      // Check if we have any data, if not, load sample data
      const employees = await this.getAllEntities('Employee');
      if (employees.length === 0) {
        console.log('No data found, loading sample data...');
        await this.loadSampleData();
      }
      
      this.initialized = true;
    } catch (error) {
      console.warn('Supabase not available, using fallback data:', error);
      this.useSupabase = false;
      this.loadFallbackData();
      this.initialized = true;
    }
  }

  private async loadSampleData() {
    try {
      // Load sample data in order due to foreign key constraints
      for (const address of sampleData.addresses) {
        await supabaseService.create('addresses', address);
      }
      
      for (const location of sampleData.locations) {
        await supabaseService.create('locations', location);
      }
      
      for (const job of sampleData.jobs) {
        await supabaseService.create('jobs', job);
      }
      
      for (const department of sampleData.departments) {
        await supabaseService.create('departments', department);
      }
      
      for (const employee of sampleData.employees) {
        await supabaseService.create('employees', employee);
      }
      
      for (const salary of sampleData.salaries) {
        await supabaseService.create('salaries', salary);
      }
      
      for (const project of sampleData.projects) {
        await supabaseService.create('projects', project);
      }
      
      console.log('Sample data loaded successfully');
    } catch (error) {
      console.error('Failed to load sample data:', error);
      this.useSupabase = false;
      this.loadFallbackData();
    }
  }

  private loadFallbackData() {
    // Load mock data into memory as fallback
    console.log('Loading fallback data...');
  }

  private getTableName(entityType: EntityType): string {
    const tableMap: Record<EntityType, string> = {
      Employee: 'employees',
      Department: 'departments',
      Job: 'jobs',
      Address: 'addresses',
      Location: 'locations',
      Project: 'projects',
      Salary: 'salaries',
      Attendance: 'attendances',
      Leave: 'leaves',
      PerformanceReview: 'performance_reviews',
      Training: 'trainings',
      EmployeeTraining: 'employee_trainings',
      EmployeeProjectAssignment: 'employee_project_assignments'
    };
    return tableMap[entityType];
  }

  private getFallbackData<T extends EntityType>(entityType: T): EntityMap[T][] {
    const dataMap: Record<EntityType, any[]> = {
      Employee: [...mockData.employees, ...sampleData.employees],
      Department: [...mockData.departments, ...sampleData.departments],
      Job: [...mockData.jobs, ...sampleData.jobs],
      Address: [...mockData.addresses, ...sampleData.addresses],
      Location: [...mockData.locations, ...sampleData.locations],
      Project: [...mockData.projects, ...sampleData.projects],
      Salary: [...mockData.salaries, ...sampleData.salaries],
      Attendance: [...mockData.attendances, ...sampleData.attendances],
      Leave: [...mockData.leaves, ...sampleData.leaves],
      PerformanceReview: [...mockData.performanceReviews, ...sampleData.performanceReviews],
      Training: [...mockData.trainings, ...sampleData.trainings],
      EmployeeTraining: [...mockData.employeeTrainings, ...sampleData.employeeTrainings],
      EmployeeProjectAssignment: [...mockData.employeeProjectAssignments, ...sampleData.employeeProjectAssignments]
    };
    return dataMap[entityType] || [];
  }

  async getAllEntities<T extends EntityType>(entityType: T): Promise<EntityMap[T][]> {
    await this.initializeData();
    
    if (this.useSupabase) {
      try {
        const tableName = this.getTableName(entityType);
        const data = await supabaseService.getAll(tableName);
        return data as EntityMap[T][];
      } catch (error) {
        console.error(`Supabase getAll failed for ${entityType}, using fallback:`, error);
        this.useSupabase = false;
        return this.getFallbackData(entityType);
      }
    }
    
    return this.getFallbackData(entityType);
  }

  async getEntityById<T extends EntityType>(entityType: T, id: string): Promise<EntityMap[T] | null> {
    await this.initializeData();
    
    if (this.useSupabase) {
      try {
        const tableName = this.getTableName(entityType);
        const data = await supabaseService.getById(tableName, id);
        return data as EntityMap[T] | null;
      } catch (error) {
        console.error(`Supabase getById failed for ${entityType}, using fallback:`, error);
        this.useSupabase = false;
      }
    }
    
    const fallbackData = this.getFallbackData(entityType);
    const idField = this.getIdField(entityType);
    return fallbackData.find((item: any) => item[idField] === id) || null;
  }

  async createEntity<T extends EntityType>(entityType: T, data: Omit<EntityMap[T], 'created_at' | 'updated_at'>): Promise<EntityMap[T]> {
    await this.initializeData();
    
    const now = new Date();
    const entityData = {
      ...data,
      created_at: now,
      updated_at: now
    } as EntityMap[T];

    if (this.useSupabase) {
      try {
        const tableName = this.getTableName(entityType);
        const created = await supabaseService.create(tableName, entityData);
        
        // Log audit record
        await auditService.logAction({
          table_name: tableName,
          record_id: this.getEntityId(created),
          action: 'INSERT',
          new_values: created,
          user_email: 'system@company.com'
        });
        
        return created as EntityMap[T];
      } catch (error) {
        console.error(`Supabase create failed for ${entityType}, using fallback:`, error);
        this.useSupabase = false;
      }
    }
    
    // Fallback: add to mock data
    const fallbackData = this.getFallbackData(entityType);
    fallbackData.push(entityData);
    
    // Log audit record locally
    auditService.logAction({
      table_name: this.getTableName(entityType),
      record_id: this.getEntityId(entityData),
      action: 'INSERT',
      new_values: entityData,
      user_email: 'system@company.com'
    });
    
    return entityData;
  }

  async updateEntity<T extends EntityType>(entityType: T, id: string, data: Partial<EntityMap[T]>): Promise<EntityMap[T] | null> {
    await this.initializeData();
    
    const existing = await this.getEntityById(entityType, id);
    if (!existing) return null;

    const updatedData = {
      ...existing,
      ...data,
      updated_at: new Date()
    } as EntityMap[T];

    if (this.useSupabase) {
      try {
        const tableName = this.getTableName(entityType);
        const updated = await supabaseService.update(tableName, id, updatedData);
        
        // Log audit record
        await auditService.logAction({
          table_name: tableName,
          record_id: id,
          action: 'UPDATE',
          old_values: existing,
          new_values: updated,
          user_email: 'system@company.com'
        });
        
        return updated as EntityMap[T];
      } catch (error) {
        console.error(`Supabase update failed for ${entityType}, using fallback:`, error);
        this.useSupabase = false;
      }
    }
    
    // Fallback: update in mock data
    const fallbackData = this.getFallbackData(entityType);
    const idField = this.getIdField(entityType);
    const index = fallbackData.findIndex((item: any) => item[idField] === id);
    
    if (index !== -1) {
      fallbackData[index] = updatedData;
      
      // Log audit record locally
      auditService.logAction({
        table_name: this.getTableName(entityType),
        record_id: id,
        action: 'UPDATE',
        old_values: existing,
        new_values: updatedData,
        user_email: 'system@company.com'
      });
      
      return updatedData;
    }
    
    return null;
  }

  async deleteEntity<T extends EntityType>(entityType: T, id: string): Promise<boolean> {
    await this.initializeData();
    
    const existing = await this.getEntityById(entityType, id);
    if (!existing) return false;

    if (this.useSupabase) {
      try {
        const tableName = this.getTableName(entityType);
        await supabaseService.delete(tableName, id);
        
        // Log audit record
        await auditService.logAction({
          table_name: tableName,
          record_id: id,
          action: 'DELETE',
          old_values: existing,
          user_email: 'system@company.com'
        });
        
        return true;
      } catch (error) {
        console.error(`Supabase delete failed for ${entityType}, using fallback:`, error);
        this.useSupabase = false;
      }
    }
    
    // Fallback: remove from mock data
    const fallbackData = this.getFallbackData(entityType);
    const idField = this.getIdField(entityType);
    const index = fallbackData.findIndex((item: any) => item[idField] === id);
    
    if (index !== -1) {
      fallbackData.splice(index, 1);
      
      // Log audit record locally
      auditService.logAction({
        table_name: this.getTableName(entityType),
        record_id: id,
        action: 'DELETE',
        old_values: existing,
        user_email: 'system@company.com'
      });
      
      return true;
    }
    
    return false;
  }

  private getIdField(entityType: EntityType): string {
    const idFieldMap: Record<EntityType, string> = {
      Employee: 'employee_id',
      Department: 'department_id',
      Job: 'job_id',
      Address: 'address_id',
      Location: 'location_id',
      Project: 'project_id',
      Salary: 'salary_id',
      Attendance: 'attendance_id',
      Leave: 'leave_id',
      PerformanceReview: 'review_id',
      Training: 'training_id',
      EmployeeTraining: 'employee_training_id',
      EmployeeProjectAssignment: 'assignment_id'
    };
    return idFieldMap[entityType];
  }

  private getEntityId(entity: any): string {
    // Try common ID field patterns
    const possibleIdFields = [
      'employee_id', 'department_id', 'job_id', 'address_id', 'location_id',
      'project_id', 'salary_id', 'attendance_id', 'leave_id', 'review_id',
      'training_id', 'employee_training_id', 'assignment_id', 'id'
    ];
    
    for (const field of possibleIdFields) {
      if (entity[field]) {
        return entity[field];
      }
    }
    
    return 'unknown';
  }

  // Convenience methods for specific entities
  getEmployees(): Employee[] {
    return this.getAllEntities('Employee') as any;
  }

  getDepartments(): Department[] {
    return this.getAllEntities('Department') as any;
  }

  getJobs(): Job[] {
    return this.getAllEntities('Job') as any;
  }

  getAddresses(): Address[] {
    return this.getAllEntities('Address') as any;
  }

  getLocations(): Location[] {
    return this.getAllEntities('Location') as any;
  }

  getProjects(): Project[] {
    return this.getAllEntities('Project') as any;
  }

  getSalaries(): Salary[] {
    return this.getAllEntities('Salary') as any;
  }

  getAttendances(): Attendance[] {
    return this.getAllEntities('Attendance') as any;
  }

  getLeaves(): Leave[] {
    return this.getAllEntities('Leave') as any;
  }

  getPerformanceReviews(): PerformanceReview[] {
    return this.getAllEntities('PerformanceReview') as any;
  }

  getTrainings(): Training[] {
    return this.getAllEntities('Training') as any;
  }

  getEmployeeTrainings(): EmployeeTraining[] {
    return this.getAllEntities('EmployeeTraining') as any;
  }

  getEmployeeProjectAssignments(): EmployeeProjectAssignment[] {
    return this.getAllEntities('EmployeeProjectAssignment') as any;
  }
}

export const dataService = new DataService();