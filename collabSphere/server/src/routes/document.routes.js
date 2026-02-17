const express = require('express');
const router = express.Router();
const { documentController } = require('../controllers');
const { auth } = require('../middleware');

// All routes require authentication
router.use(auth);

// Document CRUD
router.get('/', documentController.getAllDocuments);
router.post('/', documentController.createDocument);
router.get('/:id', documentController.getDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Version history
router.get('/:id/versions', documentController.getVersions);
router.post('/:id/versions/:versionId/restore', documentController.restoreVersion);

// Collaborators
router.post('/:id/collaborators', documentController.addCollaborator);

module.exports = router;
