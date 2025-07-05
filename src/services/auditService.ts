import { AuditRecord, AuditConfig } from '../types';
import { auditRecords } from '../data/mockData';
import { supabaseService } from './supabaseService';

class AuditService {
  private config: AuditConfig = {
    enableAuditing: true,
    auditedEntities: ['Employee', 'Department', 'Job', 'Salary', 'Project', 'EmployeeProjectAssignment', 'Attendance', 'Leave', 'PerformanceReview', 'Training', 'EmployeeTraining', 'Address', 'Location'],
    auditedActions: ['CREATE', 'UPDATE', 'DELETE', 'QUERY'],
    retentionPeriod: 365,
    logQueries: true,
    logCreates: true,
    logUpdates: true,
    logDeletes: true
  };

  private records: AuditRecord[] = [...auditRecords];
  private initialized = false;
  private useSupabase = true; // Toggle for Supabase vs in-memory

  async init() {
    if (!this.initialized) {
      if (this.useSupabase) {
        try {
          // Load existing records from Supabase
          const dbRecords = await supabaseService.getAuditLogs(1000);
          if (dbRecords.length > 0) {
            this.records = dbRecords;
          }
        } catch (error) {
          console.warn('Could not load audit records from Supabase, using fallback:', error);
          this.useSupabase = false;
        }
      }
      this.initialized = true;
    }
  }

  getConfig(): AuditConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  async logAction(
    entityType: string,
    entityId: string,
    action: AuditRecord['action'],
    changes: AuditRecord['changes'],
    userId: string,
    userName: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (!this.config.enableAuditing) return;
    if (!this.config.auditedEntities.includes(entityType)) return;
    if (!this.config.auditedActions.includes(action)) return;

    // Check specific action settings
    if (action === 'QUERY' && !this.config.logQueries) return;
    if (action === 'CREATE' && !this.config.logCreates) return;
    if (action === 'UPDATE' && !this.config.logUpdates) return;
    if (action === 'DELETE' && !this.config.logDeletes) return;

    await this.init();

    const record: AuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      action,
      timestamp: new Date(),
      userId,
      userName,
      changes,
      metadata: {
        ...metadata,
        ip: '127.0.0.1',
        userAgent: navigator.userAgent
      }
    };

    // Add to in-memory records for immediate access
    this.records.unshift(record);

