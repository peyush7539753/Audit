import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employees/EmployeeList';
import DepartmentManagement from './components/Departments/DepartmentManagement';
import JobManagement from './components/Jobs/JobManagement';
import SalaryManagement from './components/Salaries/SalaryManagement';
import ProjectManagement from './components/Projects/ProjectManagement';
import AssignmentManagement from './components/Assignments/AssignmentManagement';
import AttendanceManagement from './components/Attendance/AttendanceManagement';
import LeaveManagement from './components/Leaves/LeaveManagement';
import ReviewManagement from './components/Reviews/ReviewManagement';
import TrainingManagement from './components/Trainings/TrainingManagement';
import EmployeeTrainingManagement from './components/EmployeeTrainings/EmployeeTrainingManagement';
import LocationManagement from './components/Locations/LocationManagement';
import AddressManagement from './components/Addresses/AddressManagement';
import AuditHistory from './components/Audit/AuditHistory';
import AdvancedSearch from './components/Search/AdvancedSearch';
import EntityRestore from './components/Restore/EntityRestore';
import AuditSettings from './components/Settings/AuditSettings';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeeList />;
      case 'departments':
        return <DepartmentManagement />;
      case 'jobs':
        return <JobManagement />;
      case 'salaries':
        return <SalaryManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'assignments':
        return <AssignmentManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'leaves':
        return <LeaveManagement />;
      case 'reviews':
        return <ReviewManagement />;
      case 'trainings':
        return <TrainingManagement />;
      case 'employee-trainings':
        return <EmployeeTrainingManagement />;
      case 'locations':
        return <LocationManagement />;
      case 'addresses':
        return <AddressManagement />;
      case 'audit':
        return <AuditHistory />;
      case 'search':
        return <AdvancedSearch />;
      case 'restore':
        return <EntityRestore />;
      case 'settings':
        return <AuditSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;