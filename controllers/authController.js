const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');

exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
    
        if (!user) {
          return res.status(404).json({ msg: 'User not found' });
        }
    
        res.json(user);
      } catch (error) {
        return res.status(500).json({ msg: 'Server error', error: error.message });
      }
};


exports.registerUser = async (req, res) => {
  const { full_name, username, email, password, phone_number, is_active } = req.body;

  if (!full_name || !username || !email || !password || !phone_number) {
    return res.status(400).json({ msg: 'Please fill in all fields' });
  }

  try {
    let user = await User.findOne({ $or: [{ email }, { username }, {phone_number}] });
    if (user) {
      return res.status(400).json({ msg: 'Username or email or Phone Number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const uuid = crypto.randomUUID();
    const timestamp = Date.now().toString(36);
    const hashInput = `${uuid}-${timestamp}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
    const _id = hash.slice(0, 15);

    user = new User({
      _id,
      full_name,
      username,
      email,
      password: hashedPassword,
      phone_number,
      is_active: is_active || true 
    });

    await user.save();
    res.status(201).json({ msg: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Please provide username and password' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.userId);

    if (!deletedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ msg: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server error', error: error.message });
  }
}