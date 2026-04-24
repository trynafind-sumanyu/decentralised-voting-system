const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const getContract = require("../config/blockchain");  // ← lazy loader

exports.createElection = async (req, res) => {
  try {
    const election = await Election.create(req.body);

    // Automatically create "None of the Above" candidate
    const noneOfAboveCandidate = await Candidate.create({
      name: "None of the Above",
      party: "NOTA",
      electionId: election._id,
      isNOTA: true
    });

    // Add the candidate to the election's candidates array
    election.candidates.push(noneOfAboveCandidate._id);
    await election.save();

    res.status(201).json({
      message: "Election created successfully",
      data: election
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find();

    res.status(200).json({
      message: "All elections fetched successfully",
      data: elections
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getElectionResults = async (req, res) => {
  try {
    const electionId = req.params.id;

    // 1. get candidates from MongoDB
    const candidates = await Candidate.find({ electionId });

    if (!candidates.length) {
      return res.status(404).json({
        message: "No candidates found for this election",
      });
    }

    const contract = getContract();  // ← only connects when this endpoint is called

    // 2. get blockchain data
    const chainCandidates = await contract.getAllCandidates();

    // 3. map using blockchainId
    const results = candidates.map((c) => {
      let voteCount = 0;

      if (c.blockchainId !== null && chainCandidates[c.blockchainId - 1]) {
        voteCount = Number(chainCandidates[c.blockchainId - 1].voteCount);
      }

      return {
        id: c._id,
        blockchainId: c.blockchainId,
        name: c.name,
        party: c.party,
        voteCount
      };
    });

    // 4. sort by votes
    const sorted = results.sort((a, b) => b.voteCount - a.voteCount);
    const winner = sorted[0];

    res.status(200).json({
      message: "Election results fetched successfully",
      winner,
      ranking: sorted,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching election results",
      error: error.message,
    });
  }
};