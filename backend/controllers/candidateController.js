const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const getContract = require("../config/blockchain");  // ← lazy loader

exports.registerCandidate = async (req, res) => {
  try {
    const { name, party, electionId } = req.body;

    if (!name || !party || !electionId) {
      return res.status(400).json({
        message: "Name, party, and electionId are required"
      });
    }

    const contract = getContract();  // ← only connects when this endpoint is called

    let blockchainId = null;

    try {
      const tx = await contract.addCandidate(name);
      const receipt = await tx.wait();

      const event = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(e => e && e.name === "CandidateAdded");

      if (event) {
        blockchainId = Number(event.args.id);
      } else {
        throw new Error("CandidateAdded event not found");
      }

    } catch (blockchainError) {
      return res.status(500).json({
        message: "Blockchain registration failed",
        error: blockchainError.message
      });
    }

    const newCandidate = new Candidate({
      name,
      party,
      electionId,
      blockchainId
    });

    await newCandidate.save();

    await Election.findByIdAndUpdate(electionId, {
      $push: { candidates: newCandidate._id }
    });

    res.status(201).json({
      message: "Candidate registered successfully",
      candidate: newCandidate,
      blockchainSynced: true
    });

  } catch (error) {
    res.status(500).json({
      message: "Error registering candidate",
      error: error.message
    });
  }
};

exports.getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.query;

    if (!electionId) {
      return res.status(400).json({ message: "electionId query param is required" });
    }

    const candidates = await Candidate.find({ electionId });

    res.status(200).json({
      message: "Candidates fetched successfully",
      candidates
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching candidates",
      error: error.message
    });
  }
};