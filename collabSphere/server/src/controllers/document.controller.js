const { Document, DocumentVersion } = require('../models');

// Get all documents for user
exports.getAllDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find documents where user is owner or collaborator
    const documents = await Document.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId },
      ],
    })
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
    });
  }
};

// Get single document
exports.getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check access
    const hasAccess =
      document.owner._id.toString() === userId ||
      document.collaborators.some((c) => c.user?._id.toString() === userId) ||
      document.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
    });
  }
};

// Create document
exports.createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const document = await Document.create({
      title: title || 'Untitled Document',
      content: content || '',
      owner: userId,
    });

    // Create initial version
    await DocumentVersion.createVersion(document._id, content || '', userId, 'manual');

    const populatedDoc = await Document.findById(document._id)
      .populate('owner', 'name email');

    res.status(201).json({
      success: true,
      document: populatedDoc,
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document',
    });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check access
    const hasEditAccess =
      document.owner.toString() === userId ||
      document.collaborators.some(
        (c) => c.user?.toString() === userId && c.role === 'editor'
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have edit access',
      });
    }

    // Update document
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    document.lastEditedBy = userId;

    await document.save();

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Only owner can delete
    if (document.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this document',
      });
    }

    // Delete associated versions
    await DocumentVersion.deleteMany({ document: id });

    // Delete document
    await Document.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
    });
  }
};

// Get document versions
exports.getVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check access
    const hasAccess =
      document.owner.toString() === userId ||
      document.collaborators.some((c) => c.user?.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const versions = await DocumentVersion.find({ document: id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      versions,
    });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch versions',
    });
  }
};

// Restore version
exports.restoreVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(id);
    const version = await DocumentVersion.findById(versionId);

    if (!document || !version) {
      return res.status(404).json({
        success: false,
        message: 'Document or version not found',
      });
    }

    // Check edit access
    const hasEditAccess =
      document.owner.toString() === userId ||
      document.collaborators.some(
        (c) => c.user?.toString() === userId && c.role === 'editor'
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have edit access',
      });
    }

    // Create a new version with current content before restoring
    await DocumentVersion.createVersion(document._id, document.content, userId, 'auto');

    // Restore the document content
    document.content = version.content;
    document.lastEditedBy = userId;
    await document.save();

    res.json({
      success: true,
      document,
      message: 'Version restored successfully',
    });
  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore version',
    });
  }
};

// Add collaborator
exports.addCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Only owner can add collaborators
    if (document.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can add collaborators',
      });
    }

    // Find user by email
    const { User } = require('../models');
    const collaborator = await User.findOne({ email });

    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already a collaborator
    const existingCollab = document.collaborators.find(
      (c) => c.user?.toString() === collaborator._id.toString()
    );

    if (existingCollab) {
      return res.status(400).json({
        success: false,
        message: 'User is already a collaborator',
      });
    }

    // Add collaborator
    document.collaborators.push({
      user: collaborator._id,
      role: role || 'editor',
    });

    await document.save();

    const populatedDoc = await Document.findById(id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');

    res.json({
      success: true,
      document: populatedDoc,
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add collaborator',
    });
  }
};
