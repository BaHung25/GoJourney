import Vacation from '../models/vacation.model.js';
import PostVacation from '../models/postVacation.model.js';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import cloudinary from 'cloudinary';

// Tạo kỳ nghỉ mới
const createVacation = async (req, res) => {
  try {
    const { name, description, startDate, endDate, location, isPrivate, invitedUsers } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !startDate || !endDate || !location) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'Thời gian kết thúc phải sau thời gian bắt đầu' });
    }

    // Xử lý invitedUsers - parse từ JSON string nếu cần
    let parsedInvitedUsers = [];
    if (invitedUsers) {
      try {
        if (typeof invitedUsers === 'string') {
          parsedInvitedUsers = JSON.parse(invitedUsers);
        } else if (Array.isArray(invitedUsers)) {
          parsedInvitedUsers = invitedUsers;
        }
      } catch (error) {
        console.log('Lỗi parse invitedUsers:', error);
        parsedInvitedUsers = [];
      }
    }

    // Xử lý multiple images nếu có
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        // Convert buffer to base64 string for Cloudinary
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.v2.uploader.upload(dataURI, {
          folder: 'vacation-images',
          width: 1200,
          height: 800,
          crop: 'fill',
        });
        return result.secure_url;
      });
      
      images = await Promise.all(uploadPromises);
    }

    // Tạo kỳ nghỉ mới
    const vacation = new Vacation({
      name,
      description,
      startDate,
      endDate,
      location,
      images, // Lưu array images thay vì coverImage
      creator: userId,
      participants: [userId], // Người tạo tự động là participant
      invitedUsers: parsedInvitedUsers,
      isPrivate: isPrivate === 'true' || isPrivate === true,
    });

    await vacation.save();

    // Populate thông tin creator
    await vacation.populate('creator', 'username fullName profileImg');

    res.status(201).json({
      message: 'Tạo kỳ nghỉ thành công',
      vacation,
    });
  } catch (error) {
    console.error('Lỗi tạo kỳ nghỉ:', error);
    res.status(500).json({ error: 'Lỗi server khi tạo kỳ nghỉ' });
  }
};

// Lấy danh sách kỳ nghỉ của người dùng
const getUserVacations = async (req, res) => {
  try {
    const userId = req.user.id;

    const vacations = await Vacation.find({
      $or: [
        { creator: userId },
        { participants: userId },
        { invitedUsers: userId }
      ]
    })
    .populate('creator', 'username fullName profileImg')
    .populate('participants', 'username fullName profileImg')
    .populate('invitedUsers', 'username fullName profileImg')
    .sort({ createdAt: -1 });

    res.json(vacations);
  } catch (error) {
    console.error('Lỗi lấy danh sách kỳ nghỉ:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách kỳ nghỉ' });
  }
};

// Lấy chi tiết kỳ nghỉ
const getVacationById = async (req, res) => {
  try {
    const { vacationId } = req.params;
    const userId = req.user.id;

    const vacation = await Vacation.findById(vacationId)
      .populate('creator', 'username fullName profileImg')
      .populate('participants', 'username fullName profileImg')
      .populate('invitedUsers', 'username fullName profileImg');

    if (!vacation) {
      return res.status(404).json({ error: 'Không tìm thấy kỳ nghỉ' });
    }

    // Kiểm tra quyền xem
    const canView = vacation.creator.toString() === userId ||
                   vacation.participants.some(p => p._id.toString() === userId) ||
                   vacation.invitedUsers.some(i => i._id.toString() === userId) ||
                   !vacation.isPrivate;

    if (!canView) {
      return res.status(403).json({ error: 'Bạn không có quyền xem kỳ nghỉ này' });
    }

    res.json(vacation);
  } catch (error) {
    console.error('Lỗi lấy chi tiết kỳ nghỉ:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy chi tiết kỳ nghỉ' });
  }
};

// Cập nhật kỳ nghỉ
const updateVacation = async (req, res) => {
  try {
    const { vacationId } = req.params;
    const userId = req.user.id;
    const { name, description, startDate, endDate, location, isPrivate, finalImages } = req.body;

    const vacation = await Vacation.findById(vacationId);

    if (!vacation) {
      return res.status(404).json({ error: 'Không tìm thấy kỳ nghỉ' });
    }

    if (vacation.creator.toString() !== userId) {
      return res.status(403).json({ error: 'Chỉ người tạo mới có quyền chỉnh sửa' });
    }

    // Validation
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'Thời gian kết thúc phải sau ngày bắt đầu' });
    }

    // Xử lý finalImages - danh sách ảnh cuối cùng sau khi xóa
    let finalImageUrls = vacation.images; // Giữ nguyên nếu không có update
    if (finalImages !== undefined) {
      try {
        if (typeof finalImages === 'string') {
          finalImageUrls = JSON.parse(finalImages);
        } else if (Array.isArray(finalImages)) {
          finalImageUrls = finalImages;
        }
      } catch (error) {
        console.log('Lỗi parse finalImages:', error);
        finalImageUrls = vacation.images;
      }
    }

    // Xử lý multiple images mới nếu có
    let newImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        // Convert buffer to base64 string for Cloudinary
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.v2.uploader.upload(dataURI, {
          folder: 'vacation-images',
          width: 1200,
          height: 800,
          crop: 'fill',
        });
        return result.secure_url;
      });
      
      newImages = await Promise.all(uploadPromises);
    }

    // Cập nhật thông tin
    if (name) vacation.name = name;
    if (description !== undefined) vacation.description = description;
    if (startDate) vacation.startDate = startDate;
    if (endDate) vacation.endDate = endDate;
    if (location) vacation.location = location;
    if (isPrivate !== undefined) vacation.isPrivate = isPrivate === 'true' || isPrivate === true;
    
    // Cập nhật images: giữ lại ảnh cũ (finalImageUrls) + thêm ảnh mới
    vacation.images = [...finalImageUrls, ...newImages];

    await vacation.save();

    await vacation.populate('creator', 'username fullName profileImg');
    await vacation.populate('participants', 'username fullName profileImg');
    await vacation.populate('invitedUsers', 'username fullName profileImg');

    res.json({
      message: 'Cập nhật kỳ nghỉ thành công',
      vacation,
    });
  } catch (error) {
    console.error('Lỗi cập nhật kỳ nghỉ:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật kỳ nghỉ' });
  }
};

// Xóa kỳ nghỉ
const deleteVacation = async (req, res) => {
  try {
    const { vacationId } = req.params;
    const userId = req.user.id;

    const vacation = await Vacation.findById(vacationId);

    if (!vacation) {
      return res.status(404).json({ error: 'Không tìm thấy kỳ nghỉ' });
    }

    if (vacation.creator.toString() !== userId) {
      return res.status(403).json({ error: 'Chỉ người tạo mới có quyền xóa' });
    }

    await Vacation.findByIdAndDelete(vacationId);

    res.json({ message: 'Xóa kỳ nghỉ thành công' });
  } catch (error) {
    console.error('Lỗi xóa kỳ nghỉ:', error);
    res.status(500).json({ error: 'Lỗi server khi xóa kỳ nghỉ' });
  }
};

// Thêm bài viết vào kỳ nghỉ
const addPostToVacation = async (req, res) => {
  try {
    const { vacationId } = req.params;
    const { postId } = req.body;
    const userId = req.user.id;

    const vacation = await Vacation.findById(vacationId);
    if (!vacation) {
      return res.status(404).json({ error: 'Không tìm thấy kỳ nghỉ' });
    }

    // Kiểm tra quyền
    const canAdd = vacation.creator.toString() === userId ||
                   vacation.participants.some(p => p.toString() === userId);

    if (!canAdd) {
      return res.status(403).json({ error: 'Bạn không có quyền thêm bài viết vào kỳ nghỉ này' });
    }

    // Kiểm tra bài viết đã tồn tại
    const existingPost = await PostVacation.findOne({
      post: postId,
      vacation: vacationId
    });

    if (existingPost) {
      return res.status(400).json({ error: 'Bài viết đã có trong kỳ nghỉ này' });
    }

    const postVacation = new PostVacation({
      post: postId,
      vacation: vacationId,
      addedBy: userId,
    });

    await postVacation.save();

    res.json({ message: 'Thêm bài viết vào kỳ nghỉ thành công' });
  } catch (error) {
    console.error('Lỗi thêm bài viết vào kỳ nghỉ:', error);
    res.status(500).json({ error: 'Lỗi server khi thêm bài viết vào kỳ nghỉ' });
  }
};

// Xóa bài viết khỏi kỳ nghỉ
const removePostFromVacation = async (req, res) => {
  try {
    const { vacationId, postId } = req.params;
    const userId = req.user.id;

    const vacation = await Vacation.findById(vacationId);
    if (!vacation) {
      return res.status(404).json({ error: 'Không tìm thấy kỳ nghỉ' });
    }

    // Kiểm tra quyền
    const canRemove = vacation.creator.toString() === userId ||
                     vacation.participants.some(p => p.toString() === userId);

    if (!canRemove) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa bài viết khỏi kỳ nghỉ này' });
    }

    await PostVacation.findOneAndDelete({
      post: postId,
      vacation: vacationId
    });

    res.json({ message: 'Xóa bài viết khỏi kỳ nghỉ thành công' });
  } catch (error) {
    console.error('Lỗi xóa bài viết khỏi kỳ nghỉ:', error);
    res.status(500).json({ error: 'Lỗi server khi xóa bài viết khỏi kỳ nghỉ' });
  }
};

