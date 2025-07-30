import React from 'react';
import { Building, Phone, MapPin, AlertTriangle, Save, Download } from 'lucide-react';
import { BuildingInformation } from '../types/bulletin';
import { buildingService } from '../lib/buildingService';
import { toast } from 'react-toastify';

interface BuildingInformationFormProps {
  data: BuildingInformation;
  onChange: (data: BuildingInformation) => void;
  userId?: string;
  onSaveDefault?: (data: BuildingInformation) => void;
}

export default function BuildingInformationForm({ data, onChange, userId, onSaveDefault }: BuildingInformationFormProps) {
  const updateField = (field: keyof BuildingInformation, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleSaveToDatabase = async () => {
    if (!userId) {
      toast.error('Please sign in to save building information.');
      return;
    }

    try {
      await buildingService.createOrUpdateBuildingInfo(userId, {
        building_name: data.buildingName,
        address: data.address,
        phone: data.phone,
        emergency_contact: data.emergencyContact,
        emergency_phone: data.emergencyPhone
      });
      toast.success('Building information saved successfully!');
    } catch (error) {
      console.error('Error saving building information:', error);
      toast.error('Failed to save building information.');
    }
  };

  const handleLoadFromDatabase = async () => {
    if (!userId) {
      toast.error('Please sign in to load building information.');
      return;
    }

    try {
      const buildingInfo = await buildingService.getBuildingInfo(userId);
      if (buildingInfo) {
        onChange({
          buildingName: buildingInfo.building_name,
          address: buildingInfo.address,
          phone: buildingInfo.phone,
          emergencyContact: buildingInfo.emergency_contact,
          emergencyPhone: buildingInfo.emergency_phone
        });
        toast.success('Building information loaded successfully!');
      } else {
        toast.info('No saved building information found.');
      }
    } catch (error) {
      console.error('Error loading building information:', error);
      toast.error('Failed to load building information.');
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center justify-between">
        <div className="flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Building Information
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleLoadFromDatabase}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 border border-gray-300 flex items-center"
            title="Load from database"
          >
            <Download className="w-4 h-4 mr-1" />
            Load
          </button>
          <button
            type="button"
            onClick={handleSaveToDatabase}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 border border-blue-600 flex items-center"
            title="Save to database"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
          {onSaveDefault && (
            <button
              type="button"
              onClick={() => onSaveDefault(data)}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 border border-gray-300 flex items-center"
              title="Save as default"
            >
              Save as default
            </button>
          )}
        </div>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Building className="w-4 h-4 mr-1" />
            Building Name
          </label>
          <input
            type="text"
            value={data.buildingName}
            onChange={(e) => updateField('buildingName', e.target.value)}
            placeholder="e.g., Stake Center"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Address
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="e.g., 123 Main St, City, State"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Phone className="w-4 h-4 mr-1" />
            Building Phone
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="e.g., (555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Emergency Contact
          </label>
          <input
            type="text"
            value={data.emergencyContact}
            onChange={(e) => updateField('emergencyContact', e.target.value)}
            placeholder="e.g., Bishop's Phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <Phone className="w-4 h-4 mr-1" />
          Emergency Phone
        </label>
        <input
          type="tel"
          value={data.emergencyPhone}
          onChange={(e) => updateField('emergencyPhone', e.target.value)}
          placeholder="e.g., (555) 987-6543"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </section>
  );
} 