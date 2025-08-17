// Tính toán trạng thái kỳ nghỉ dựa trên ngày
export const calculateVacationStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'ongoing';
  } else {
    return 'completed';
  }
};

// Format ngày cho hiển thị
export const formatVacationDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Format ngày chi tiết
export const formatVacationDateDetailed = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Lấy màu sắc cho trạng thái
export const getStatusColor = (status) => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800';
    case 'ongoing':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Lấy text cho trạng thái
export const getStatusText = (status) => {
  switch (status) {
    case 'upcoming':
      return 'Sắp tới';
    case 'ongoing':
      return 'Đang diễn ra';
    case 'completed':
      return 'Đã hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

// Tính số ngày còn lại
export const getDaysRemaining = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const diffTime = start - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Kiểm tra xem kỳ nghỉ có đang diễn ra không
export const isVacationOngoing = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
};

// Kiểm tra xem kỳ nghỉ có sắp tới không (trong vòng 7 ngày)
export const isVacationUpcoming = (startDate) => {
  const daysRemaining = getDaysRemaining(startDate);
  return daysRemaining > 0 && daysRemaining <= 7;
};
