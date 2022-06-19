const PulseOG = artifacts.require("PulseOG");

module.exports = async function (deployer, network, accounts) {
  
  await deployer.deploy(PulseOG, "PulseOG", "POG", 18, "21000000000000000000000000");
  const pulseOG = await PulseOG.deployed()

};