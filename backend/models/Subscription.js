const mongoose = require('mongoose');

// Schema cho lịch sử giao dịch
const transactionHistorySchema = new mongoose.Schema({
  transId: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return !v || (typeof v === 'string' && v.trim().length > 0);
      },
      message: 'transId phải là một chuỗi hợp lệ nếu được cung cấp'
    }
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['new', 'upgrade', 'downgrade', 'renewal', "trial"],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'canceled'],
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'momo'
  },
  orderId: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        return v && typeof v === 'string' && v.trim().length > 0;
      },
      message: 'orderId không được để trống hoặc null'
    }
  },
  requestId: {
    type: String,
    required: true
  },
  previousPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  },
  newPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  priceDifference: {
    type: Number,
    default: 0 // Dùng cho upgrade/downgrade
  },
  refundAmount: {
    type: Number,
    default: 0 // Dùng cho downgrade
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: () => new Map()
  }
});

// Schema cho thông tin gói
const packageInfoSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  name: String,
  type: String,
  features: [String],
  duration: Number,
  price: Number,
  activatedAt: Date,
  expiredAt: Date,
  usageStats: {
    activeJobPosts: { type: Number, default: 0 },
    viewedProfiles: { type: Number, default: 0 },
    successfulHires: { type: Number, default: 0 }
  }
});

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userType: {
    type: String,
    enum: ['regular', 'recruiter'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'canceled', 'upgrading', 'downgrading'],
    default: 'pending'
  },
  subscriptionType: {
    type: String,
    enum: ['trial', 'monthly', 'yearly', 'custom'],
    default: 'monthly'
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  trialUsed: {
    type: Boolean,
    default: false
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currentPackage: packageInfoSchema,
  packageHistory: [packageInfoSchema],
  transactionHistory: [transactionHistorySchema],
  notifications: [{
    type: {
      type: String,
      enum: ['expiration', 'upgrade', 'downgrade', 'renewal', 'payment', 'subscription']
    },
    message: String,
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String,
    lastActive: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ 'currentPackage.packageId': 1 });

// Index for orderId
subscriptionSchema.index({ 'transactionHistory.orderId': 1 }, { 
  unique: true,
  sparse: true,
  partialFilterExpression: { 
    'transactionHistory.orderId': { $exists: true, $ne: null, $type: 'string' }
  }
});

// Index for transId
subscriptionSchema.index({ 'transactionHistory.transId': 1 }, { 
  unique: true,
  sparse: true,
  partialFilterExpression: { 
    'transactionHistory.transId': { $exists: true, $ne: null, $type: 'string' }
  }
});

subscriptionSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });
subscriptionSchema.index({ 'notifications.createdAt': 1 });

// Middleware
subscriptionSchema.pre('save', async function(next) {
  if (this.trialUsed) {
    return next(); // Bỏ qua kiểm tra
  }
  // Validate transactionHistory orderId and transId before saving
  if (this.transactionHistory && this.transactionHistory.length > 0) {
    // Check for null or invalid orderIds and transIds
    const invalidTransaction = this.transactionHistory.find(
      t => (!t.orderId || typeof t.orderId !== 'string' || t.orderId.trim().length === 0) ||
          (!t.transId || typeof t.transId !== 'string' || t.transId.trim().length === 0)
    );
    if (invalidTransaction) {
      console.error('Invalid transaction found:', {
        transaction: invalidTransaction,
        orderId: invalidTransaction?.orderId,
        transId: invalidTransaction?.transId,
        orderIdType: typeof invalidTransaction?.orderId,
        transIdType: typeof invalidTransaction?.transId
      });
      return next(new Error('Mỗi giao dịch phải có orderId và transId hợp lệ'));
    }

    // Normalize orderIds and transIds
    this.transactionHistory = this.transactionHistory.map(t => ({
      ...t,
      orderId: t.orderId.trim(),
      transId: t.transId.trim()
    }));

    // Check for duplicate orderIds within the same document
    const orderIds = this.transactionHistory.map(t => t.orderId);
    const uniqueOrderIds = new Set(orderIds);
    if (orderIds.length !== uniqueOrderIds.size) {
      console.error('Duplicate orderIds found:', {
        orderIds,
        uniqueCount: uniqueOrderIds.size,
        totalCount: orderIds.length
      });
      return next(new Error('Phát hiện orderId trùng lặp trong lịch sử giao dịch'));
    }

    // Check for duplicate transIds within the same document
    const transIds = this.transactionHistory.map(t => t.transId);
    const uniqueTransIds = new Set(transIds);
    if (transIds.length !== uniqueTransIds.size) {
      console.error('Duplicate transIds found:', {
        transIds,
        uniqueCount: uniqueTransIds.size,
        totalCount: transIds.length
      });
      return next(new Error('Phát hiện transId trùng lặp trong lịch sử giao dịch'));
    }

    // Check if any orderId or transId exists in other documents
    for (const transaction of this.transactionHistory) {
      const [existingSubscriptionByOrderId, existingSubscriptionByTransId] = await Promise.all([
        this.constructor.findOne({
          _id: { $ne: this._id },
          'transactionHistory.orderId': transaction.orderId
        }),
        this.constructor.findOne({
          _id: { $ne: this._id },
          'transactionHistory.transId': transaction.transId
        })
      ]);

      if (existingSubscriptionByOrderId) {
        console.error('OrderId exists in another subscription:', {
          orderId: transaction.orderId,
          existingSubscriptionId: existingSubscriptionByOrderId._id
        });
        return next(new Error(`orderId ${transaction.orderId} đã tồn tại trong hệ thống`));
      }

      if (existingSubscriptionByTransId) {
        console.error('TransId exists in another subscription:', {
          transId: transaction.transId,
          existingSubscriptionId: existingSubscriptionByTransId._id
        });
        return next(new Error(`transId ${transaction.transId} đã tồn tại trong hệ thống`));
      }
    }
  }

  this.updatedAt = Date.now();
  if (this.isModified('currentPackage')) {
    this.packageHistory.push(this.currentPackage);
  }
  next();
});

