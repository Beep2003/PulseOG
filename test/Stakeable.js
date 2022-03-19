const PulseOG = artifacts.require("PulseOG");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const helper = require("./helpers/truffleTestHelpers");
contract("PulseOG", async accounts => {
    it("Staking 100x2", async () => {
        pulseOG = await PulseOG.deployed();

        // Stake 100 is used to stake 100 tokens twice and see that stake is added correctly and money burned
        let owner = accounts[0];
        // Set owner, user and a stake_amount
        let stake_amount = 100;
        // Add som tokens on account 1 asweel
        await pulseOG.mint(accounts[1], 1000);
        // Get init balance of user
        balance = await pulseOG.balanceOf(owner)

        // Stake the amount, notice the FROM parameter which specifes what the msg.sender address will be

        stakeID = await pulseOG.stake(stake_amount, { from: owner });
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
                assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
                assert.equal(ev.index, 1, "Stake index was not correct");
                return true;
            },
            "Stake event should have triggered");

        // Stake again on owner because we want hasStake test to assert summary
        stakeID = await pulseOG.stake(stake_amount, { from: owner });
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
                assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
                assert.equal(ev.index, 1, "Stake index was not correct");
                return true;
            },
            "Stake event should have triggered");
    

    });

    it("new stakeholder should have increased index", async () => {
        let stake_amount = 100;
        stakeID = await pulseOG.stake(stake_amount, { from: accounts[1] });
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
                assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
                assert.equal(ev.index, 2, "Stake index was not correct");
                return true;
            },
            "Stake event should have triggered");

        })

        it("cannot stake more than owning", async () => {

        // Stake too much on accounts[2]
        pulseOG = await PulseOG.deployed();

        try {
            await pulseOG.stake(1000000000, { from: accounts[2] });
        } catch (error) {
            assert.equal(error.reason, "PulseOG: Cannot stake more than you own");
        }
    });

    it("cant withdraw bigger amount than current stake", async() => {
        pulseOG = await PulseOG.deployed();

        let owner = accounts[0];

        // Try withdrawing 200 from first stake
        try {
            await pulseOG.withdrawStake(200, 0, {from:owner});
        }catch(error){
            assert.equal(error.reason, "Staking: Cannot withdraw more than you have staked", "Failed to notice a too big withdrawal from stake");
        }
    });

        it("withdraw 50 from a stake", async() => {
        pulseOG = await PulseOG.deployed();

        let owner = accounts[0];
        let withdraw_amount = 50;
        // Try withdrawing 50 from first stake
        await pulseOG.withdrawStake(withdraw_amount, 0, {from:owner});
        // Grab a new summary to see if the total amount has changed
        let summary = await pulseOG.hasStake(owner);

        assert.equal(summary.total_amount, 200-withdraw_amount, "The total staking amount should be 150");
        // Itterate all stakes and verify their amount aswell. 
        let stake_amount = summary.stakes[0].amount;

        assert.equal(stake_amount, 100-withdraw_amount, "Wrong Amount in first stake after withdrawal");
    });

        it("remove stake if empty", async() => {
        pulseOG = await PulseOG.deployed();

        let owner = accounts[0];
        let withdraw_amount = 50;
        // Try withdrawing 50 from first stake AGAIN, this should empty the first stake
        await pulseOG.withdrawStake(withdraw_amount, 0, {from:owner});
        // Grab a new summary to see if the total amount has changed
        let summary = await pulseOG.hasStake(owner);
        console.log(summary);

        assert.equal(summary.stakes[0].user, "0x0000000000000000000000000000000000000000", "Failed to remove stake when it was empty");
    });

        it("calculate rewards", async() => {
        pulseOG = await PulseOG.deployed();

        let owner = accounts[0];

        // Owner has 1 stake at this time, its the index 1 with 100 Tokens staked
        // So lets fast forward time by 20 Hours and see if we gain 2% reward
        const newBlock = await helper.advanceTimeAndBlock(3600*20);
        let summary = await pulseOG.hasStake(owner);

        
        let stake = summary.stakes[1];
        assert.equal(stake.claimable, 100*0.02, "Reward should be 2 after staking for twenty hours with 100")
        // Make a new Stake for 1000, fast forward 20 hours again, and make sure total stake reward is 24 (20+4)
        // Remember that the first 100 has been staked for 40 hours now, so its 4 in rewards.
        await pulseOG.stake(1000, {from: owner});
        await helper.advanceTimeAndBlock(3600*20);

        summary = await pulseOG.hasStake(owner);

        stake = summary.stakes[1];
        let newstake = summary.stakes[2];

        assert.equal(stake.claimable, (100*0.04), "Reward should be 4 after staking for 40 hours")
        assert.equal(newstake.claimable, (1000*0.02), "Reward should be 20 after staking 20 hours");
    });

        it("reward stakes", async() => {
        pulseOG = await PulseOG.deployed();
        // Use a fresh Account, Mint 1000 Tokens to it
        let staker = accounts[3];
        await pulseOG.mint(accounts[3],1000);
        let initial_balance = await pulseOG.balanceOf(staker);
        // Make a stake on 200, fast forward 20 hours, claim reward, amount should be Initial balanace +4
        await pulseOG.stake(200, {from: staker});
        await helper.advanceTimeAndBlock(3600*20);

        let stakeSummary = await pulseOG.hasStake(staker);
        let stake = stakeSummary.stakes[0];
        // Withdraw 100 from stake at index 0 
        await pulseOG.withdrawStake(100, 0, { from: staker});

        // Balance of account holder should be updated by 104 tokens
        let after_balance = await pulseOG.balanceOf(staker);

        let expected = 1000-200+100+Number(stake.claimable);
        assert.equal(after_balance.toNumber(), expected, "Failed to withdraw the stake correctly")
    
        // Claiming them again should not return any rewards since we reset timer
    
        try{
            await pulseOG.withdrawStake(100, 0 , {from:staker});
        }catch(error){
            assert.fail(error);
        }
        let second_balance = await pulseOG.balanceOf(staker);
        // we should have gained 100 this time.
        assert.equal(second_balance.toNumber(), after_balance.toNumber()+100, "Failed to reset timer second withdrawal reward")
    });
});