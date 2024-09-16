const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createWorkspace, userAllWorkspaces, individualWorkspace, updateWorkspace, deleteWorkspace } = require('../controllers/workspacesController');

const router = express.Router();

router.post('/', authMiddleware, createWorkspace)
router.get('/', authMiddleware, userAllWorkspaces);
router.get('/:id', authMiddleware, individualWorkspace);
router.put('/:id', authMiddleware, updateWorkspace)
router.delete('/:id', authMiddleware, deleteWorkspace)

module.exports = router;
