const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/requireAdmin");

const {
  registerCandidate,
  getCandidatesByElection,
  getAdminCandidatesByElection,
  updateCandidateApproval,
} = require("../controllers/candidateController");

router.post("/", registerCandidate);
router.get("/", getCandidatesByElection);
router.get("/admin", requireAdmin, getAdminCandidatesByElection);
router.patch("/:id/approval", requireAdmin, updateCandidateApproval);

module.exports = router;
