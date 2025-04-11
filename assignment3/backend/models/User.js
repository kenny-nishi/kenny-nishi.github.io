// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  hashed_password: {
    type: String,
    required: true
  },
  profileImageUrl: {
    type: String,
    required: true
  },
  favorites: [{
    id: {
      type: String,
    },
    image: {
      type: String,
    },
    name: {
      type: String,
    },
    nationality: {
      type: String,
    },
    birthday: {
      type: String,
    },
    deathday: {
      type: String,
    },
    biography: {
      type: String,
    },
    addedAt: {
      type: Date,
    }
  }]
});

module.exports = mongoose.model('User', userSchema,'user_info');