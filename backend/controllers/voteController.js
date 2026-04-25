const Vote = require("../models/Vote");
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const getContract = require("../config/blockchain");
const { getElectionStatus, isElectionOpen } = require("../utils/electionStatus");
const { buildScopedVoterKey } = require("../utils/voteScope");

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
    const scopedVoterKey = buildScopedVoterKey(voterId.toString(), electionId.toString());

    let tx = null;
    try {
      tx = await contract.vote(scopedVoterKey, chainCandidateId);
      await tx.wait();
    } catch (blockchainError) {
      // ✅ Non-blocking: log error but don't fail the vote
      console.warn("Blockchain vote failed (non-blocking):", blockchainError.message);
    }

    const vote = new Vote({
      voterId,
      candidateId,
      electionId,
      txHash: tx ? tx.hash : "pending",
    });
    await vote.save();

    const candidateLabel = candidate.isNOTA
      ? "None of the Above (NOTA)"
      : `${candidate.name} (${candidate.party || "Independent"})`;

    voter.votedElections.push({
      electionId,
      txHash: tx ? tx.hash : "pending",
      candidateName: candidateLabel,
      votedAt: new Date(),
    });
    await voter.save();

    election.status = currentStatus;
    await election.save();

    res.status(201).json({
      message: "Vote cast successfully",
      txHash: tx ? tx.hash : "pending",
      candidateName: candidateLabel,
      vote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error casting vote",
      error: error.message,
    });
  }
};