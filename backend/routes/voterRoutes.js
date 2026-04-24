const express = require("express");
const router = express.Router();

const { registerVoter, getVoterByAadhar } = require("../controllers/voterController");

// register voter
router.post("/", registerVoter);

// ✅ look up voter by aadhar number (used for sign-in)
// GET /api/voters/lookup?aadharNumber=123456789012
router.get("/lookup", getVoterByAadhar);

module.exports = router;