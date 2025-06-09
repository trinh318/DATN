const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'orderId không được để trống hoặc null'
    }
  },
  requestId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['new', 'upgrade', 'downgrade', 'renewal'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'canceled'],
    required: true,
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'momo'
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
    default: 0
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  metadata: {
    signature: String,
    partnerCode: String,
    orderInfo: String,
    redirectUrl: String,
    ipnUrl: String,
    lang: { type: String, default: 'vi' },
    extraData: String,
    paymentPlatform: { type: String, default: 'web' }
  },
  completedAt: {
    type: Date
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
paymentSchema.index({ subscriptionId: 1, status: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ transId: 1 }, { unique: true });
paymentSchema.index({ createdAt: 1 });

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods
paymentSchema.methods.updateStatus = async function(newStatus, transactionDetails = {}) {
  this.status = newStatus;
  this.completedAt = new Date();
  
  if (transactionDetails.transId) {
    this.transId = transactionDetails.transId;
  }
  
  if (transactionDetails.metadata) {
    this.metadata = { ...this.metadata, ...transactionDetails.metadata };
  }
  
  await this.save();
  return this;
};

paymentSchema.methods.generatePaymentData = function() {
  return {
    orderId: this.orderId,
    amount: this.amount,
    orderInfo: this.metadata.orderInfo || `Payment for ${this.type}`,
    redirectUrl: this.metadata.redirectUrl,
    ipnUrl: this.metadata.ipnUrl,
    requestId: this.requestId,
    extraData: this.metadata.extraData,
    partnerCode: this.metadata.partnerCode,
    paymentMethod: this.paymentMethod
  };
};

// Static methods
paymentSchema.statics.findByOrderId = function(orderId) {
  return this.findOne({ orderId })
    .populate('subscriptionId')
    .populate('userId')
    .populate('previousPackageId')
    .populate('newPackageId');
};

paymentSchema.statics.getPendingPayments = function(userId) {
  return this.find({
    userId,
    status: 'pending',
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }).sort({ createdAt: -1 });
};

paymentSchema.statics.getPaymentHistory = function(userId, limit = 10) {
  return this.find({
    userId,
    status: { $in: ['success', 'failed', 'canceled'] }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('newPackageId', 'name price duration');
};

module.exports = mongoose.model('Payment', paymentSchema); 