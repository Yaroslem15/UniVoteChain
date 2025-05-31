// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./UniVoteCoin.sol";

contract UniVoteChain is Ownable {
    UniVoteCoin public uniVoteCoin;
    uint256 public voteCount;

    struct Vote {
        string name;
        string[] options;
        uint256[] optionVotes;
        mapping(address => bool) hasVoted;
        address[] allowedVoters;
        bool isActive;
        address creator;
    }

    mapping(uint256 => Vote) private _votes;
    mapping(address => bool) private _registeredUsers;

    event UserRegistered(address indexed user);
    event VoteCreated(uint256 indexed voteId, string name, address indexed creator);
    event Voted(uint256 indexed voteId, address indexed voter, uint256 optionIndex);
    event VoteStopped(uint256 indexed voteId);

    constructor(address _uniVoteCoin) Ownable(msg.sender) {
        uniVoteCoin = UniVoteCoin(_uniVoteCoin);
    }

    function register() external {
        require(!_registeredUsers[msg.sender], "User already registered");
        _registeredUsers[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }

    function registeredUsers(address user) external view returns (bool) {
        return _registeredUsers[user];
    }

    function createVote(
        string memory _name,
        string[] memory _options,
        address[] memory _allowedVoters
    ) external {
        require(_registeredUsers[msg.sender], "User not registered");
        require(_options.length >= 2, "At least two options required");
        require(_allowedVoters.length > 0, "At least one voter required");

        Vote storage newVote = _votes[voteCount];
        newVote.name = _name;
        newVote.options = _options;
        newVote.optionVotes = new uint256[](_options.length);
        newVote.allowedVoters = _allowedVoters;
        newVote.isActive = true;
        newVote.creator = msg.sender;

        emit VoteCreated(voteCount, _name, msg.sender);
        voteCount++;

        uniVoteCoin.mint(msg.sender, 20 * 10**18);
    }

    function vote(uint256 _voteId, uint256 _optionIndex) external {
        require(_voteId < voteCount, "Vote does not exist");
        Vote storage v = _votes[_voteId];
        require(v.isActive, "Vote is not active");
        require(_registeredUsers[msg.sender], "User not registered");
        require(!v.hasVoted[msg.sender], "User already voted");
        require(_optionIndex < v.options.length, "Invalid option");
        require(isAllowedVoter(_voteId, msg.sender), "Not allowed to vote");

        v.hasVoted[msg.sender] = true;
        v.optionVotes[_optionIndex]++;
        uniVoteCoin.mint(msg.sender, 10 * 10**18); 

        emit Voted(_voteId, msg.sender, _optionIndex);
    }

    function stopVote(uint256 _voteId) external {
        require(_voteId < voteCount, "Vote does not exist");
        Vote storage v = _votes[_voteId];
        require(v.creator == msg.sender, "Not vote creator");
        require(v.isActive, "Vote already stopped");
        v.isActive = false;

        uniVoteCoin.mint(msg.sender, 5 * 10**18); 

        emit VoteStopped(_voteId);
    }

    function isAllowedVoter(uint256 _voteId, address _voter) internal view returns (bool) {
        Vote storage v = _votes[_voteId];
        for (uint i = 0; i < v.allowedVoters.length; i++) {
            if (v.allowedVoters[i] == _voter) {
                return true;
            }
        }
        return false;
    }

    function getVoteDetails(uint256 _voteId)
        public
        view
        returns (
            string memory name,
            string[] memory options,
            uint256[] memory optionVotes,
            address[] memory allowedVoters,
            bool isActive,
            address creator
        ) {
        require(_voteId < voteCount, "Vote does not exist");
        Vote storage v = _votes[_voteId];
        return (v.name, v.options, v.optionVotes, v.allowedVoters, v.isActive, v.creator);
    }

    function getUserVoteStatus(uint256 _voteId, address _user)
        public
        view
        returns (bool hasVoted, bool isAllowed)
    {
        require(_voteId < voteCount, "Vote does not exist");
        Vote storage v = _votes[_voteId];
        bool voted = v.hasVoted[_user];
        bool allowed = false;
        for (uint i = 0; i < v.allowedVoters.length; i++) {
            if (v.allowedVoters[i] == _user) {
                allowed = true;
                break;
            }
        }
        return (voted, allowed);
    }
}

