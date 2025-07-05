import React, { useState, useEffect } from 'react';
import { AuditConfig } from '../../types';
import { auditService } from '../../services/auditService';
import { Save, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

const AuditSettings: React.FC = () => {
  const [config, setConfig] = useState<AuditConfig>({
    enableAuditing: true,
    auditedEntities: [],
    auditedActions: [],
    retentionPeriod: 365,
    logQueries: true,
    logCreates: true,
    logUpdates: true,
    logDeletes: true
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentConfig = auditService.getConfig();
    setConfig(currentConfig);
  }, []);

  const handleToggle = (key: keyof AuditConfig) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEntityToggle = (entity: string) => {
    setConfig(prev => ({
      ...prev,
      auditedEntities: prev.auditedEntities.includes(entity)
        ? prev.auditedEntities.filter(e => e !== entity)
        : [...prev.auditedEntities, entity]
    }));
  };

  const handleActionToggle = (action: string) => {
    setConfig(prev => ({
      ...prev,
      auditedActions: prev.auditedActions.includes(action)
        ? prev.auditedActions.filter(a => a !== action)
        : [...prev.auditedActions, action]
    }));
  };

  const handleRetentionChange = (value: number) => {
    setConfig(prev => ({
      ...prev,
      retentionPeriod: value
    }));
  };

  const handleSave = () => {
    auditService.updateConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const entities = [
    'Employee', 'Department', 'Job', 'Salary', 'Project', 
    'EmployeeProjectAssignment', 'Attendance', 'Leave', 
    'PerformanceReview', 'Training', 'EmployeeTraining', 
    'Address', 'Location'
  ];
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'QUERY'];

  const ToggleButton: React.FC<{
    enabled: boolean;
    onClick: () => void;
    label: string;
  }> = ({ enabled, onClick, label }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={onClick}
        className={`p-1 rounded-full transition-colors ${
          enabled ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        {enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Settings</h1>
          <p className="text-gray-600 mt-2">Configure audit logging and retention policies</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            General Settings
          </h3>
          
          <div className="space-y-4">
            <ToggleButton
              enabled={config.enableAuditing}
              onClick={() => handleToggle('enableAuditing')}
              label="Enable Auditing"
            />
            
            <ToggleButton
              enabled={config.logQueries}
              onClick={() => handleToggle('logQueries')}
              label="Log Query Operations"
            />
            
            <ToggleButton
              enabled={config.logCreates}
              onClick={() => handleToggle('logCreates')}
              label="Log Create Operations"
            />
            
            <ToggleButton
              enabled={config.logUpdates}
              onClick={() => handleToggle('logUpdates')}
              label="Log Update Operations"
            />
            
            <ToggleButton
              enabled={config.logDeletes}
              onClick={() => handleToggle('logDeletes')}
              label="Log Delete Operations"
            />
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Period (days)
              </label>
              <input
                type="number"
                value={config.retentionPeriod}
                onChange={(e) => handleRetentionChange(parseInt(e.target.value) || 365)}
                min="1"
                max="3650"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                How long to keep audit records (1-3650 days)
              </p>
            </div>
          </div>
        </div>

        {/* Entity Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Audited Entities
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {entities.map(entity => (
              <ToggleButton
                key={entity}
                enabled={config.auditedEntities.includes(entity)}
                onClick={() => handleEntityToggle(entity)}
                label={entity}
              />
            ))}
          </div>
        </div>

        {/* Action Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Audited Actions
          </h3>
          
          <div className="space-y-3">
            {actions.map(action => (
              <ToggleButton
                key={action}
                enabled={config.auditedActions.includes(action)}
                onClick={() => handleActionToggle(action)}
                label={action}
              />
            ))}
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configuration Summary
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Auditing Status:</span>
              <span className={`font-medium ${
                config.enableAuditing ? 'text-green-600' : 'text-red-600'
              }`}>
                {config.enableAuditing ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Audited Entities:</span>
              <span className="font-medium text-gray-900">
                {config.auditedEntities.length} / {entities.length}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Audited Actions:</span>
              <span className="font-medium text-gray-900">
                {config.auditedActions.length} / {actions.length}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Retention Period:</span>
              <span className="font-medium text-gray-900">
                {config.retentionPeriod} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {!config.enableAuditing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Warning:</strong> Auditing is currently disabled. No audit records will be created.
          </p>
        </div>
      )}
      
      {config.auditedEntities.length === 0 && config.enableAuditing && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> No entities are selected for auditing. Please select at least one entity type.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuditSettings;