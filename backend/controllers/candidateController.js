const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const { registerCandidateOnBlockchain } = require("../utils/blockchainCandidate");
const { getElectionStatus } = require("../utils/electionStatus");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.registerCandidate = async (req, res) => {
  try {
    const { name, party, electionId } = req.body;

    if (!name || !party || !electionId) {
      return res.status(400).json({
        message: "Name, party, and electionId are required",
      });
    }

    const trimmedName = name.trim();
    const trimmedParty = party.trim();

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    const currentStatus = getElectionStatus(election.startDate, election.endDate);
    if (currentStatus === "completed") {
      return res.status(400).json({
        message: "Cannot register candidates for a completed election",
      });
    }

    const existingCandidate = await Candidate.findOne({
      electionId,
      name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
    });

    if (existingCandidate) {
      return res.status(409).json({
        message: "A candidate with this name is already registered for the election",
      });
    }

    let blockchainId;

    try {
      ({ blockchainId } = await registerCandidateOnBlockchain(trimmedName));
    } catch (blockchainError) {
      return res.status(500).json({
        message: "Blockchain registration failed",
        error: blockchainError.message,
      });
    }

    const newCandidate = new Candidate({
      name: trimmedName,
      party: trimmedParty,
      electionId,
      blockchainId,
    });

    await newCandidate.save();

    election.candidates.push(newCandidate._id);
    election.status = currentStatus;
    await election.save();

    res.status(201).json({
      message: "Candidate registered successfully",
      candidate: newCandidate,
      blockchainSynced: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering candidate",
      error: error.message,
    });
  }
};

exports.getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.query;

    if (!electionId) {
      return res.status(400).json({ message: "electionId query param is required" });
    }

    const candidates = await Candidate.find({ electionId }).sort({ isNOTA: 1, createdAt: 1 });

    res.status(200).json({
      message: "Candidates fetched successfully",
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching candidates",
      error: error.message,
    });
  }
};
