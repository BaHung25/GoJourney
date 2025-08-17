import mongoose from 'mongoose';

const postVacationSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    vacation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vacation',
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Đảm bảo mỗi post chỉ được thêm vào một vacation một lần
postVacationSchema.index({ post: 1, vacation: 1 }, { unique: true });

// Index để tối ưu truy vấn
postVacationSchema.index({ vacation: 1, createdAt: -1 });
postVacationSchema.index({ post: 1 });

const PostVacation = mongoose.model('PostVacation', postVacationSchema);

export default PostVacation; 