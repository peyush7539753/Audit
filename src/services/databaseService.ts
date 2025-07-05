class DatabaseService {
  private dbName = 'EmployeeManagementDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create audit records store
        if (!db.objectStoreNames.contains('auditRecords')) {
          const auditStore = db.createObjectStore('auditRecords', { keyPath: 'id' });
          auditStore.createIndex('entityType', 'entityType', { unique: false });
          auditStore.createIndex('entityId', 'entityId', { unique: false });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
          auditStore.createIndex('userId', 'userId', { unique: false });
        }

        // Create employees store
        if (!db.objectStoreNames.contains('employees')) {
          const empStore = db.createObjectStore('employees', { keyPath: 'id' });
          empStore.createIndex('employeeId', 'employeeId', { unique: true });
          empStore.createIndex('email', 'email', { unique: true });
        }

        // Create other entity stores
        const stores = [
          'departments', 'jobs', 'salaries', 'projects', 'employeeProjectAssignments',
          'attendances', 'leaves', 'performanceReviews', 'trainings', 'employeeTrainings',
          'addresses', 'locations'
        ];

        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
    });
  }

  async saveAuditRecord(record: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['auditRecords'], 'readwrite');
      const store = transaction.objectStore('auditRecords');
      const request = store.add(record);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAuditRecords(limit: number = 100): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['auditRecords'], 'readonly');
      const store = transaction.objectStore('auditRecords');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      const records: any[] = [];
      let count = 0;

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < limit) {
          records.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(records);
        }
      };
    });
  }

  async saveEntity(storeName: string, entity: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(entity);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getEntities(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteEntity(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const databaseService = new DatabaseService();