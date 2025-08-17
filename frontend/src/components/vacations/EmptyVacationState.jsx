import React from 'react';
import { Calendar, Plus } from 'lucide-react';

const EmptyVacationState = ({ onCreateClick, title = "Chưa có kỳ nghỉ nào", description = "Bắt đầu tạo kỳ nghỉ đầu tiên của bạn để lưu trữ những kỷ niệm đẹp" }) => {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
        <Calendar size={32} className="text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="btn btn-primary gap-2"
        >
          <Plus size={20} />
          Tạo kỳ nghỉ đầu tiên
        </button>
      )}
    </div>
  );
};

export default EmptyVacationState;
