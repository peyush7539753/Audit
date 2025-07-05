import React, { useState } from 'react';
import { AuditRecord } from '../../types';
import { auditService } from '../../services/auditService';
import { dataService } from '../../services/dataService';
import { RotateCcw, Clock, Database, AlertTriangle, CheckCircle, Info, History } from 'lucide-react';

const EntityRestore: React.FC = () => {
  const [entityType, setEntityType] = useState<string>('Employee');
  const [entityId, setEntityId] = useState<string>('');
  const [history, setHistory] = useState<AuditRecord[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [currentData, setCurrentData] = useState<any>(null);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const entityTypes = [
    'Employee', 'Department', 'Job', 'Salary', 'Project', 
    'EmployeeProjectAssignment', 'Attendance', 'Leave', 
    'PerformanceReview', 'Training', 'EmployeeTraining', 
    'Address', 'Location'
  ];

  const loadHistory = async () => {
    if (!entityId.trim()) {
      alert('Please enter an entity ID');
      return;
    }

    setIsLoading(true);
    setRestoreStatus('idle');
    setStatusMessage('');
    
    try {
      // Load audit history for the entity
      const entityHistory = await auditService.getEntityHistory(entityType, entityId);
      setHistory(entityHistory);
      setPreviewData(null);
      setSelectedTimestamp('');
      
      // Load current entity state for comparison
      await loadCurrentEntityState();
      
      if (entityHistory.length === 0) {
        setStatusMessage(`No audit history found for ${entityType} with ID "${entityId}"`);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setStatusMessage('Error loading entity history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentEntityState = async () => {
    try {
      let current = null;
      
      switch (entityType) {
        case 'Employee':
          current = dataService.getEmployee(entityId);
          break;
        case 'Department':
          current = dataService.getDepartment(entityId);
          break;
        case 'Job':
          current = dataService.getJob(entityId);
          break;
        case 'Salary':
          current = dataService.getSalary(entityId);
          break;
        case 'Project':
          current = dataService.getProject(entityId);
          break;
        case 'EmployeeProjectAssignment':
          current = dataService.getEmployeeProjectAssignment(entityId);
          break;
        case 'Attendance':
          current = dataService.getAttendance(entityId);
          break;
        case 'Leave':
          current = dataService.getLeave(entityId);
          break;
        case 'PerformanceReview':
          current = dataService.getPerformanceReview(entityId);
          break;
        case 'Training':
          current = dataService.getTraining(entityId);
          break;
        case 'EmployeeTraining':
          current = dataService.getEmployeeTraining(entityId);
          break;
        case 'Address':
          current = dataService.getAddress(entityId);
          break;
        case 'Location':
          current = dataService.getLocation(entityId);
          break;
      }
      
      setCurrentData(current);
    } catch (error) {
      console.error('Error loading current entity state:', error);
      setCurrentData(null);
    }
  };

  const previewRestore = async () => {
    if (!selectedTimestamp) {
      alert('Please select a timestamp to restore to');
      return;
    }

    try {
      const targetDate = new Date(selectedTimestamp);
      
      // Use the enhanced restore utility
      const restoredState = await auditService.restoreEntity(entityType, entityId, targetDate);
      
      if (restoredState === null) {
        setStatusMessage('Entity was deleted or did not exist at this point in time and cannot be restored.');
        setPreviewData(null);
        return;
      }
      
      setPreviewData(restoredState);
      setStatusMessage('');
    } catch (error) {
      console.error('Error previewing restore:', error);
      setStatusMessage('Error previewing restore');
      setPreviewData(null);
    }
  };

  const performRestore = async () => {
    if (!selectedTimestamp || !previewData) {
      alert('Please preview the restore first');
      return;
    }

    const confirmMessage = `Are you sure you want to restore ${entityType} ${entityId} to the state at ${new Date(selectedTimestamp).toLocaleString()}?\n\nThis action will update the database and cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Prepare clean data for restoration (remove metadata)
      const cleanData = { ...previewData };
      delete cleanData.id;
      delete cleanData.createdAt;
      delete cleanData.updatedAt;
      delete cleanData._snapshot;
      
      // Perform the actual restore to database
      const success = await dataService.restoreEntityToDatabase(entityType, entityId, cleanData);

      if (success) {
        // Log the restore action in audit trail
        await auditService.logAction(
          entityType,
          entityId,
          'UPDATE',
          [{
            field: 'restored',
            oldValue: 'current state',
            newValue: `restored to ${new Date(selectedTimestamp).toISOString()}`
          }],
          'current-user',
          'System Admin'
        );

        setRestoreStatus('success');
        setStatusMessage(`Successfully restored ${entityType} ${entityId} to state at ${new Date(selectedTimestamp).toLocaleString()}`);
        
        // Clear form data
        setHistory([]);
        setSelectedTimestamp('');
        setPreviewData(null);
        setCurrentData(null);
      } else {
        setRestoreStatus('error');
        setStatusMessage('Failed to restore entity. The entity may not exist or the update failed.');
      }
    } catch (error: any) {
      console.error('Error during restore:', error);
      setRestoreStatus('error');
      setStatusMessage(`Restore failed: ${error.message || 'Unknown error occurred'}`);
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Database className="w-4 h-4 text-green-600" />;
      case 'UPDATE':
        return <Database className="w-4 h-4 text-blue-600" />;
      case 'DELETE':
        return <Database className="w-4 h-4 text-red-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entity Restore</h1>
          <p className="text-gray-600 mt-2">Restore entities to previous states using Supabase database audit history</p>
        </div>
      </div>

      {/* Status Messages */}
      {restoreStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">{statusMessage}</p>
          </div>
        </div>
      )}

      {restoreStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800 font-medium">{statusMessage}</p>
          </div>
        </div>
      )}

      {statusMessage && restoreStatus === 'idle' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-blue-800">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Entity Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Entity</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity Type
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {entityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity ID
            </label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="Enter entity ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadHistory}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>{isLoading ? 'Loading...' : 'Load History'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current State vs Preview Comparison */}
      {(currentData || previewData) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Database State</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(currentData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {previewData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Restore Preview
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (State at {new Date(selectedTimestamp).toLocaleString()})
                </span>
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Timeline */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Database Change History for {entityType} {entityId}
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {history.map((record, index) => (
              <div
                key={record.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTimestamp === record.timestamp.toISOString()
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTimestamp(record.timestamp.toISOString())}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedTimestamp === record.timestamp.toISOString()}
                      onChange={() => setSelectedTimestamp(record.timestamp.toISOString())}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      {getActionIcon(record.action)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(record.action)}`}>
                        {record.action}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {record.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    by {record.userName}
                  </span>
                </div>
                
                {record.changes.length > 0 && (
                  <div className="mt-3 ml-8 space-y-1">
                    {record.changes
                      .filter(change => change.field !== 'entity' && change.field !== 'restored')
                      .slice(0, 3)
                      .map((change, changeIndex) => (
                      <div key={changeIndex} className="text-sm text-gray-700">
                        <span className="font-medium">{change.field}:</span>
                        <span className="text-red-600 ml-2">
                          {formatValue(change.oldValue)}
                        </span>
                        <span className="text-gray-500 mx-2">→</span>
                        <span className="text-green-600">
                          {formatValue(change.newValue)}
                        </span>
                      </div>
                    ))}
                    {record.changes.filter(c => c.field !== 'entity' && c.field !== 'restored').length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{record.changes.filter(c => c.field !== 'entity' && c.field !== 'restored').length - 3} more changes
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restore Actions */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Database Restore Actions
          </h3>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={previewRestore}
              disabled={!selectedTimestamp}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>Preview Restore</span>
            </button>

            <button
              onClick={performRestore}
              disabled={!selectedTimestamp || !previewData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore to Database</span>
            </button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Warning:</p>
                <p>Entity restoration will permanently update the Supabase database. The current state will be overwritten with the selected historical state. This action cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 && entityId && !isLoading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No History Found</h3>
          <p className="text-gray-600">
            No audit history was found for {entityType} with ID "{entityId}". 
            Please check the entity ID and try again.
          </p>
        </div>
      )}
    </div>
  );
};

export default EntityRestore;