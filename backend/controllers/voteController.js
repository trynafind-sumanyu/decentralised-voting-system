const Vote = require("../models/Vote");
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const getContract = require("../config/blockchain");  // ← changed to lazy loader

exports.castVote = async (req, res) => {
  try {
    const { voterId, candidateId, electionId } = req.body;

    // validation
    if (!voterId || !candidateId || !electionId) {
      return res.status(400).json({
        message: "voterId, candidateId, electionId are required"
      });
    }

    const contract = getContract();  // ← only connects now, not at startup

    // 1. check voter
    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }

    // 2. check if already voted
    if (voter.hasVoted) {
      return res.status(400).json({ message: "Voter has already cast their vote" });
    }

    // 3. check candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // 4. use blockchainId (NOT MongoDB ID)
    const chainCandidateId = candidate.blockchainId;
    if (!chainCandidateId) {
      return res.status(400).json({ message: "Candidate not registered on blockchain" });
    }

    // 5. blockchain vote
    let tx;
    try {
      tx = await contract.vote(voterId.toString(), chainCandidateId);
      await tx.wait();
    } catch (blockchainError) {
      return res.status(500).json({
        message: "Blockchain vote failed",
        error: blockchainError.message
      });
    }

    // 6. MongoDB audit log
    const vote = new Vote({
      voterId,
      candidateId,
      electionId,
      txHash: tx.hash
    });
    await vote.save();

    // 7. update voter state
    voter.hasVoted = true;
    voter.lastVotedTxHash = tx.hash;
    await voter.save();

    res.status(201).json({
      message: "Vote cast successfully",
      txHash: tx.hash,
      vote
    });

  } catch (error) {
    res.status(500).json({
      message: "Error casting vote",
      error: error.message
    });
  }
};