import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Users, Wifi, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Location, Address, Department } from '../../types';

interface LocationModalProps {
  location: Location | null;
  mode: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSave: (location: Partial<Location>) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ location, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    locationName: '',
    addressId: '',
    capacity: 0,
    facilities: [] as string[]
  });

  const [addresses, setAddresses] = useState(dataService.getAddresses());
  const [facilityInput, setFacilityInput] = useState('');

  useEffect(() => {
    if (location) {
      setFormData({
        locationName: location.locationName,
        addressId: location.addressId,
        capacity: location.capacity,
        facilities: [...location.facilities]
      });
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value
    }));
  };

  const addFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facilityInput.trim()]
      }));
      setFacilityInput('');
    }
  };

  const removeFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facility)
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
            {mode === 'create' ? 'Add Location' : mode === 'edit' ? 'Edit Location' : 'View Location'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
            <input
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <select
              name="addressId"
              value={formData.addressId}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option value="">Select Address</option>
              {addresses.map(address => (
                <option key={address.id} value={address.id}>
                  {address.street}, {address.city}, {address.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              disabled={isReadOnly}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facilities</label>
            {!isReadOnly && (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  placeholder="Add facility"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addFacility}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {formData.facilities.map((facility, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {facility}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
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
                {mode === 'create' ? 'Create Location' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const LocationManagement: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLocations(dataService.getLocations());
    setAddresses(dataService.getAddresses());
    setDepartments(dataService.getDepartments());
  };

  const getAddress = (addressId: string) => {
    return addresses.find(addr => addr.id === addressId);
  };

  const getDepartmentCount = (locationId: string) => {
    return departments.filter(dept => dept.locationId === locationId).length;
  };

  const getLocationDepartments = (locationId: string) => {
    return departments.filter(dept => dept.locationId === locationId);
  };

  const handleView = (location: Location) => {
    setSelectedLocation(location);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedLocation(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = async (location: Location) => {
    if (window.confirm(`Are you sure you want to delete ${location.locationName}?`)) {
      await dataService.deleteLocation(location.id);
      loadData();
    }
  };

  const handleSave = async (locationData: Partial<Location>) => {
    if (modalMode === 'create') {
      await dataService.createLocation(locationData as Omit<Location, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (modalMode === 'edit' && selectedLocation) {
      await dataService.updateLocation(selectedLocation.id, locationData);
    }
    setIsModalOpen(false);
    loadData();
  };

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

  const totalLocations = locations.length;
  const totalCapacity = locations.reduce((sum, location) => sum + location.capacity, 0);
  const totalDepartments = departments.length;
  const avgCapacity = locations.length > 0 ? Math.round(totalCapacity / locations.length) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Location Management</h1>
          <p className="text-gray-600 mt-2">Manage office locations and facilities</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Location
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Locations"
          value={totalLocations}
          icon={MapPin}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Capacity"
          value={totalCapacity}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Departments"
          value={totalDepartments}
          icon={Building2}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg Capacity"
          value={avgCapacity}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {locations.map((location) => {
          const address = getAddress(location.addressId);
          const departmentCount = getDepartmentCount(location.id);
          const locationDepartments = getLocationDepartments(location.id);
          
          return (
            <div key={location.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {location.locationName}
                    </h3>
                    {address && (
                      <p className="text-sm text-gray-600">
                        {address.street}, {address.city}, {address.state} {address.postalCode}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(location)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(location)}
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(location)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right mb-4">
                <div className="text-sm font-medium text-gray-900">
                  Capacity: {location.capacity}
                </div>
                <div className="text-sm text-gray-500">
                  {departmentCount} departments
                </div>
              </div>

              {/* Facilities */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Facilities:</h4>
                <div className="flex flex-wrap gap-2">
                  {location.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <Wifi className="w-3 h-3 mr-1" />
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              {/* Departments */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Departments:</h4>
                <div className="space-y-2">
                  {locationDepartments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {dept.departmentName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ${dept.budget.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {locationDepartments.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No departments assigned</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Location List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facilities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => {
                const address = getAddress(location.addressId);
                const departmentCount = getDepartmentCount(location.id);
                
                return (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {location.locationName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created: {location.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {address && (
                        <div className="text-sm text-gray-900">
                          <div>{address.street}</div>
                          <div className="text-gray-500">
                            {address.city}, {address.state} {address.postalCode}
                          </div>
                          <div className="text-gray-500">{address.country}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {location.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {departmentCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {location.facilities.slice(0, 3).map((facility, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {facility}
                          </span>
                        ))}
                        {location.facilities.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{location.facilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(location)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(location)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(location)}
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

      {/* Location Modal */}
      {isModalOpen && (
        <LocationModal
          location={selectedLocation}
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default LocationManagement;