const mongoose = require('mongoose');
const { Schema } = mongoose;

const workspaceSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  commerce: {
    name: {
      type: String,
      required: true,
      enum: ['VENDURE', 'SHOPIFY']
    },
    creds: {
      type: Object,
      required: true
    }
  },
  cms: {
    type: Object,
    required: true
  },
  payment: {
    type: Object,
    required: true
  },
  composer_url: {
    type: String,
    required: true,
    default: 'https://universalcomposer.com'
  },
  user_id: {
    type: String,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
