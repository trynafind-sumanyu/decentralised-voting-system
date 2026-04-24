const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ["upcoming", "active", "completed"],
    default: "upcoming",
  },

  candidates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },
  ],

  // future-proof blockchain linkage
  blockchainElectionId: {
    type: Number,
    default: null,
  },

  // 🔥 optional but useful for audit/debugging
  contractAddress: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Election", electionSchema);