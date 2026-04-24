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

    const newCandidate = new Candidate({
      name: trimmedName,
      party: trimmedParty,
      electionId,
      approvalStatus: "pending",
    });

    await newCandidate.save();

    election.candidates.push(newCandidate._id);
    election.status = currentStatus;
    await election.save();

    res.status(201).json({
      message: "Candidate registered successfully and is awaiting admin approval",
      candidate: newCandidate,
      blockchainSynced: false,
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

    const candidates = await Candidate.find({
      electionId,
      $or: [
        { isNOTA: true },
        { approvalStatus: "approved" },
      ],
    }).sort({ isNOTA: 1, createdAt: 1 });

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

exports.getAdminCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.query;

    if (!electionId) {
      return res.status(400).json({ message: "electionId query param is required" });
    }

    const candidates = await Candidate.find({ electionId }).sort({ isNOTA: 1, createdAt: 1 });

    res.status(200).json({
      message: "Admin candidates fetched successfully",
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching admin candidates",
      error: error.message,
    });
  }
};

exports.updateCandidateApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        message: "approvalStatus must be either approved or rejected",
      });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    if (candidate.isNOTA) {
      return res.status(400).json({
        message: "NOTA cannot be modified",
      });
    }

    if (approvalStatus === "approved" && !candidate.blockchainId) {
      try {
        const { blockchainId } = await registerCandidateOnBlockchain(candidate.name);
        candidate.blockchainId = blockchainId;
      } catch (blockchainError) {
        // ✅ FIX: Log blockchain error but don't block approval
        // Candidate is approved in DB even if blockchain sync fails
        console.warn("Blockchain sync failed (non-blocking):", blockchainError.message);
        candidate.blockchainId = null;
      }
    }

    candidate.approvalStatus = approvalStatus;
    candidate.approvedAt = approvalStatus === "approved" ? new Date() : null;
    candidate.approvedBy = approvalStatus === "approved" ? req.adminUser?.username || "admin" : null;
    await candidate.save();

    res.status(200).json({
      message: `Candidate ${approvalStatus} successfully`,
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating candidate approval",
      error: error.message,
    });
  }
};