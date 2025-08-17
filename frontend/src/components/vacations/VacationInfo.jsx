import React from 'react';
import { Calendar, MapPin, Lock, Unlock } from 'lucide-react';
import { 
  formatVacationDateDetailed, 
  getStatusColor, 
  getStatusText,
  calculateVacationStatus 
} from '../../utils/helpers/vacationHelpers';

const VacationInfo = ({ vacation }) => {
  const actualStatus = calculateVacationStatus(vacation?.startDate, vacation?.endDate);

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(actualStatus)}`}>
          {getStatusText(actualStatus)}
        </span>
        {vacation.isPrivate && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
            <Lock size={14} />
            Riêng tư
          </span>
        )}
        {!vacation.isPrivate && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-1">
            <Unlock size={14} />
            Công khai
          </span>
        )}
      </div>

      {/* Description */}
      {vacation.description && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
          <p className="text-gray-700 leading-relaxed">{vacation.description}</p>
        </div>
      )}

      {/* Date Range */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar size={20} />
          Thời gian
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={16} />
            <span>Từ: {formatVacationDateDetailed(vacation.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={16} />
            <span>Đến: {formatVacationDateDetailed(vacation.endDate)}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin size={20} />
          Địa điểm
        </h3>
        <p className="text-gray-700">{vacation.location}</p>
      </div>
    </div>
  );
};

export default VacationInfo;
