import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage cho multer - sử dụng memory storage để tránh lỗi file system
const storage = multer.memoryStorage();

// Filter file types
const fileFilter = (req, file, cb) => {
  // Chỉ cho phép upload ảnh
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh!'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  }
});

// Middleware cho single image (giữ nguyên cho backward compatibility)
export const uploadSingle = upload.single('coverImage');

// Middleware cho multiple images
export const uploadMultiple = upload.array('images', 10); // Tối đa 10 ảnh

export default upload; 