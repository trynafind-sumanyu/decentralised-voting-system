const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  party: {
    type: String,
    trim: true,
    default: "",
  },

  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },

  blockchainId: {
    type: Number,
    default: null,
  },

  isNOTA: {
    type: Boolean,
    default: false,
  },

  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  approvedAt: {
    type: Date,
    default: null,
  },

  approvedBy: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

candidateSchema.index({ electionId: 1, approvalStatus: 1, createdAt: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);
