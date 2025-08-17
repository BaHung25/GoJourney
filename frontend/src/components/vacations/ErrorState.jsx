import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ 
  title = "Có lỗi xảy ra", 
  message = "Không thể tải dữ liệu", 
  onRetry,
  showRetryButton = true 
}) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle size={32} className="text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {message}
        </p>
        {showRetryButton && onRetry && (
          <button 
            onClick={onRetry}
            className="btn btn-primary gap-2"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

