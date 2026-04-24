const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const getContract = require("../config/blockchain");
const { registerCandidateOnBlockchain } = require("../utils/blockchainCandidate");
const { getElectionStatus } = require("../utils/electionStatus");

exports.createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        message: "title, startDate, and endDate are required",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        message: "startDate and endDate must be valid dates",
      });
    }

    if (parsedEndDate <= parsedStartDate) {
      return res.status(400).json({
        message: "endDate must be after startDate",
      });
    }

    const election = await Election.create({
      title: title.trim(),
      description: description?.trim() || "",
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      status: getElectionStatus(parsedStartDate, parsedEndDate),
    });

    try {
      const { blockchainId } = await registerCandidateOnBlockchain("None of the Above");

      const noneOfAboveCandidate = await Candidate.create({
        name: "None of the Above",
        party: "NOTA",
        electionId: election._id,
        blockchainId,
        isNOTA: true,
        approvalStatus: "approved",
        approvedAt: new Date(),
        approvedBy: "system",
      });

      election.candidates.push(noneOfAboveCandidate._id);
      await election.save();
    } catch (error) {
      await Candidate.deleteMany({ electionId: election._id });
      await Election.deleteOne({ _id: election._id });
      throw error;
    }

    res.status(201).json({
      message: "Election created successfully",
      data: election,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating election",
      error: err.message,
    });
  }
};

exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: 1 });
    const data = elections.map((election) => ({
      ...election.toObject(),
      status: getElectionStatus(election.startDate, election.endDate),
    }));

    res.status(200).json({
      message: "All elections fetched successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching elections",
      error: err.message,
    });
  }
};

exports.getElectionResults = async (req, res) => {
  try {
    const electionId = req.params.id;
    const candidates = await Candidate.find({
      electionId,
      $or: [
        { isNOTA: true },
        { approvalStatus: "approved" },
      ],
    });

    if (!candidates.length) {
      return res.status(404).json({
        message: "No candidates found for this election",
      });
    }

    const contract = getContract();
    const chainCandidates = await contract.getAllCandidates();

    const results = candidates.map((candidate) => {
      let voteCount = 0;

      if (candidate.blockchainId !== null && chainCandidates[candidate.blockchainId - 1]) {
        voteCount = Number(chainCandidates[candidate.blockchainId - 1].voteCount);
      }

      return {
        id: candidate._id,
        blockchainId: candidate.blockchainId,
        name: candidate.name,
        party: candidate.party,
        voteCount,
      };
    });

    const ranking = results.sort((a, b) => b.voteCount - a.voteCount);

    res.status(200).json({
      message: "Election results fetched successfully",
      winner: ranking[0],
      ranking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching election results",
      error: error.message,
    });
  }
};
