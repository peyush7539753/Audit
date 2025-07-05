import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, DollarSign, FolderOpen, Activity, TrendingUp, Calendar } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { auditService } from '../../services/auditService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalJobs: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalAuditRecords: 0,
    recentActivity: 0,
    avgSalary: 0
  });

  const [activitySummary, setActivitySummary] = useState({
    totalActions: 0,
    actionsByType: {} as Record<string, number>,
    entitiesByType: {} as Record<string, number>,
    userActivity: {} as Record<string, number>
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const employees = dataService.getEmployees();
        const departments = dataService.getDepartments();
        const jobs = dataService.getJobs();
        const projects = dataService.getProjects();
        const salaries = dataService.getSalaries();
        const auditHistory = await auditService.getAuditHistory();
        
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        const recentActivity = auditHistory.filter(record => 
          record.timestamp >= last30Days
        ).length;

        const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
        const avgSalary = salaries.length > 0 
          ? salaries.reduce((sum, s) => sum + s.amount, 0) / salaries.length 
          : 0;

        const summary = auditService.getActivitySummary(last30Days, new Date());

        setStats({
          totalEmployees: employees.length,
          totalDepartments: departments.length,
          totalJobs: jobs.length,
          totalProjects: projects.length,
          activeProjects,
          totalAuditRecords: auditHistory.length,
          recentActivity,
          avgSalary
        });

        setActivitySummary(summary);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values in case of error
        setStats({
          totalEmployees: 0,
          totalDepartments: 0,
          totalJobs: 0,
          totalProjects: 0,
          activeProjects: 0,
          totalAuditRecords: 0,
          recentActivity: 0,
          avgSalary: 0
        });
        setActivitySummary({
          totalActions: 0,
          actionsByType: {},
          entitiesByType: {},
          userActivity: {}
        });
      }
    };

    loadDashboardData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    format?: 'number' | 'currency';
  }> = ({ title, value, icon: Icon, color, format = 'number' }) => {
    const formatValue = (val: number | string) => {
      // Handle undefined, null, or invalid values
      if (val === undefined || val === null || val === '') {
        return 'N/A';
      }
      
      // Convert to number if it's a string
      const numVal = typeof val === 'string' ? parseFloat(val) : val;
      
      // Check if it's a valid number
      if (isNaN(numVal)) {
        return 'N/A';
      }
      
      if (format === 'currency') {
        return `$${numVal.toLocaleString()}`;
      }
      return numVal.toLocaleString();
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

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your employee management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Departments"
          value={stats.totalDepartments}
          icon={Building2}
          color="bg-indigo-500"
        />
        <StatCard
          title="Job Positions"
          value={stats.totalJobs}
          icon={Briefcase}
          color="bg-purple-500"
        />
        <StatCard
          title="Average Salary"
          value={Math.round(stats.avgSalary)}
          icon={DollarSign}
          color="bg-green-500"
          format="currency"
        />
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderOpen}
          color="bg-orange-500"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={Calendar}
          color="bg-emerald-500"
        />
        <StatCard
          title="Audit Records"
          value={stats.totalAuditRecords}
          icon={Activity}
          color="bg-red-500"
        />
        <StatCard
          title="Recent Activity"
          value={stats.recentActivity}
          icon={TrendingUp}
          color="bg-pink-500"
        />
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions by Type (Last 30 Days)</h3>
          <div className="space-y-3">
            {Object.entries(activitySummary.actionsByType).map(([action, count]) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{action}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(activitySummary.actionsByType).length === 0 && (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Entities by Type (Last 30 Days)</h3>
          <div className="space-y-3">
            {Object.entries(activitySummary.entitiesByType).map(([entity, count]) => (
              <div key={entity} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{entity}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(activitySummary.entitiesByType).length === 0 && (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* User Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity (Last 30 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(activitySummary.userActivity).map(([user, count]) => (
            <div key={user} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{user}</span>
                <span className="text-lg font-bold text-gray-900">{count}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">actions performed</p>
            </div>
          ))}
          {Object.keys(activitySummary.userActivity).length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No user activity in the last 30 days</p>
            </div>
          )}
        </div>
      </div>

      {/* Database Setup Notice */}
      {stats.totalEmployees === 0 && stats.totalDepartments === 0 && stats.totalJobs === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Database Setup Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>It looks like your Supabase database hasn't been set up yet. To get started:</p>
                <ol className="mt-2 list-decimal list-inside space-y-1">
                  <li>Open your Supabase project dashboard</li>
                  <li>Go to the SQL Editor</li>
                  <li>Run the SQL script from the SUPABASE_SETUP.md file</li>
                  <li>Add your Supabase credentials to the .env file</li>
                </ol>
                <p className="mt-2">Once set up, you can start adding employees, departments, and other data to see meaningful statistics here.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;