// Static method to check if orderId exists
subscriptionSchema.statics.isOrderIdExists = async function(orderId) {
  if (!orderId) return false;
  const subscription = await this.findOne({
    'transactionHistory.orderId': orderId
  });
  return !!subscription;
};

// Thêm validation ở mức schema cho transactionHistory
const validateTransactionHistory = function(transactionHistory) {
  if (!Array.isArray(transactionHistory)) return false;
  
  // Kiểm tra từng transaction
  for (const transaction of transactionHistory) {
    if (!transaction.orderId || typeof transaction.orderId !== 'string' || transaction.orderId.trim().length === 0) {
      return false;
    }
  }
  
  // Kiểm tra trùng lặp orderId
  const orderIds = transactionHistory.map(t => t.orderId);
  return orderIds.length === new Set(orderIds).size;
};

subscriptionSchema.path('transactionHistory').validate(function(value) {
  if (!validateTransactionHistory(value)) {
    throw new Error('TransactionHistory validation failed: Invalid or duplicate orderIds');
  }
  return true;
});

// Methods
subscriptionSchema.methods.addTransaction = async function(transactionData) {
  console.log('Adding transaction with data:', JSON.stringify(transactionData, null, 2));
  
  // Validate orderId
  if (!transactionData.orderId || typeof transactionData.orderId !== 'string' || transactionData.orderId.trim().length === 0) {
    console.error('Invalid orderId in transaction data:', {
      orderId: transactionData.orderId,
      type: typeof transactionData.orderId
    });
    throw new Error('orderId phải là một chuỗi hợp lệ và không được để trống');
  }

  // Normalize orderId
  transactionData.orderId = transactionData.orderId.trim();

  // Check if orderId already exists in current document
  const existingTransaction = this.transactionHistory.find(t => t.orderId === transactionData.orderId);
  if (existingTransaction) {
    console.error('OrderId already exists in current document:', transactionData.orderId);
    throw new Error(`orderId ${transactionData.orderId} đã tồn tại trong document hiện tại`);
  }

  // Check if orderId exists in other documents
  const existingSubscription = await this.constructor.findOne({
    _id: { $ne: this._id },
    'transactionHistory.orderId': transactionData.orderId
  });
  if (existingSubscription) {
    console.error('OrderId exists in another document:', {
      orderId: transactionData.orderId,
      existingSubscriptionId: existingSubscription._id
    });
    throw new Error(`orderId ${transactionData.orderId} đã tồn tại trong hệ thống`);
  }

  // Validate required fields
  if (!transactionData.amount) {
    throw new Error('amount is required');
  }
  if (!transactionData.type) {
    throw new Error('type is required');
  }
  if (transactionData.type !== 'new' && !transactionData?.metadata?.newPackageId) {
    throw new Error('newPackageId is required');
  }

  // Create a new transaction object with all required fields
  const transaction = {
    transId: transactionData.transId,
    amount: transactionData.amount,
    type: transactionData.type,
    status: transactionData.status || 'pending',
    paymentMethod: transactionData.paymentMethod || 'momo',
    orderId: transactionData.orderId,
    requestId: transactionData.requestId,
    newPackageId: transactionData.newPackageId,
    previousPackageId: transactionData.previousPackageId,
    priceDifference: transactionData.priceDifference || 0,
    refundAmount: transactionData.refundAmount || 0,
    completedAt: new Date(),
    metadata: transactionData.metadata || new Map()
  };

  // Log the transaction before pushing
  console.log('Pushing transaction:', JSON.stringify(transaction, null, 2));
  
  // Add to transactionHistory
  this.transactionHistory.push(transaction);

  // Validate the entire transactionHistory array
  try {
    await this.validate('transactionHistory');
  } catch (error) {
    console.error('Validation error:', error);
    // Remove the transaction we just added
    this.transactionHistory.pop();
    throw error;
  }

  console.log('Transaction added successfully. Current transactionHistory length:', this.transactionHistory.length);

  if (transactionData.status === 'success') {
    this.status = 'active';
    // Thêm thông báo
    this.notifications.push({
      type: transactionData.type,
      message: `Giao dịch ${transactionData.type} thành công`,
      createdAt: new Date()
    });
  }
};

