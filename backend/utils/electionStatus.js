function getElectionStatus(startDate, endDate, now = new Date()) {
  if (now < startDate) {
    return "upcoming";
  }

  if (now > endDate) {
    return "completed";
  }

  return "active";
}

function isElectionOpen(election, now = new Date()) {
  return now >= election.startDate && now <= election.endDate;
}

module.exports = {
  getElectionStatus,
  isElectionOpen,
};
