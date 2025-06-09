const Subscription = require('../models/Subscription');

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

// Mapping source => required feature
const sourceFeatureMap = {
  'applied': 'manage_candidates',
  'resume-db': 'view_candidate_profiles',
  'follow' : 'none'
};

const checkFeatureBySource = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { source } = req.query;
    console.log ("thong tin cua sorce trong file check",source);
    if (!userId) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện hành động này.' });
    }

    const requiredFeature = sourceFeatureMap[source];
    console.log("requiredFeature",requiredFeature);

    const activeSub = await Subscription.findOne({
      userId,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate('currentPackage.packageId');

    console.log("thong tin goi dang dung la",activeSub)

    if (!activeSub || !activeSub.currentPackage.packageId) {
      return res.status(403).json({ message: 'Bạn chưa có gói đăng ký hợp lệ. Vui lòng cập nhật để tiếp tục.' });
    }

    const userFeatures = activeSub.currentPackage.packageId.features.map(f => f.key);
    if (source === 'follow') {
      next();

    if (!userFeatures.includes(requiredFeature)) {
      const featureLabel = defaultPackageFeatures.find(f => f.key === requiredFeature)?.label || requiredFeature;
      return res.status(403).json({ message: `Gói hiện tại không hỗ trợ chức năng này!` });
    }
    
    if (source === 'resume-db') {
      const currentUsageStats = activeSub.currentPackage.usageStats || {};
      currentUsageStats.viewedProfiles = (currentUsageStats.viewedProfiles || 0) + 1;
      activeSub.currentPackage.usageStats = currentUsageStats;
      
      await activeSub.save();
      console.log("thuc hien cong xong");
    }
     
    }

    next();
  } catch (error) {
    console.error('checkFeatureBySource error:', error);
    res.status(500).json({ message: 'Lỗi kiểm tra quyền truy cập chức năng.' });
  }
};

module.exports = checkFeatureBySource;
