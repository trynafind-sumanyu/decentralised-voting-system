const getContract = require("../config/blockchain");

async function registerCandidateOnBlockchain(name) {
  const contract = getContract();
  const tx = await contract.addCandidate(name);
  const receipt = await tx.wait();

  const event = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch (error) {
        return null;
      }
    })
    .find((parsedEvent) => parsedEvent && parsedEvent.name === "CandidateAdded");

  if (!event) {
    throw new Error("CandidateAdded event not found");
  }

  return {
    blockchainId: Number(event.args.id),
    txHash: tx.hash,
  };
}

module.exports = {
  registerCandidateOnBlockchain,
};
