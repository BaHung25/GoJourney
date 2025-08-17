import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Users, Check, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Helper function để tạo headers
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    // Không cần Authorization header vì sử dụng session cookies
  };
};

const InviteUserModal = ({ isOpen, onClose, onInvite, isLoading = false, vacationId, existingParticipants = [], existingInvited = [] }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch followed users
  const { data: followedUsers = [], isLoading: isLoadingFollowed } = useQuery({
    queryKey: ['followedUsers'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/users/following', {
          headers: getHeaders(),
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch followed users');
        const data = await response.json();
        // API trả về trực tiếp array, không cần .following
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching followed users:', error);
        return [];
      }
    },
    enabled: isOpen
  });

  // Filter out users who are already participants or invited
  const filterExistingUsers = (users) => {
    const existingIds = [
      ...existingParticipants.map(p => p._id.toString()),
      ...existingInvited.map(i => i._id.toString())
    ];
    return users.filter(user => !existingIds.includes(user._id.toString()));
  };

  // Filter followed users based on search
  const filteredFollowedUsers = filterExistingUsers(followedUsers).filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Search users in the entire system
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Tìm kiếm theo cả username và fullName
      const response = await fetch(`/api/users/search?username=${encodeURIComponent(query)}&fullName=${encodeURIComponent(query)}`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Lọc kết quả và loại bỏ người đã có
        const filteredData = filterExistingUsers(data);
        setSearchResults(filteredData);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUserSelect = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id.toString() === user._id.toString());
      if (isSelected) {
        return prev.filter(u => u._id.toString() !== user._id.toString());
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0 && !searchQuery.trim()) {
      toast.error('Vui lòng chọn người dùng hoặc nhập tên người dùng');
      return;
    }
    
    // If searchQuery is provided, use that; otherwise use selected users
    if (searchQuery.trim()) {
      onInvite(searchQuery.trim());
    } else {
      // Invite selected users
      selectedUsers.forEach(user => {
        onInvite(user.username);
      });
    }
    
    setSearchQuery('');
    setSelectedUsers([]);
    setSearchResults([]);
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus size={20} />
            Mời người tham gia
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Username Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm người dùng trong hệ thống
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên người dùng hoặc họ tên để tìm kiếm..."
                className="input input-bordered w-full pl-10"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tìm kiếm theo username hoặc họ tên. Kết quả sẽ hiển thị ngay bên dưới.
            </p>
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Search size={16} />
                Kết quả tìm kiếm cho "{searchQuery}"
                {isSearching && <span className="loading loading-spinner loading-sm"></span>}
              </h4>
              
              {searchResults.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Tìm thấy {searchResults.length} người dùng phù hợp
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {searchResults.map((user) => {
                      const isSelected = selectedUsers.some(u => u._id.toString() === user._id.toString());
                      return (
                        <div
                          key={user._id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profileImg || '/avatar-placeholder.png'}
                              alt={user.fullName || user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {user.fullName || user.username}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                @{user.username}
                              </p>
                            </div>
                            {isSelected && (
                              <Check size={16} className="text-primary" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : !isSearching && (
                <div className="text-center py-4 text-gray-500">
                  <p>Không tìm thấy người dùng nào phù hợp với "{searchQuery}"</p>
                  <p className="text-sm mt-1">Hãy thử tìm kiếm với từ khóa khác</p>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Followed Users List */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-gray-600" />
              <h4 className="font-medium text-gray-700">Người bạn đang follow</h4>
              <span className="text-sm text-gray-500">({filteredFollowedUsers.length})</span>
            </div>

            {isLoadingFollowed ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner loading-md"></span>
                <p className="text-gray-500 mt-2">Đang tải danh sách...</p>
              </div>
            ) : filteredFollowedUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {filteredFollowedUsers.map((user) => {
                  const isSelected = selectedUsers.some(u => u._id.toString() === user._id.toString());
                  return (
                    <div
                      key={user._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profileImg || '/avatar-placeholder.png'}
                          alt={user.fullName || user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            @{user.username}
                          </p>
                        </div>
                        {isSelected && (
                          <Check size={16} className="text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? (
                  <div>
                    <p>Không tìm thấy người dùng nào phù hợp với "{searchQuery}"</p>
                    <p className="text-sm mt-1">Hãy thử tìm kiếm với từ khóa khác</p>
                  </div>
                ) : followedUsers.length === 0 ? (
                  <div>
                    <p>Bạn chưa follow ai cả</p>
                    <p className="text-sm mt-1">Hãy follow một số người dùng để mời họ tham gia</p>
                  </div>
                ) : (
                  <div>
                    <p>Tất cả người bạn follow đã được mời hoặc đã tham gia</p>
                    <p className="text-sm mt-1">Bạn có thể tìm kiếm người dùng khác ở trên</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Users Summary */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">
                Đã chọn {selectedUsers.length} người dùng:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <span
                    key={user._id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {user.fullName || user.username}
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (selectedUsers.length === 0 && !searchQuery.trim())}
              className="btn btn-primary gap-2"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Đang gửi...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Gửi lời mời
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;
