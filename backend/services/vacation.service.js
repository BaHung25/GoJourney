import Vacation from '../models/vacation.model.js';
import PostVacation from '../models/postVacation.model.js';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';

class VacationService {
  // Tạo kỳ nghỉ mới
  static async createVacation(vacationData, userId) {
    const vacation = new Vacation({
      ...vacationData,
      creator: userId,
      participants: [userId], // Người tạo tự động là participant
    });

    await vacation.save();
    await vacation.populate('creator', 'username fullName profileImg');

    return vacation;
  }

  // Lấy danh sách kỳ nghỉ của người dùng
  static async getUserVacations(userId, options = {}) {
    const { status, page = 1, limit = 10 } = options;

    const query = {
      $or: [
        { creator: userId },
        { participants: userId },
      ],
    };

    if (status) {
      query.status = status;
    }

    const result = await Vacation.paginate(query, {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'creator', select: 'username fullName profileImg' },
        { path: 'participants', select: 'username fullName profileImg' },
      ],
      sort: { startDate: 1 },
    });

    return result;
  }

  // Lấy chi tiết kỳ nghỉ
  static async getVacationById(vacationId, userId) {
    const vacation = await Vacation.findById(vacationId)
      .populate('creator', 'username fullName profileImg')
      .populate('participants', 'username fullName profileImg')
      .populate('invitedUsers', 'username fullName profileImg');

    if (!vacation) {
      throw new Error('Không tìm thấy kỳ nghỉ');
    }

    // Kiểm tra quyền truy cập
    const canAccess = vacation.creator.toString() === userId || 
                     vacation.participants.includes(userId) ||
                     !vacation.isPrivate;

    if (!canAccess) {
      throw new Error('Không có quyền truy cập kỳ nghỉ này');
    }

    return vacation;
  }

  // Cập nhật kỳ nghỉ
  static async updateVacation(vacationId, updateData, userId) {
    const vacation = await Vacation.findById(vacationId);

    if (!vacation) {
      throw new Error('Không tìm thấy kỳ nghỉ');
    }

    if (vacation.creator.toString() !== userId) {
      throw new Error('Chỉ người tạo mới có quyền chỉnh sửa');
    }

    // Cập nhật thông tin
    Object.assign(vacation, updateData);
    await vacation.save();

    await vacation.populate('creator', 'username fullName profileImg');
    await vacation.populate('participants', 'username fullName profileImg');
    await vacation.populate('invitedUsers', 'username fullName profileImg');

    return vacation;
  }

  // Xóa kỳ nghỉ
  static async deleteVacation(vacationId, userId) {
    const vacation = await Vacation.findById(vacationId);

    if (!vacation) {
      throw new Error('Không tìm thấy kỳ nghỉ');
    }

    if (vacation.creator.toString() !== userId) {
      throw new Error('Chỉ người tạo mới có quyền xóa');
    }

    // Xóa tất cả liên kết PostVacation
    await PostVacation.deleteMany({ vacation: vacationId });

    // Xóa kỳ nghỉ
    await Vacation.findByIdAndDelete(vacationId);

    return { message: 'Xóa kỳ nghỉ thành công' };
  }

  // Thêm bài viết vào kỳ nghỉ
  static async addPostToVacation(vacationId, postId, userId) {
    // Kiểm tra kỳ nghỉ tồn tại và quyền truy cập
    const vacation = await Vacation.findById(vacationId);
    if (!vacation) {
      throw new Error('Không tìm thấy kỳ nghỉ');
    }

    const canAccess = vacation.creator.toString() === userId || 
                     vacation.participants.includes(userId);

    if (!canAccess) {
      throw new Error('Không có quyền thêm bài viết vào kỳ nghỉ này');
    }

    // Kiểm tra bài viết tồn tại
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Không tìm thấy bài viết');
    }

    // Kiểm tra bài viết đã được thêm vào kỳ nghỉ chưa
    const existingLink = await PostVacation.findOne({ post: postId, vacation: vacationId });
    if (existingLink) {
      throw new Error('Bài viết đã được thêm vào kỳ nghỉ này');
    }

    // Tạo liên kết
    const postVacation = new PostVacation({
      post: postId,
      vacation: vacationId,
      addedBy: userId,
    });

    await postVacation.save();

    return postVacation;
  }

  // Gỡ bài viết khỏi kỳ nghỉ
  static async removePostFromVacation(vacationId, postId, userId) {
    // Kiểm tra quyền truy cập
    const vacation = await Vacation.findById(vacationId);
    if (!vacation) {
      throw new Error('Không tìm thấy kỳ nghỉ');
    }

    const canAccess = vacation.creator.toString() === userId || 
                     vacation.participants.includes(userId);

    if (!canAccess) {
      throw new Error('Không có quyền gỡ bài viết khỏi kỳ nghỉ này');
    }

    // Xóa liên kết
    const result = await PostVacation.findOneAndDelete({
      post: postId,
      vacation: vacationId,
    });

    if (!result) {
      throw new Error('Không tìm thấy liên kết bài viết với kỳ nghỉ');
    }

    return { message: 'Gỡ bài viết khỏi kỳ nghỉ thành công' };
  }

  // Lấy bài viết theo kỳ nghỉ
  static async getPostsByVacation(vacationId, userId, options = {}) {
    const { page = 1, limit = 10 } = options;

    // Kiểm tra quyền truy cập
    const vacation = await Vacation.findById(vacationId);
    if (!vacation) {
      throw new Error('Không tìm thấy kỳ nghỉ');
    }

    const canAccess = vacation.creator.toString() === userId || 
                     vacation.participants.includes(userId) ||
                     !vacation.isPrivate;

    if (!canAccess) {
      throw new Error('Không có quyền truy cập kỳ nghỉ này');
    }

    // Lấy danh sách post IDs từ PostVacation
    const postVacations = await PostVacation.find({ vacation: vacationId })
      .populate({
        path: 'post',
        populate: [
          { path: 'user', select: 'username fullName profileImg' },
          { path: 'likes', select: 'username fullName profileImg' },
          { path: 'comments.user', select: 'username fullName profileImg' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const posts = postVacations.map(pv => pv.post);

    return {
      posts,
      hasMore: postVacations.length === parseInt(limit),
      currentPage: parseInt(page),
    };
  }

  // Mời người dùng tham gia kỳ nghỉ
  static async inviteUserToVacation(vacationId, userIds, currentUserId) {
    const vacation = await Vacation.findById(vacationId);

    if (!vacation) {
      throw new Error('Không tìm thấy kỳ nghỉ');
    }

    if (vacation.creator.toString() !== currentUserId) {
      throw new Error('Chỉ người tạo mới có quyền mời người khác');
    }

    // Kiểm tra người dùng tồn tại
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      throw new Error('Một số người dùng không tồn tại');
    }

    // Thêm vào danh sách mời
    vacation.invitedUsers = [...new Set([...vacation.invitedUsers, ...userIds])];
    await vacation.save();

    await vacation.populate('invitedUsers', 'username fullName profileImg');

    return vacation;
  }

  // Chấp nhận lời mời tham gia kỳ nghỉ
  static async acceptVacationInvitation(vacationId, userId) {
    const vacation = await Vacation.findById(vacationId);

    if (!vacation) {
      throw new Error('Không tìm thấy kỳ nghỉ');
    }

    if (!vacation.invitedUsers.includes(userId)) {
      throw new Error('Bạn không được mời tham gia kỳ nghỉ này');
    }

    // Thêm vào participants và xóa khỏi invitedUsers
    vacation.participants.push(userId);
    vacation.invitedUsers = vacation.invitedUsers.filter(id => id.toString() !== userId);
    
    await vacation.save();

    await vacation.populate('participants', 'username fullName profileImg');

    return vacation;
  }

  // Lấy danh sách kỳ nghỉ có thể thêm bài viết
  static async getAvailableVacationsForPost(userId) {
    const vacations = await Vacation.find({
      $or: [
        { creator: userId },
        { participants: userId },
      ],
      status: { $in: ['upcoming', 'ongoing'] },
    })
    .select('_id name startDate endDate location')
    .sort({ startDate: 1 });

    return vacations;
  }
}

export default VacationService; 