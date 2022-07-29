require("@nomiclabs/hardhat-waffle");

module.exports = {
  networks: {
    testnet: {
      chainId: 941,
      url: "https://rpc.v2b.testnet.pulsechain.com",
      accounts: (process.env.PKEYS || '').split(','),
      gasPrice: 50000000000,
    },
    
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    artifacts: "./src/artifacts",
    sources: "./src/contracts",
    cache: "./src/cache",
    tests: "./src/test"

  },
  mocha: {
    timeout: 40000
  }
}