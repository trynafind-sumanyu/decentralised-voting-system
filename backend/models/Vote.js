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

  // Important for blockchain traceability.
  txHash: {
    type: String,
    required: true
  },

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

voteSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
