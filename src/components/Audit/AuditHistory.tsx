import React, { useState, useEffect } from 'react';
import { AuditRecord } from '../../types';
import { auditService } from '../../services/auditService';
import { Search, Filter, Clock, User, Database, Activity, Eye, Calendar } from 'lucide-react';

const AuditHistory: React.FC = () => {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AuditRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    userId: '',
    startDate: '',
    endDate: ''
  });
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await loadAuditHistory();
    };
    loadData();
  }, []);

  useEffect(() => {
    const applyFiltersAsync = async () => {
      await applyFilters();
    };
    applyFiltersAsync();
  }, [auditRecords, searchTerm, filters]);

  const loadAuditHistory = async () => {
    try {
      const records = await auditService.getAuditHistory();
      setAuditRecords(Array.isArray(records) ? records : []);
    } catch (error) {
      console.error('Error loading audit history:', error);
      setAuditRecords([]);
    }
  };

  const applyFilters = async () => {
    try {
      let filtered = Array.isArray(auditRecords) ? [...auditRecords] : [];

      // Apply search
      if (searchTerm) {
        filtered = await auditService.searchAuditRecords(searchTerm, {
          entityType: filters.entityType || undefined,
          action: filters.action || undefined,
          userId: filters.userId || undefined,
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined
        });
      } else {
        // Apply individual filters
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
          filtered = filtered.filter(record => record.timestamp >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          filtered = filtered.filter(record => record.timestamp <= new Date(filters.endDate));
        }
      }

      setFilteredRecords(Array.isArray(filtered) ? filtered : []);
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredRecords([]);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      entityType: '',
      action: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
  };

  const handleViewDetails = (record: AuditRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Database className="w-4 h-4 text-green-500" />;
      case 'UPDATE':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'DELETE':
        return <Database className="w-4 h-4 text-red-500" />;
      case 'QUERY':
        return <Search className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'QUERY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const DetailModal: React.FC<{ record: AuditRecord; onClose: () => void }> = ({ record, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Audit Record Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Entity Type</label>
                <p className="text-lg font-semibold text-gray-900">{record.entityType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Entity ID</label>
                <p className="text-lg font-semibold text-gray-900">{record.entityId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getActionColor(record.action)}`}>
                  {getActionIcon(record.action)}
                  <span className="ml-2">{record.action}</span>
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="text-lg font-semibold text-gray-900">{record.userName}</p>
                <p className="text-sm text-gray-500">ID: {record.userId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                <p className="text-lg font-semibold text-gray-900">{record.timestamp.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Changes */}
          {record.changes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Changes Made</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {record.changes.map((change, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="font-medium text-gray-900 mb-2">{change.field}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Old Value</label>
                        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm">
                          {change.oldValue !== null ? String(change.oldValue) : 'null'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">New Value</label>
                        <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-sm">
                          {change.newValue !== null ? String(change.newValue) : 'null'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {record.metadata && Object.keys(record.metadata).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(record.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit History</h1>
          <p className="text-gray-600 mt-2">Complete record of all system activities</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search audit records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              value={filters.entityType}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Employee">Employee</option>
              <option value="Department">Department</option>
              <option value="Job">Job</option>
              <option value="Salary">Salary</option>
              <option value="Project">Project</option>
              <option value="EmployeeProjectAssignment">Project Assignment</option>
              <option value="Attendance">Attendance</option>
              <option value="Leave">Leave</option>
              <option value="PerformanceReview">Performance Review</option>
              <option value="Training">Training</option>
              <option value="EmployeeTraining">Employee Training</option>
              <option value="Address">Address</option>
              <option value="Location">Location</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="QUERY">Query</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Records */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Audit Records ({Array.isArray(filteredRecords) ? filteredRecords.length : 0})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {Array.isArray(filteredRecords) && filteredRecords.map((record) => (
            <div key={record.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    {getActionIcon(record.action)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(record.action)}`}>
                        {record.action}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {record.entityType}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {record.entityId}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{record.userName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{record.timestamp.toLocaleString()}</span>
                      </div>
                    </div>

                    {record.changes.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Changes:</h4>
                        {record.changes.slice(0, 3).map((change, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-gray-900">{change.field}:</span>
                            <span className="text-red-600 ml-2">
                              {change.oldValue !== null ? String(change.oldValue) : 'null'}
                            </span>
                            <span className="text-gray-500 mx-2">→</span>
                            <span className="text-green-600">
                              {change.newValue !== null ? String(change.newValue) : 'null'}
                            </span>
                          </div>
                        ))}
                        {record.changes.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{record.changes.length - 3} more changes
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleViewDetails(record)}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {(!Array.isArray(filteredRecords) || filteredRecords.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            No audit records found matching your criteria.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRecord && (
        <DetailModal
          record={selectedRecord}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AuditHistory;