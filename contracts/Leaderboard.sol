// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "fhevm/abstracts/Reencrypt.sol";
import "fhevm/lib/TFHE.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract Leaderboard {

    struct Player {
        address user;
        euint32 score;
    }

    mapping(address => Player) public players;

    euint32 private highestScore = TFHE.asEuint32(0);

    // Function to add a player to the leaderboard
    function addPlayer(address _user, bytes calldata encryptedScore) public {
        euint32 score = TFHE.asEuint32(encryptedScore);
        ebool isAbove = TFHE.le(highestScore, score);
        highestScore = TFHE.cmux(isAbove, score, highestScore);

        // add player to leaderboard
        players[_user] = Player(_user, score);

    }

    // Function to get a player's score
    function getPlayerScore(address _user) public view returns (euint32) {
        require(msg.sender == _user, "Player score not registered");
        return players[_user].score;
    }

    // funcion to get the player's score in relation to the highest score
    function getScoreRelativeToHighestScore() public view returns (uint) {
        euint32 score = players[msg.sender].score;

        // cannot use div with euint32 divisor
        uint32 times = 0;
        euint32 highest = highestScore;
        bool timesBool = TFHE.decrypt(TFHE.gt(highest, 0));
        while (timesBool) {
            highest = TFHE.sub(highest, score);
            times++;
            timesBool = TFHE.decrypt(TFHE.gt(highest, 0));
        }

        return times * 10;
    }

}
