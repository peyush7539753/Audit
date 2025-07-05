# Database Architecture & CRUD Operations

## Overview

This Employee Management System uses a **hybrid storage approach** combining **in-memory data structures** with **IndexedDB** for persistence and audit trail storage.

## Database Technologies Used

### 1. **Primary Data Storage: In-Memory + IndexedDB**
- **In-Memory Arrays**: Fast access for real-time operations
- **IndexedDB**: Browser-based NoSQL database for persistence
- **Automatic Synchronization**: Changes are saved to IndexedDB asynchronously

### 2. **Audit Trail Storage: IndexedDB**
- **Dedicated Audit Store**: Separate object store for audit records
- **Indexed Fields**: Optimized queries by entity type, timestamp, user
- **Retention Management**: Configurable data retention policies

## Data Entities (13 Total)

### Core Entities
1. **Employee** - Employee records with personal and employment data
2. **Department** - Organizational departments with budgets and locations
3. **Job** - Job positions with salary ranges and descriptions
4. **Salary** - Employee salary history with effective dates
5. **Address** - Physical addresses for employees and locations
6. **Location** - Office locations with capacity and facilities

### Operational Entities
7. **Project** - Company projects with timelines and budgets
8. **EmployeeProjectAssignment** - Employee-to-project assignments
9. **Attendance** - Daily attendance records with check-in/out times
10. **Leave** - Employee leave requests and approvals
11. **PerformanceReview** - Employee performance evaluations
12. **Training** - Training programs and courses
13. **EmployeeTraining** - Individual training enrollments and progress

## CRUD Operations Flow

### Create Operations
```typescript
1. Validate input data
2. Generate unique ID and timestamps
3. Add to in-memory collection
4. Save to IndexedDB (async)
5. Log audit record (CREATE action)
6. Update UI state
```

### Read Operations
```typescript
1. Return data from in-memory collections
2. Apply filters and sorting
3. Log audit record (QUERY action) if configured
```

### Update Operations
```typescript
1. Find existing entity in memory
2. Compare old vs new values
3. Update in-memory collection
4. Save to IndexedDB (async)
5. Log audit record (UPDATE action) with field changes
6. Update UI state
```

### Delete Operations
```typescript
1. Remove from in-memory collection
2. Delete from IndexedDB (async)
3. Log audit record (DELETE action)
4. Update UI state
```

## Audit System Architecture

### Audit Record Structure
```typescript
interface AuditRecord {
  id: string;                    // Unique audit record ID
  entityType: string;            // Type of entity (Employee, Department, etc.)
  entityId: string;              // ID of the affected entity
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'QUERY';
  timestamp: Date;               // When the action occurred
  userId: string;                // Who performed the action
  userName: string;              // Display name of user
  changes: Array<{               // Field-level changes
    field: string;               // Field name that changed
    oldValue: any;               // Previous value
    newValue: any;               // New value
  }>;
  metadata: Record<string, any>; // Additional context (IP, user agent, etc.)
}
```

### Audit Trail Features
- **Complete Change Tracking**: Every field modification is recorded
- **User Attribution**: All actions are linked to specific users
- **Temporal Ordering**: Precise timestamps for chronological reconstruction
- **Metadata Capture**: IP addresses, user agents, and custom context
- **Configurable Logging**: Enable/disable specific actions or entities

## Entity Restoration System

### How Restoration Works

1. **Historical Reconstruction**: 
   - Retrieves all audit records for an entity up to target timestamp
   - Sorts records chronologically (oldest first)
   - Replays CREATE → UPDATE → DELETE operations in sequence

2. **State Building Process**:
   ```typescript
   let entityState = null;
   
   for (const record of chronologicalHistory) {
     if (record.action === 'CREATE') {
       entityState = { id: entityId };
       // Apply creation fields
     } else if (record.action === 'UPDATE') {
       // Apply field changes to existing state
     } else if (record.action === 'DELETE') {
       entityState = null; // Entity deleted
       break;
     }
   }
   ```

3. **Data Type Conversion**:
   - Automatically converts ISO date strings back to Date objects
   - Handles null/undefined values properly
   - Preserves original data types from audit records

4. **Validation & Safety**:
   - Prevents restoration of deleted entities
   - Validates entity existence before restoration
   - Provides preview functionality before actual restoration
   - Logs restoration actions in audit trail

### Restoration Capabilities

- ✅ **Point-in-Time Recovery**: Restore to any historical timestamp
- ✅ **Preview Mode**: See exact state before restoration
- ✅ **Change Comparison**: Compare current vs historical states
- ✅ **Audit Trail**: All restorations are logged
- ✅ **Data Integrity**: Proper type conversion and validation
- ✅ **Multi-Entity Support**: Works with all 13 entity types

## Performance Characteristics

### Read Performance
- **In-Memory Access**: O(1) for ID lookups, O(n) for filtering
- **No Network Latency**: All data is local
- **Instant UI Updates**: Immediate response to user actions

### Write Performance
- **Synchronous UI**: Immediate feedback to users
- **Asynchronous Persistence**: Non-blocking IndexedDB writes
- **Batch Operations**: Efficient bulk updates when needed

### Storage Efficiency
- **Structured Data**: Optimized object storage in IndexedDB
- **Indexed Queries**: Fast lookups by entity type, timestamp, user
- **Compression**: Browser-native compression for stored data

## Data Consistency & Reliability

### Consistency Model
- **Eventually Consistent**: In-memory changes are immediately visible
- **Durable Writes**: IndexedDB provides ACID properties
- **Conflict Resolution**: Last-write-wins for concurrent updates

### Error Handling
- **Graceful Degradation**: System continues if IndexedDB fails
- **Retry Logic**: Automatic retry for failed database operations
- **User Feedback**: Clear error messages for failed operations

### Backup & Recovery
- **Audit Trail**: Complete history enables full reconstruction
- **Export Capabilities**: Data can be exported for backup
- **Import Functions**: Restore from exported data files

## Security Considerations

### Data Protection
- **Client-Side Only**: No data transmitted to external servers
- **Browser Security**: Leverages browser's security model
- **Access Control**: User-based action attribution

### Audit Security
- **Immutable Records**: Audit records cannot be modified
- **Tamper Detection**: Chronological validation of audit trail
- **User Tracking**: Complete attribution of all actions

This architecture provides a robust, scalable, and auditable data management system suitable for enterprise employee management needs while maintaining excellent performance and user experience.