const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const Package = require('../models/Package');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const Company = require('../models/Company');
const Payment = require('../models/Payment');
const { getUserType } = require('../utils/userUtils');
const { validateUserPurchase } = require('../utils/subscriptionUtils');
const Notification = require('../models/Notification');

const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const ngrokUrl = 'https://fcb7-113-23-14-206.ngrok-free.app/api/payment/notify';

// Thêm biến để theo dõi sequence number
let currentSequence = Date.now();
const getNextSequence = () => {
    currentSequence += 1;
    return currentSequence;
};

// Helper function to generate unique transaction ID
const generateUniqueTransId = (orderId, prefix = 'pending') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${orderId}_${timestamp}_${random}`;
};

// Helper function to generate MoMo signature
const generateMoMoSignature = (rawSignature) => {
    return crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
};

// Helper function to create MoMo payment request
const createMoMoPaymentRequest = (amount, orderId, orderInfo) => {
    const requestId = `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const returnUrl = 'http://localhost:3000/recruiter-page#';
    const notifyUrl = ngrokUrl;

    // Sắp xếp các tham số theo thứ tự alphabet
    const rawSignature = [
        `accessKey=${accessKey}`,
        `amount=${amount}`,
        `extraData=`,
        `ipnUrl=${notifyUrl}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${partnerCode}`,
        `redirectUrl=${returnUrl}`,
        `requestId=${requestId}`,
        `requestType=captureWallet`
    ].join('&');

    const signature = generateMoMoSignature(rawSignature);

    return {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: returnUrl,
        ipnUrl: notifyUrl,
        requestType: "captureWallet",
        extraData: "",
        lang: "vi",
        signature
    };
};

// Helper function to generate unique orderId
const generateUniqueOrderId = async (prefix = 'order') => {
    console.log('Starting generateUniqueOrderId with prefix:', prefix);
    try {
        // Tạo UUID để đảm bảo tính duy nhất
        const uuid = uuidv4().replace(/-/g, '').substr(0, 12);
        console.log('Generated UUID:', uuid);

        // Lấy sequence number
        const sequence = getNextSequence();
        console.log('Generated sequence:', sequence);

        // Tạo timestamp với độ chính xác đến millisecond
        const timestamp = new Date().getTime();
        console.log('Generated timestamp:', timestamp);

        // Kết hợp các thành phần để tạo orderId
        const orderId = `${prefix}-${timestamp}-${sequence}-${uuid}`;
        console.log('Generated orderId:', orderId);

        if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
            console.error('Invalid orderId generated:', { orderId, type: typeof orderId });
            throw new Error('Invalid orderId generated');
        }

        // Kiểm tra xem orderId đã tồn tại chưa trong cả hai collection
        console.log('Checking for existing orderId in both collections...');
        const [existingSubscription, existingPayment] = await Promise.all([
            Subscription.findOne({
                'transactionHistory.orderId': orderId
            }).select('_id'),
            Payment.findOne({ orderId }).select('_id')
        ]);

        if (existingSubscription || existingPayment) {
            console.log('OrderId already exists:', {
                existingSubscription: !!existingSubscription,
                existingPayment: !!existingPayment
            });
            return generateUniqueOrderId(prefix);
        }

        const trimmedOrderId = orderId.trim();
        console.log('Final orderId to be returned:', trimmedOrderId);
        return trimmedOrderId;
    } catch (error) {
        console.error('Error in generateUniqueOrderId:', {
            error: error.message,
            stack: error.stack,
            prefix
        });
        throw new Error('Failed to generate orderId: ' + error.message);
    }
};

// Helper function to validate orderId format
const isValidOrderId = (orderId) => {
    if (!orderId || typeof orderId !== 'string') return false;

    // Kiểm tra format: prefix-timestamp-sequence-uuid
    const parts = orderId.split('-');
    if (parts.length !== 4) return false;

    // Kiểm tra timestamp hợp lệ
    const timestamp = parseInt(parts[1]);
    if (isNaN(timestamp)) return false;

    // Kiểm tra sequence number
    const sequence = parseInt(parts[2]);
    if (isNaN(sequence)) return false;

    // Kiểm tra UUID part
    if (parts[3].length !== 12) return false;

    return true;
};

