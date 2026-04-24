const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  aadharNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\d{12}$/, // Must be exactly 12 digits
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  dateOfBirth: {
    type: Date,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  hasVoted: {
    type: Boolean,
    default: false,
  },

  // 🔥 optional but useful for blockchain traceability
  lastVotedTxHash: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// 🔥 indexes for fast lookup (important for voting systems)
voterSchema.index({ aadharNumber: 1 });
voterSchema.index({ email: 1 });

module.exports = mongoose.model("Voter", voterSchema);