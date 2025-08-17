import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const vacationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String], // Array of image URLs thay vì coverImage
      default: [],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    invitedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

// Index để tối ưu truy vấn
vacationSchema.index({ creator: 1, startDate: 1 });
vacationSchema.index({ participants: 1 });
vacationSchema.index({ invitedUsers: 1 });
vacationSchema.index({ status: 1 });

// Virtual field để backward compatibility
vacationSchema.virtual('coverImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : '';
});

// Ensure virtual fields are serialized
vacationSchema.set('toJSON', { virtuals: true });
vacationSchema.set('toObject', { virtuals: true });

// Thêm plugin pagination
vacationSchema.plugin(mongoosePaginate);

const Vacation = mongoose.model('Vacation', vacationSchema);

export default Vacation; 