// Thêm middleware để validate orderId trước khi xử lý
const validateOrderId = (req, res, next) => {
    const orderId = req.body.orderId || req.params.orderId;
    if (orderId && !isValidOrderId(orderId)) {
        return res.status(400).json({ error: 'Invalid orderId format' });
    }
    next();
};

// Áp dụng middleware cho các routes liên quan
router.post('/notify', validateOrderId);
router.get('/check-order/:orderId', validateOrderId);

// Thêm hàm cleanup để xóa các orderId cũ
const cleanupOldOrderIds = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        await Subscription.updateMany(
            {
                'transactionHistory.status': { $in: ['failed', 'canceled'] },
                'transactionHistory.completedAt': { $lt: thirtyDaysAgo }
            },
            {
                $pull: {
                    transactionHistory: {
                        status: { $in: ['failed', 'canceled'] },
                        completedAt: { $lt: thirtyDaysAgo }
                    }
                }
            }
        );
    } catch (error) {
        console.error('Error cleaning up old orderIds:', error);
    }
};

// Chạy cleanup định kỳ (mỗi 24 giờ)
setInterval(cleanupOldOrderIds, 24 * 60 * 60 * 1000);

router.post('/create-payment', async (req, res) => {
    console.log('Starting create-payment with body:', {
        packageId: req.body.packageId,
        userId: req.body.userId,
        subscriptionType: req.body.subscriptionType
    });

    const { packageId, userId, subscriptionType = 'monthly' } = req.body;

    if (!userId || !packageId) {
        console.error('Missing required fields:', { userId, packageId });
        return res.status(400).json({ error: 'Thiếu thông tin cần thiết' });
    }

    try {
        console.log('Getting user type for userId:', userId);
        const userType = await getUserType(userId);
        console.log('User type:', userType);

        console.log('Validating user purchase...');
        await validateUserPurchase(userId);

        console.log('Finding package with ID:', packageId);
        const packageData = await Package.findById(packageId);
        if (!packageData) {
            console.error('Package not found:', packageId);
            return res.status(404).json({ error: 'Gói dịch vụ không tồn tại' });
        }

        if (userType === 'regular' && packageData.type === 'recruiter') {
            console.error('Invalid package type for user:', {
                userType,
                packageType: packageData.type
            });
            return res.status(400).json({ error: 'Gói này chỉ dành cho nhà tuyển dụng' });
        }

        const amount = packageData.price;
        console.log('Package amount:', amount);

        // Generate and validate orderId
        let orderId;
        let retryCount = 0;
        const maxRetries = 3;

        console.log('Starting orderId generation with max retries:', maxRetries);
        while (!orderId && retryCount < maxRetries) {
            try {
                console.log(`Attempt ${retryCount + 1} to generate orderId`);
                orderId = await generateUniqueOrderId();
                console.log('Generated orderId:', orderId);

                if (!orderId) {
                    console.error('Generated orderId is null or empty');
                    throw new Error('Generated orderId is null or empty');
                }
            } catch (error) {
                console.error(`Attempt ${retryCount + 1} failed to generate orderId:`, {
                    error: error.message,
                    stack: error.stack
                });
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw new Error('Không thể tạo mã đơn hàng sau nhiều lần thử. Vui lòng thử lại sau.');
                }
            }
        }

        console.log('Successfully generated orderId:', orderId);

        const orderInfo = `Thanh toán cho gói ${packageData.name}`;
        const transId = generateUniqueTransId(orderId);
        console.log('Generated transId:', transId);

        // Tạo request MoMo với signature mới
        console.log('Creating MoMo payment request...');
        const requestBody = createMoMoPaymentRequest(amount, orderId, orderInfo);

        try {
            console.log('Creating new subscription...');
            const subscription = new Subscription({
                userId,
                userType,
                status: 'pending',
                subscriptionType,
                totalAmount: amount,
                metadata: {
                    deviceInfo: req.headers['user-agent'],
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }
            });

            console.log('Updating package info...');
            await subscription.updatePackageInfo(packageData);

            // Kiểm tra lại một lần nữa trước khi thêm transaction
            console.log('Double checking orderId uniqueness...');
            const [existingSubscription, existingPayment] = await Promise.all([
                Subscription.findOne({
                    'transactionHistory.orderId': orderId
                }).select('_id'),
                Payment.findOne({ orderId }).select('_id')
            ]);

            if (existingSubscription || existingPayment) {
                console.error('OrderId conflict detected:', {
                    orderId,
                    existingSubscription: !!existingSubscription,
                    existingPayment: !!existingPayment
                });
                throw new Error('OrderId đã tồn tại trong hệ thống');
            }

            console.log('Adding transaction to subscription...');
            await subscription.addTransaction({
                transId,
                amount,
                type: 'new',
                status: 'pending',
                paymentMethod: 'momo',
                orderId,
                requestId: requestBody.requestId,
                newPackageId: packageData._id,
                metadata: {
                    orderInfo,
                    amount,
                    type: 'new_subscription',
                    packageName: packageData.name,
                    packageType: packageData.type
                }
            });

            console.log('Adding notification...');
            await Notification.create({
                user_id: subscription.userId, // hoặc recruiterId tùy hệ thống
                type: 'subscription',
                message: `New subscription initiated for package ${packageData.name}`,
                createdAt: new Date(),
                read: false
            });

            console.log('Saving subscription...');

            await subscription.save();

            console.log('Making MoMo API request...');
            const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);

            if (momoRes.data && momoRes.data.payUrl) {
                console.log('Successfully received MoMo payUrl');
                res.json({
                    payUrl: momoRes.data.payUrl,
                    subscriptionId: subscription._id,
                    orderId: orderId
                });
            } else {
                console.error('No payUrl in MoMo response:', momoRes.data);
                throw new Error('Không nhận được payUrl từ MoMo');
            }
        } catch (error) {
            console.error("Lỗi khi lưu subscription:", {
                error: error.message,
                stack: error.stack,
                orderId,
                userId,
                packageId
            });
            throw new Error('Lỗi khi lưu thông tin đăng ký: ' + error.message);
        }
    } catch (error) {
        console.error("Lỗi tạo thanh toán:", {
            error: error.message,
            stack: error.stack,
            userId,
            packageId
        });
        res.status(500).json({ error: error.message || 'Tạo thanh toán thất bại' });
    }
});

