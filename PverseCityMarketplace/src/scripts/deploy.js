async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
   
 
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const Pverse = await ethers.getContractFactory("Pverse");
  
      const NAME = 'Pverse City'
      const SYMBOL = 'PVC'
      const COST = 1000000
  
   
    const marketplace = await Marketplace.deploy(1);
    const pverse = await Pverse.deploy(NAME, SYMBOL, COST);
    
    
   
    saveFrontendFiles(marketplace , "Marketplace");
    saveFrontendFiles(pverse , "Pverse");
  }
  
  function saveFrontendFiles(contract, name) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../../frontend/contractsData";
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    fs.writeFileSync(
      contractsDir + `/${name}-address.json`,
      JSON.stringify({ address: contract.address }, undefined, 2)
    );
  
    const contractArtifact = artifacts.readArtifactSync(name);
  
    fs.writeFileSync(
      contractsDir + `/${name}.json`,
      JSON.stringify(contractArtifact, null, 2)
    );
  }
  
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });