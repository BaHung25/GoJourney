import React from 'react';
import { Crown, Calendar } from 'lucide-react';
import { formatVacationDateDetailed } from '../../utils/helpers/vacationHelpers';

const CreatorInfo = ({ creator, createdAt }) => {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Crown size={20} className="text-yellow-500" />
        Người tạo
      </h3>
      <div className="flex items-center gap-3">
        <img
          src={creator?.profileImg || '/avatar-placeholder.png'}
          alt={creator?.fullName || creator?.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {creator?.fullName || creator?.username}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Calendar size={14} />
            <span>Tạo vào {formatVacationDateDetailed(createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorInfo;
