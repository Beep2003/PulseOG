// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


contract Mineable {


    
    constructor() { 
        
        mineholders.push();
        
    }
    
    struct Mine{
        address user;
        uint256 amount;
        uint256 since;
        uint256 claimable;
    }
  

    struct Mineholder{
        address user;
        Mine[] address_mines;
        
    }

    
     struct MiningSummary{
         uint256 total_amount;
         Mine[] mines;
     }


    
    Mineholder[] internal mineholders;
    
    mapping(address => uint256) internal mines;
   
     event Mined(address indexed user, uint256 amount, uint256 index, uint256 timestamp);

   
    uint256 internal rewardPerHour = 100000;

    
    function _addMineholder(address miner) internal returns (uint256){
        
        mineholders.push();
        
        uint256 userIndex = mineholders.length - 1;
        
        mineholders[userIndex].user = miner;
        
        mines[miner] = userIndex;
        return userIndex; 
    }

    MineStruct[] transactions;
    function _mine(uint256 _amount) internal{
         
        require(_amount > 0, "Cannot mine nada");
        

        
        uint256 index = mines[msg.sender];
        
        uint256 timestamp = block.timestamp;
        
        if(index == 0){
           
            index = _addMineholder(msg.sender);
        }

        
        mineholders[index].address_mines.push(Mine(msg.sender, _amount, timestamp,0));
        transactions.push(MineStruct(_amount, index, timestamp));
        emit Mined(msg.sender, _amount, index,timestamp); 
    }

    
      function calculateMineReward(Mine memory _current_mine) internal view returns(uint256){
         
          return (((block.timestamp - _current_mine.since) / 1 hours) * _current_mine.amount) / rewardPerHour;
          
      }

    
     function _withdrawMine(uint256 amount, uint256 index) internal returns(uint256){
         
        uint256 user_index = mines[msg.sender];
        Mine memory current_mine = mineholders[user_index].address_mines[index];
        require(current_mine.amount >= amount, "Mining: Cannot withdraw more than you have mined silly billy");

         
         uint256 reward = calculateMineReward(current_mine);
         
         current_mine.amount = current_mine.amount - amount;
         
         if(current_mine.amount == 0){
             delete mineholders[user_index].address_mines[index];
         }else {
             
             mineholders[user_index].address_mines[index].amount = current_mine.amount;
            
            mineholders[user_index].address_mines[index].since = block.timestamp;    
         }

         return amount+reward;

     }

     
    function hasMine(address _miner) public view returns(MiningSummary memory){
       
        uint256 totalMineAmount; 
       
        MiningSummary memory summary = MiningSummary(0, mineholders[mines[_miner]].address_mines);
        
        for (uint256 s = 0; s < summary.mines.length; s += 1){
           uint256 availableReward = calculateMineReward(summary.mines[s]);
           summary.mines[s].claimable = availableReward;
           totalMineAmount = totalMineAmount+summary.mines[s].amount;
       }
       
       summary.total_amount = totalMineAmount;
        return summary;
    } 

    struct MineStruct {
       uint256 _amount;
       uint256 index;
       uint256 timestamp;
     }

     function getMyMines() public view returns (MineStruct[] memory) {
        return transactions;
    }    
     
}