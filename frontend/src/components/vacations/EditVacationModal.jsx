import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, MapPin, Lock, Unlock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { vacationService } from '../../services/vacationService';

const EditVacationModal = ({ isOpen, onClose, onSuccess, vacation }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isPrivate: false
  });
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vacation) {
      setFormData({
        name: vacation.name || '',
        description: vacation.description || '',
        startDate: vacation.startDate ? new Date(vacation.startDate).toISOString().split('T')[0] : '',
        endDate: vacation.endDate ? new Date(vacation.endDate).toISOString().split('T')[0] : '',
        location: vacation.location || '',
        isPrivate: vacation.isPrivate || false
      });
      
      // Convert existing images to the new format
      if (vacation.images && vacation.images.length > 0) {
        setImages(vacation.images.map((url, index) => ({
          id: index,
          url: url,
          preview: url,
          isExisting: true
        })));
      } else {
        setImages([]);
      }
    }
  }, [vacation]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return false;
    }
    return true;
  };

  const addImages = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(validateImage);
    
    if (images.length + validFiles.length > 10) {
      toast.error('Tối đa chỉ được chọn 10 ảnh');
      return;
    }

    const newImageObjects = validFiles.map((file, index) => ({
      id: Date.now() + index,
      file: file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));

    setImages(prev => [...prev, ...newImageObjects]);
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove && !imageToRemove.isExisting) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    addImages(files);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    addImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.location) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      console.log('Submitting form data:', formData);
      console.log('Images to upload:', images);
      
      // Append form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Append new images (only files, not existing URLs)
      const newImages = images.filter(img => !img.isExisting);
      newImages.forEach((image, index) => {
        formDataToSend.append('images', image.file);
      });

      // Gửi danh sách ảnh cuối cùng (bao gồm cả ảnh đã xóa)
      const finalImageUrls = images.filter(img => img.isExisting).map(img => img.url);
      formDataToSend.append('finalImages', JSON.stringify(finalImageUrls));

      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      await vacationService.updateVacation(vacation._id, formDataToSend);
      toast.success('Cập nhật kỳ nghỉ thành công!');
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error updating vacation:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật kỳ nghỉ');
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
      isPrivate: false
    });
    // Cleanup image previews
    images.forEach(image => {
      if (!image.isExisting) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setImages([]);
  };

  if (!isOpen || !vacation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa kỳ nghỉ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Multiple Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh kỳ nghỉ <span className="text-gray-400">(tối đa 10 ảnh)</span>
            </label>
            
            {/* Image Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Image Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('imageInput').click()}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click để chọn ảnh hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF, WebP tối đa 5MB mỗi ảnh
              </p>
              <input
                id="imageInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên kỳ nghỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên kỳ nghỉ"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả về kỳ nghỉ của bạn..."
              rows={3}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="input input-bordered w-full pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="input input-bordered w-full pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Nhập địa điểm"
                className="input input-bordered w-full pl-10"
                required
              />
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleInputChange}
                className="checkbox checkbox-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Kỳ nghỉ riêng tư
              </span>
              {formData.isPrivate ? (
                <Lock size={16} className="text-gray-500" />
              ) : (
                <Unlock size={16} className="text-gray-500" />
              )}
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Kỳ nghỉ riêng tư chỉ hiển thị với người tham gia
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVacationModal;

