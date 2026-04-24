const express = require("express");
const router = express.Router();

const {
  createElection,
  getAllElections,
  getElectionResults
} = require("../controllers/electionController");

// create election
router.post("/", createElection);

// get all elections
router.get("/", getAllElections);

// get election results
router.get("/:id/results", getElectionResults);

module.exports = router;