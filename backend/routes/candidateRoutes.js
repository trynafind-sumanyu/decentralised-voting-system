const express = require("express");
const router = express.Router();

const {
  registerCandidate,
  getCandidatesByElection,
} = require("../controllers/candidateController");

// create candidate
router.post("/", registerCandidate);

// ✅ NEW: get candidates for an election
// GET /api/candidates?electionId=<id>
router.get("/", getCandidatesByElection);

module.exports = router;