// Add new method to track package changes
subscriptionSchema.methods.trackPackageChange = function(fromTier, toTier, changeType, reason) {
  if (!this.packageStatus) {
    this.packageStatus = {
      currentTier: toTier,
      previousTier: fromTier,
      changeHistory: []
    };
  } else {
    this.packageStatus.previousTier = this.packageStatus.currentTier;
    this.packageStatus.currentTier = toTier;
  }

  this.packageStatus.changeHistory.push({
    fromTier,
    toTier,
    changeType,
    changeDate: new Date(),
    reason
  });
};

// Update the updatePackageInfo method to include package status tracking
subscriptionSchema.methods.updatePackageInfo = async function(packageData) {
  if (!packageData) {
    throw new Error('Package data is required');
  }

  if (!packageData._id) {
    throw new Error('Package ID is required');
  }

  const previousPackage = this.currentPackage;
  
  // Update current package information
  this.currentPackage = {
    packageId: packageData._id,
    name: packageData.name || 'Unknown Package',
    type: packageData.type || 'basic',
    features: packageData.features || [],
    duration: packageData.duration || 30,
    price: packageData.price || 0,
    activatedAt: new Date(),
    expiredAt: new Date(Date.now() + (packageData.duration || 30) * 24 * 60 * 60 * 1000),
    usageStats: {
      activeJobPosts: 0,
      viewedProfiles: 0,
      successfulHires: 0
    }
  };

  // Track package change
  if (previousPackage) {
    const changeType = packageData.price > previousPackage.price ? 'upgrade' : 'downgrade';
    this.trackPackageChange(
      previousPackage.type,
      packageData.type,
      changeType,
      `${changeType === 'upgrade' ? 'Upgraded' : 'Downgraded'} from ${previousPackage.name} to ${packageData.name}`
    );
  } else {
    this.trackPackageChange(
      null,
      packageData.type,
      'new',
      `Initial subscription to ${packageData.name}`
    );
  }

  // Update subscription dates
  this.startDate = this.currentPackage.activatedAt;
  this.endDate = this.currentPackage.expiredAt;

  // Add notification
  this.notifications.push({
    type: previousPackage ? (packageData.price > previousPackage.price ? 'upgrade' : 'downgrade') : 'subscription',
    message: `Package updated to ${packageData.name}`,
    createdAt: new Date()
  });

  return this;
};

// Phương thức kiểm tra và tính toán upgrade
subscriptionSchema.methods.calculateUpgrade = async function(newPackageId) {
  const Package = mongoose.model('Package');
  const newPackage = await Package.findById(newPackageId);
  
  if (!newPackage) {
    throw new Error('Không tìm thấy gói mới');
  }

  const remainingDays = Math.max(0, (this.endDate - new Date()) / (1000 * 60 * 60 * 24));
  const remainingValue = Math.floor((remainingDays / 30) * this.currentPackage.price);
  const upgradeAmount = Math.max(0, newPackage.price - remainingValue);

  return {
    canUpgrade: newPackage.price > this.currentPackage.price,
    upgradeAmount,
    remainingDays,
    remainingValue
  };
};

// Phương thức kiểm tra và tính toán downgrade
subscriptionSchema.methods.calculateDowngrade = async function(newPackageId) {
  const Package = mongoose.model('Package');
  const newPackage = await Package.findById(newPackageId);
  
  if (!newPackage) {
    throw new Error('Không tìm thấy gói mới');
  }

  const remainingDays = Math.max(0, (this.endDate - new Date()) / (1000 * 60 * 60 * 24));
  const remainingValue = Math.floor((remainingDays / 30) * this.currentPackage.price);
  const newPackageValue = Math.floor((remainingDays / 30) * newPackage.price);
  const refundAmount = Math.max(0, remainingValue - newPackageValue);

  return {
    canDowngrade: newPackage.price < this.currentPackage.price,
    refundAmount,
    remainingDays,
    newPackageValue
  };
};

// Static methods
subscriptionSchema.statics.getActiveSubscriptions = function(userId) {
  return this.find({
    userId,
    status: 'active',
    endDate: { $gt: new Date() }
  }).populate('currentPackage.packageId');
};

subscriptionSchema.statics.getSubscriptionStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$currentPackage.packageId',
        totalSubscriptions: { $sum: 1 },
        activeSubscriptions: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalRevenue: { $sum: '$totalAmount' },
        avgDuration: { $avg: { $subtract: ['$endDate', '$startDate'] } }
      }
    },
    {
      $lookup: {
        from: 'packages',
        localField: '_id',
        foreignField: '_id',
        as: 'packageInfo'
      }
    }
  ]);
};

// Xuất model
module.exports = mongoose.model('Subscription', subscriptionSchema);
