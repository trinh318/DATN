const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Package = require('../models/Package');


// Thêm subscription mới
router.post('/add', async (req, res) => {
  try {
    const { userId, packageId, startDate, endDate, isTrial } = req.body;

    if (!userId || !packageId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin đăng ký.' });
    }

    const newSubscription = new Subscription({
      userId,
      packageId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isTrial: isTrial || false,
      status: 'active'
    });

    await newSubscription.save();

    res.status(201).json({
      message: 'Đăng ký gói thành công',
      subscription: newSubscription
    });
  } catch (error) {
    console.error('Lỗi khi thêm subscription:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm subscription.' });
  }
});

router.get('/report', async (req, res) => {
  try {
    // Tính tổng số subscriptions
    const totalSubscriptions = await Subscription.countDocuments();

    // Tính số lượng subscriptions theo trạng thái
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const expiredSubscriptions = await Subscription.countDocuments({ status: 'expired' });

    // Tính số lượng subscriptions theo gói (packageId)
    const subscriptionsByPackage = await Subscription.aggregate([
      { $group: { _id: "$packageId", total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Trả về báo cáo
    res.status(200).json({
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      subscriptionsByPackage
    });
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo subscription:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy báo cáo.' });
  }
});

// Báo cáo theo userId (ví dụ: các subscription của một user cụ thể)
router.get('/report/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm tất cả subscription của user
    const subscriptions = await Subscription.find({ userId });

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy subscription nào cho người dùng này.' });
    }

    // Tổng hợp các dữ liệu
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
    const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'expired').length;
    const subscriptionsByPackage = subscriptions.reduce((acc, sub) => {
      acc[sub.packageId] = (acc[sub.packageId] || 0) + 1;
      return acc;
    }, {});

    // Trả về báo cáo
    res.status(200).json({
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      subscriptionsByPackage
    });
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo cho user:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy báo cáo cho người dùng.' });
  }
});

