const Soulverse = artifacts.require("Soulverse");
const BN = web3.utils.BN;
const truffleAssert = require('truffle-assertions');

contract("Soulverse", function (accounts) {
  let soulverse;
  let owner = accounts[0];
  let operator = accounts[1];
  let recipient = accounts[2];

  beforeEach(async () => {
    soulverse = await Soulverse.new();
  });

  it("should have the correct initial supply", async () => {
    const expectedSupply = web3.utils.toWei("21000000000", "ether");
    const actualSupply = await soulverse.FIXED_SUPPLY();
    assert.equal(actualSupply.toString(), expectedSupply);
  });

  it("should set the operator correctly", async () => {
    await soulverse.setOperator(operator, { from: owner });
    const actualOperator = await soulverse.operator();
    assert.equal(actualOperator, operator);
  });

//it("should burn tokens successfully", async () => {
// const initialBalanceBN = new web3.utils.BN(initialBalance);
// const burnAmountBN = new web3.utils.BN(burnAmount);

// const expectedBalance = initialBalanceBN.sub(burnAmountBN).toString();
// assert.equal(newBalance.toString(), expectedBalance);

//});

it("should burn tokens successfully", async function () {
  const burnAmount = web3.utils.toWei("1000", "ether");
  const initialBalance = new BN(await soulverse.balanceOf(owner));

  await soulverse.burn(burnAmount, { from: owner });

  const newBalance = new BN(await soulverse.balanceOf(owner));
  const expectedNewBalance = initialBalance.sub(new BN(burnAmount));

  assert.equal(newBalance.toString(), expectedNewBalance.toString());
});


  it("should set the transfer limit correctly", async () => {
    const transferLimit = web3.utils.toWei("10000", "ether");
    await soulverse.setTransferLimit(transferLimit, { from: owner });
    const actualTransferLimit = await soulverse.transferLimit();
    assert.equal(actualTransferLimit.toString(), transferLimit);
  });

  it("should whitelist an account correctly", async () => {
    await soulverse.whitelistAccount(recipient, { from: owner });
    const isWhitelisted = await soulverse.isWhitelisted(recipient);
    assert.equal(isWhitelisted, true);
  });

  it("should unwhitelist an account correctly", async () => {
    await soulverse.whitelistAccount(recipient, { from: owner });
    await soulverse.unWhitelistAccount(recipient, { from: owner });
    const isWhitelisted = await soulverse.isWhitelisted(recipient);
    assert.equal(isWhitelisted, false);
  });

  it("should not allow unauthorized accounts to whitelist", async () => {
    try {
        await soulverse.whitelistAccount(operator, { from: recipient });
        assert.fail("Expected a revert due to unauthorized access");
    } catch (error) {
        assert.include(error.message, "revert", "Expected a revert for unauthorized");
    }
  });

  it("should not allow unauthorized accounts to unwhitelist", async () => {
    try {
        await soulverse.unWhitelistAccount(operator, { from: recipient });
        assert.fail("Expected a revert due to unauthorized access");
    } catch (error) {
        assert.include(error.message, "revert", "Expected a revert for unauthorized");
    }
  });
  

  it("should blacklist and unblacklist accounts correctly", async () => {
    await soulverse.blacklistAccount(recipient, { from: owner });
    const isBlacklistedAfter = await soulverse.isBlacklisted(recipient);
    assert.equal(isBlacklistedAfter, true);

    await soulverse.unBlacklistAccount(recipient, { from: owner });
    const isBlacklistedAfterRemoval = await soulverse.isBlacklisted(recipient);
    assert.equal(isBlacklistedAfterRemoval, false);
  });

  it("should transfer tokens successfully within limits", async () => {
    const transferAmount = web3.utils.toWei("1000", "ether");
    await soulverse.transfer(recipient, transferAmount, { from: owner });
    const recipientBalance = await soulverse.balanceOf(recipient);
    assert.equal(recipientBalance.toString(), transferAmount);
  });

  it("should transfer tokens successfully from an approved allowance within limits", async () => {
    const allowanceAmount = web3.utils.toWei("1000", "ether");
    await soulverse.approve(operator, allowanceAmount, { from: owner });
    await soulverse.transferFrom(owner, recipient, allowanceAmount, { from: operator });
    const recipientBalance = await soulverse.balanceOf(recipient);
    assert.equal(recipientBalance.toString(), allowanceAmount);
  });

  it("should not transfer tokens below the minimum wallet holding", async () => {
    const transferAmount = web3.utils.toWei("50", "ether");  
    await soulverse.approve(operator, transferAmount, { from: owner });
    await truffleAssert.reverts(
        soulverse.transferFrom(owner, recipient, transferAmount, { from: operator }),
        "Amount below minimum per wallet"
    );
});


  it("should not transfer tokens exceeding the maximum wallet holding", async () => {
    const transferAmount = web3.utils.toWei("1100000", "ether");
    await truffleAssert.reverts(
      soulverse.transfer(recipient, transferAmount, { from: owner }),
      "Amount exceeds maximum per wallet"
    );
  });
});