router.post('/notify', async (req, res) => {
    const { resultCode, message, orderId, amount, transId, requestId } = req.body;

    if (!orderId || resultCode === undefined || transId === undefined) {
        return res.status(400).json({ error: 'Thiếu dữ liệu cần thiết' });
    }

    try {
        const subscription = await Subscription.findOne({
            'transactionHistory.orderId': orderId
        });

        if (!subscription) {
            return res.status(404).json({ message: "Không tìm thấy đăng ký tương ứng" });
        }

        const pendingTransaction = subscription.transactionHistory.find(
            t => t.orderId === orderId && t.status === 'pending'
        );

        if (!pendingTransaction) {
            return res.status(400).json({ message: "Không tìm thấy giao dịch đang chờ xử lý" });
        }

        try {
            if (parseInt(resultCode) === 0) {
                const now = new Date();
                let duration = 30;

                // Xử lý các trường hợp khác nhau
                if (orderId.startsWith('upgrade-')) {
                    // Xử lý nâng cấp gói
                    const newPackageId = pendingTransaction.newPackageId ||
                        (pendingTransaction.metadata instanceof Map ?
                            pendingTransaction.metadata.get('newPackageId') :
                            pendingTransaction.metadata?.newPackageId);

                    if (!newPackageId) {
                        throw new Error('Missing newPackageId for upgrade transaction');
                    }

                    const newPackage = await Package.findById(newPackageId);
                    if (!newPackage) {
                        throw new Error('Package not found for upgrade');
                    }
                    if (typeof newPackage.price === 'number') {
                        subscription.totalAmount = (subscription.totalAmount || 0) + newPackage.price;
                    }

                    await subscription.updatePackageInfo(newPackage);
                } else if (orderId.startsWith('renew-')) {
                    // Xử lý gia hạn gói
                    const currentEndDate = subscription.endDate || now;
                    subscription.startDate = new Date(currentEndDate);
                    subscription.endDate = new Date(currentEndDate.getTime() + newPackage.duration * 24 * 60 * 60 * 1000);
                    if (subscription.currentPackage?.price && typeof subscription.currentPackage.price === 'number') {
                        subscription.totalAmount = (subscription.totalAmount || 0) + subscription.currentPackage.price;
                    }
                } else {
                    // Xử lý đăng ký mới
                    subscription.startDate = now;
                    subscription.endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
                }

                // Cập nhật trạng thái giao dịch hiện tại
                pendingTransaction.status = 'success';
                pendingTransaction.completedAt = now;

                // Tạo metadata mới như một Map
                const metadataMap = new Map(Object.entries({
                    ...pendingTransaction.metadata instanceof Map
                        ? Object.fromEntries(pendingTransaction.metadata)
                        : pendingTransaction.metadata || {},
                    resultCode,
                    message,
                    completedAt: now
                }));
                pendingTransaction.metadata = metadataMap;
                subscription.status = 'active';

                // Thêm thông báo về trạng thái giao dịch
                await Notification.create({
                    user_id: subscription.userId, // hoặc recruiterId nếu dùng hệ thống nhà tuyển dụng
                    type: 'payment',
                    message: `Thanh toán thành công cho đơn hàng ${orderId}`,
                    createdAt: new Date(),
                    read: false
                });
                console.log("thong tin hoa don duoc luu", subscription);

                await subscription.save();

                let featuresRaw = subscription.currentPackage?.features || [];
                let features = [];

                try {
                    features = featuresRaw.map(f => {
                        if (typeof f === 'string') {
                            // Loại bỏ ObjectId(...) để tránh lỗi
                            const safeStr = f.replace(/_id: new ObjectId\([^)]+\)/g, '_id: null');
                            return JSON.parse(
                                safeStr
                                    .replace(/(\w+):/g, '"$1":') // thêm dấu nháy key
                                    .replace(/'/g, '"') // đổi dấu ' thành "
                            );
                        } else {
                            return f;
                        }
                    });
                } catch (e) {
                    console.error('Lỗi khi parse feature:', e);
                }

                const hasHighlightFeature = features.some(f => f.key === 'highlight_companys');

                console.log("Có quyền tăng branding công ty:", hasHighlightFeature);

                if (hasHighlightFeature) {
                    const HIGHLIGHT_DURATION_DAYS = 30;
                    const highlightUntil = new Date(Date.now() + HIGHLIGHT_DURATION_DAYS * 24 * 60 * 60 * 1000);

                    const company = await Company.findOne({ user_id: subscription.userId });
                    console.log("Công ty tương ứng:", company);

                    if (company) {
                        company.highlight = true;
                        company.highlight_expiration = highlightUntil;
                        company.updated_at = new Date();

                        await company.save();
                        console.log("Cập nhật highlight thành công");
                    }
                }
                // Cập nhật user với subscription hiện tại
                const updatedUser = await User.findByIdAndUpdate(
                    subscription.userId,
                    {
                        $set: {
                            activeSubscriptionId: subscription._id,
                            role: 'recruiter'
                        }
                    },
                    { new: true }
                );

                if (!updatedUser) {
                    console.error('Không thể cập nhật user sau khi thanh toán thành công');
                    return res.status(500).json({
                        message: "Lỗi cập nhật thông tin người dùng"
                    });
                }

                return res.status(200).json({
                    message: "Thanh toán thành công",
                    subscription: {
                        id: subscription._id,
                        status: subscription.status,
                        startDate: subscription.startDate,
                        endDate: subscription.endDate
                    }
                });
            } else {
                // Xử lý thanh toán thất bại
                pendingTransaction.status = 'failed';
                pendingTransaction.completedAt = new Date();

                // Tạo metadata mới như một Map cho trường hợp thất bại
                const metadataMap = new Map(Object.entries({
                    ...pendingTransaction.metadata instanceof Map
                        ? Object.fromEntries(pendingTransaction.metadata)
                        : pendingTransaction.metadata || {},
                    resultCode,
                    message
                }));
                pendingTransaction.metadata = metadataMap;

                await subscription.save();

                return res.status(400).json({
                    message: "Thanh toán thất bại",
                    resultCode,
                    orderId
                });
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật giao dịch:", error);
            throw new Error('Lỗi khi cập nhật thông tin giao dịch: ' + error.message);
        }
    } catch (error) {
        console.error("Lỗi xử lý callback:", error);
        return res.status(500).json({
            message: "Lỗi hệ thống",
            error: error.message
        });
    }
});

// API lấy thông tin gói subscription hiện tại
router.get('/current-package/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy thông tin người dùng",
                code: "USER_NOT_FOUND"
            });
        }

        // Kiểm tra subscription ID trong user
        if (!user.activeSubscriptionId) {
            // Tìm subscription active mới nhất của user
            const latestSubscription = await Subscription.findOne({
                userId: user._id,
                status: { $nin: ['pending', 'expired'] }, // Loại trừ 2 trạng thái này
                endDate: { $gt: new Date() }
            }).sort({ createdAt: -1 });


            if (latestSubscription) {
                // Nếu tìm thấy subscription active, cập nhật user
                await User.findByIdAndUpdate(user._id, {
                    $set: { activeSubscriptionId: latestSubscription._id }
                });

                return res.json({
                    subscription: {
                        id: latestSubscription._id,
                        status: latestSubscription.status,
                        startDate: latestSubscription.startDate,
                        endDate: latestSubscription.endDate,
                        currentPackage: latestSubscription.currentPackage,
                        currentPackageId: latestSubscription.currentPackage.packageId,
                        packageDetails: {
                            id: latestSubscription.currentPackage.packageId,
                            name: latestSubscription.currentPackage.name,
                            price: latestSubscription.currentPackage.price
                        }
                    }
                });
            }

            return res.status(404).json({
                message: "Bạn chưa đăng ký gói dịch vụ nào",
                code: "NO_ACTIVE_SUBSCRIPTION"
            });
        }

        const subscription = await Subscription.findById(user.activeSubscriptionId)
            .select('status startDate endDate currentPackage transactionHistory')
            .populate('currentPackage.packageId');

        if (!subscription) {
            // Xóa reference không hợp lệ
            await User.findByIdAndUpdate(user._id, {
                $unset: { activeSubscriptionId: 1 }
            });

            return res.status(404).json({
                message: "Không tìm thấy thông tin subscription",
                code: "SUBSCRIPTION_NOT_FOUND"
            });
        }

        // Kiểm tra subscription có còn active và chưa hết hạn
        const now = new Date();
        if (['pending', 'expired'].includes(subscription.status) || subscription.endDate <= now) {
            // Cập nhật trạng thái nếu đã hết hạn
            if (subscription.status === 'active' && subscription.endDate <= now) {
                subscription.status = 'expired';
                await subscription.save();

                // Xóa reference trong user
                await User.findByIdAndUpdate(user._id, {
                    $unset: { activeSubscriptionId: 1 }
                });
            }

            return res.status(404).json({
                message: "Gói dịch vụ của bạn đã hết hạn",
                code: "SUBSCRIPTION_EXPIRED"
            });
        }

        console.log('Sending subscription response:', {
            id: subscription._id,
            status: subscription.status,
            currentPackage: subscription.currentPackage,
            packageId: subscription.currentPackage.packageId
        });

        res.json({
            subscription: {
                id: subscription._id,
                status: subscription.status,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                currentPackage: subscription.currentPackage,
                currentPackageId: subscription.currentPackage.packageId,
                packageDetails: {
                    id: subscription.currentPackage.packageId,
                    name: subscription.currentPackage.name,
                    price: subscription.currentPackage.price
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin subscription:', error);
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thông tin subscription",
            error: error.message
        });
    }
});

