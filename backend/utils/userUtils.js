const User = require('../models/User');

const getUserType = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    return user.role === 'recruiter' ? 'recruiter' : 'regular';
};

module.exports = {
    getUserType
}; 