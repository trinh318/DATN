const User = require('../models/User');
const Subscription = require('../models/Subscription');

const validateUserPurchase = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    
    if (user.role === 'admin') {
        throw new Error('Admin không thể mua gói subscription');
    }

    // Kiểm tra subscription hiện tại
    if (user.activeSubscriptionId) {
        const activeSubscription = await Subscription.findById(user.activeSubscriptionId);
        if (activeSubscription && activeSubscription.status === 'active') {
            const now = new Date();
            if (activeSubscription.endDate > now) {
                throw new Error('Bạn đang có gói subscription đang hoạt động. Vui lòng đợi đến khi gói hiện tại hết hạn.');
            }
        }
    }
    
    return true;
};

module.exports = {
    validateUserPurchase
}; 