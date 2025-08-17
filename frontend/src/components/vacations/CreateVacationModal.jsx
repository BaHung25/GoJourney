import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Calendar, MapPin, Lock, Unlock, Users, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { vacationService } from '../../services/vacationService';

const CreateVacationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isPrivate: false,
    invitedUsers: []
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Tên kỳ nghỉ là bắt buộc';
        if (value.trim().length < 3) return 'Tên phải có ít nhất 3 ký tự';
        if (value.trim().length > 100) return 'Tên không được vượt quá 100 ký tự';
        return '';
      case 'startDate':
        if (!value) return 'Ngày bắt đầu là bắt buộc';
        if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
          return 'Ngày bắt đầu không thể là quá khứ';
        }
        return '';
      case 'endDate':
        if (!value) return 'Ngày kết thúc là bắt buộc';
        if (formData.startDate && new Date(value) <= new Date(formData.startDate)) {
          return 'Ngày kết thúc phải sau ngày bắt đầu';
        }
        return '';
      case 'location':
        if (!value.trim()) return 'Địa điểm là bắt buộc';
        if (value.trim().length < 2) return 'Địa điểm phải có ít nhất 2 ký tự';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (['name', 'startDate', 'endDate', 'location'].includes(key)) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.startDate && 
           formData.endDate && 
           formData.location.trim() &&
           new Date(formData.endDate) > new Date(formData.startDate);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Only validate and show errors if field has been touched
    if (touched[name]) {
      const error = validateField(name, newValue);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateImage = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)');
      return false;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return false;
    }

    return true;
  };

  const addImages = (newFiles) => {
    const validFiles = [];
    
    newFiles.forEach(file => {
      if (validateImage(file)) {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) return;

    // Check total image limit (10 images max)
    if (images.length + validFiles.length > 10) {
      toast.error('Tối đa chỉ được upload 10 ảnh');
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  }, []);

  const removeImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng sửa các lỗi trong form');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'invitedUsers') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append multiple images
      images.forEach((image, index) => {
        formDataToSend.append(`images`, image.file);
      });

      await vacationService.createVacation(formDataToSend);
      toast.success('Tạo kỳ nghỉ thành công!');
      onSuccess();
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo kỳ nghỉ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      isPrivate: false,
      invitedUsers: []
    });
    setErrors({});
    setTouched({});
    // Cleanup image previews
    images.forEach(image => URL.revokeObjectURL(image.preview));
    setImages([]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tạo kỳ nghỉ mới</h2>
            <p className="text-sm text-gray-600 mt-1">Chia sẻ những khoảnh khắc đáng nhớ với bạn bè</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
            disabled={isSubmitting}
            aria-label="Đóng modal"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Multiple Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Ảnh kỳ nghỉ <span className="text-gray-400">(tùy chọn, tối đa 10 ảnh)</span>
            </label>
            
            {/* Image Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group aspect-square">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200"
                        aria-label="Xóa ảnh"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {images.length < 10 && (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-3">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-700">
                      {isDragOver ? 'Thả ảnh vào đây' : 'Click để chọn ảnh hoặc kéo thả'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG, GIF, WebP • Tối đa 5MB mỗi ảnh
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Đã chọn {images.length}/10 ảnh
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}

            {images.length >= 10 && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Đã đạt giới hạn 10 ảnh. Vui lòng xóa một số ảnh để thêm ảnh mới.
                </p>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên kỳ nghỉ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Ví dụ: Du lịch Đà Nẵng 2024"
                className={`input input-bordered w-full pr-10 transition-all duration-200 ${
                  touched.name && errors.name ? 'input-error' : 'focus:input-primary'
                }`}
                required
                maxLength={100}
              />
              {formData.name && touched.name && !errors.name && (
                <CheckCircle size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
              )}
              {touched.name && errors.name && (
                <AlertCircle size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
              )}
            </div>
            {touched.name && errors.name && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100 ký tự
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả <span className="text-gray-400">(tùy chọn)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết về kỳ nghỉ của bạn..."
              rows={3}
              className="textarea textarea-bordered w-full focus:textarea-primary transition-all duration-200"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {formData.description.length}/500 ký tự
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  min={new Date().toISOString().split('T')[0]}
                  className={`input input-bordered w-full pl-10 transition-all duration-200 ${
                    touched.startDate && errors.startDate ? 'input-error' : 'focus:input-primary'
                  }`}
                  required
                />
              </div>
              {touched.startDate && errors.startDate && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.startDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={`input input-bordered w-full pl-10 transition-all duration-200 ${
                    touched.endDate && errors.endDate ? 'input-error' : 'focus:input-primary'
                  }`}
                  required
                />
              </div>
              {touched.endDate && errors.endDate && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Ví dụ: Đà Nẵng, Việt Nam"
                className={`input input-bordered w-full pl-10 transition-all duration-200 ${
                  touched.location && errors.location ? 'input-error' : 'focus:input-primary'
                }`}
                required
              />
            </div>
            {touched.location && errors.location && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.location}
              </p>
            )}
          </div>

          {/* Privacy */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleInputChange}
                className="checkbox checkbox-primary transition-all duration-200"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  Kỳ nghỉ riêng tư
                </span>
                {formData.isPrivate ? (
                  <Lock size={18} className="text-gray-600" />
                ) : (
                  <Unlock size={18} className="text-gray-600" />
                )}
              </div>
            </label>
            <p className="text-sm text-gray-600 mt-2 ml-6">
              {formData.isPrivate 
                ? 'Kỳ nghỉ này sẽ chỉ hiển thị với những người được mời tham gia.'
                : 'Kỳ nghỉ này sẽ hiển thị công khai và mọi người có thể xem.'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline btn-lg flex-1 sm:flex-none"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg flex-1 sm:flex-none"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Tạo kỳ nghỉ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVacationModal;
