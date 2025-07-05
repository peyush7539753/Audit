import React, { useState, useEffect } from 'react';
import { UserCheck, Calendar, Clock, TrendingUp, Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Attendance, Employee } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AttendanceModalProps {
  attendance: Attendance | null;
  mode: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSave: (attendance: Partial<Attendance>) => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ attendance, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'PRESENT' as const,
    notes: ''
  });

  const [employees, setEmployees] = useState(dataService.getEmployees());

  useEffect(() => {
    if (attendance) {
      setFormData({
        employeeId: attendance.employeeId,
        date: attendance.date.toISOString().split('T')[0],
        checkInTime: attendance.checkInTime ? attendance.checkInTime.toTimeString().slice(0, 5) : '',
        checkOutTime: attendance.checkOutTime ? attendance.checkOutTime.toTimeString().slice(0, 5) : '',
        status: attendance.status,
        notes: attendance.notes || ''
      });
    }
  }, [attendance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      date: new Date(formData.date),
      checkInTime: formData.checkInTime ? new Date(`${formData.date}T${formData.checkInTime}`) : undefined,
      checkOutTime: formData.checkOutTime ? new Date(`${formData.date}T${formData.checkOutTime}`) : undefined,
      notes: formData.notes || undefined
    };
    onSave(submitData);
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add Attendance' : mode === 'edit' ? 'Edit Attendance' : 'View Attendance'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
              <input
                type="time"
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
              <input
                type="time"
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
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
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">Leave</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isReadOnly}
              rows={3}
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
                {mode === 'create' ? 'Create Attendance' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const AttendanceManagement: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAttendances(dataService.getAttendances());
    setEmployees(dataService.getEmployees());
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const handleView = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAttendance(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = async (attendance: Attendance) => {
    if (window.confirm(`Are you sure you want to delete this attendance record?`)) {
      await dataService.deleteAttendance(attendance.id);
      loadData();
    }
  };

  const handleSave = async (attendanceData: Partial<Attendance>) => {
    if (modalMode === 'create') {
      await dataService.createAttendance(attendanceData as Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (modalMode === 'edit' && selectedAttendance) {
      await dataService.updateAttendance(selectedAttendance.id, attendanceData);
    }
    setIsModalOpen(false);
    loadData();
  };

  const getAttendanceStats = () => {
    const statusCounts = attendances.reduce((acc, attendance) => {
      acc[attendance.status] = (acc[attendance.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const getDailyAttendanceData = () => {
    const dailyData: { [key: string]: { present: number; absent: number; leave: number } } = {};
    
    attendances.forEach(attendance => {
      const dateKey = attendance.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { present: 0, absent: 0, leave: 0 };
      }
      
      if (attendance.status === 'PRESENT') dailyData[dateKey].present++;
      else if (attendance.status === 'ABSENT') dailyData[dateKey].absent++;
      else if (attendance.status === 'LEAVE') dailyData[dateKey].leave++;
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        ...data,
        total: data.present + data.absent + data.leave
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 days
  };

  const calculateWorkingHours = (checkIn?: Date, checkOut?: Date) => {
    if (!checkIn || !checkOut) return 0;
    return (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60); // Convert to hours
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    format?: 'number' | 'percentage';
  }> = ({ title, value, icon: Icon, color, format = 'number' }) => {
    const formatValue = (val: number | string) => {
      if (format === 'percentage' && typeof val === 'number') {
        return `${val.toFixed(1)}%`;
      }
      return val.toString();
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

  const totalRecords = attendances.length;
  const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
  const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;
  const avgWorkingHours = attendances
    .filter(a => a.status === 'PRESENT')
    .reduce((sum, a) => sum + calculateWorkingHours(a.checkInTime, a.checkOutTime), 0) / 
    (attendances.filter(a => a.status === 'PRESENT').length || 1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LEAVE': return 'bg-blue-100 text-blue-800';
      case 'HALF_DAY': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-2">Track and manage employee attendance records</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Attendance
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Records"
          value={totalRecords}
          icon={UserCheck}
          color="bg-blue-500"
        />
        <StatCard
          title="Attendance Rate"
          value={attendanceRate}
          icon={TrendingUp}
          color="bg-green-500"
          format="percentage"
        />
        <StatCard
          title="Present Today"
          value={presentCount}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg Working Hours"
          value={avgWorkingHours.toFixed(1)}
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getAttendanceStats()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getAttendanceStats().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getDailyAttendanceData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} name="Absent" />
              <Line type="monotone" dataKey="leave" stroke="#3B82F6" strokeWidth={2} name="Leave" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Attendance Records</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Working Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.map((attendance) => {
                const workingHours = calculateWorkingHours(attendance.checkInTime, attendance.checkOutTime);
                
                return (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getEmployeeName(attendance.employeeId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {attendance.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {attendance.date.toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {attendance.checkInTime?.toLocaleTimeString() || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {attendance.checkOutTime?.toLocaleTimeString() || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {workingHours > 0 ? `${workingHours.toFixed(1)}h` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(attendance.status)}`}>
                        {attendance.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(attendance)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(attendance)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(attendance)}
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

      {/* Attendance Modal */}
      {isModalOpen && (
        <AttendanceModal
          attendance={selectedAttendance}
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AttendanceManagement;