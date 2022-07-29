const { expect } = require("chai"); 
const { parseEther } = require("ethers/lib/utils");

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("NFTMarketplace", function () {

  let Pverse;
  let pverse;
  let Marketplace;
  let marketplace
  let deployer;
  let addr1;
  let addr2;
  let addrs;
  let feePercent = 1;
  
  

  beforeEach(async function () {
    
    Pverse = await ethers.getContractFactory("Pverse");
    Marketplace = await ethers.getContractFactory("Marketplace");
    [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

    const NAME = 'Pverse City'
    const SYMBOL = 'PVC'
    const COST = 1

 
    pverse = await Pverse.deploy(NAME, SYMBOL, COST);
    marketplace = await Marketplace.deploy(feePercent);
  });

  describe("Deployment", function () {

    it("Should track name and symbol of the nft collection", async function () {
      
      const COST = 1
      const pverseName = "Pverse City"
      const pverseSymbol = "PVC"
      expect(await pverse.name()).to.equal(pverseName);
      expect(await pverse.symbol()).to.equal(pverseSymbol);
      expect(await pverse.cost()).to.equal(COST);
    });

    it("Should track feeAccount and feePercent of the marketplace", async function () {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    });


    it("Returns the max supply", async function () {
      expect(await pverse.maxSupply()).to.equal('31');
    });
})

describe("Minting NFTs", function () {
     
  it("Should track each minted NFT", async function () {
    const COST = 1
    await pverse.connect(addr1).mint(1, { value: COST})
    expect(await pverse.balanceOf(addr1.address)).to.equal(1);
    expect(await pverse.tokenURI(1)).to.equal('ipfs://QmR5Uq7z87zp4vNKauBgLGAYuXXfZskbr2mAecVRPp6dNE/1.json');

     
     await pverse.connect(addr2).mint(2, { value: COST})
     expect(await pverse.balanceOf(addr2.address)).to.equal(1);
     expect(await pverse.tokenURI(2)).to.equal('ipfs://QmR5Uq7z87zp4vNKauBgLGAYuXXfZskbr2mAecVRPp6dNE/2.json');
  });
})

describe("listing marketplace items", function () {
  let price = 1
  let result 
  beforeEach(async function () {
    const COST = 1
    
    await pverse.connect(addr1).mint(1, { value: COST})
    
    await pverse.connect(addr1).setApprovalForAll(marketplace.address, true)
  })

  it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function () {
    const COST = 1
    
    await expect(marketplace.connect(addr1).listItem(pverse.address, 1 , toWei(price)))
      .to.emit(marketplace, "Offered")
      .withArgs(
        1,
        pverse.address,
        1,
        toWei(price),
        addr1.address
      )
    
    expect(await pverse.ownerOf(1)).to.equal(marketplace.address);
    
    expect(await marketplace.itemCount()).to.equal(1)
    
    const item = await marketplace.items(1)
    expect(item.itemId).to.equal(1)
    expect(item.pverse).to.equal(pverse.address)
    expect(item.tokenId).to.equal(1)
    expect(item.price).to.equal(toWei(price))
    expect(item.sold).to.equal(false)
  });

  it("Should fail if price is set to zero", async function () {
    await expect(
      marketplace.connect(addr1).listItem(pverse.address, 1, 0)
    ).to.be.revertedWith("Price must be greater than zero");
  });

 });
 
 describe("Purchasing marketplace items", function () {
  let price = 2
  let fee = (feePercent/100)*price
  let totalPriceInWei
  beforeEach(async function () {
    const COST = 1
    
    await pverse.connect(addr1).mint(1, { value: COST})
    
    await pverse.connect(addr1).setApprovalForAll(marketplace.address, true)
    
    await marketplace.connect(addr1).listItem(pverse.address, 1 , toWei(price))
  
  })
  it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function () {
    const sellerInitalEthBal = await addr1.getBalance()
    const feeAccountInitialEthBal = await deployer.getBalance()
    
    totalPriceInWei = await marketplace.getTotalPrice(1);
    
    await expect(marketplace.connect(addr2).purchaseItem(1, {value: totalPriceInWei}))
    .to.emit(marketplace, "Bought")
      .withArgs(
        1,
        pverse.address,
        1,
        toWei(price),
        addr1.address,
        addr2.address
      )
    const sellerFinalEthBal = await addr1.getBalance()
    const feeAccountFinalEthBal = await deployer.getBalance()
    
    expect((await marketplace.items(1)).sold).to.equal(true)
    
    expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitalEthBal))
    
    expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + +fromWei(feeAccountInitialEthBal))
    
    expect(await pverse.ownerOf(1)).to.equal(addr2.address);
  })
  it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
    
    await expect(
      marketplace.connect(addr2).purchaseItem(2, {value: totalPriceInWei})
    ).to.be.revertedWith("item doesn't exist");
    await expect(
      marketplace.connect(addr2).purchaseItem(0, {value: totalPriceInWei})
    ).to.be.revertedWith("item doesn't exist");
    
    await expect(
      marketplace.connect(addr2).purchaseItem(1, {value: toWei(price)})
    ).to.be.revertedWith("not enough ether to cover item price and market fee"); 
    
    await marketplace.connect(addr2).purchaseItem(1, {value: totalPriceInWei})
    
    const addr3 = addrs[0]
    await expect(
      marketplace.connect(addr3).purchaseItem(1, {value: totalPriceInWei})
    ).to.be.revertedWith("item already sold");
  });
})
})
