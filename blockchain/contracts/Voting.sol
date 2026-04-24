// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public admin;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public hasVoted;

    uint public candidatesCount;

    // EVENTS
    event CandidateAdded(uint id, string name);
    event Voted(address voter, uint candidateId);

    constructor() {
        admin = msg.sender;
    }

    function addCandidate(string memory _name) public {
        // require(msg.sender == admin, "Only admin allowed"); // Removed for testing

        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);

        emit CandidateAdded(candidatesCount, _name);
    }

    function vote(uint _candidateId) public {
        require(!hasVoted[msg.sender], "Already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit Voted(msg.sender, _candidateId);
    }

    // Get all candidates
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory result = new Candidate[](candidatesCount);

        for (uint i = 1; i <= candidatesCount; i++) {
            result[i - 1] = candidates[i];
        }

        return result;
    }
}