import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { QueryFilter, Employee } from '../../types';
import { dataService } from '../../services/dataService';

const AdvancedSearch: React.FC = () => {
  const [filters, setFilters] = useState<QueryFilter[]>([]);
  const [results, setResults] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const employeeFields = [
    { key: 'firstName', label: 'First Name', type: 'text' },
    { key: 'lastName', label: 'Last Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'employeeId', label: 'Employee ID', type: 'text' },
    { key: 'phoneNumber', label: 'Phone Number', type: 'text' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['MALE', 'FEMALE', 'OTHER'] },
    { key: 'hireDate', label: 'Hire Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'TERMINATED'] }
  ];

  const operators = [
    { key: 'equals', label: 'Equals' },
    { key: 'contains', label: 'Contains' },
    { key: 'startsWith', label: 'Starts With' },
    { key: 'endsWith', label: 'Ends With' },
    { key: 'greaterThan', label: 'Greater Than' },
    { key: 'lessThan', label: 'Less Than' },
    { key: 'between', label: 'Between' }
  ];

  const addFilter = () => {
    const newFilter: QueryFilter = {
      field: '',
      operator: 'equals',
      value: ''
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, key: keyof QueryFilter, value: any) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [key]: value };
    setFilters(updatedFilters);
  };

  const handleSearch = async () => {
    if (filters.length === 0) {
      alert('Please add at least one filter');
      return;
    }

    setIsSearching(true);
    
    try {
      const query = {
        entityType: 'Employee',
        filters: filters.filter(f => f.field && f.value),
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      };

      const searchResults = dataService.searchEmployees(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      alert('An error occurred while searching');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setFilters([]);
    setResults([]);
  };

  const getDepartmentName = (departmentId: string) => {
    const department = dataService.getDepartment(departmentId);
    return department?.departmentName || 'Unknown Department';
  };

  const getJobTitle = (jobId: string) => {
    const job = dataService.getJob(jobId);
    return job?.jobTitle || 'Unknown Job';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Search</h1>
          <p className="text-gray-600 mt-2">Create complex queries with multiple filters</p>
        </div>
      </div>

      {/* Search Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-end space-x-2">
            <button
              onClick={addFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Filter</span>
            </button>
            
            <button
              onClick={clearSearch}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                <select
                  value={filter.field}
                  onChange={(e) => updateFilter(index, 'field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Field</option>
                  {employeeFields.map(field => (
                    <option key={field.key} value={field.key}>{field.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {operators.map(op => (
                    <option key={op.key} value={op.key}>{op.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => updateFilter(index, 'value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter value"
                />
              </div>

              {filter.operator === 'between' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value 2</label>
                  <input
                    type="text"
                    value={filter.value2 || ''}
                    onChange={(e) => updateFilter(index, 'value2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter second value"
                  />
                </div>
              )}

              <button
                onClick={() => removeFilter(index)}
                className="p-2 text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {filters.length > 0 && (
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({results.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDepartmentName(employee.departmentId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getJobTitle(employee.jobId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : employee.status === 'INACTIVE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;