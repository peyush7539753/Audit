import React from 'react';
import { 
  Users, 
  Building2, 
  Briefcase, 
  DollarSign,
  FolderOpen,
  UserCheck,
  Calendar,
  Star,
  GraduationCap,
  History, 
  Settings,
  BarChart3,
  Search,
  Shield,
  MapPin,
  Link,
  BookOpen,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'salaries', label: 'Salaries', icon: DollarSign },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'assignments', label: 'Project Assignments', icon: Link },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'leaves', label: 'Leaves', icon: Calendar },
    { id: 'reviews', label: 'Performance Reviews', icon: Star },
    { id: 'trainings', label: 'Trainings', icon: GraduationCap },
    { id: 'employee-trainings', label: 'Employee Training Records', icon: BookOpen },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'addresses', label: 'Addresses', icon: Home },
    { id: 'audit', label: 'Audit History', icon: History },
    { id: 'search', label: 'Advanced Search', icon: Search },
    { id: 'restore', label: 'Entity Restore', icon: Shield },
    { id: 'settings', label: 'Audit Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Employee System</h1>
        <p className="text-sm text-gray-600">Management Portal</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;