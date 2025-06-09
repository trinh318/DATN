const mongoose = require('mongoose');

const packageDetailSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'enterprise', 'custom']
  },
  features: [{
    name: String,
    description: String,
    limit: Number,
    used: { type: Number, default: 0 }
  }],
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  activatedAt: {
    type: Date,
    required: true
  },
  expiredAt: {
    type: Date,
    required: true
  },
  usageStats: {
    activeJobPosts: { 
      type: Number, 
      default: 0,
      min: 0
    },
    viewedProfiles: { 
      type: Number, 
      default: 0,
      min: 0
    },
    successfulHires: { 
      type: Number, 
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled'],
    default: 'active'
  },
  metadata: {
    previousPackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package'
    },
    upgradeHistory: [{
      date: Date,
      fromPackage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package'
      },
      toPackage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package'
      },
      priceDifference: Number
    }],
    customizations: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
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
packageDetailSchema.index({ subscriptionId: 1, status: 1 });
packageDetailSchema.index({ packageId: 1 });
packageDetailSchema.index({ expiredAt: 1 });
packageDetailSchema.index({ 'usageStats.lastUpdated': 1 });

// Pre-save middleware
packageDetailSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.usageStats.lastUpdated = Date.now();
  next();
});

// Methods
packageDetailSchema.methods.updateUsageStats = async function(stats) {
  Object.keys(stats).forEach(key => {
    if (key in this.usageStats && typeof stats[key] === 'number') {
      this.usageStats[key] = Math.max(0, stats[key]);
    }
  });
  this.usageStats.lastUpdated = new Date();
  await this.save();
  return this;
};

packageDetailSchema.methods.checkFeatureLimit = function(featureName) {
  const feature = this.features.find(f => f.name === featureName);
  if (!feature) {
    return { hasAccess: false, message: 'Feature not available in this package' };
  }
  return {
    hasAccess: feature.used < feature.limit,
    remaining: Math.max(0, feature.limit - feature.used),
    used: feature.used,
    limit: feature.limit
  };
};

packageDetailSchema.methods.incrementFeatureUsage = async function(featureName) {
  const feature = this.features.find(f => f.name === featureName);
  if (!feature) {
    throw new Error(`Feature ${featureName} not found in package`);
  }
  if (feature.used >= feature.limit) {
    throw new Error(`Feature ${featureName} usage limit reached`);
  }
  feature.used += 1;
  await this.save();
  return this.checkFeatureLimit(featureName);
};

// Static methods
packageDetailSchema.statics.getActivePackageDetails = function(subscriptionId) {
  return this.findOne({
    subscriptionId,
    status: 'active',
    expiredAt: { $gt: new Date() }
  }).populate('packageId');
};

packageDetailSchema.statics.getPackageUsageStats = async function(packageId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        packageId: mongoose.Types.ObjectId(packageId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$packageId',
        totalJobPosts: { $sum: '$usageStats.totalJobPosts' },
        activeJobPosts: { $sum: '$usageStats.activeJobPosts' },
        viewedProfiles: { $sum: '$usageStats.viewedProfiles' },
        successfulHires: { $sum: '$usageStats.successfulHires' },
        totalSubscriptions: { $sum: 1 },
        activeSubscriptions: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('PackageDetail', packageDetailSchema); 