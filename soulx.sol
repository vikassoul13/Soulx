

// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;


abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function getOwner() external view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

   
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

   
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface IERC20 {
    
    function totalSupply() external view returns (uint256);

    
    function balanceOf(address account) external view returns (uint256);

    
    function transfer(address to, uint256 amount) external returns (bool);

  
    function allowance(address owner, address spender) external view returns (uint256);

    
    function approve(address spender, uint256 amount) external returns (bool);

    
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    
    event Transfer(address indexed from, address indexed to, uint256 value);

    
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


interface IERC20Metadata is IERC20 {
    
    function name() external view returns (string memory);

    
    function symbol() external view returns (string memory);

    
    function decimals() external view returns (uint8);
}


contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, _allowances[owner][spender] + addedValue);
        return true;
    }

    
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = _allowances[owner][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

   
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

   
    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}



}

/**
 *  Soulverse Token
 */
contract Soulverse is ERC20, Ownable {
     // Max supply, 21.6 billion tokens with 18 decimals
    uint256 public constant FIXED_SUPPLY = 21_600_000_000 * 10**18;
    // Per day transfer limit, per wallet
    uint256 public transferLimit;

    uint256 public constant MAX_TOKEN_BALANCE = 1000000 * 10**18; // Maximum token balance an address can hold
    uint256 public constant MIN_TOKEN_BALANCE = 100 * 10**18; // Minimum token balance an address can hold
     uint256 public constant MAX_TRANSFER_AMOUNT = 50000 * 10**18; // Max transfer from a wallet to another wallet



    address public operator;

    // List of addresses to skip transfer limits checks
    mapping(address => bool) private _whitelisted;

    // List of blacklist addresses to stop transfer
    mapping(address => bool) private _blacklisted;

    struct UserTransfer {
        uint256 lastTime;
        uint256 perDayTransfer;
    }

    // user per day transfers
    mapping(address => UserTransfer) private userTransfers;

    /**
     * @notice emitted when transfer limit is set
     * @param limit per day limit
     */
    event TransferLimitSet(uint256 indexed limit);

    event SetOperator(address operator);

    event WhiteListAccount(address account);

    event UnWhiteListAccount(address account);

    event BlackListAccount(address account);

    event UnBlackListAccount(address account);

    constructor() ERC20("SoulCoin", "SoulX") {
        // Mint fixed supply
        _mint(msg.sender, FIXED_SUPPLY);
    }

    modifier onlyAuthorized() {
        require(
            (owner() == msg.sender) || (operator == msg.sender),
            "Not authorized"
        );

        _;
    }

    function setOperator(address _operator) external onlyOwner {
        operator = _operator;
        emit SetOperator(_operator);
    }

    /**
     * @notice burns tokens of the caller. No per day limit on burn
     * @param amount number of tokens to mint
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @notice sets transfer limit per day per wallet. Only by owner can set
     * @notice can be set to 0 to disable transfer limits
     * @param _limit Number of tokens per day
     */
    function setTransferLimit(uint256 _limit) external onlyAuthorized {
        transferLimit = _limit;
        emit TransferLimitSet(_limit);
    }

    function whitelistAccount(address account) external onlyAuthorized {
        _whitelisted[account] = true;
        emit WhiteListAccount(account);
    }

    function unWhitelistAccount(address account) external onlyAuthorized {
        delete _whitelisted[account];
        emit UnWhiteListAccount(account);
    }

    function isWhitelisted(address account) public view returns (bool) {
        return _whitelisted[account];
    }

    function blacklistAccount(address account) external onlyAuthorized {
        _blacklisted[account] = true;
	emit BlackListAccount(account);
    }

    function unBlacklistAccount(address account) external onlyAuthorized {
        delete _blacklisted[account];
	emit UnBlackListAccount(account);
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _blacklisted[account];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {

	require(!isBlacklisted(from) && !isBlacklisted(to), "ERC20: This address is blacklisted");

        // Check for transfer limits, skip for mints and burns
        if ((transferLimit > 0) && (from != address(0)) && (to != address(0))) {
            // Both 'from' and 'to' addresses should not be in the whiltelist
            // to enforce the limit
            if (!isWhitelisted(from) && !isWhitelisted(to))
                _enforceTransferLimit(from, amount);
                 if (to != address(0)) {
        // Check for maximum token balance
        require(balanceOf(to) + amount <= MAX_TOKEN_BALANCE, "SoulCoin: Maximum token balance exceeded");

        // Check for minimum token balance
        require(balanceOf(to) + amount >= MIN_TOKEN_BALANCE, "SoulCoin: Minimum token balance not met");
    }
        }
    }

    function _enforceTransferLimit(address from, uint256 amount) internal {
        UserTransfer storage uTransfer = userTransfers[from];

        require(amount <= transferLimit, "SoulCoin: daily limit exceeds");

        if ((block.timestamp - uTransfer.lastTime) >= 1 days) {
            uTransfer.lastTime = block.timestamp;
            uTransfer.perDayTransfer = amount;
        } else {
            require((amount + uTransfer.perDayTransfer) <= transferLimit, "SoulCoin: daily limit exceeds");
            uTransfer.perDayTransfer += amount;
        }
    }

    function recoverWrongTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyAuthorized {
        if (token == address(this))
           this.transfer(to, amount);
        else
           IERC20(token).transfer(to, amount);
    }
}
