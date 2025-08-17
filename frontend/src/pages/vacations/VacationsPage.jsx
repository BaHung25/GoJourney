import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { vacationService } from '../../services/vacationService';
import { calculateVacationStatus } from '../../utils/helpers/vacationHelpers';

import VacationCard from '../../components/vacations/VacationCard';
import CreateVacationModal from '../../components/vacations/CreateVacationModal';
import EmptyVacationState from '../../components/vacations/EmptyVacationState';
import ErrorState from '../../components/vacations/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VacationsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const queryClient = useQueryClient();

  const { data: vacations, isLoading, error, refetch } = useQuery({
    queryKey: ['vacations'],
    queryFn: async () => {
      const result = await vacationService.getUserVacations();
      console.log('Vacations API response:', result);
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 phút
    refetchOnWindowFocus: false,
  });

  // Filter vacations based on status
  const filteredVacations = React.useMemo(() => {
    if (!vacations || !statusFilter) return vacations;
    
    return vacations.filter(vacation => {
      const status = calculateVacationStatus(vacation.startDate, vacation.endDate);
      return status === statusFilter;
    });
  }, [vacations, statusFilter]);

  console.log('Current vacations data:', vacations);
  console.log('Filtered vacations:', filteredVacations);
  console.log('Current filter:', statusFilter);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    toast.error('Không thể tải danh sách kỳ nghỉ');
    return (
      <ErrorState
        title="Không thể tải danh sách kỳ nghỉ"
        message="Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại."
        onRetry={refetch}
      />
    );
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp tới';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã hoàn thành';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Kỳ nghỉ của tôi</h1>
          <p className="text-green-600 mt-2">Quản lý và theo dõi các chuyến đi của bạn</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={20} />
          Tạo kỳ nghỉ mới
        </button>
      </div>
  
      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-green-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-green-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-green-300 rounded-md px-3 py-2 text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-48"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="upcoming">🟦 Sắp tới (chưa bắt đầu)</option>
              <option value="ongoing">🟢 Đang diễn ra</option>
              <option value="completed">⚫ Đã hoàn thành</option>
            </select>
            
            {/* Clear filter button */}
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="text-green-600 hover:text-green-800 px-3 py-1 rounded-md text-sm transition-colors duration-200"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          
          {/* Results count */}
          <div className="text-sm text-green-700">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                Đang tải...
              </span>
            ) : statusFilter ? (
              <>
                Hiển thị <span className="font-semibold text-green-800">{filteredVacations?.length || 0}</span> 
                trong tổng số <span className="font-semibold text-green-800">{vacations?.length || 0}</span> kỳ nghỉ
              </>
            ) : (
              <>
                Tổng cộng <span className="font-semibold text-green-800">{vacations?.length || 0}</span> kỳ nghỉ
              </>
            )}
          </div>
        </div>
      </div>
  
      {/* Vacations Grid */}
      {filteredVacations?.length === 0 ? (
        statusFilter ? (
          // No results for current filter
          <div className="text-center py-12">
            <div className="max-w-md mx-auto bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-green-200">
              <Filter size={48} className="mx-auto text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Không tìm thấy kỳ nghỉ nào
              </h3>
              <p className="text-green-600 mb-4">
                Không có kỳ nghỉ nào với trạng thái "{getStatusText(statusFilter)}"
              </p>
              <button
                onClick={() => setStatusFilter('')}
                className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg border border-green-300 transition-colors duration-200"
              >
                Xem tất cả kỳ nghỉ
              </button>
            </div>
          </div>
        ) : (
          // No vacations at all
          <div className="text-center py-12">
            <div className="max-w-md mx-auto bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-green-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Chưa có kỳ nghỉ nào
              </h3>
              <p className="text-green-600 mb-4">
                Hãy tạo kỳ nghỉ đầu tiên của bạn để bắt đầu
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200"
              >
                Tạo kỳ nghỉ mới
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacations?.map((vacation) => (
            <div 
              key={vacation._id}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-green-300"
            >
              <VacationCard 
                vacation={vacation}
                onUpdate={refetch}
              />
            </div>
          ))}
        </div>
      )}
  
      {/* Create Vacation Modal */}
      <CreateVacationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={async () => {
          setIsCreateModalOpen(false);
          console.log('Invalidating vacations query...');
          await queryClient.invalidateQueries({ queryKey: ['vacations'] });
          console.log('Query invalidated, vacations should refresh');
          toast.success('Tạo kỳ nghỉ thành công!');
        }}
      />
    </div>
  </div>
  );
};

export default VacationsPage;
