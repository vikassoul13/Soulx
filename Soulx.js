const { expect } = require("chai");

describe("Soulverse", function () {
  let soulverse;
  let owner;
  let operator;
  let recipient;

  beforeEach(async function () {
    const Soulverse = await ethers.getContractFactory("Soulverse");

    soulverse = await Soulverse.deploy();
    await soulverse.deployed();

    [owner, operator, recipient] = await ethers.getSigners();
  });

  it("should have the correct initial supply", async function () {
    const expectedSupply = ethers.utils.parseEther("21000000000");
    const actualSupply = await soulverse.FIXED_SUPPLY();

    expect(actualSupply).to.equal(expectedSupply);
  });

  it("should set the operator correctly", async function () {
    await soulverse.connect(owner).setOperator(operator.address);
    const actualOperator = await soulverse.operator();

    expect(actualOperator).to.equal(operator.address);
  });

  it("should burn tokens successfully", async function () {
    const burnAmount = ethers.utils.parseEther("1000");
    const initialBalance = await soulverse.balanceOf(owner.address);

    await soulverse.connect(owner).burn(burnAmount);

    const newBalance = await soulverse.balanceOf(owner.address);

    expect(newBalance).to.equal(initialBalance.sub(burnAmount));
  });

  it("should set the transfer limit correctly", async function () {
    const transferLimit = ethers.utils.parseEther("10000");

    await soulverse.connect(owner).setTransferLimit(transferLimit);
    const actualTransferLimit = await soulverse.transferLimit();

    expect(actualTransferLimit).to.equal(transferLimit);
  });

  it("should blacklist and unblacklist accounts correctly", async function () {
    const account = recipient.address;

    await soulverse.connect(owner).blacklistAccount(account);
    expect(await soulverse.isBlacklisted(account)).to.equal(true);

    await soulverse.connect(owner).unBlacklistAccount(account);
    expect(await soulverse.isBlacklisted(account)).to.equal(false);
  });

  it("should transfer tokens successfully within limits", async function () {
    const transferAmount = ethers.utils.parseEther("1000");

    await soulverse.transfer(recipient.address, transferAmount);
    const recipientBalance = await soulverse.balanceOf(recipient.address);

    expect(recipientBalance).to.equal(transferAmount);
  });

  it("should transfer tokens successfully from an approved allowance within limits", async function () {
    const allowanceAmount = ethers.utils.parseEther("1000");

    await soulverse.connect(owner).approve(operator.address, allowanceAmount);
    await soulverse.connect(operator).transferFrom(owner.address, recipient.address, allowanceAmount);
    const recipientBalance = await soulverse.balanceOf(recipient.address);

    expect(recipientBalance).to.equal(allowanceAmount);
  });

  it("should not transfer tokens below the minimum wallet holding", async function () {
    const transferAmount = ethers.utils.parseEther("50");

    await expect(soulverse.transfer(recipient.address, transferAmount)).to.be.revertedWith(
      "Amount below minimum per wallet"
    );
  });

  it("should not transfer tokens exceeding the maximum wallet holding", async function () {
    const transferAmount = ethers.utils.parseEther("1100000");

    await expect(soulverse.transfer(recipient.address, transferAmount)).to.be.revertedWith(
      "Amount exceeds maximum per wallet"
    );
  });
});
