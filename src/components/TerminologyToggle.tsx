import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Church, Building } from 'lucide-react';
import { getCurrentUnitType, setSelectedUnitType, UnitType } from '../lib/config';
import { useSession } from '../lib/SessionContext';
import { userService } from '../lib/supabase';

interface UnitTypeSelectorProps {
  className?: string;
}

export default function UnitTypeSelector({ className = '' }: UnitTypeSelectorProps) {
  const { t } = useTranslation();

  const unitTypeOptions: { value: UnitType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'ward',
      label: t('terminology.ward'),
      icon: <Church className="w-4 h-4" />,
      description: t('terminology.stake')
    },
    {
      value: 'branch',
      label: t('terminology.branch'),
      icon: <Building className="w-4 h-4" />,
      description: t('terminology.districtStake')
    }
  ];
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSession();
  const currentUnitType = getCurrentUnitType();
  const currentOption = unitTypeOptions.find(option => option.value === currentUnitType) || unitTypeOptions[0];

  const handleSelect = async (unitType: UnitType) => {
    // If user is logged in, sync to database
    if (user?.id) {
      try {
        await userService.updateUnitType(user.id, unitType);
      } catch (error) {
        console.error('Failed to save unit type to database:', error);
      }
    }
    setSelectedUnitType(unitType);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        title={`Currently using ${currentOption.label} terminology. Click to change.`}
      >
        <div className="flex items-center space-x-2">
          {currentOption.icon}
          <span>{currentOption.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              {unitTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    option.value === currentUnitType ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${option.value === currentUnitType ? 'text-blue-600' : 'text-gray-500'}`}>
                      {option.icon}
                    </div>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </div>
                  {option.value === currentUnitType && (
                    <div className="ml-auto">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}