    // Save to Supabase
    if (this.useSupabase) {
      try {
        await supabaseService.createAuditLog(record);
      } catch (error) {
        console.warn('Could not save audit record to Supabase:', error);
        // Continue with in-memory storage as fallback
      }
    }
  }

  async getAuditHistory(entityType?: string, entityId?: string, limit: number = 100): Promise<AuditRecord[]> {
    await this.init();
    
    if (this.useSupabase) {
      try {
        const records = await supabaseService.getAuditLogs(limit);
        
        let filtered = records;
        if (entityType) {
          filtered = filtered.filter(record => record.entityType === entityType);
        }
        if (entityId) {
          filtered = filtered.filter(record => record.entityId === entityId);
        }
        
        return filtered.slice(0, limit);
      } catch (error) {
        console.warn('Could not fetch audit history from Supabase, using fallback:', error);
        // Fallback to in-memory records
      }
    }
    
    // Fallback to in-memory records
    let filtered = [...this.records];

    if (entityType) {
      filtered = filtered.filter(record => record.entityType === entityType);
    }

    if (entityId) {
      filtered = filtered.filter(record => record.entityId === entityId);
    }

    return filtered.slice(0, limit);
  }

  async getEntityHistory(entityType: string, entityId: string): Promise<AuditRecord[]> {
    await this.init();
    
    if (this.useSupabase) {
      try {
        return await supabaseService.getEntityAuditHistory(entityType, entityId);
      } catch (error) {
        console.warn('Could not fetch entity history from Supabase, using fallback:', error);
        // Fallback to in-memory records
      }
    }
    
    // Fallback to in-memory records
    return this.records
      .filter(record => record.entityType === entityType && record.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Enhanced Entity Restoration Utility
   * Replays audit logs for a specific entity up to a given timestamp
   * Handles CREATE, UPDATE, DELETE operations chronologically
   */
  async restoreEntity(entityType: string, entityId: string, targetTimestamp: Date): Promise<any> {
    await this.init();
    
    // Get all audit records for this entity up to the target timestamp
    const relevantHistory = this.records
      .filter(record => 
        record.entityType === entityType && 
        record.entityId === entityId && 
        record.timestamp <= targetTimestamp &&
        ['CREATE', 'UPDATE', 'DELETE'].includes(record.action) // Skip QUERY actions
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Chronological order
    
    if (relevantHistory.length === 0) {
      return null; // No history found
    }
    
    let entityState: any = null;
    let wasCreated = false;
    let wasDeleted = false;
    
    // Replay all operations chronologically
    for (const record of relevantHistory) {
      if (record.action === 'CREATE') {
        // Entity was created - initialize with creation data
        entityState = { id: entityId };
        wasCreated = true;
        wasDeleted = false;
        
        // Apply all creation changes
        record.changes.forEach(change => {
          if (change.field !== 'entity' && change.field !== 'restored') {
            entityState[change.field] = this.convertValue(change.newValue);
          }
        });
        
      } else if (record.action === 'UPDATE' && wasCreated && !wasDeleted) {
        // Entity was updated - apply changes to existing state
        record.changes.forEach(change => {
          if (change.field !== 'entity' && change.field !== 'restored') {
            entityState[change.field] = this.convertValue(change.newValue);
          }
        });
        
      } else if (record.action === 'DELETE') {
        // Entity was deleted - mark as deleted
        wasDeleted = true;
        entityState = null;
      }
    }
    
    // If entity was deleted at target time, it cannot be restored
    if (wasDeleted) {
      return null;
    }
    
    // If entity was never created by target time, it doesn't exist
    if (!wasCreated || !entityState) {
      return null;
    }
    
    return entityState;
  }

  /**
   * Convert audit values back to proper types
   */
  private convertValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }
    
    // Convert date strings back to Date objects
    if (typeof value === 'string') {
      // Check for ISO date format
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
      }
      // Check for date-only format
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(value);
      }
    }
    
    return value;
  }

  /**
   * Get a complete snapshot of entity state at a specific timestamp
   */
  async getEntitySnapshot(entityType: string, entityId: string, timestamp: Date): Promise<any> {
    const restoredState = await this.restoreEntity(entityType, entityId, timestamp);
    
    if (!restoredState) {
      return null;
    }
    
    // Add metadata about the snapshot
    return {
      ...restoredState,
      _snapshot: {
        entityType,
        entityId,
        timestamp: timestamp.toISOString(),
        restoredAt: new Date().toISOString()
      }
    };
  }

  /**
   * Compare two entity states and return differences
   */
  compareEntityStates(oldState: any, newState: any): Array<{field: string, oldValue: any, newValue: any}> {
    const changes: Array<{field: string, oldValue: any, newValue: any}> = [];
    
    if (!oldState && !newState) return changes;
    if (!oldState) {
      // Entity was created
      Object.keys(newState).forEach(key => {
        if (key !== '_snapshot') {
          changes.push({ field: key, oldValue: null, newValue: newState[key] });
        }
      });
      return changes;
    }
    if (!newState) {
      // Entity was deleted
      Object.keys(oldState).forEach(key => {
        if (key !== '_snapshot') {
          changes.push({ field: key, oldValue: oldState[key], newValue: null });
        }
      });
      return changes;
    }
    
    // Compare all fields
    const allKeys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);
    allKeys.forEach(key => {
      if (key !== '_snapshot' && oldState[key] !== newState[key]) {
        changes.push({ 
          field: key, 
          oldValue: oldState[key] || null, 
          newValue: newState[key] || null 
        });
      }
    });
    
    return changes;
  }

  getActivitySummary(startDate: Date, endDate: Date): {
    totalActions: number;
    actionsByType: Record<string, number>;
    entitiesByType: Record<string, number>;
    userActivity: Record<string, number>;
  } {
    const filtered = this.records.filter(
      record => record.timestamp >= startDate && record.timestamp <= endDate
    );

    const summary = {
      totalActions: filtered.length,
      actionsByType: {} as Record<string, number>,
      entitiesByType: {} as Record<string, number>,
      userActivity: {} as Record<string, number>
    };

    filtered.forEach(record => {
      summary.actionsByType[record.action] = (summary.actionsByType[record.action] || 0) + 1;
      summary.entitiesByType[record.entityType] = (summary.entitiesByType[record.entityType] || 0) + 1;
      summary.userActivity[record.userName] = (summary.userActivity[record.userName] || 0) + 1;
    });

    return summary;
  }

  async searchAuditRecords(
    query: string,
    filters: {
      entityType?: string;
      action?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<AuditRecord[]> {
    await this.init();
    
    let filtered = [...this.records];

    if (filters.entityType) {
      filtered = filtered.filter(record => record.entityType === filters.entityType);
    }

    if (filters.action) {
      filtered = filtered.filter(record => record.action === filters.action);
    }

    if (filters.userId) {
      filtered = filtered.filter(record => record.userId === filters.userId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(record => record.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter(record => record.timestamp <= filters.endDate!);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(record => 
        record.userName.toLowerCase().includes(lowerQuery) ||
        record.entityType.toLowerCase().includes(lowerQuery) ||
        record.action.toLowerCase().includes(lowerQuery) ||
        record.changes.some(change => 
          change.field.toLowerCase().includes(lowerQuery) ||
          String(change.oldValue).toLowerCase().includes(lowerQuery) ||
          String(change.newValue).toLowerCase().includes(lowerQuery)
        )
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const auditService = new AuditService();