const Voter = require("../models/Voter");

exports.registerVoter = async (req, res) => {
  try {
    let { name, email, aadharNumber, dateOfBirth } = req.body;

    if (!name || !email || !aadharNumber || !dateOfBirth) {
      return res.status(400).json({
        message: "Name, email, aadharNumber, and date of birth are required"
      });
    }

    if (!/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        message: "Aadhar number must be exactly 12 digits"
      });
    }

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      return res.status(400).json({
        message: "Invalid date of birth format"
      });
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.status(403).json({
        message: "Voter must be at least 18 years old to register"
      });
    }

    if (dob > today) {
      return res.status(400).json({
        message: "Date of birth cannot be in the future"
      });
    }

    email = email.toLowerCase().trim();
    aadharNumber = aadharNumber.trim();

    const existingEmail = await Voter.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const existingAadhar = await Voter.findOne({ aadharNumber });
    if (existingAadhar) {
      return res.status(400).json({
        message: "Aadhar number already registered"
      });
    }

    const voter = new Voter({
      name: name.trim(),
      email,
      aadharNumber,
      dateOfBirth: dob,
      age,
      votedElections: []
    });

    await voter.save();

    res.status(201).json({
      message: "Voter registered successfully",
      voter
    });
  } catch (error) {
    console.error("Voter registration error:", error);
    res.status(500).json({
      message: "Error registering voter",
      error: error.message
    });
  }
};

exports.getVoterByAadhar = async (req, res) => {
  try {
    const { aadharNumber } = req.query;

    if (!aadharNumber) {
      return res.status(400).json({
        message: "aadharNumber query parameter is required"
      });
    }

    if (!/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        message: "Aadhar number must be exactly 12 digits"
      });
    }

    const voter = await Voter.findOne({
      aadharNumber: aadharNumber.trim()
    });

    if (!voter) {
      return res.status(404).json({
        message: "Voter not found with this Aadhar number"
      });
    }

    res.status(200).json({
      message: "Voter found",
      voter
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching voter",
      error: error.message
    });
  }
};