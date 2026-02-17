const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    content: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    // Snapshot type: 'auto' for auto-saves, 'manual' for user-triggered
    snapshotType: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching versions of a document
documentVersionSchema.index({ document: 1, createdAt: -1 });

// Static method to create a new version
documentVersionSchema.statics.createVersion = async function (documentId, content, userId, type = 'auto') {
  // Get the latest version number
  const latestVersion = await this.findOne({ document: documentId })
    .sort({ versionNumber: -1 })
    .select('versionNumber');

  const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

  return this.create({
    document: documentId,
    content,
    createdBy: userId,
    versionNumber,
    snapshotType: type,
  });
};

// Static method to clean up old versions (keep last N versions)
documentVersionSchema.statics.cleanupOldVersions = async function (documentId, keepCount = 50) {
  const versions = await this.find({ document: documentId })
    .sort({ createdAt: -1 })
    .skip(keepCount)
    .select('_id');

  if (versions.length > 0) {
    await this.deleteMany({
      _id: { $in: versions.map((v) => v._id) },
    });
  }
};

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);
