// PulseChain Network Configuration
export const PULSECHAIN_CONFIG = {
  chainId: 369,
  chainName: "PulseChain",
  rpcUrl: "https://rpc.pulsechain.com",
  blockExplorerUrl: "https://scan.pulsechain.com",
};

// Contract Addresses
export const CONTRACTS = {
  presale: "0x5Fe9722e445a190220B48CCb101455EC34395699",
  token: "0x9a63c7Dd7Ec7EAc8dd787f10635006D2C9EDd902",
  usdc: "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07",
};

// Token Configuration
export const TOKEN_CONFIG = {
  name: "ProveX 2.0",
  symbol: "ProveX 2.0",
  decimals: 18,
  totalSupply: 100_000_000,
};

export const USDC_DECIMALS = 6;

// Presale Configuration
export const PRESALE_CONFIG = {
  hardcapUSDC: 8_000,
  minBuyUSDC: 10,
};

// Tokenomics
export const TOKENOMICS = {
  presaleAllocation: 50_000_000,
  lpAllocation: 50_000_000,
  presalePercent: 50,
  lpPercent: 50,
};

// Tax Information
export const TAX_INFO = {
  buyTax: 5,
  sellTax: 5,
  sacrificeUrl: "https://ProveX.info",
};

// Contract ABIs
export const PRESALE_ABI = [
  // write functions
  "function buy(uint256 usdcAmount) external",
  "function setLive(bool _live) external",
  "function sweepUnsoldTokens(address to) external",
  "function transferOwnership(address newOwner) external",
  "function renounceOwnership() external",

  // view functions
  "function HARD_CAP_USDC() external view returns (uint256)",
  "function MIN_USDC() external view returns (uint256)",
  "function PRESALE_TOKENS() external view returns (uint256)",
  "function TOKENS_PER_USDC() external view returns (uint256)",
  "function soldTokens() external view returns (uint256)",
  "function totalUsdcIn() external view returns (uint256)",
  "function USDC_DECIMALS() external view returns (uint8)",

  "function isLive() external view returns (bool)",
  "function isOngoing() external view returns (bool)",

  "function token() external view returns (address)",
  "function usdc() external view returns (address)",
  "function treasury() external view returns (address)",
  "function owner() external view returns (address)",

  // events
  "event Buy(address indexed buyer, uint256 usdcIn, uint256 tokensOut)",
  "event SetLive(bool live)",
  "event SweepUnsold(address indexed to, uint256 amount)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
];


export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];
