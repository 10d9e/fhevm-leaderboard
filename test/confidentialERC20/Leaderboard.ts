import { expect } from "chai";
import { ethers } from "hardhat";

import { createInstances } from "../instance";
import { getSigners, initSigners } from "../signers";
import { deployEncryptedERC20Fixture } from "./Leaderboard.fixture";

describe("Leaderboard", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const contract = await deployEncryptedERC20Fixture();
    this.contractAddress = await contract.getAddress();
    this.leaderboard = contract;
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);
  });

  it("should add a new player", async function () {
    const score = this.instances.alice.encrypt32(1337);
    const transaction = await this.leaderboard.addPlayer(this.signers.alice.address, score);
    await transaction.wait();
    const player = await this.leaderboard.players(this.signers.alice.address);

    const decryptedScore = this.instances.alice.decrypt(this.contractAddress, player.score);
    console.log(decryptedScore);
    // Decrypt the total supply
    //expect(decryptedScore).to.equal(1337);
  });

  it("should add a new player", async function () {
    var transaction = await this.leaderboard.addPlayer(this.signers.alice.address, 10);
    await transaction.wait();
    transaction = await this.leaderboard.addPlayer(this.signers.bob.address, 100);
    await transaction.wait();
    transaction = await this.leaderboard.addPlayer(this.signers.carol.address, 70);
    await transaction.wait();
    transaction = await this.leaderboard.addPlayer(this.signers.dave.address, 4);
    await transaction.wait();
    transaction = await this.leaderboard.addPlayer(this.signers.eve.address, 7);
    await transaction.wait();

    const player = await this.leaderboard.players(this.signers.alice.address);
    // Decrypt the total supply
    expect(player.score).to.equal(10);

    let relativeScore = await this.leaderboard.getScoreRelativeToHighestScore();
    console.log(relativeScore);
    
  });



});