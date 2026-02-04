import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, CheckCircle, Archive, FileText } from 'lucide-react';
import { BulletinStatus } from '../types/bulletin';

interface BulletinStatusBadgeProps {
  status: BulletinStatus;
  scheduledDate?: string;
  className?: string;
}

export default function BulletinStatusBadge({
  status,
  scheduledDate,
  className = ''
}: BulletinStatusBadgeProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      // Parse as local date (not UTC) - same method as other components
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          icon: FileText,
          text: t('bulletin.draftStatus'),
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
      case 'scheduled':
        return {
          icon: Clock,
          text: scheduledDate ? t('bulletin.scheduledFor', { date: formatDate(scheduledDate.split('T')[0]) }) : t('bulletin.scheduledStatus'),
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'active':
        return {
          icon: CheckCircle,
          text: t('bulletin.activeStatus'),
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'archived':
        return {
          icon: Archive,
          text: t('bulletin.archivedStatus'),
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          iconColor: 'text-gray-500'
        };
      default:
        return {
          icon: FileText,
          text: t('bulletin.unknownStatus'),
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <Icon className={`w-3 h-3 mr-1 ${config.iconColor}`} />
      {config.text}
    </span>
  );
}