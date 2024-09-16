const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Workspace = require('../models/workspaceModel');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');

exports.createWorkspace = async (req, res) => {
    const { name, description, commerce, cms, payment, composer_url } = req.body;

    if (!name || !description || !commerce || !commerce.name || !commerce.creds || !cms || !payment || !composer_url) {
      return res.status(400).json({ msg: 'Please fill in all required fields' });
    }

    if (!['VENDURE', 'SHOPIFY'].includes(commerce.name)) {
      return res.status(400).json({ msg: 'Invalid commerce name. Allowed values: emporix, shopify' });
    }

    const uuid = crypto.randomUUID();
    const timestamp = Date.now().toString(36);
    const hashInput = `${uuid}-${timestamp}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
    const id = hash.slice(0, 15);
    const _id = "ws-" + id;
  
    try {
      const workspace = new Workspace({
        _id: _id,
        name,
        description,
        commerce,
        cms,
        payment,
        composer_url,
        user_id: req.userId
      });
  
      await workspace.save();
      res.status(201).json({ msg: 'Workspace created successfully' });
    } catch (error) {
      return res.status(500).json({ msg: 'Server error', error: error.message });
    }
}

exports.userAllWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({ user_id: req.userId });
        
        if (!workspaces.length) {
          return res.status(404).json({ msg: 'No workspaces found' });
        }
    
        res.json(workspaces);
      } catch (error) {
        return res.status(500).json({ msg: 'Server error', error: error.message });
      }
}

exports.individualWorkspace = async (req, res) => {
    try {
        const workspaces = await Workspace.find({ _id: req.params.id, user_id: req.userId });
        
        if (!workspaces.length) {
          return res.status(404).json({ msg: 'No workspaces found' });
        }
    
        res.json(workspaces);
      } catch (error) {
        return res.status(500).json({ msg: 'Server error', error: error.message });
      }
}

exports.updateWorkspace = async (req, res) => {
    const { name, description, commerce, cms, payment, composer_url } = req.body;

    const updates = { name, description, commerce, cms, payment, composer_url };
  
    try {
      const workspace = await Workspace.findOne({ _id: req.params.id, user_id: req.userId });
      
      if (!workspace) {
        return res.status(404).json({ msg: 'Workspace not found' });
      }
  
      if (commerce && commerce.name && !['emporix', 'shopify'].includes(commerce.name)) {
        return res.status(400).json({ msg: 'Invalid commerce name. Allowed values: emporix, shopify' });
      }
  
      const updatedWorkspace = await Workspace.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
      res.json(updatedWorkspace);
    } catch (error) {
      return res.status(500).json({ msg: 'Server error', error: error.message });
    }
}

exports.deleteWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    
        if (!workspace) {
          return res.status(404).json({ msg: 'Workspace not found' });
        }
    
        res.json({ msg: 'Workspace deleted successfully' });
      } catch (error) {
        return res.status(500).json({ msg: 'Server error', error: error.message });
      }
}
