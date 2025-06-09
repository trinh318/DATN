const Subscription = require('../models/Subscription');
const Package = require('../models/Package');
const Job = require('../models/Job'); // Giả sử bạn có model Job

const defaultPackageFeatures = [
    { key: 'post_jobs', label: 'Đăng tin tuyển dụng' },
    { key: 'manage_candidates', label: 'Quản lý ứng viên' },
    { key: 'view_candidate_profiles', label: 'Xem hồ sơ ứng viên' },
    { key: 'highlight_jobs', label: 'Làm nổi bật tin tuyển dụng' },
    { key: 'access_resume_database', label: 'Truy cập kho CV' },
    { key: 'priority_support', label: 'Hỗ trợ ưu tiên' },
    { key: 'analytics_dashboard', label: 'Xem báo cáo, thống kê' },
    { key: 'highlight_companys', label: 'Tăng branding công ty' },
    { key: 'invite_candidates', label: 'Mời ứng viên tham gia ứng tuyển' },
    { key: 'job_boost', label: 'Đẩy tin tuyển dụng lên đầu' }
];

const checkFeatureAccess = (featureKey) => {
    return async (req, res, next) => {
        const source = req.query.source;
        console.log("thong tin lay source tuwf file check chuc nang",source)

        try {
            const userId = req.userId;
            console.log("thong tin nguoi dang nhap de kiem tra goi dang ky la",userId);

            if (!userId) {
                return res.status(401).json({ message: 'Bạn cần phải đăng nhập để thực hiện hành động này.' });
            }
              if (!userId) {
                return res.status(401).json({ message: 'Bạn cần phải đăng nhập để thực hiện hành động này.' });
            }

            const activeSub = await Subscription.findOne({
                userId,
                status: 'active',
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            }).populate('currentPackage.packageId');
            if (!activeSub || !activeSub.currentPackage.packageId) {
                return res.status(403).json({ message: 'Bạn chưa có gói đăng ký hợp lệ. Vui lòng cập nhật để tiếp tục.' });
            }


            const features = activeSub.currentPackage.packageId.features.map(f => f.key); // ['post_jobs', 'view_candidates', ...]
            const hasAccess = features.includes(featureKey);
            console.log("thong tin cac chuc nang co the su dung la",hasAccess);
            if (!hasAccess) {
                console.log("ban khong the su dung chuc nang nay");
                return res.status(403).json({ message: 'Gói của bạn không hỗ trợ chức năng này.' });
            }

            if (featureKey === 'post_jobs') {
                // Check if package has unlimited posts
                if (activeSub.currentPackage.packageId.postLimit !== -1) {
                    const firstDay = new Date(activeSub.currentPackage.activatedAt);
                    const lastDay = new Date(activeSub.currentPackage.expiredAt);
                    
                    // Count active job posts for current month
                    const activePostCount = await Job.countDocuments({
                        employer_id: userId,
                        created_at: { $gte: firstDay, $lte: lastDay },
                        status: { $ne: 'deleted' }  // Don't count deleted jobs
                    });
                    console.log("so luong bai dang cua ntd la", activePostCount);
                    if (activePostCount >= activeSub.currentPackage.packageId.postLimit) {
                        return res.status(403).json({
                            message: `Bạn đã đạt giới hạn ${activeSub.currentPackage.packageId.postLimit} tin đăng trong tháng này.`,
                            currentCount: activePostCount,
                            limit: activeSub.currentPackage.packageId.postLimit
                        });
                    }
                    activeSub.currentPackage.usageStats.activeJobPosts += 1;
                }
                await Subscription.updateOne(
                    { _id: activeSub._id },
                    { $inc: { 'currentPackage.usageStats.activeJobPosts': 1 } }
                );

            }
            

            if (!defaultPackageFeatures.some(feature => feature.key === featureKey)) {
                return res.status(403).json({ message: 'Gói của bạn không bao gồm chức năng này.' });
            }

            next();

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi kiểm tra quyền gói đăng ký.' });
        }
    };
};

module.exports = checkFeatureAccess;
