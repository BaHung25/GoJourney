import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Image, Smile, X, Upload } from 'lucide-react';

const CreatePost = ({ isOpen, onClose, vacationId, onPostCreated }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const imgRef = useRef(null);

  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ['authUser'] });

  const {
    mutate: createPost,
    isPending: isCreatingPost,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, images, vacationId }) => {
      try {
        const formData = new FormData();
        formData.append('text', text);
        
        // Append multiple images
        images.forEach((image, index) => {
          formData.append('images', image.file);
        });

        // If creating post for vacation, add vacationId
        if (vacationId) {
          formData.append('vacationId', vacationId);
        }

        const res = await fetch('/api/posts/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong!');
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      setText('');
      setImages([]);
      toast.success(vacationId ? 'Bài viết đã được thêm vào kỳ nghỉ!' : 'Tạo bài viết thành công!');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (vacationId) {
        queryClient.invalidateQueries({ queryKey: ['vacation', vacationId] });
        queryClient.invalidateQueries({ queryKey: ['vacationPosts', vacationId] });
        queryClient.invalidateQueries({ queryKey: ['vacation-posts', vacationId] });
      }
      
      // Call onPostCreated callback if provided
      if (onPostCreated) {
        onPostCreated();
      } else if (onClose) {
        // Fallback to onClose if no onPostCreated callback
        onClose();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo bài viết');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) {
      toast.error('Vui lòng thêm nội dung hoặc ảnh cho bài viết');
      return;
    }
    createPost({ text, images, vacationId });
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
      toast.error('Tối đa 10 ảnh cho mỗi bài viết');
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleImgChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const handleClose = () => {
    if (isCreatingPost) return;
    
    // Cleanup image previews
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
    });
    
    setText('');
    setImages([]);
    setIsDragOver(false);
    
    if (onClose) {
      onClose();
    }
  };

  const showUploadArea = false;

  // If not open and no vacationId, render standalone version
  if (!isOpen && !vacationId) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Input */}
          <div className="flex items-start gap-3">
            <img
              src={authUser?.profileImg || '/avatar-placeholder.png'}
              alt={authUser?.fullName || authUser?.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-md"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Bạn đang nghĩ gì?"
              className="flex-1 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-500 text-lg"
              rows={3}
              maxLength={1000}
            />
          </div>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt="Selected"
                      className="h-full w-full object-cover rounded-xl border border-white/40 shadow-md transition group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                      <button
                        type="button"
                        className="rounded-full bg-white/80 p-2 text-gray-700 shadow hover:bg-red-50 transition"
                        onClick={() => removeImage(image.id)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">
                {images.length} ảnh đã chọn
              </p>
            </div>
          )}

          {/* Image Upload Area (hidden as requested) */}
          {showUploadArea && images.length < 10 && (
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 cursor-pointer ${
                isDragOver 
                  ? 'border-emerald-400 bg-emerald-50' 
                  : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => imgRef.current?.click()}
            >
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <Upload size={20} />
                <span className="text-sm font-medium">
                  {isDragOver ? 'Thả ảnh vào đây' : 'Click để thêm ảnh hoặc kéo thả'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF, WebP • Tối đa 5MB mỗi ảnh • Tối đa 10 ảnh
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-white/30 pt-3">
            <div className="flex items-center gap-3 text-emerald-600">
              {/* Image Upload */}
              <button
                type="button"
                onClick={() => imgRef.current?.click()}
                className="rounded-full p-1.5 transition hover:bg-emerald-50"
                disabled={images.length >= 10}
                title={images.length >= 10 ? 'Đã đạt tối đa 10 ảnh' : 'Thêm ảnh'}
              >
                <Image className="h-5 w-5" />
              </button>
              {/* Emoji Button */}
              <button
                type="button"
                className="rounded-full p-1.5 transition hover:bg-emerald-50"
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>
            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              ref={imgRef}
              onChange={handleImgChange}
            />
      
            {/* Post Button */}
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-1.5 text-sm font-semibold text-white shadow-md transition hover:scale-105 disabled:opacity-50"
              disabled={isCreatingPost || (!text.trim() && images.length === 0)}
            >
              {isCreatingPost ? "Đang đăng..." : "Đăng bài"}
            </button>
          </div>
      
          {/* Error Message */}
          {isError && (
            <p className="mt-2 text-center text-sm text-red-500">{error.message}</p>
          )}
        </form>
      </div>
    );
  }

  // Modal version
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {vacationId ? 'Thêm bài viết vào kỳ nghỉ' : 'Tạo bài viết mới'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {vacationId ? 'Chia sẻ khoảnh khắc của bạn trong kỳ nghỉ này' : 'Chia sẻ những gì bạn đang nghĩ'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
            disabled={isCreatingPost}
            aria-label="Đóng modal"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Input */}
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={vacationId ? "Chia sẻ về kỳ nghỉ của bạn..." : "Bạn đang nghĩ gì?"}
                className="textarea textarea-bordered w-full h-32 resize-none focus:textarea-primary transition-all duration-200"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {text.length}/1000 ký tự
              </p>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt="Selected"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {images.length} ảnh đã chọn
                </p>
              </div>
            )}

            {/* Image Upload Area (hidden as requested) */}
            {showUploadArea && images.length < 10 && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => imgRef.current?.click()}
              >
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click để chọn ảnh hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, WebP • Tối đa 5MB mỗi ảnh • Tối đa 10 ảnh
                </p>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              ref={imgRef}
              onChange={handleImgChange}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline"
                disabled={isCreatingPost}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isCreatingPost || (!text.trim() && images.length === 0)}
              >
                {isCreatingPost ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Đang đăng...
                  </>
                ) : (
                  vacationId ? 'Thêm vào kỳ nghỉ' : 'Đăng bài'
                )}
              </button>
            </div>

            {/* Error Message */}
            {isError && (
              <p className="text-center text-sm text-red-500">{error.message}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
