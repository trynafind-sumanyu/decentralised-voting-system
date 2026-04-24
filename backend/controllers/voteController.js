const Vote = require("../models/Vote");
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const getContract = require("../config/blockchain");
const { getElectionStatus, isElectionOpen } = require("../utils/electionStatus");

exports.castVote = async (req, res) => {
  try {
    const { voterId, candidateId, electionId } = req.body;

    if (!voterId || !candidateId || !electionId) {
      return res.status(400).json({
        message: "voterId, candidateId, electionId are required",
      });
    }

    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }

    if (voter.hasVoted) {
      return res.status(400).json({ message: "Voter has already cast their vote" });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const currentStatus = getElectionStatus(election.startDate, election.endDate);
    if (!isElectionOpen(election)) {
      return res.status(400).json({
        message: `Voting is not open for this election. Current status: ${currentStatus}`,
      });
    }

    const existingVote = await Vote.findOne({ voterId, electionId });
    if (existingVote) {
      return res.status(409).json({ message: "Voter has already voted in this election" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.electionId.toString() !== electionId) {
      return res.status(400).json({ message: "Candidate does not belong to the selected election" });
    }

    const chainCandidateId = Number(candidate.blockchainId);
    if (!chainCandidateId) {
      return res.status(400).json({ message: "Candidate not registered on blockchain" });
    }

    const contract = getContract();

    let tx;
    try {
      tx = await contract.vote(voterId.toString(), chainCandidateId);
      await tx.wait();
    } catch (blockchainError) {
      return res.status(500).json({
        message: "Blockchain vote failed",
        error: blockchainError.message,
      });
    }

    const vote = new Vote({
      voterId,
      candidateId,
      electionId,
      txHash: tx.hash,
    });
    await vote.save();

    voter.hasVoted = true;
    voter.lastVotedTxHash = tx.hash;
    await voter.save();

    election.status = currentStatus;
    await election.save();

    res.status(201).json({
      message: "Vote cast successfully",
      txHash: tx.hash,
      vote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error casting vote",
      error: error.message,
    });
  }
};