// Báo cáo doanh thu theo tháng
router.get('/revenue/monthly', async (req, res) => {
  try {
    const monthlyRevenue = await Subscription.aggregate([
      { 
        $group: {
          _id: { $month: "$startDate" },
          totalRevenue: { $sum: "$totalAmount" },
          userCount: { $addToSet: "$userId" },
          activeUsers: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$status", "active"] },
                  { $gte: ["$endDate", new Date()] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          userCount: { $size: "$userCount" },
          activeUsers: 1
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json(monthlyRevenue);
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy báo cáo doanh thu.' });
  }
});

// So sánh doanh thu giữa các tháng
router.get('/revenue/compare', async (req, res) => {
  try {
    const monthlyComparison = await Subscription.aggregate([
      { 
        $group: {
          _id: { $month: "$startDate" },  // Group by month
          totalRevenue: { $sum: "$totalAmount" } // Tổng doanh thu theo tháng
        }
      },
      { $sort: { _id: 1 } } // Sort theo tháng
    ]);

    res.status(200).json(monthlyComparison);
  } catch (error) {
    console.error('Error fetching monthly comparison:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi so sánh doanh thu các tháng.' });
  }
});

router.get('/statistics/by-package-status', async (req, res) => {
  try {
    const data = await Subscription.aggregate([
      {
        $lookup: {
          from: 'packages',
          localField: 'currentPackage.packageId',
          foreignField: '_id',
          as: 'package'
        }
      },
      { $unwind: '$package' },
      {
        $group: {
          _id: {
            packageName: '$package.name',
            status: '$status'
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          uniqueUsers: { $addToSet: '$userId' },
          activeUsers: {
            $sum: { 
              $cond: [
                { $and: [
                  { $eq: ['$status', 'active'] },
                  { $gte: ['$endDate', new Date()] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.packageName',
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count',
              revenue: '$totalRevenue',
              activeUsers: '$activeUsers'
            }
          },
          totalCount: { $sum: '$count' },
          totalRevenue: { $sum: '$totalRevenue' },
          totalUniqueUsers: { $addToSet: '$uniqueUsers' }
        }
      },
      {
        $project: {
          _id: 1,
          statusCounts: 1,
          totalCount: 1,
          totalRevenue: 1,
          totalUniqueUsers: { $size: { $reduce: { input: '$totalUniqueUsers', initialValue: [], in: { $setUnion: ['$$value', '$$this'] } } } }
        }
      },
      { $sort: { totalCount: -1 } }
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching subscription status by package:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu trạng thái gói.' });
  }
});

// GET /subscriptions/statistics/user-count-by-package
router.get('/statistics/user-count-by-package', async (req, res) => {
  try {
    const data = await Subscription.aggregate([
      {
        $lookup: {
          from: 'packages',
          localField: 'currentPackage.packageId',
          foreignField: '_id',
          as: 'package'
        }
      },
      { $unwind: '$package' },
      {
        $group: {
          _id: '$package.name',
          userCount: { $addToSet: '$userId' },
          totalRevenue: { $sum: '$totalAmount' },
          usageStats: {
            $push: {
              activeJobPosts: '$currentPackage.usageStats.activeJobPosts',
              viewedProfiles: '$currentPackage.usageStats.viewedProfiles',
              successfulHires: '$currentPackage.usageStats.successfulHires'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          packageName: '$_id',
          userCount: { $size: '$userCount' },
          totalRevenue: 1,
          averageUsage: {
            activeJobPosts: { $avg: '$usageStats.activeJobPosts' },
            viewedProfiles: { $avg: '$usageStats.viewedProfiles' },
            successfulHires: { $avg: '$usageStats.successfulHires' }
          }
        }
      },
      { $sort: { userCount: -1 } }
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user count by package:', error);
    res.status(500).json({ message: 'Lỗi khi lấy số lượng người dùng theo gói.' });
  }
});

// Lấy danh sách khách hàng với phân trang
router.get('/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Xây dựng query
    const query = {};
    if (search) {
      query.$or = [
        { 'currentPackage.name': { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    // Tính tổng số records
    const total = await Subscription.countDocuments(query);

    // Lấy data với phân trang
    const subscriptions = await Subscription.find(query)
      .populate({
        path: 'userId',
        select: 'username email phone role state'
      })
      .populate({
        path: 'currentPackage.packageId',
        select: 'name price duration features'
      })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const overview = subscriptions.map(sub => ({
      id: sub._id,
      // Thông tin người dùng
      username: sub.userId?.username || 'N/A',
      email: sub.userId?.email || 'N/A',
      phone: sub.userId?.phone || 'N/A',
      role: sub.userId?.role || 'N/A',
      state: sub.userId?.state || 'N/A',
      
      // Thông tin gói hiện tại
      packageName: sub.currentPackage?.name || 'N/A',
      price: sub.currentPackage?.price || 0,
      duration: sub.currentPackage?.duration || 0,
      
      // Thông tin subscription cơ bản
      status: sub.status,
      subscriptionType: sub.subscriptionType,
      startDate: sub.startDate,
      endDate: sub.endDate,
      
      // Thông tin giao dịch gần nhất
      lastTransaction: sub.transactionHistory?.length > 0 
        ? {
            type: sub.transactionHistory[sub.transactionHistory.length - 1].type,
            status: sub.transactionHistory[sub.transactionHistory.length - 1].status,
            amount: sub.transactionHistory[sub.transactionHistory.length - 1].amount,
            completedAt: sub.transactionHistory[sub.transactionHistory.length - 1].completedAt
          }
        : null,
      
      createdAt: sub.createdAt
    }));

    res.json({
      data: overview,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách khách hàng:', err);
    res.status(500).json({ 
      message: 'Lỗi khi lấy danh sách khách hàng',
      error: err.message 
    });
  }
});

// Lấy thông tin chi tiết của một subscription
router.get('/customers/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate({
        path: 'userId',
        select: 'username email phone role state company'
      })
      .populate({
        path: 'currentPackage.packageId',
        select: 'name price duration features'
      })
      .populate({
        path: 'packageHistory.packageId',
        select: 'name price duration features'
      });

    if (!subscription) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin subscription' });
    }

    const detail = {
      id: subscription._id,
      
      // Thông tin người dùng
      user: {
        id: subscription.userId?._id,
        username: subscription.userId?.username || 'N/A',
        email: subscription.userId?.email || 'N/A',
        phone: subscription.userId?.phone || 'N/A',
        role: subscription.userId?.role || 'N/A',
        state: subscription.userId?.state || 'N/A',
        company: subscription.userId?.company || null
      },
      
      // Thông tin gói hiện tại
      currentPackage: {
        id: subscription.currentPackage?.packageId?._id,
        name: subscription.currentPackage?.name || 'N/A',
        price: subscription.currentPackage?.price || 0,
        duration: subscription.currentPackage?.duration || 0,
        features: subscription.currentPackage?.features || [],
        usageStats: subscription.currentPackage?.usageStats || {
          totalJobPosts: subscription.currentPackage?.postLimit,
          activeJobPosts: 0,
          viewedProfiles: 0,
          successfulHires: 0
        }
      },
      
      // Thông tin subscription
      status: subscription.status,
      subscriptionType: subscription.subscriptionType,
      autoRenew: subscription.autoRenew,
      totalAmount: subscription.totalAmount,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      
      // Lịch sử gói
      packageHistory: subscription.packageHistory.map(pkg => ({
        id: pkg.packageId?._id,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        features: pkg.features,
        activatedAt: pkg.activatedAt,
        expiredAt: pkg.expiredAt
      })),
      
      // Lịch sử giao dịch
      transactionHistory: subscription.transactionHistory.map(trans => ({
        transId: trans.transId,
        type: trans.type,
        status: trans.status,
        amount: trans.amount,
        paymentMethod: trans.paymentMethod,
        orderId: trans.orderId,
        completedAt: trans.completedAt,
        metadata: trans.metadata
      })),
      
      // Thông báo
      notifications: subscription.notifications.map(notif => ({
        type: notif.type,
        message: notif.message,
        createdAt: notif.createdAt,
        read: notif.read
      })),
      
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    };

    res.json(detail);
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết subscription:', err);
    res.status(500).json({ 
      message: 'Lỗi khi lấy chi tiết subscription',
      error: err.message 
    });
  }
});

// Tính tỷ lệ duy trì khách hàng
router.get('/retention-rate', async (req, res) => {
    try {
        // Lấy tất cả các subscription có lịch sử giao dịch
        const subscriptions = await Subscription.find({
            'transactionHistory.1': { $exists: true } // Có ít nhất 2 giao dịch
        }).populate('userId');

        // Tính tỷ lệ duy trì theo tháng
        const monthlyStats = {};
        let totalRenewals = 0;
        let totalExpired = 0;

        subscriptions.forEach(sub => {
            // Lọc các giao dịch renewal thành công
            const renewals = sub.transactionHistory.filter(trans => 
                trans.type === 'renewal' && trans.status === 'success'
            );

            renewals.forEach(renewal => {
                const month = new Date(renewal.completedAt).getMonth() + 1;
                if (!monthlyStats[month]) {
                    monthlyStats[month] = { renewals: 0, expired: 0 };
                }
                monthlyStats[month].renewals++;
                totalRenewals++;
            });

            // Đếm các gói hết hạn
            const expired = sub.transactionHistory.filter(trans =>
                trans.status === 'expired'
            );

            expired.forEach(exp => {
                const month = new Date(exp.completedAt).getMonth() + 1;
                if (!monthlyStats[month]) {
                    monthlyStats[month] = { renewals: 0, expired: 0 };
                }
                monthlyStats[month].expired++;
                totalExpired++;
            });
        });

        // Tính tỷ lệ duy trì theo tháng
        const monthlyRetention = Object.entries(monthlyStats).map(([month, stats]) => {
            const total = stats.renewals + stats.expired;
            const retentionRate = total > 0 ? (stats.renewals / total) * 100 : 0;
            return {
                month: parseInt(month),
                retentionRate
            };
        });

        // Tính tỷ lệ duy trì tổng thể
        const overallRetentionRate = totalRenewals + totalExpired > 0 
            ? (totalRenewals / (totalRenewals + totalExpired)) * 100 
            : 0;

        res.json({
            monthlyRetention: monthlyRetention.sort((a, b) => a.month - b.month),
            overallRetentionRate
        });

    } catch (error) {
        console.error('Error calculating retention rate:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tính tỷ lệ duy trì khách hàng.' });
    }
});

// Tính tỷ lệ chuyển đổi từ gói free lên gói trả phí
router.get('/conversion-rate', async (req, res) => {
    try {
        const subscriptions = await Subscription.aggregate([
            {
                $lookup: {
                    from: 'packages',
                    localField: 'currentPackage.packageId',
                    foreignField: '_id',
                    as: 'currentPackageInfo'
                }
            },
            {
                $match: {
                    'transactionHistory': { 
                        $elemMatch: { 
                            type: 'upgrade',
                            status: 'success'
                        }
                    }
                }
            }
        ]);

        console.log("Subscriptions for conversion rate:", subscriptions);

        // Thống kê theo tháng
        const monthlyStats = {};
        let totalFreeUsers = 0;
        let totalConversions = 0;
        const convertedUserIds = new Set(); // Tập hợp để lưu ID người dùng đã chuyển đổi

        // Xử lý từng subscription
        subscriptions.forEach(sub => {
            // Tìm giao dịch upgrade đầu tiên (chuyển từ free lên paid)
            const firstUpgrade = sub.transactionHistory.find(trans => 
                trans.type === 'upgrade' && trans.status === 'success'
            );

            // Kiểm tra xem người dùng có phải là người dùng miễn phí hoặc đang dùng thử không
            const isFreeUser = sub.currentPackageInfo.length > 0 && sub.currentPackageInfo[0].price === 0;
            const isTrialUser = sub.isTrial; // Kiểm tra nếu là người dùng dùng thử

            if (firstUpgrade && !convertedUserIds.has(sub.userId.toString())) {
                convertedUserIds.add(sub.userId.toString()); // Thêm ID người dùng vào tập hợp
                const month = new Date(firstUpgrade.completedAt).getMonth() + 1;
                const year = new Date(firstUpgrade.completedAt).getFullYear();
                const monthKey = `${year}-${month}`;

                if (!monthlyStats[monthKey]) {
                    monthlyStats[monthKey] = {
                        conversions: 0,
                        totalFreeUsers: 0
                    };
                }

                monthlyStats[monthKey].conversions++;
                totalConversions++;
            }
        });

        // Lấy tổng số người dùng free và trial theo từng tháng
        const freeUsersByMonth = await Subscription.aggregate([
            {
                $lookup: {
                    from: 'packages',
                    localField: 'currentPackage.packageId',
                    foreignField: '_id',
                    as: 'packageInfo'
                }
            },
            {
                $match: {
                    $or: [
                        { 'packageInfo.price': 0 }, // Người dùng miễn phí
                        { trialUsed: true } // Người dùng đang dùng thử
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$startDate' },
                        month: { $month: '$startDate' }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Cập nhật số liệu người dùng free và trial vào thống kê
        freeUsersByMonth.forEach(stat => {
            const monthKey = `${stat._id.year}-${stat._id.month}`;
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                    conversions: 0,
                    totalFreeUsers: 0
                };
            }
            monthlyStats[monthKey].totalFreeUsers = stat.count;
            totalFreeUsers += stat.count;
        });

        console.log("Free Users By Month:", freeUsersByMonth);
        console.log("Monthly Stats After Update:", monthlyStats);

        // Tính tỷ lệ chuyển đổi theo tháng
        const monthlyConversion = Object.entries(monthlyStats).map(([month, stats]) => {
            const conversionRate = stats.totalFreeUsers > 0 
                ? (stats.conversions / stats.totalFreeUsers) * 100 
                : 0;
            
            return {
                month,
                freeUsers: stats.totalFreeUsers,
                conversions: stats.conversions,
                conversionRate: parseFloat(conversionRate.toFixed(2))
            };
        });

        // Tính tỷ lệ chuyển đổi tổng thể
        const overallConversionRate = totalFreeUsers > 0 
            ? (totalConversions / totalFreeUsers) * 100 
            : 0;

        res.json({
            monthlyConversion: monthlyConversion.sort((a, b) => a.month.localeCompare(b.month)),
            overallConversionRate: parseFloat(overallConversionRate.toFixed(2)),
            totalStats: {
                totalFreeUsers,
                totalConversions
            }
        });

    } catch (error) {
        console.error('Error calculating conversion rate:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tính tỷ lệ chuyển đổi.' });
    }
});

// Đăng ký dùng thử miễn phí
router.post('/trial', async (req, res) => {
    try {
        const { userId, packageId } = req.body;

        // Kiểm tra xem user đã từng dùng thử chưa
        const existingTrial = await Subscription.findOne({
            userId,
            isTrial: true
        });

        if (existingTrial) {
            return res.status(400).json({
                message: 'Bạn đã sử dụng gói dùng thử trước đây'
            });
        }

        // Lấy thông tin gói
        const package = await Package.findById(packageId);
        if (!package) {
            return res.status(404).json({
                message: 'Không tìm thấy gói đăng ký'
            });
        }

        // Tạo thời gian dùng thử (mặc định 7 ngày)
        const trialDays = 7;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + trialDays);

        // Tạo subscription mới
        const newSubscription = new Subscription({
            userId,
            userType: 'recruiter', // hoặc lấy từ user info
            status: 'active',
            trialUsed: true,
            startDate,
            endDate,
            autoRenew: false,
            totalAmount: 0,
            currentPackage: {
                packageId: package._id,
                name: package.name,
                price: 0, // Miễn phí trong thời gian dùng thử
                duration: trialDays,
                features: package.features,
                activatedAt: startDate,
                expiredAt: endDate,
                usageStats: {
                    activeJobPosts: 0,
                    viewedProfiles: 0,
                    successfulHires: 0
                }
            },
            transactionHistory: [{
                type: 'trial',
                status: 'success',
                amount: 0,
                paymentMethod: 'trial',
                orderId: `TRIAL_ORDER_${Date.now()}`,
                requestId: `TRIAL-${Date.now()}`,
                transId: `TRIAL-${Date.now()}`,
                newPackageId: package._id,
                completedAt: new Date()
            }],
            notifications: [{
                type: 'subscription',
                message: 'Bạn đã đăng ký gói dùng thử thành công',
                createdAt: new Date(),
                read: false
            }]
        });
        console.log("thong tin cua goi dang ky trial la", newSubscription);

        await newSubscription.save();

        res.status(201).json({
            message: 'Đăng ký gói dùng thử thành công',
            subscription: {
                id: newSubscription._id,
                packageName: package.name,
                startDate,
                endDate,
                features: package.features
            }
        });

    } catch (error) {
        console.error('Error creating trial subscription:', error);
        res.status(500).json({
            message: 'Đã xảy ra lỗi khi đăng ký gói dùng thử'
        });
  }
});

module.exports = router;
