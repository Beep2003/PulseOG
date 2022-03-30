// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Pverse is ERC721 {
    uint256 public cost = 100000 ether;
    uint256 public maxSupply = 31;
    uint256 public totalSupply = 0;

    struct Building {
        string name;
        address owner;
        int256 posX;
        int256 posY;
        int256 posZ;
        uint256 sizeX;
        uint256 sizeY;
        uint256 sizeZ;
    }

    Building[] public buildings;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost
    ) ERC721(_name, _symbol) {
        cost = _cost;

        buildings.push(
            Building("Pverse City Hall", address(0x0), 0, 0, 0, 10, 10, 10)
        );
        buildings.push(Building("PulseOG Hotel", address(0x0), 0, 10, 0, 10, 5, 3));
        buildings.push(
            Building("Bitcoin Center", address(0x0), 0, -10, 0, 10, 5, 3)
        );
        buildings.push(
            Building("Ethereum Kitten adoption ", address(0x0), 10, 0, 0, 5, 25, 5)
        );
        buildings.push(
            Building("PulseChain Mall", address(0x0), -10, 0, 0, 5, 25, 5)
        );

        buildings.push(
            Building("Richard Heart Statue", address(0x0), -20, 0, 0, 5, 25, 5)
        );

        buildings.push(
            Building("Pverse Sports Arena", address(0x0), -40, 10, 0, 5, 25, 5)
        );

        buildings.push(
            Building("Pverse Opera House", address(0x0), 20, 0, 0, 5, 25, 5)
        );

        buildings.push(
            Building("Mount Heartmore", address(0x0), 40, 10, 0, 5, 25, 5)
        );

        buildings.push(
            Building("Pverse Whole Foods", address(0x0), 50, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("PulseOG StakeHouse", address(0x0), 30, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Pverse Gentlemen's Club", address(0x0), -30, 0, 0, 10, 10, 10)
        );

         buildings.push(
            Building("Pulse Bridge", address(0x0), -50, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Hex luxury boutique", address(0x0), -40, -20, 0, 5, 25, 5)
        );

        buildings.push(
            Building("Pverse Weed Store", address(0x0), -40, -50, 0, 5, 25, 5)
        );

        buildings.push(
            Building("Reggae Island", address(0x0), 40, -50, 0, 5, 25, 5)
        );

         buildings.push(
            Building("Arthur Hayes Bank", address(0x0), 40, -20, 0, 5, 25, 5)
        );

        buildings.push(
            Building("Satoshi Nakamoto Boxing", address(0x0), 70, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Pverse Victoria Falls", address(0x0), -70, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Condominium", address(0x0), 90, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Church", address(0x0), -90, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Pulse Electric Cars", address(0x0), 110, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("The Grand Palace", address(0x0), -110, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Gang Hideout", address(0x0), 130, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Pverse Long Bay", address(0x0), -130, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Crack Head Strip Club", address(0x0), 150, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Chop Shop", address(0x0), -150, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Slum", address(0x0), 170, 0, 0, 10, 10, 10)
        );

        buildings.push(
            Building("Nuclear Power Plant", address(0x0), -170, 0, 0, 10, 10, 10)
        );

         buildings.push(
            Building(" Pverse Pyramids", address(0x0), -40, 40, 0, 5, 25, 5)
        );

        buildings.push(
            Building("Pverse Boats", address(0x0), -40, 80, 0, 5, 25, 5)
        );

    }

    function mint(uint256 _id) public payable {
        uint256 supply = totalSupply;
        require(supply <= maxSupply);
        require(buildings[_id - 1].owner == address(0x0));
        require(msg.value >= 100000 ether);

        // NOTE: tokenID always starts from 1, but our array starts from 0
        buildings[_id - 1].owner = msg.sender;
        totalSupply = totalSupply + 1;

        _safeMint(msg.sender, _id);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        // Update Building ownership
        buildings[tokenId - 1].owner = to;

        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        // Update Building ownership
        buildings[tokenId - 1].owner = to;

        _safeTransfer(from, to, tokenId, _data);
    }

     // Public View Functions
    function getBuildings() public view returns (Building[] memory) {
        return buildings;
    }

    function getBuilding(uint256 _id) public view returns (Building memory) {
        return buildings[_id - 1];
    }

}