const PulseOG = artifacts.require("PulseOG");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions'); 

// Start a test series named PulseOG, it will use 10 test accounts 
contract("PulseOG", async accounts => {
    // each it is a new test, and we name our first test initial supply
    it("initial supply", async () => {
        // wait until pulseog is deplyoed, store the results inside pulseOG
        // the result is a client to the Smart contract api
        pulseOG = await PulseOG.deployed();
        // call our totalSUpply function
        let supply = await pulseOG.totalSupply()

        // Assert that the supply matches what we set in migration
        assert.equal(supply.toNumber(), 5000000, "Initial supply was not the same as in migration")
        
    });

    it("minting", async() => {
        pulseOG = await PulseOG.deployed(); 

        // Let's use account 1 since that account should have 0 
        let intial_balance = await pulseOG.balanceOf(accounts[1]);

        // Let's verify the balance
        assert.equal(intial_balance.toNumber(), 0, "intial balance for account 1 should be 0")

        // Let's mint 100 tokens to the user and grab the balance again
        let totalSupply = await pulseOG.totalSupply();
        await pulseOG.mint(accounts[1], 100);
        // Grab the balance again to see what it is after calling mint
        let after_balance = await pulseOG.balanceOf(accounts[1]);
        let after_supply = await pulseOG.totalSupply();
        // Assert and check that they match
        assert.equal(after_balance.toNumber(), 100, "The balance after minting 100 should be 100")
        assert.equal(after_supply.toNumber(), totalSupply.toNumber()+100, "The totalSupply should have been increasesd")

        try {
            // Mint with address 0
            await pulseOG.mint('0x0000000000000000000000000000000000000000', 100);
        }catch(error){
            assert.equal(error.reason, "PulseOG: cannot mint to zero address", "Failed to stop minting on zero address")
        }
    })

    it("burning", async() => {
        pulseOG = await PulseOG.deployed();

        // Let's continue on account 1 since that account now has 100 tokens
        let initial_balance = await pulseOG.balanceOf(accounts[1]);

        // Burn to address 0 
        try{
            await pulseOG.burn('0x0000000000000000000000000000000000000000', 100);
        }catch(error){
            assert.equal(error.reason, "PulseOG: cannot burn from zero address", "Failed to notice burning on 0 address")
        }

        // Burn more than balance
        try {
            await pulseOG.burn(accounts[1], initial_balance+initial_balance);
        }catch(error){
            assert.equal(error.reason, "PulseOG: Cannot burn more than the account owns", "Failed to capture too big burns on an account")
        }

        let totalSupply = await pulseOG.totalSupply();
        try {
            await pulseOG.burn(accounts[1], initial_balance - 50);
        }catch(error){
            assert.fail(error);
        }

        let balance = await pulseOG.balanceOf(accounts[1]);


        // Make sure balance was reduced and that totalSupply reduced
        assert.equal(balance.toNumber(), initial_balance-50, "Burning 50 should reduce users balance")

        let newSupply = await pulseOG.totalSupply();

        assert.equal(newSupply.toNumber(), totalSupply.toNumber()-50, "Total supply not properly reduced")
    })

 it("transfering tokens", async() => {
        pulseOG = await PulseOG.deployed();

        // Grab initial balance
        let initial_balance = await pulseOG.balanceOf(accounts[1]);

        // transfer tokens from account 0 to 1 
        await pulseOG.transfer(accounts[1], 100);
        
        let after_balance = await pulseOG.balanceOf(accounts[1]);

        assert.equal(after_balance.toNumber(), initial_balance.toNumber()+100, "Balance should have increased on reciever")
    
        // We can change the msg.sender using the FROM value in function calls.
        let account2_initial_balance = await pulseOG.balanceOf(accounts[2]);

        await pulseOG.transfer(accounts[2], 20, { from: accounts[1]});
        // Make sure balances are switched on both accounts
        let account2_after_balance = await pulseOG.balanceOf(accounts[2]);
        let account1_after_balance = await pulseOG.balanceOf(accounts[1]);

        assert.equal(account1_after_balance.toNumber(), after_balance.toNumber()-20, "Should have reduced account 1 balance by 20");
        assert.equal(account2_after_balance.toNumber(), account2_initial_balance.toNumber()+20, "Should have givne accounts 2 20 tokens");
    

        // Try transfering too much
        try {
            await pulseOG.transfer(accounts[2], 2000000000000, { from:accounts[1]});
        }catch(error){
            assert.equal(error.reason, "PulseOG: cant transfer more than your account holds");
        }
       
    })

 it ("allow account some allowance", async() => {
        pulseOG = await PulseOG.deployed();

        
        try{
            // Give account(0) access too 100 tokens on creator
            await pulseOG.approve('0x0000000000000000000000000000000000000000', 100);    
        }catch(error){
            assert.equal(error.reason, 'PulseOG: approve cannot be to zero address', "Should be able to approve zero address");
        }

        try{
            // Give account 1 access too 100 tokens on zero account
            await pulseOG.approve(accounts[1], 100);    
        }catch(error){
            assert.fail(error); // shold not fail
        }

        // Verify by checking allowance
        let allowance = await pulseOG.allowance(accounts[0], accounts[1]);

        assert.equal(allowance.toNumber(), 100, "Allowance was not correctly inserted");
    })

    it("transfering with allowance", async() => {
        pulseOG = await PulseOG.deployed();

        try{
            // Account 1 should have 100 tokens by now to use on account 0 
            // lets try using more 
            await pulseOG.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] } );
        }catch(error){

            assert.equal(error.reason, "PulseOG: You cannot spend that much on this account", "Failed to detect overspending")
        }
        let init_allowance = await pulseOG.allowance(accounts[0], accounts[1]);
        console.log("init balalnce: ", init_allowance.toNumber())
        try{
            // Account 1 should have 100 tokens by now to use on account 0 
            // lets try using more 
            let worked = await pulseOG.transferFrom(accounts[0], accounts[2], 50, {from:accounts[1]});
        }catch(error){
            assert.fail(error);
        }

        // Make sure allowance was changed
        let allowance = await pulseOG.allowance(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(), 50, "The allowance should have been decreased by 50")

        
    })



});