const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // ✅ FIX: party field was missing from schema but used in controller
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

  // maps MongoDB candidate → blockchain candidate
  blockchainId: {
    type: Number,
    default: null,
  },

  // Flag to identify "None of the Above" candidate
  isNOTA: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Candidate", candidateSchema);