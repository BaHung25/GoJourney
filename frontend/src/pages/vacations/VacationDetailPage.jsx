import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Plus,
  UserPlus,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { vacationService } from '../../services/vacationService';
import { 
  formatVacationDateDetailed, 
  getStatusColor, 
  getStatusText,
  calculateVacationStatus 
} from '../../utils/helpers/vacationHelpers';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ParticipantsList from '../../components/vacations/ParticipantsList';
import CreatorInfo from '../../components/vacations/CreatorInfo';
import VacationInfo from '../../components/vacations/VacationInfo';
import VacationPosts from '../../components/vacations/VacationPosts';
import InviteUserModal from '../../components/vacations/InviteUserModal';
import EditVacationModal from '../../components/vacations/EditVacationModal';
import ErrorState from '../../components/vacations/ErrorState';
import CreatePost from '../../pages/home/CreatePost';

const VacationDetailPage = () => {
  const { vacationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch vacation details
  const { data: vacation, isLoading, error } = useQuery({
    queryKey: ['vacation', vacationId],
    queryFn: async () => {
      return await vacationService.getVacationById(vacationId);
    },
  });

  // Fetch vacation posts
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['vacation-posts', vacationId],
    queryFn: async () => {
      const result = await vacationService.getVacationPosts(vacationId);
      console.log('Vacation posts fetched:', result);
      return result;
    },
  });

  // Delete vacation mutation
  const deleteVacationMutation = useMutation({
    mutationFn: async () => {
      return await vacationService.deleteVacation(vacationId);
    },
    onSuccess: () => {
      toast.success('Xóa kỳ nghỉ thành công!');
      navigate('/vacations');
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa kỳ nghỉ');
    },
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async (username) => {
      return await vacationService.inviteUserToVacation(vacationId, username);
    },
    onSuccess: () => {
      toast.success('Đã gửi lời mời thành công!');
      setIsInviteModalOpen(false);
      queryClient.invalidateQueries(['vacation', vacationId]);
      // Invalidate notifications để cập nhật notification count
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      return await vacationService.acceptVacationInvitation(vacationId);
    },
    onSuccess: () => {
      toast.success('Chấp nhận lời mời thành công!');
      queryClient.invalidateQueries(['vacation', vacationId]);
      // Invalidate notifications để cập nhật notification count
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi chấp nhận lời mời');
    },
  });

  // Kick user mutation
  const kickUserMutation = useMutation({
    mutationFn: async (userId) => {
      return await vacationService.kickUserFromVacation(vacationId, userId);
    },
    onSuccess: () => {
      toast.success('Loại thành viên thành công!');
      queryClient.invalidateQueries(['vacation', vacationId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi loại thành viên');
    },
  });

  // Handle post creation success
  const handlePostCreated = () => {
    console.log('Post created successfully, refreshing posts...');
    setIsCreatePostModalOpen(false);
    // Refresh vacation posts
    refetchPosts();
    // Also invalidate related queries
    queryClient.invalidateQueries(['vacation-posts', vacationId]);
    queryClient.invalidateQueries(['vacation', vacationId]);
  };

  // Tính toán trạng thái thực tế dựa trên ngày
  const actualStatus = calculateVacationStatus(vacation?.startDate, vacation?.endDate);

  const handleDelete = () => {
    if (confirm('Bạn có chắc chắn muốn xóa kỳ nghỉ này?')) {
      deleteVacationMutation.mutate();
    }
  };

  const handleInvite = (username) => {
    inviteUserMutation.mutate(username);
  };

  const handleAcceptInvitation = () => {
    acceptInvitationMutation.mutate();
  };

  const handleKickUser = (userId) => {
    kickUserMutation.mutate(userId);
  };

  // Kiểm tra xem user hiện tại có được mời không
  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
  });

  const isInvited = authUser && vacation?.invitedUsers?.some(user => user._id.toString() === authUser._id.toString());
  const isCreator = authUser && vacation?.creator?._id.toString() === authUser._id.toString();
  const isParticipant = authUser && vacation?.participants?.some(user => user._id.toString() === authUser._id.toString());

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Không tìm thấy kỳ nghỉ"
        message="Kỳ nghỉ bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập."
        onRetry={() => navigate('/vacations')}
        showRetryButton={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute inset-0">
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-200 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-200 rounded-full opacity-15 blur-3xl"></div>
    </div>
    
    <div className="relative z-10 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <button
            onClick={() => navigate('/vacations')}
            className="group p-4 bg-emerald-100 hover:bg-emerald-200 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft size={24} className="text-emerald-700 group-hover:text-emerald-800" />
          </button>
          
          <div className="flex-1 space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600 leading-tight">
              {vacation.name}
            </h1>
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-xl font-semibold tracking-wide">{vacation.location}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Chỉ hiển thị nút Edit và Delete khi là creator */}
            {isCreator && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="group bg-white/80 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 border-2 border-emerald-200 hover:border-emerald-300"
                >
                  <Edit size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteVacationMutation.isPending}
                  className="group bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} className="group-hover:scale-110 transition-transform duration-300" />
                  {deleteVacationMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
  
      {/* Cover Image */}
      {vacation.images && vacation.images.length > 0 && (
        <div className="mb-10 relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl z-10"></div>
          <img
            src={vacation.images[0]}
            alt={vacation.name}
            className="w-full h-80 lg:h-96 object-cover rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute bottom-6 left-6 z-20">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl">
              <p className="text-emerald-800 font-semibold text-lg">📸 Ảnh bìa</p>
            </div>
          </div>
        </div>
      )}
  
      {/* Vacation Info Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mb-10">
        {/* Main Info */}
        <div className="xl:col-span-2 space-y-8">
          {/* Vacation Info Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/30"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">ℹ️</span>
                </div>
                <h2 className="text-2xl font-bold text-emerald-800">Thông tin kỳ nghỉ</h2>
              </div>
              <VacationInfo vacation={vacation} />
            </div>
          </div>
  
          {/* Posts Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 to-cyan-50/30"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl">📝</span>
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-800">Bài viết & Kỷ niệm</h2>
                </div>
                {/* Chỉ hiển thị nút "Thêm bài viết" khi là creator hoặc participant */}
                {(isCreator || isParticipant) && (
                  <button
                    onClick={() => setIsCreatePostModalOpen(true)}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1"
                  >
                    <Plus size={20} />
                    Thêm bài viết
                  </button>
                )}
              </div>
              <VacationPosts
                posts={posts?.posts || []}
                isLoading={postsLoading}
                onAddPost={() => setIsCreatePostModalOpen(true)}
              />
            </div>
          </div>
        </div>
  
        {/* Sidebar */}
        <div className="space-y-8">
          {/* Invitation Card - chỉ hiển thị khi user được mời */}
          {isInvited && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl shadow-2xl border border-emerald-200/50 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white text-lg">🎉</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-800">Lời mời tham gia</h3>
                </div>
                <div className="mb-4">
                  <p className="text-emerald-700 mb-3">
                    Bạn đã được mời tham gia kỳ nghỉ này! Hãy chấp nhận để bắt đầu chia sẻ những khoảnh khắc tuyệt vời.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-emerald-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(vacation.startDate).toLocaleDateString('vi-VN')} - {new Date(vacation.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAcceptInvitation}
                    disabled={acceptInvitationMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {acceptInvitationMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Check size={18} />
                        Chấp nhận
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Participants Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 to-emerald-50/30"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">👥</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-800">Thành viên</h3>
              </div>
              <ParticipantsList
                participants={vacation.participants}
                creator={vacation.creator}
                onInviteClick={() => setIsInviteModalOpen(true)}
                onKickUser={handleKickUser}
                currentUser={authUser}
                showKickButton={isCreator}
                showInviteButton={false}
              />
              {/* Chỉ hiển thị nút mời khi là creator hoặc participant */}
              {(isCreator || isParticipant) && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-full mt-4 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  <Plus size={18} />
                  Mời thành viên
                </button>
              )}
            </div>
          </div>

          {/* Creator Info Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-emerald-200/50 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/30"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">👑</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-800">Người tạo</h3>
              </div>
              <CreatorInfo 
                creator={vacation.creator} 
                createdAt={vacation.createdAt} 
              />
            </div>
          </div>
        </div>
      </div>
  
      {/* Modals */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
        isLoading={inviteUserMutation.isPending}
        vacationId={vacationId}
        existingParticipants={vacation?.participants || []}
        existingInvited={vacation?.invitedUsers || []}
      />
  
      <CreatePost
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        vacationId={vacationId}
        onPostCreated={handlePostCreated}
      />
  
      <EditVacationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        vacation={vacation}
        onSuccess={() => {
          queryClient.invalidateQueries(['vacation', vacationId]);
          setIsEditModalOpen(false);
        }}
      />
    </div>
  </div>
  );
};

export default VacationDetailPage;
