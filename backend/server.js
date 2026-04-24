const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// routes
const electionRoutes = require("./routes/electionRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const voterRoutes = require("./routes/voterRoutes");

// blockchain init
const contract = require("./config/blockchain.js");

const app = express();

// middleware
app.use(cors());           // ✅ FIX: allow frontend requests
app.use(express.json());

// DB connect
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

// routes
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/voters", voterRoutes);
app.use("/api/votes", voteRoutes);

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});