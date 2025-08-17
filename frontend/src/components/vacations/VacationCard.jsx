import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, MoreVertical, Edit, Trash2, Eye, Check, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { vacationService } from '../../services/vacationService';
import { 
  formatVacationDate, 
  getStatusColor, 
  getStatusText,
  calculateVacationStatus 
} from '../../utils/helpers/vacationHelpers';

import EditVacationModal from './EditVacationModal';
import LoadingSpinner from '../common/LoadingSpinner';

const VacationCard = ({ vacation, onUpdate }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch current user để kiểm tra trạng thái
  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      return await vacationService.acceptVacationInvitation(vacation._id);
    },
    onSuccess: () => {
      toast.success('Chấp nhận lời mời thành công!');
      onUpdate();
      // Invalidate notifications để cập nhật notification count
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi chấp nhận lời mời');
    },
  });

  // Tính toán trạng thái thực tế dựa trên ngày
  const actualStatus = calculateVacationStatus(vacation.startDate, vacation.endDate);

  // Kiểm tra trạng thái của user với vacation
  const isInvited = authUser && vacation.invitedUsers?.some(user => user._id === authUser._id);
  const isCreator = authUser && vacation.creator?._id === authUser._id;
  const isParticipant = authUser && vacation.participants?.some(user => user._id === authUser._id);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa kỳ nghỉ này?')) return;

    setIsDeleting(true);
    try {
      await vacationService.deleteVacation(vacation._id);
      toast.success('Xóa kỳ nghỉ thành công!');
      onUpdate();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa kỳ nghỉ');
    } finally {
      setIsDeleting(false);
      setIsMenuOpen(false);
    }
  };

  const handleAcceptInvitation = () => {
    acceptInvitationMutation.mutate();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
        {vacation.images && vacation.images.length > 0 ? (
          <img
            src={vacation.images[0]}
            alt={vacation.name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => navigate(`/vacations/${vacation._id}`)}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer"
            onClick={() => navigate(`/vacations/${vacation._id}`)}
          >
            <Calendar size={48} className="text-white opacity-50" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(actualStatus)}`}>
            {getStatusText(actualStatus)}
          </span>
        </div>

        {/* Invitation Badge */}
        {isInvited && (
          <div className="absolute top-3 right-12">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
              Được mời
            </span>
          </div>
        )}

        {/* Menu Button */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    navigate(`/vacations/${vacation._id}`);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye size={14} />
                  Xem chi tiết
                </button>
                
                {/* Chỉ hiển thị nút edit khi là creator */}
                {isCreator && (
                  <button
                    onClick={() => {
                      setIsEditModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Chỉnh sửa
                  </button>
                )}

                {/* Chỉ hiển thị nút delete khi là creator */}
                {isCreator && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => navigate(`/vacations/${vacation._id}`)}
      >
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
          {vacation.name}
        </h3>
        
        {vacation.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {vacation.description}
          </p>
        )}

        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} />
            <span className="line-clamp-1">{vacation.location}</span>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>
              {formatVacationDate(vacation.startDate)} - {formatVacationDate(vacation.endDate)}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={14} />
            <span>{vacation.participants?.length || 0} người tham gia</span>
          </div>
        </div>

        {/* Creator */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={vacation.creator?.profileImg || '/avatar-placeholder.png'}
              alt={vacation.creator?.fullName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-gray-600">
              Tạo bởi {vacation.creator?.fullName || vacation.creator?.username}
            </span>
          </div>
        </div>

        {/* Accept Invitation Button - chỉ hiển thị khi được mời */}
        {isInvited && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAcceptInvitation();
              }}
              disabled={acceptInvitationMutation.isPending}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {acceptInvitationMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Check size={16} />
                  Chấp nhận lời mời
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Edit Vacation Modal */}
      <EditVacationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          onUpdate();
          toast.success('Cập nhật kỳ nghỉ thành công!');
        }}
        vacation={vacation}
      />
    </div>
  );
};

export default VacationCard;
