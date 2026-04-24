function buildScopedVoterKey(voterId, electionId) {
  return `${electionId}:${voterId}`;
}

module.exports = {
  buildScopedVoterKey,
};
