const API_BASE_URL = '/api/vacations';

// Helper function để xử lý response
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
};

// Helper function để tạo headers
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function để tạo headers cho file upload (không có Content-Type)
const getHeadersForFileUpload = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const vacationService = {
  // Tạo kỳ nghỉ mới
  createVacation: async (formData) => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeadersForFileUpload(), // Thêm Authorization header
      body: formData, // FormData cho file upload
    });
    return handleResponse(response);
  },

  // Lấy danh sách kỳ nghỉ của người dùng
  getUserVacations: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/user?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Lấy chi tiết kỳ nghỉ
  getVacationById: async (vacationId) => {
    const response = await fetch(`${API_BASE_URL}/${vacationId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Cập nhật kỳ nghỉ
  updateVacation: async (vacationId, formData) => {
    const response = await fetch(`${API_BASE_URL}/${vacationId}`, {
      method: 'PUT',
      headers: getHeadersForFileUpload(), // Thêm Authorization header
      body: formData, // FormData cho file upload
    });
    return handleResponse(response);
  },

  // Xóa kỳ nghỉ
  deleteVacation: async (vacationId) => {
    const response = await fetch(`${API_BASE_URL}/${vacationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Lấy bài viết theo kỳ nghỉ
  getVacationPosts: async (vacationId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/${vacationId}/posts?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Thêm bài viết vào kỳ nghỉ
  addPostToVacation: async (vacationId, postId) => {
    const response = await fetch(`${API_BASE_URL}/${vacationId}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ postId }),
    });
    return handleResponse(response);
  },

  // Gỡ bài viết khỏi kỳ nghỉ
  removePostFromVacation: async (vacationId, postId) => {
    const response = await fetch(`${API_BASE_URL}/${vacationId}/posts/${postId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Mời người dùng tham gia kỳ nghỉ
  inviteUserToVacation: async (vacationId, username) => {
    const response = await fetch(`${API_BASE_URL}/${vacationId}/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username }),
    });
    return handleResponse(response);
  },

  // Chấp nhận lời mời tham gia kỳ nghỉ
  acceptVacationInvitation: async (vacationId) => {
    const response = await fetch(`${API_BASE_URL}/${vacationId}/accept`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Loại thành viên khỏi kỳ nghỉ
  kickUserFromVacation: async (vacationId, userId) => {
    const response = await fetch(`${API_BASE_URL}/${vacationId}/participants/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

export default vacationService;
