require("@nomiclabs/hardhat-waffle");

module.exports = {
  networks: {
    mainnet: {
      chainId: 369,
      url: "https://rpc.pulsechain.com",
      accounts: (process.env.PKEYS || '').split(','),
      gasPrice: 50000000000,
    },
    
  },
  solidity: {
    version: "0.8.9",
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