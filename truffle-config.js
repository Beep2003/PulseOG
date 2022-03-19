const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     
      port: 7545,            
      network_id: "*",       
    },
    testnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`),
      network_id: 3,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    testnetbsc: {
      provider: () => new HDWalletProvider(mnemonic, `https://data-seed-prebsc-1-s1.binance.org:8545/`),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    testnetpulsev2: {
      provider: () => new HDWalletProvider(mnemonic, `https://rpc.v2.testnet.pulsechain.com`),
      network_id: 940,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    testnetpulsev2b: {
      provider: () => new HDWalletProvider(mnemonic, `https://rpc.v2b.testnet.pulsechain.com`),
      network_id: 941,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },

  
  },

  mocha: {
    // timeout: 100000
  },

  
  compilers: {
    solc: {
      version: "0.8.9", 
    }
  }
}