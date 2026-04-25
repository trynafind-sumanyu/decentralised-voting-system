const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();
const requireAdmin = require("../middleware/requireAdmin");

const {
  registerCandidate,
  getCandidatesByElection,
  getAdminCandidatesByElection,
  updateCandidateApproval,
} = require("../controllers/candidateController");

router.post("/", upload.single("photo"), registerCandidate);
router.get("/admin", requireAdmin, getAdminCandidatesByElection);
router.get("/", getCandidatesByElection);
router.patch("/:id/approval", requireAdmin, updateCandidateApproval);

module.exports = router;