// API lấy lịch sử các gói đã đăng ký
router.get('/subscription-history/:userId', async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            userId: req.params.userId,
            status: { $in: ['active', 'expired'] }
        })
            .select('status startDate endDate currentPackage packageHistory transactionHistory')
            .populate('currentPackage.packageId')
            .sort({ startDate: -1 });

        res.json(subscriptions.map(sub => ({
            id: sub._id,
            status: sub.status,
            startDate: sub.startDate,
            endDate: sub.endDate,
            currentPackage: sub.currentPackage,
            packageHistory: sub.packageHistory,
            lastTransaction: sub.getCurrentTransaction()
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API kiểm tra trạng thái đơn hàng
router.get('/check-order/:orderId', async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            'transactionHistory.orderId': req.params.orderId
        });

        if (!subscription) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const transaction = subscription.transactionHistory.find(
            t => t.orderId === req.params.orderId
        );

        res.json({
            status: subscription.status,
            transaction
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API lấy subscription đang active
router.get('/active-subscriptions/:userId', async (req, res) => {
    try {
        const subscriptions = await Subscription.getActiveSubscriptions(req.params.userId);
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API nâng cấp gói subscription
router.post('/upgrade-subscription', async (req, res) => {
    const { userId, newPackageId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || !user.activeSubscriptionId) {
            return res.status(404).json({ error: 'No active subscription found' });
        }

        const currentSubscription = await Subscription.findById(user.activeSubscriptionId);
        const newPackage = await Package.findById(newPackageId);

        if (!currentSubscription || !newPackage) {
            return res.status(404).json({ error: 'Package information not found' });
        }

        if (newPackage.price <= currentSubscription.currentPackage.price) {
            return res.status(400).json({ error: 'New package must have a higher price than current package' });
        }

        // Tính toán số tiền nâng cấp
        const remainingDays = Math.max(0, (new Date(currentSubscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        const remainingValue = Math.floor((remainingDays / 30) * currentSubscription.currentPackage.price);
        const upgradeAmount = Math.max(0, newPackage.price - remainingValue);

        // Tạo orderId mới với hệ thống mới
        const orderId = await generateUniqueOrderId('upgrade');
        const orderInfo = `Upgrade to ${newPackage.name}`;
        const transId = generateUniqueTransId(orderId);

        // Tạo request MoMo với signature mới
        const requestBody = createMoMoPaymentRequest(upgradeAmount, orderId, orderInfo);

        // Thêm giao dịch mới vào subscription hiện tại
        try {
            await currentSubscription.addTransaction({
                transId,
                status: 'pending',
                paymentMethod: 'momo',
                orderId,
                requestId: requestBody.requestId,
                amount: upgradeAmount,
                type: 'upgrade',
                newPackageId: newPackage._id,
                metadata: {
                    newPackageId: newPackage._id,
                    orderInfo
                }
            });

            // Add notification for upgrade
            await Notification.create({
                user_id: userId,
                type: 'upgrade',
                message: `Bạn đã bắt đầu nâng cấp lên gói ${newPackage.name}`,
                read: false
            });


            await currentSubscription.save();

            const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);

            if (momoRes.data && momoRes.data.payUrl) {
                res.json({
                    payUrl: momoRes.data.payUrl,
                    upgradeAmount,
                    orderId,
                    newPackageId: newPackage._id
                });
            } else {
                throw new Error('No payUrl received from MoMo');
            }
        } catch (error) {
            // Rollback nếu có lỗi
            if (currentSubscription.transactionHistory.length > 0) {
                const lastTransaction = currentSubscription.transactionHistory[currentSubscription.transactionHistory.length - 1];
                if (lastTransaction.orderId === orderId) {
                    currentSubscription.transactionHistory.pop();
                    await currentSubscription.save();
                }
            }
            throw error;
        }
    } catch (error) {
        console.error('Error upgrading package:', error);
        res.status(500).json({ error: error.message || 'Package upgrade failed' });
    }
});

// API gia hạn subscription
router.post('/renew-subscription', async (req, res) => {
    const { userId, packageId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        const packageData = await Package.findById(packageId);
        if (!packageData) {
            return res.status(404).json({ error: 'Không tìm thấy gói dịch vụ' });
        }

        const orderId = `renew-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const requestId = `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const transId = generateUniqueTransId(orderId);

        const returnUrl = 'http://localhost:3000/recruiter-page#';
        const notifyUrl = ngrokUrl;
        const orderInfo = `Gia hạn gói ${packageData.name}`;

        const rawSignature = `accessKey=${accessKey}&amount=${packageData.price}&extraData=&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=captureWallet`;
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount: packageData.price,
            orderId,
            orderInfo,
            redirectUrl: returnUrl,
            ipnUrl: notifyUrl,
            requestType: "captureWallet",
            extraData: "",
            lang: "vi",
            signature
        };

        const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);

        if (momoRes.data && momoRes.data.payUrl) {
            // Tạo subscription mới cho gia hạn
            const subscription = new Subscription({
                userId,
                userType: user.role === 'recruiter' ? 'recruiter' : 'regular',
                status: 'pending',
                subscriptionType: 'monthly',
                totalAmount: packageData.price,
                metadata: {
                    type: 'renewal',
                    previousSubscriptionId: user.activeSubscriptionId
                }
            });

            await subscription.updatePackageInfo(packageData);

            subscription.addTransaction({
                transId,
                amount: packageData.price,
                type: 'renewal',
                status: 'pending',
                paymentMethod: 'momo',
                orderId,
                requestId,
                newPackageId: packageData._id,
                metadata: {
                    orderInfo
                }
            });

            await subscription.save();
            await Notification.create({
                user_id: userId,
                type: 'upgrade',
                message: `Bạn đã hạ xuống gói ${packageData.name}`,
                read: false
            });


            res.json({
                payUrl: momoRes.data.payUrl,
                subscriptionId: subscription._id,
                orderId
            });
        } else {
            throw new Error('Không nhận được payUrl từ MoMo');
        }
    } catch (error) {
        console.error('Lỗi khi gia hạn gói:', error);
        res.status(500).json({ error: error.message || 'Gia hạn gói thất bại' });
    }
});

// API hạ cấp gói subscription
router.post('/downgrade-subscription', async (req, res) => {
    const { userId, newPackageId } = req.body;
    console.log("thong tin duoc gui xuong backend", newPackageId);

    if (!newPackageId) {
        alert("không tin thấy id gói")
        return res.status(400).json({ message: 'newPackageId is required' });
    }
    try {
        const user = await User.findById(userId);
        if (!user || !user.activeSubscriptionId) {
            return res.status(404).json({ error: 'No active subscription found' });
        }

        const currentSubscription = await Subscription.findById(user.activeSubscriptionId);
        const newPackage = await Package.findById(newPackageId);
        console.log("thong tin duocqq ", newPackage.price);
        console.log("thong tin duoc ", currentSubscription.currentPackage.price);

        if (!currentSubscription || !newPackage) {
            return res.status(404).json({ error: 'Package information not found' });
        }

        if (newPackage.price > currentSubscription.currentPackage.price) {
            return res.status(400).json({ error: 'New package must have a lower price than current package' });
        }

        // Tạo orderId cho giao dịch hạ cấp
        const orderId = await generateUniqueOrderId('downgrade');
        const orderInfo = `Downgrade to ${newPackage.name}`;
        const transId = generateUniqueTransId(orderId);
        const amount = newPackage.price;
        // Cập nhật trạng thái subscription
        currentSubscription.status = 'downgrading';

        const requestBody = createMoMoPaymentRequest(amount, orderId, orderInfo);

        // Thêm giao dịch mới vào subscription hiện tại
        await currentSubscription.addTransaction({
            transId,
            status: 'pending',
            paymentMethod: 'momo',
            orderId,
            requestId: Date.now().toString(),
            amount: newPackage.price,
            type: 'downgrade',
            newPackageId: newPackage._id,
            metadata: {
                newPackageId: newPackage._id,
                orderInfo,
                effectiveDate: currentSubscription.endDate // Hạ cấp sẽ có hiệu lực từ ngày hết hạn gói hiện tại
            }
        });
        await currentSubscription.save();

        const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
        if (momoRes.data && momoRes.data.payUrl) {
            res.json({
                payUrl: momoRes.data.payUrl,
                downgradeAmount: amount,
                orderId,
                newPackageId: newPackage._id,
                effectiveDate: currentSubscription.endDate
            });
        } else {
            throw new Error('Không nhận được payUrl từ MoMo');
        }
        // Cập nhật gói mới
        await currentSubscription.updatePackageInfo(newPackage);

        // currentSubscription.status = 'active';
        await currentSubscription.save();

        // Cập nhật user
        user.activeSubscriptionId = currentSubscription._id;
        await user.save();
        await Notification.create({
            user_id: userId,
            type: 'upgrade',
            message: `Bạn đã bắt đầu nâng cấp lên gói ${newPackage.name}`,
            read: false
        });
    } catch (error) {
        console.error('Error downgrading package:', error);
        res.status(500).json({ error: error.message || 'Package downgrade failed' });
    }
});

// Route để lấy danh sách gói đăng ký của người dùng
router.get('/subscriptions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ID người dùng'
            });
        }

        // Kiểm tra người dùng tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Lấy tất cả các gói đăng ký của user và populate thông tin package
        const subscriptions = await Subscription.find({ userId })
            .populate('currentPackage.packageId')
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo, mới nhất lên đầu
        console.log("thong tin tra ve la ", subscriptions)
        // Format dữ liệu trả về
        const formattedSubscriptions = subscriptions.map(sub => {
            const subscription = sub.toObject();
            return {
                _id: subscription._id,
                status: subscription.status,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                subscriptionType: subscription.subscriptionType,
                autoRenew: subscription.autoRenew,
                totalAmount: subscription.totalAmount,
                package: subscription.currentPackage?.packageId ? {
                    _id: subscription.currentPackage.packageId._id,
                    name: subscription.currentPackage.packageId.name,
                    description: subscription.currentPackage.packageId.description,
                    features: subscription.currentPackage.packageId.features,
                    price: subscription.currentPackage.packageId.price,
                    type: subscription.currentPackage.packageId.type,
                    postLimit: subscription.currentPackage.packageId.postLimit,
                } : null,
                usageStats: subscription.currentPackage?.usageStats || {
                    totalJobPosts: subscription.currentPackage.packageId.postLimit,
                    activeJobPosts: 0,
                    viewedProfiles: 0,
                    successfulHires: 0
                },
                transactions: subscription.transactionHistory.map(trans => ({
                    transId: trans.transId,
                    orderId: trans.orderId,
                    amount: trans.amount,
                    type: trans.type,
                    status: trans.status,
                    paymentMethod: trans.paymentMethod,
                    completedAt: trans.completedAt
                }))
            };
        });

        return res.status(200).json({
            success: true,
            data: formattedSubscriptions,
            message: formattedSubscriptions.length ? 'Lấy danh sách gói đăng ký thành công' : 'Chưa có gói đăng ký nào'
        });

    } catch (error) {
        console.error('Error getting subscriptions:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy thông tin gói đăng ký',
            error: error.message
        });
    }
});

module.exports = router;

