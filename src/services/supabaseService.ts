import { supabase, TABLES, type Database } from '../lib/supabase'
import { 
  Employee, Department, Job, Salary, Project, EmployeeProjectAssignment,
  Attendance, Leave, PerformanceReview, Training, EmployeeTraining,
  Address, Location, AuditRecord 
} from '../types'

class SupabaseService {
  private isAvailable(): boolean {
    return supabase !== null
  }

  // Helper function to convert database row to application entity
  private convertDatabaseToEntity<T>(row: any, entityType: string): T {
    if (!row) return row
    
    const converted = { ...row }
    
    // Convert database field names to application field names
    switch (entityType) {
      case 'Address':
        return {
          id: row.address_id,
          street: row.street,
          city: row.city,
          state: row.state,
          postalCode: row.postal_code,
          country: row.country,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'Location':
        return {
          id: row.location_id,
          locationName: row.location_name,
          addressId: row.address_id,
          capacity: row.capacity || 0,
          facilities: row.facilities || [],
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'Department':
        return {
          id: row.department_id,
          departmentName: row.department_name,
          locationId: row.location_id,
          headId: row.head_id,
          budget: row.budget || 0,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'Job':
        return {
          id: row.job_id,
          jobTitle: row.job_title,
          minSalary: row.min_salary || 0,
          maxSalary: row.max_salary || 0,
          jobDescription: row.job_description || '',
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'Employee':
        return {
          id: row.employee_id,
          employeeId: row.employee_id,
          firstName: row.first_name,
          lastName: row.last_name,
          dateOfBirth: row.dob ? new Date(row.dob) : new Date(),
          gender: row.gender || 'OTHER',
          email: row.email,
          phoneNumber: row.phone_number || '',
          addressId: row.address_id || '',
          departmentId: row.department_id || '',
          jobId: row.job_id || '',
          hireDate: new Date(row.hire_date),
          managerId: row.manager_id,
          status: row.status || 'ACTIVE',
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'Salary':
        return {
          id: row.salary_id,
          employeeId: row.employee_id,
          amount: row.amount,
          effectiveFrom: new Date(row.effective_from),
          effectiveTo: row.effective_to ? new Date(row.effective_to) : undefined,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'Project':
        return {
          id: row.project_id,
          projectName: row.project_name,
          startDate: new Date(row.start_date),
          endDate: row.end_date ? new Date(row.end_date) : undefined,
          status: row.status || 'PLANNING',
          departmentId: row.department_id || '',
          budget: row.budget || 0,
          description: row.description || '',
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'EmployeeProjectAssignment':
        return {
          id: row.assignment_id,
          employeeId: row.employee_id,
          projectId: row.project_id,
          role: row.role,
          assignedDate: new Date(row.assigned_date),
          endDate: row.end_date ? new Date(row.end_date) : undefined,
          status: row.status || 'ACTIVE',
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'Attendance':
        return {
          id: row.attendance_id,
          employeeId: row.employee_id,
          date: new Date(row.date),
          checkInTime: row.check_in_time ? new Date(row.check_in_time) : undefined,
          checkOutTime: row.check_out_time ? new Date(row.check_out_time) : undefined,
          status: row.status || 'PRESENT',
          notes: row.notes,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'Leave':
        return {
          id: row.leave_id,
          employeeId: row.employee_id,
          leaveType: row.leave_type,
          startDate: new Date(row.start_date),
          endDate: new Date(row.end_date),
          status: row.status || 'PENDING',
          reason: row.reason || '',
          approvedBy: row.approved_by,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'PerformanceReview':
        return {
          id: row.review_id,
          employeeId: row.employee_id,
          reviewerId: row.reviewer_id,
          reviewDate: new Date(row.review_date),
          rating: row.rating || 1,
          comments: row.comments || '',
          goals: row.goals || '',
          achievements: row.achievements || '',
          areasForImprovement: row.areas_for_improvement || '',
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'Training':
        return {
          id: row.training_id,
          trainingTitle: row.training_title,
          description: row.description || '',
          startDate: new Date(row.start_date),
          endDate: row.end_date ? new Date(row.end_date) : new Date(),
          trainerName: row.trainer_name || '',
          departmentId: row.department_id || '',
          maxParticipants: row.max_participants || 0,
          cost: row.cost || 0,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      case 'EmployeeTraining':
        return {
          id: row.employee_training_id,
          employeeId: row.employee_id,
          trainingId: row.training_id,
          status: row.status || 'ENROLLED',
          enrollmentDate: new Date(row.enrollment_date || row.created_at),
          completionDate: row.completion_date ? new Date(row.completion_date) : undefined,
          score: row.score,
          certificate: row.certificate,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        } as T
        
      default:
        return converted as T
    }
  }

  // Helper function to convert application entity to database row
  private convertEntityToDatabase(entity: any, entityType: string): any {
    if (!entity) return entity
    
    const converted = { ...entity }
    
    switch (entityType) {
      case 'Address':
        return {
          address_id: entity.id,
          street: entity.street,
          city: entity.city,
          state: entity.state,
          postal_code: entity.postalCode,
          country: entity.country,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'Location':
        return {
          location_id: entity.id,
          location_name: entity.locationName,
          address_id: entity.addressId,
          capacity: entity.capacity,
          facilities: entity.facilities,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'Department':
        return {
          department_id: entity.id,
          department_name: entity.departmentName,
          location_id: entity.locationId,
          head_id: entity.headId,
          budget: entity.budget,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'Job':
        return {
          job_id: entity.id,
          job_title: entity.jobTitle,
          min_salary: entity.minSalary,
          max_salary: entity.maxSalary,
          job_description: entity.jobDescription,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'Employee':
        return {
          employee_id: entity.id,
          first_name: entity.firstName,
          last_name: entity.lastName,
          dob: entity.dateOfBirth?.toISOString().split('T')[0],
          gender: entity.gender,
          email: entity.email,
          phone_number: entity.phoneNumber,
          address_id: entity.addressId,
          department_id: entity.departmentId,
          job_id: entity.jobId,
          hire_date: entity.hireDate?.toISOString().split('T')[0],
          manager_id: entity.managerId,
          status: entity.status,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'Salary':
        return {
          salary_id: entity.id,
          employee_id: entity.employeeId,
          amount: entity.amount,
          effective_from: entity.effectiveFrom?.toISOString().split('T')[0],
          effective_to: entity.effectiveTo?.toISOString().split('T')[0],
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'Project':
        return {
          project_id: entity.id,
          project_name: entity.projectName,
          start_date: entity.startDate?.toISOString().split('T')[0],
          end_date: entity.endDate?.toISOString().split('T')[0],
          status: entity.status,
          department_id: entity.departmentId,
          budget: entity.budget,
          description: entity.description,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'EmployeeProjectAssignment':
        return {
          assignment_id: entity.id,
          employee_id: entity.employeeId,
          project_id: entity.projectId,
          role: entity.role,
          assigned_date: entity.assignedDate?.toISOString().split('T')[0],
          end_date: entity.endDate?.toISOString().split('T')[0],
          status: entity.status,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'Attendance':
        return {
          attendance_id: entity.id,
          employee_id: entity.employeeId,
          date: entity.date?.toISOString().split('T')[0],
          check_in_time: entity.checkInTime?.toISOString(),
          check_out_time: entity.checkOutTime?.toISOString(),
          status: entity.status,
          notes: entity.notes,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'Leave':
        return {
          leave_id: entity.id,
          employee_id: entity.employeeId,
          leave_type: entity.leaveType,
          start_date: entity.startDate?.toISOString().split('T')[0],
          end_date: entity.endDate?.toISOString().split('T')[0],
          status: entity.status,
          reason: entity.reason,
          approved_by: entity.approvedBy,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'PerformanceReview':
        return {
          review_id: entity.id,
          employee_id: entity.employeeId,
          reviewer_id: entity.reviewerId,
          review_date: entity.reviewDate?.toISOString().split('T')[0],
          rating: entity.rating,
          comments: entity.comments,
          goals: entity.goals,
          achievements: entity.achievements,
          areas_for_improvement: entity.areasForImprovement,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'Training':
        return {
          training_id: entity.id,
          training_title: entity.trainingTitle,
          description: entity.description,
          start_date: entity.startDate?.toISOString().split('T')[0],
          end_date: entity.endDate?.toISOString().split('T')[0],
          trainer_name: entity.trainerName,
          department_id: entity.departmentId,
          max_participants: entity.maxParticipants,
          cost: entity.cost,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      case 'EmployeeTraining':
        return {
          employee_training_id: entity.id,
          employee_id: entity.employeeId,
          training_id: entity.trainingId,
          status: entity.status,
          enrollment_date: entity.enrollmentDate?.toISOString().split('T')[0],
          completion_date: entity.completionDate?.toISOString().split('T')[0],
          score: entity.score,
          certificate: entity.certificate,
          created_at: entity.createdAt?.toISOString(),
          updated_at: entity.updatedAt?.toISOString()
        }
        
      default:
        return converted
    }
  }

  // Generic CRUD operations
  async create<T>(tableName: string, entityType: string, data: any): Promise<T> {
    if (!this.isAvailable()) {
      throw new Error('Supabase is not available')
    }

    const dbData = this.convertEntityToDatabase(data, entityType)
    
    const { data: result, error } = await supabase!
      .from(tableName)
      .insert(dbData)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create ${entityType}: ${error.message}`)
    }
    
    return this.convertDatabaseToEntity<T>(result, entityType)
  }

  async getAll<T>(tableName: string, entityType: string): Promise<T[]> {
    if (!this.isAvailable()) {
      throw new Error('Supabase is not available')
    }

    const { data, error } = await supabase!
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch ${entityType}s: ${error.message}`)
    }
    
    return (data || []).map(row => this.convertDatabaseToEntity<T>(row, entityType))
  }

  async getById<T>(tableName: string, entityType: string, id: string, idField: string): Promise<T | null> {
    if (!this.isAvailable()) {
      throw new Error('Supabase is not available')
    }

    const { data, error } = await supabase!
      .from(tableName)
      .select('*')
      .eq(idField, id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch ${entityType}: ${error.message}`)
    }
    
    return this.convertDatabaseToEntity<T>(data, entityType)
  }

  async update<T>(tableName: string, entityType: string, id: string, idField: string, updates: any): Promise<T | null> {
    if (!this.isAvailable()) {
      throw new Error('Supabase is not available')
    }

    const dbUpdates = this.convertEntityToDatabase({ ...updates, updatedAt: new Date() }, entityType)
    
    const { data, error } = await supabase!
      .from(tableName)
      .update(dbUpdates)
      .eq(idField, id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update ${entityType}: ${error.message}`)
    }
    
    return this.convertDatabaseToEntity<T>(data, entityType)
  }

  async delete(tableName: string, entityType: string, id: string, idField: string): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Supabase is not available')
    }

    const { error } = await supabase!
      .from(tableName)
      .delete()
      .eq(idField, id)
    
    if (error) {
      throw new Error(`Failed to delete ${entityType}: ${error.message}`)
    }
    
    return true
  }

  // Audit log operations
  async createAuditLog(auditRecord: Omit<AuditRecord, 'id'>): Promise<void> {
    if (!this.isAvailable()) {
      return // Silently fail if Supabase is not available
    }

    const { error } = await supabase!
      .from(TABLES.AUDIT_LOGS)
      .insert({
        table_name: auditRecord.entityType,
        record_id: auditRecord.entityId,
        action: auditRecord.action,
        old_values: auditRecord.changes.reduce((acc, change) => {
          acc[change.field] = change.oldValue
          return acc
        }, {} as any),
        new_values: auditRecord.changes.reduce((acc, change) => {
          acc[change.field] = change.newValue
          return acc
        }, {} as any),
        changed_fields: auditRecord.changes.map(c => c.field),
        user_id: auditRecord.userId,
        user_email: auditRecord.userName,
        timestamp: auditRecord.timestamp.toISOString(),
        ip_address: auditRecord.metadata?.ip,
        user_agent: auditRecord.metadata?.userAgent,
        reason: auditRecord.metadata?.reason
      })
    
    if (error) {
      console.error('Failed to create audit log:', error)
    }
  }

  async getAuditLogs(limit: number = 100): Promise<AuditRecord[]> {
    if (!this.isAvailable()) {
      return []
    }

    const { data, error } = await supabase!
      .from(TABLES.AUDIT_LOGS)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }
    
    return (data || []).map(row => ({
      id: row.id,
      entityType: row.table_name,
      entityId: row.record_id,
      action: row.action as AuditRecord['action'],
      timestamp: new Date(row.timestamp),
      userId: row.user_id || 'unknown',
      userName: row.user_email || 'Unknown User',
      changes: row.changed_fields?.map((field: string) => ({
        field,
        oldValue: row.old_values?.[field] || null,
        newValue: row.new_values?.[field] || null
      })) || [],
      metadata: {
        ip: row.ip_address,
        userAgent: row.user_agent,
        reason: row.reason
      }
    }))
  }

  async getEntityAuditHistory(entityType: string, entityId: string): Promise<AuditRecord[]> {
    if (!this.isAvailable()) {
      return []
    }

    const { data, error } = await supabase!
      .from(TABLES.AUDIT_LOGS)
      .select('*')
      .eq('table_name', entityType)
      .eq('record_id', entityId)
      .order('timestamp', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch entity audit history: ${error.message}`)
    }
    
    return (data || []).map(row => ({
      id: row.id,
      entityType: row.table_name,
      entityId: row.record_id,
      action: row.action as AuditRecord['action'],
      timestamp: new Date(row.timestamp),
      userId: row.user_id || 'unknown',
      userName: row.user_email || 'Unknown User',
      changes: row.changed_fields?.map((field: string) => ({
        field,
        oldValue: row.old_values?.[field] || null,
        newValue: row.new_values?.[field] || null
      })) || [],
      metadata: {
        ip: row.ip_address,
        userAgent: row.user_agent,
        reason: row.reason
      }
    }))
  }

  // Entity restoration
  async restoreEntity(tableName: string, entityType: string, id: string, idField: string, restoredData: any): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Supabase is not available')
    }

    const dbData = this.convertEntityToDatabase({ ...restoredData, updatedAt: new Date() }, entityType)
    
    const { error } = await supabase!
      .from(tableName)
      .update(dbData)
      .eq(idField, id)
    
    if (error) {
      throw new Error(`Failed to restore ${entityType}: ${error.message}`)
    }
    
    return true
  }
}

export const supabaseService = new SupabaseService()