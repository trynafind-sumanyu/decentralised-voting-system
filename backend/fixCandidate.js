const mongoose = require('mongoose');
// require('dotenv').config(); // Commented out to avoid redaction
process.env.MONGO_URI = 'mongodb+srv://sumanyurajput2005_db_user:u9rZwixHgZ6HxyKT@cluster0.jeepvil.mongodb.net/?appName=Cluster0';
process.env.NETWORK = 'localhost';
process.env.LOCAL_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478c3';
process.env.RPC_URL_LOCAL = 'http://127.0.0.1:8545';
const Candidate = require('./models/Candidate');

async function fixCandidate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const candidateId = '69e83d217b83bbc4dc9e17eb';
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      console.log('Candidate not found');
      return;
    }

    if (candidate.blockchainId) {
      console.log('Candidate already has blockchainId:', candidate.blockchainId);
      return;
    }

    console.log('Registering candidate on blockchain:', candidate.name);

    const contract = require('./config/blockchain'); // Load after env set

    // Add to blockchain
    const tx = await contract.addCandidate(candidate.name);
    const receipt = await tx.wait();

    // Parse event
    const event = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find(e => e && e.name === 'CandidateAdded');

    if (event) {
      const blockchainId = Number(event.args.id);
      candidate.blockchainId = blockchainId;
      await candidate.save();
      console.log('Updated candidate with blockchainId:', blockchainId);
    } else {
      console.log('CandidateAdded event not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixCandidate();