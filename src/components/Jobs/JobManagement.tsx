import React, { useState, useEffect } from 'react';
import { Briefcase, DollarSign, Users, TrendingUp, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Job, Department, Employee } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface JobModalProps {
  job: Job | null;
  mode: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSave: (job: Partial<Job>) => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    minSalary: 0,
    maxSalary: 0,
    jobDescription: ''
  });

  useEffect(() => {
    if (job) {
      setFormData({
        jobTitle: job.jobTitle,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        jobDescription: job.jobDescription
      });
    }
  }, [job]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Salary') ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add Job' : mode === 'edit' ? 'Edit Job' : 'View Job'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input
                type="number"
                name="minSalary"
                value={formData.minSalary}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <input
                type="number"
                name="maxSalary"
                value={formData.maxSalary}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              disabled={isReadOnly}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {mode === 'create' ? 'Create Job' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const JobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setJobs(dataService.getJobs());
    setDepartments(dataService.getDepartments());
    setEmployees(dataService.getEmployees());
  };

  const getJobEmployeeCount = (jobId: string) => {
    return employees.filter(emp => emp.jobId === jobId).length;
  };

  const handleView = (job: Job) => {
    setSelectedJob(job);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedJob(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = async (job: Job) => {
    if (window.confirm(`Are you sure you want to delete ${job.jobTitle}?`)) {
      await dataService.deleteJob(job.id);
      loadData();
    }
  };

  const handleSave = async (jobData: Partial<Job>) => {
    if (modalMode === 'create') {
      await dataService.createJob(jobData as Omit<Job, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (modalMode === 'edit' && selectedJob) {
      await dataService.updateJob(selectedJob.id, jobData);
    }
    setIsModalOpen(false);
    loadData();
  };

  const getSalaryRangeData = () => {
    return jobs.map(job => ({
      title: job.jobTitle,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      avgSalary: (job.minSalary + job.maxSalary) / 2,
      employees: getJobEmployeeCount(job.id)
    }));
  };

  const getJobDistributionData = () => {
    return jobs.map(job => ({
      name: job.jobTitle.length > 15 ? job.jobTitle.substring(0, 15) + '...' : job.jobTitle,
      employees: getJobEmployeeCount(job.id)
    }));
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    format?: 'number' | 'currency';
  }> = ({ title, value, icon: Icon, color, format = 'number' }) => {
    const formatValue = (val: number | string) => {
      if (format === 'currency' && typeof val === 'number') {
        return `$${val.toLocaleString()}`;
      }
      return val.toLocaleString();
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const totalJobs = jobs.length;
  const avgMinSalary = jobs.length > 0 ? jobs.reduce((sum, job) => sum + job.minSalary, 0) / jobs.length : 0;
  const avgMaxSalary = jobs.length > 0 ? jobs.reduce((sum, job) => sum + job.maxSalary, 0) / jobs.length : 0;
  const totalEmployeesInJobs = jobs.reduce((sum, job) => sum + getJobEmployeeCount(job.id), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">Overview and management of job positions</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Job
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Job Positions"
          value={totalJobs}
          icon={Briefcase}
          color="bg-blue-500"
        />
        <StatCard
          title="Avg Min Salary"
          value={Math.round(avgMinSalary)}
          icon={DollarSign}
          color="bg-green-500"
          format="currency"
        />
        <StatCard
          title="Avg Max Salary"
          value={Math.round(avgMaxSalary)}
          icon={TrendingUp}
          color="bg-purple-500"
          format="currency"
        />
        <StatCard
          title="Employees in Jobs"
          value={totalEmployeesInJobs}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Distribution by Job</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getJobDistributionData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="employees" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Range vs Employee Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={getSalaryRangeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="avgSalary" name="Average Salary" />
              <YAxis dataKey="employees" name="Employee Count" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => [value, name === 'employees' ? 'Employee Count' : 'Average Salary']}
                labelFormatter={(value) => `Avg Salary: $${value.toLocaleString()}`}
              />
              <Scatter dataKey="employees" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Job List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Job Position Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => {
                const employeeCount = getJobEmployeeCount(job.id);
                
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {job.jobTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created: {job.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Avg: ${Math.round((job.minSalary + job.maxSalary) / 2).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {employeeCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {job.jobDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(job)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(job)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Modal */}
      {isModalOpen && (
        <JobModal
          job={selectedJob}
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default JobManagement;