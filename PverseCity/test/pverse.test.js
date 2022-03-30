const Pverse = artifacts.require("./Pverse")

require('chai')
    .use(require('chai-as-promised'))
    .should() 

const EVM_REVERT = 'VM Exception while processing transaction: revert'

contract('Pverse', ([owner1, owner2]) => {

    const NAME = 'Pverse City'
    const SYMBOL = 'PVC'
    const COST = web3.utils.toWei('100000', 'ether')

    let pverse, result

    beforeEach(async () => {
        pverse = await Pverse.new(NAME, SYMBOL, COST)
    })

    describe('Deployment', () => {
        it('Returns the contract name', async () => {
            result = await pverse.name()
            result.should.equal(NAME)
        })

        it('Returns the symbol', async () => {
            result = await pverse.symbol()
            result.should.equal(SYMBOL)
        })

        it('Returns the cost to mint', async () => {
            result = await pverse.cost()
            result.toString().should.equal(COST)
        })

        it('Returns the max supply', async () => {
            result = await pverse.maxSupply()
            result.toString().should.equal('31')
        })

        it('Returns the number of buildings/land available', async () => {
            result = await pverse.getBuildings()
            result.length.should.equal(31)
        })
    })

    describe('Minting', () => {
        describe('Success', () => {
            beforeEach(async () => {
                result = await pverse.mint(1, { from: owner1, value: COST })
            })

            it('Updates the owner address', async () => {
                result = await pverse.ownerOf(1)
                result.should.equal(owner1)
            })

            it('Updates building details', async () => {
                result = await pverse.getBuilding(1)
                result.owner.should.equal(owner1)
            })
        })

        describe('Failure', () => {
            it('Prevents mint with 0 value', async () => {
                await pverse.mint(1, { from: owner1, value: 0 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('Prevents mint with invalid ID', async () => {
                await pverse.mint(100, { from: owner1, value: 1 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('Prevents minting if already owned', async () => {
                await pverse.mint(1, { from: owner1, value: COST })
                await pverse.mint(1, { from: owner2, value: COST }).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('Transfers', () => {
        describe('success', () => {
            beforeEach(async () => {
                await pverse.mint(1, { from: owner1, value: COST })
                await pverse.approve(owner2, 1, { from: owner1 })
                await pverse.transferFrom(owner1, owner2, 1, { from: owner2 })
            })

            it('Updates the owner address', async () => {
                result = await pverse.ownerOf(1)
                result.should.equal(owner2)
            })

            it('Updates building details', async () => {
                result = await pverse.getBuilding(1)
                result.owner.should.equal(owner2)
            })
        })

        describe('failure', () => {
            it('Prevents transfers without ownership', async () => {
                await pverse.transferFrom(owner1, owner2, 1, { from: owner2 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('Prevents transfers without approval', async () => {
                await pverse.mint(1, { from: owner1, value: COST })
                await pverse.transferFrom(owner1, owner2, 1, { from: owner2 }).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })
})

    




