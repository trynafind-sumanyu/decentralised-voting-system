const express = require("express");
const router = express.Router();

const { castVote } = require("../controllers/voteController");

// cast vote
router.post("/", castVote);

module.exports = router;