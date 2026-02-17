const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      default: 'Untitled Document',
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['viewer', 'editor'],
          default: 'editor',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
documentSchema.index({ owner: 1, updatedAt: -1 });
documentSchema.index({ 'collaborators.user': 1 });

// Virtual for getting all users with access
documentSchema.virtual('allUsers').get(function () {
  const users = [this.owner];
  this.collaborators.forEach((collab) => {
    if (collab.user) users.push(collab.user);
  });
  return users;
});

module.exports = mongoose.model('Document', documentSchema);
