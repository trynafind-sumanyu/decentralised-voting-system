const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

let contract = null;

function getContract() {
  if (contract) return contract;

  const network = process.env.NETWORK || "amoy";

  let provider, contractAddress;

  // 🔥 NETWORK SWITCH
  if (network === "amoy") {
    provider = new ethers.JsonRpcProvider(process.env.RPC_URL_AMOY);
    contractAddress = process.env.AMOY_CONTRACT_ADDRESS;

  } else {
    // LOCAL
    provider = new ethers.JsonRpcProvider(process.env.RPC_URL_LOCAL);

    const filePath = path.join(__dirname, "../../blockchain/deployedAddress.json");

    if (!fs.existsSync(filePath)) {
      throw new Error("deployedAddress.json not found. Deploy locally first.");
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    contractAddress = data.address;
  }

  // 🔐 Wallet (same for both)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // 📜 ABI
  const contractABI = require("../abi/Voting.json").abi;

  contract = new ethers.Contract(contractAddress, contractABI, wallet);

  console.log(`Connected to ${network} contract at: ${contractAddress}`);

  return contract;
}

module.exports = getContract;