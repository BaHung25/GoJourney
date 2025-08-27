import User from '../models/user.model.js';
import Vacation from '../models/vacation.model.js';

const searchUsers = async (req, res) => {
  try {
    const search_query = req.query.search_query;

    if (!search_query) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: search_query, $options: 'i' } },
        { fullName: { $regex: search_query, $options: 'i' } },
      ],
    }).select('_id username fullName profileImg');

    res.status(200).json(users);
  } catch (error) {
    console.error('Error in searchUsers controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// export moved to bottom

// Tìm kiếm kỳ nghỉ công khai theo tên
const searchVacations = async (req, res) => {
  try {
    const search_query = req.query.search_query;

    if (!search_query) {
      return res.status(200).json([]);
    }

    const vacations = await Vacation.find({
      isPrivate: false,
      name: { $regex: search_query, $options: 'i' },
    })
      .select('_id name location images startDate endDate creator isPrivate')
      .populate('creator', 'username fullName profileImg')
      .limit(20);

    res.status(200).json(vacations);
  } catch (error) {
    console.error('Error in searchVacations controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { searchUsers, searchVacations };
