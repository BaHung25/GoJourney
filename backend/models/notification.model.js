import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ['follow', 'like', 'vacation_invitation'],
    },

    // Thêm trường để lưu thông tin liên quan đến vacation
    vacation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vacation',
      required: function() {
        return this.type === 'vacation_invitation';
      }
    },

    read: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
