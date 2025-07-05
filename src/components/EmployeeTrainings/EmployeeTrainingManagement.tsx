import React, { useState, useEffect } from 'react';
import { GraduationCap, User, Calendar, CheckCircle, XCircle, Clock, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { EmployeeTraining, Employee, Training } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface EmployeeTrainingModalProps {
  employeeTraining: EmployeeTraining | null;
  mode: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSave: (employeeTraining: Partial<EmployeeTraining>) => void;
}

const EmployeeTrainingModal: React.FC<EmployeeTrainingModalProps> = ({ employeeTraining, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    trainingId: '',
    status: 'ENROLLED' as const,
    enrollmentDate: '',
    completionDate: '',
    score: 0,
    certificate: ''
  });

  const [employees, setEmployees] = useState(dataService.getEmployees());
  const [trainings, setTrainings] = useState(dataService.getTrainings());

  useEffect(() => {
    if (employeeTraining) {
      setFormData({
        employeeId: employeeTraining.employeeId,
        trainingId: employeeTraining.trainingId,
        status: employeeTraining.status,
        enrollmentDate: employeeTraining.enrollmentDate.toISOString().split('T')[0],
        completionDate: employeeTraining.completionDate ? employeeTraining.completionDate.toISOString().split('T')[0] : '',
        score: employeeTraining.score || 0,
        certificate: employeeTraining.certificate || ''
      });
    }
  }, [employeeTraining]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'score' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      enrollmentDate: new Date(formData.enrollmentDate),
      completionDate: formData.completionDate ? new Date(formData.completionDate) : undefined,
      score: formData.score || undefined,
      certificate: formData.certificate || undefined
    };
    onSave(submitData);
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add Employee Training' : mode === 'edit' ? 'Edit Employee Training' : 'View Employee Training'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option value="">Select Employee</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Training</label>
            <select
              name="trainingId"
              value={formData.trainingId}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option value="">Select Training</option>
              {trainings.map(training => (
                <option key={training.id} value={training.id}>
                  {training.trainingTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option value="ENROLLED">Enrolled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
              <input
                type="date"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleChange}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                disabled={isReadOnly}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
              <input
                type="text"
                name="certificate"
                value={formData.certificate}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
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
                {mode === 'create' ? 'Create Training Record' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeTrainingManagement: React.FC = () => {
  const [employeeTrainings, setEmployeeTrainings] = useState<EmployeeTraining[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedEmployeeTraining, setSelectedEmployeeTraining] = useState<EmployeeTraining | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEmployeeTrainings(dataService.getEmployeeTrainings());
    setEmployees(dataService.getEmployees());
    setTrainings(dataService.getTrainings());
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const getTrainingTitle = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    return training?.trainingTitle || 'Unknown Training';
  };

  const handleView = (employeeTraining: EmployeeTraining) => {
    setSelectedEmployeeTraining(employeeTraining);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (employeeTraining: EmployeeTraining) => {
    setSelectedEmployeeTraining(employeeTraining);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedEmployeeTraining(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = async (employeeTraining: EmployeeTraining) => {
    if (window.confirm(`Are you sure you want to delete this training record?`)) {
      await dataService.deleteEmployeeTraining(employeeTraining.id);
      loadData();
    }
  };

  const handleSave = async (employeeTrainingData: Partial<EmployeeTraining>) => {
    if (modalMode === 'create') {
      await dataService.createEmployeeTraining(employeeTrainingData as Omit<EmployeeTraining, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (modalMode === 'edit' && selectedEmployeeTraining) {
      await dataService.updateEmployeeTraining(selectedEmployeeTraining.id, employeeTrainingData);
    }
    setIsModalOpen(false);
    loadData();
  };

  const getStatusData = () => {
    const statusCounts = employeeTrainings.reduce((acc, et) => {
      acc[et.status] = (acc[et.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count
    }));
  };

  const getTrainingEnrollmentData = () => {
    const trainingCounts = employeeTrainings.reduce((acc, et) => {
      const trainingTitle = getTrainingTitle(et.trainingId);
      acc[trainingTitle] = (acc[trainingTitle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(trainingCounts).map(([training, count]) => ({
      name: training.length > 15 ? training.substring(0, 15) + '...' : training,
      count
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const totalEnrollments = employeeTrainings.length;
  const completedTrainings = employeeTrainings.filter(et => et.status === 'COMPLETED').length;
  const inProgressTrainings = employeeTrainings.filter(et => et.status === 'IN_PROGRESS').length;
  const avgScore = employeeTrainings.filter(et => et.score).reduce((sum, et) => sum + (et.score || 0), 0) / 
    (employeeTrainings.filter(et => et.score).length || 1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'DROPPED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ENROLLED': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'DROPPED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Training Records</h1>
          <p className="text-gray-600 mt-2">Track individual employee training progress and achievements</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Training Record
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Enrollments"
          value={totalEnrollments}
          icon={GraduationCap}
          color="bg-blue-500"
        />
        <StatCard
          title="Completed"
          value={completedTrainings}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="In Progress"
          value={inProgressTrainings}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Average Score"
          value={`${avgScore.toFixed(1)}%`}
          icon={GraduationCap}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getStatusData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollments by Training</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTrainingEnrollmentData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Training Records List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Employee Training Records</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeTrainings.map((employeeTraining) => (
                <tr key={employeeTraining.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getEmployeeName(employeeTraining.employeeId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {employeeTraining.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {getTrainingTitle(employeeTraining.trainingId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {employeeTraining.enrollmentDate.toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employeeTraining.status)}`}>
                        {getStatusIcon(employeeTraining.status)}
                        <span className="ml-1">{employeeTraining.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {employeeTraining.score ? `${employeeTraining.score}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(employeeTraining)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(employeeTraining)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employeeTraining)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Training Modal */}
      {isModalOpen && (
        <EmployeeTrainingModal
          employeeTraining={selectedEmployeeTraining}
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default EmployeeTrainingManagement;