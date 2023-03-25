// File: contracts/Mineable.sol


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
// File: contracts/Ownable.sol


pragma solidity ^0.8.9;


contract Ownable {
    
    address private _owner;

   
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

   
    modifier onlyOwner() {
        require(_owner == msg.sender, "Ownable: only owner can call this function");
       
        _;
    }

    constructor() {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), _owner);
    }
  
    function owner() public view returns(address) {
        return _owner;

    }

    
    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

   
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }
    
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

}
// File: contracts/PulseOG.sol


pragma solidity ^0.8.9;

// blockchains are speech and speech is a protected human right.



/// @custom:security-contact info@pulseog.com
contract PulseOG is Ownable, Mineable {
  

 
  uint private _totalSupply;
  uint8 private _decimals;
  string private _symbol;
  string private _name;
  string public constant AUTHORS = "@Beep2003 pulseog.com";
 
  mapping (address => uint256) private _balances;
 
   mapping (address => mapping (address => uint256)) private _allowances;

  
  event Transfer(address indexed from, address indexed to, uint256 value);
  
  event Approval(address indexed owner, address indexed spender, uint256 value);

 
  constructor(string memory token_name, string memory short_symbol, uint8 token_decimals, uint256 token_totalSupply){
      _name = token_name;
      _symbol = short_symbol;
      _decimals = token_decimals;
      _totalSupply = token_totalSupply;

      _balances[msg.sender] = _totalSupply;

     
      emit Transfer(address(0), msg.sender, _totalSupply);
  }
 
  function decimals() external view returns (uint8) {
    return _decimals;
  }
 
  function symbol() external view returns (string memory){
    return _symbol;
  }
  
  function name() external view returns (string memory){
    return _name;
  }
 
  function totalSupply() external view returns (uint256){
    return _totalSupply;
  }
 
  function balanceOf(address account) external view returns (uint256) {
    return _balances[account];
  }


  function _mint(address account, uint256 amount) internal {
    require(account != address(0), "PulseOG: cannot mint to zero address");

   
    _totalSupply = _totalSupply + (amount);
    
    _balances[account] = _balances[account] + amount;
    
    emit Transfer(address(0), account, amount);
  }
  
  
  function _burn(address account, uint256 amount) internal {
    require(account != address(0), "PulseOG: cannot burn from zero address");
    require(_balances[account] >= amount, "PulseOG: Cannot burn more than the account owns");

    
    _balances[account] = _balances[account] - amount;
    
    _totalSupply = _totalSupply - amount;
    
    emit Transfer(account, address(0), amount);
  }
  
  function burn(address account, uint256 amount) public onlyOwner returns(bool) {
    _burn(account, amount);
    return true;
    
    
  }


  function mint(address account, uint256 amount) public onlyOwner returns(bool){
    _mint(account, amount);
    return true;
  }


  function transfer(address recipient, uint256 amount) external returns (bool) {
    _transfer(msg.sender, recipient, amount);
    return true;
  }

  function _transfer(address sender, address recipient, uint256 amount) internal {
    require(sender != address(0), "PulseOG: transfer from zero address");
    require(recipient != address(0), "PulseOG: transfer to zero address");
    require(_balances[sender] >= amount, "PulseOG: cant transfer more than your account holds");

    _balances[sender] = _balances[sender] - amount;
    _balances[recipient] = _balances[recipient] + amount;
    
    emit Transfer(sender, recipient, amount);
  }
 
  function getOwner() external view returns (address) {
    return owner();
  }
  
   function allowance(address owner, address spender) external view returns(uint256){
     return _allowances[owner][spender];
   }
  
   function approve(address spender, uint256 amount) external returns (bool) {
     _approve(msg.sender, spender, amount);
     return true;
   }


    function _approve(address owner, address spender, uint256 amount) internal {
      require(owner != address(0), "PulseOG: approve cannot be done from zero address");
      require(spender != address(0), "PulseOG: approve cannot be to zero address");
      
      _allowances[owner][spender] = amount;

      emit Approval(owner,spender,amount);
    }
    
    function transferFrom(address spender, address recipient, uint256 amount) external returns(bool){
      
      require(_allowances[spender][msg.sender] >= amount, "PulseOG: You cannot spend that much on this account");
      
      _transfer(spender, recipient, amount);
     
      _approve(spender, msg.sender, _allowances[spender][msg.sender] - amount);
      return true;
    }
   
    function mine(uint256 _amount) public {
      
      require(_amount < _balances[msg.sender], "PulseOG: Cannot mine more than you own");

        _mine(_amount);
               
        _burn(msg.sender, _amount);
    }

   
    function withdrawMine(uint256 amount, uint256 mine_index)  public {

      uint256 amount_to_mint = _withdrawMine(amount, mine_index);
      
      _mint(msg.sender, amount_to_mint);
    }

}