// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// The habits built by taking correct action facilitate the heavy lifting of change.

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard {

    // Variables
    address payable public immutable feeAccount; 
    uint public immutable feePercent; 
    uint public itemCount; 

    struct Item {
        uint itemId;
        IERC721 pverse;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    // itemId -> Item
    mapping(uint => Item) public items;

    event Offered(
        uint itemId,
        address indexed pverse,
        uint tokenId,
        uint price,
        address indexed seller
    );
    event Bought(
        uint itemId,
        address indexed pverse,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    constructor(uint _feePercent) {
        feeAccount = payable(owner());
        feePercent = _feePercent;
    }

     
    function listItem(IERC721 _pverse, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
       
        itemCount ++;
       
        _pverse.transferFrom(msg.sender, address(this), _tokenId);
       
        items[itemCount] = Item (
            itemCount,
            _pverse,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );
        
        emit Offered(
            itemCount,
            address(_pverse),
            _tokenId,
            _price,
            msg.sender
        );
    }

    

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(msg.value >= _totalPrice, "not enough pulse to cover item price and market fee");
        require(!item.sold, "item already sold");
      
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
      
        item.sold = true;
      
        item.pverse.transferFrom(address(this), msg.sender, item.tokenId);
       
        emit Bought(
            _itemId,
            address(item.pverse),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }
    function getTotalPrice(uint _itemId) view public returns(uint){
        return((items[_itemId].price*(100 + feePercent))/100);
    }
}