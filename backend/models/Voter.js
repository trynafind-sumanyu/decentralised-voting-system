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
    match: /^\d{12}$/,
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

  votedElections: [
    {
      electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Election",
        required: true,
      },
      txHash: {
        type: String,
        required: true,
      },
      candidateName: {
        type: String,
        default: "",   // ✅ stores "Rahul Sharma (Independent)" for receipt display
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

voterSchema.index({ aadharNumber: 1 });
voterSchema.index({ email: 1 });
voterSchema.index({ _id: 1, "votedElections.electionId": 1 });

module.exports = mongoose.model("Voter", voterSchema);