const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voter",
    required: true
  },

  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true
  },

  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true
  },

  // 🔥 IMPORTANT: blockchain traceability
  txHash: {
    type: String,
    required: true
  },

  // optional but useful for debugging
  status: {
    type: String,
    enum: ["pending", "confirmed", "failed"],
    default: "confirmed"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Vote", voteSchema);