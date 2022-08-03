const Pverse = artifacts.require("Pverse")

module.exports = async function (deployer) {
    const NAME = 'Pverse City'
    const SYMBOL = 'PVC'
    const COST = web3.utils.toWei('1000000', 'ether')

    await deployer.deploy(Pverse, NAME, SYMBOL, COST)
}