// Lấy bài viết của kỳ nghỉ
const getPostsByVacation = async (req, res) => {
  try {
    const { vacationId } = req.params;
    const userId = req.user.id;

    const vacation = await Vacation.findById(vacationId);
    if (!vacation) {
      return res.status(404).json({ error: 'Không tìm thấy kỳ nghỉ' });
    }

    // Kiểm tra quyền xem
    const canView = vacation.creator.toString() === userId ||
                   vacation.participants.some(p => p.toString() === userId) ||
                   vacation.invitedUsers.some(i => i.toString() === userId) ||
                   !vacation.isPrivate;

    if (!canView) {
      return res.status(403).json({ error: 'Bạn không có quyền xem bài viết của kỳ nghỉ này' });
    }

    const postVacations = await PostVacation.find({ vacation: vacationId })
      .populate({
        path: 'post',
        populate: {
          path: 'user',
          select: 'username fullName profileImg'
        }
      })
      .sort({ createdAt: -1 });

    console.log('PostVacations found:', postVacations.length);
    console.log('Sample postVacation:', postVacations[0]);

    // Filter out null posts and ensure they exist
    const posts = postVacations
      .map(pv => pv.post)
      .filter(post => post && post._id); // Only return valid posts

    console.log('Valid posts after filtering:', posts.length);
    console.log('Sample post:', posts[0]);

    res.json({ posts }); // Wrap in object with posts key
  } catch (error) {
    console.error('Lỗi lấy bài viết của kỳ nghỉ:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy bài viết của kỳ nghỉ' });
  }
};

// Mời người dùng tham gia kỳ nghỉ
const inviteUserToVacation = async (req, res) => {
  try {
    const { vacationId } = req.params;
    const { username } = req.body;
    const userId = req.user.id;

    const vacation = await Vacation.findById(vacationId);
    if (!vacation) {
      return res.status(404).json({ error: 'Không tìm thấy kỳ nghỉ' });
    }

    if (vacation.creator.toString() !== userId) {
      return res.status(403).json({ error: 'Chỉ người tạo mới có quyền mời' });
    }

    const userToInvite = await User.findOne({ username });
    if (!userToInvite) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    if (vacation.invitedUsers.includes(userToInvite._id)) {
      return res.status(400).json({ error: 'Người dùng đã được mời' });
    }

    if (vacation.participants.includes(userToInvite._id)) {
      return res.status(400).json({ error: 'Người dùng đã tham gia kỳ nghỉ' });
    }

    vacation.invitedUsers.push(userToInvite._id);
    await vacation.save();

    // Tạo notification cho người được mời
    const notification = new Notification({
      from: userId,
      to: userToInvite._id,
      type: 'vacation_invitation',
      vacation: vacationId,
    });

    await notification.save();

    res.json({ message: 'Mời người dùng thành công' });
  } catch (error) {
    console.error('Lỗi mời người dùng:', error);
    res.status(500).json({ error: 'Lỗi server khi mời người dùng' });
  }
};

// Chấp nhận lời mời tham gia kỳ nghỉ
const acceptVacationInvitation = async (req, res) => {
  try {
    const { vacationId } = req.params;
    const userId = req.user.id;

    const vacation = await Vacation.findById(vacationId);
    if (!vacation) {
      return res.status(404).json({ error: 'Không tìm thấy kỳ nghỉ' });
    }

    if (!vacation.invitedUsers.includes(userId)) {
      return res.status(400).json({ error: 'Bạn không được mời tham gia kỳ nghỉ này' });
    }

    // Chuyển từ invitedUsers sang participants
    vacation.invitedUsers = vacation.invitedUsers.filter(id => id.toString() !== userId);
    vacation.participants.push(userId);

    await vacation.save();

    // Xóa notification liên quan
    await Notification.findOneAndDelete({
      to: userId,
      vacation: vacationId,
      type: 'vacation_invitation'
    });

    res.json({ message: 'Chấp nhận lời mời thành công' });
  } catch (error) {
    console.error('Lỗi chấp nhận lời mời:', error);
    res.status(500).json({ error: 'Lỗi server khi chấp nhận lời mời' });
  }
};

// Loại thành viên khỏi kỳ nghỉ
const kickUserFromVacation = async (req, res) => {
  try {
    const { vacationId, userId } = req.params;
    const currentUserId = req.user.id;

    const vacation = await Vacation.findById(vacationId);
    if (!vacation) {
      return res.status(404).json({ error: 'Không tìm thấy kỳ nghỉ' });
    }

    // Chỉ creator mới có thể kick thành viên
    if (vacation.creator.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Chỉ người tạo mới có quyền loại thành viên' });
    }

    // Không thể kick chính mình (creator)
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Không thể loại chính mình khỏi kỳ nghỉ' });
    }

    // Kiểm tra xem user có phải là participant không
    if (!vacation.participants.includes(userId)) {
      return res.status(400).json({ error: 'Người dùng này không phải là thành viên của kỳ nghỉ' });
    }

    // Loại user khỏi participants
    vacation.participants = vacation.participants.filter(id => id.toString() !== userId);

    await vacation.save();

    res.json({ message: 'Loại thành viên thành công' });
  } catch (error) {
    console.error('Lỗi loại thành viên:', error);
    res.status(500).json({ error: 'Lỗi server khi loại thành viên' });
  }
};

export {
  createVacation,
  getUserVacations,
  getVacationById,
  updateVacation,
  deleteVacation,
  addPostToVacation,
  removePostFromVacation,
  getPostsByVacation,
  inviteUserToVacation,
  acceptVacationInvitation,
  kickUserFromVacation,
}; 