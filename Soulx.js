const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Soulverse", () => {
    let contract;
    let owner;
    let user1;
    let user2;
    let user3;
   
    async function setup() {
        const provider = await ethers.provider;
        contract = await ethers.getContractFactory("Soulverse");
        contract = await contract.deploy(provider);
        owner = provider.getSigner();
        user1 = ethers.Wallet.createRandom().address;
        user2 = ethers.Wallet.createRandom().address;
        user3 = ethers.Wallet.createRandom().address;
    }
    beforeEach(async () => {
        await setup();
    });
    it("should set the transfer limit", async () => {
        await contract.setTransferLimit(1000);
        expect(await contract.transferLimit()).to.equal(1000);
    });
    it("should allow transfer if the transfer limit is not set", async () => {
        await contract.transfer(user2, 100);
        const balance = await contract.balanceOf(user2);
        expect(balance).to.equal(100);
    });
    it("should not allow transfer if the transfer limit is reached", async () => {
        await contract.setTransferLimit(100);
        await contract.transfer(user2, 100);
        try {
            await contract.transfer(user2, 1);
        } catch (error) {
            expect(error.message).to.equal("SoulCoin: daily limit exceeds");
        }
    });
    it("should allow transfer if the sender is whitelisted", async () => {
        await contract.whitelistAccount(user1);
        await contract.transfer(user1, 1000);
        const balance = await contract.balanceOf(user1);
        expect(balance).to.equal(1000);
    });
    it("should not allow transfer if the recipient is blacklisted", async () => {
      await contract.blacklistAccount(user2);
      try {
          await contract.transfer(user1, 100);
      } catch (error) {
          expect(error.message).to.equal("SoulCoin: recipient is blacklisted");
      }
  });
    it("should allow transfer if the transfer is from the owner", async () => {
        await contract.transfer(user1, 100);
        const balance = await contract.balanceOf(user1);
        expect(balance).to.equal(100);
    });
    it("should not allow transfer if the transaction count for the user exceeds the limit", async () => {
        await contract.setTransferLimit(100);
        for (let i = 0; i < 100; i++) {
            await contract.transfer(user3, 1);
        }
        try {
            await contract.transfer(user3, 1);
        } catch (error) {
            expect(error.message).to.equal("SoulCoin: maximum transactions per day exceeded");
        }
    });
    it("should allow transfer after the daily transaction count is reset", async () => {
        await contract.resetDailyTransferCount();
        await contract.transfer(user3, 1);
        const balance = await contract.balanceOf(user3);
        expect(balance).to.equal(1);
    });


    it("should prevent transferring below minimum per wallet limit for non-whitelisted accounts", async () => {
      await contract.transfer(user2, 100); // Transfer some tokens to user2
      try {
          await contract.transfer(user2, 10); // Try to transfer below the minimum wallet holding
      } catch (error) {
          expect(error.message).to.equal("Sender balance will be below minimum per wallet");
      }
  });

  

  it("should prevent transferring to a blacklisted recipient", async () => {
      await contract.blacklistAccount(user2);
      try {
          await contract.transfer(user2, 100);
      } catch (error) {
          expect(error.message).to.equal("SoulCoin: recipient is blacklisted");
      }
  });

  

  
    
});
