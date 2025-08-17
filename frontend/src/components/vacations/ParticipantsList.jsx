import React from 'react';
import { Users, UserPlus, Crown, UserMinus, AlertTriangle } from 'lucide-react';

const ParticipantsList = ({ 
  participants = [], 
  creator, 
  onInviteClick, 
  onKickUser,
  showInviteButton = true,
  currentUser,
  showKickButton = false
}) => {
  const canKickUser = (participant) => {
    // Chỉ creator mới có thể kick thành viên
    return showKickButton && creator && currentUser && creator._id === currentUser._id && participant._id !== creator._id;
  };

  const handleKickUser = (participant) => {
    if (confirm(`Bạn có chắc chắn muốn loại ${participant.fullName || participant.username} khỏi kỳ nghỉ này?`)) {
      onKickUser(participant._id);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users size={20} />
          Người tham gia ({participants.length})
        </h3>
        {showInviteButton && onInviteClick && (
          <button
            onClick={onInviteClick}
            className="btn btn-primary btn-sm gap-2"
          >
            <UserPlus size={16} />
            Mời
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {participants.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có người tham gia</p>
        ) : (
          participants.map((participant) => (
            <div key={participant._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={participant.profileImg || '/avatar-placeholder.png'}
                    alt={participant.fullName || participant.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {creator && participant._id === creator._id && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                      <Crown size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {participant.fullName || participant.username}
                  </p>
                  <div className="flex items-center gap-2">
                    {creator && participant._id === creator._id && (
                      <span className="text-xs text-blue-600 font-medium">Người tạo</span>
                    )}
                    <span className="text-xs text-gray-500">@{participant.username}</span>
                  </div>
                </div>
              </div>
              
              {/* Kick Button */}
              {canKickUser(participant) && (
                <button
                  onClick={() => handleKickUser(participant)}
                  className="btn btn-outline btn-error btn-sm gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                  title={`Loại ${participant.fullName || participant.username} khỏi kỳ nghỉ`}
                >
                  <UserMinus size={14} />
                  Loại
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantsList;
