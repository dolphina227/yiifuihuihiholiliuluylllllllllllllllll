// PulseChain Network Configuration
export const PULSECHAIN_CONFIG = {
  chainId: 369,
  chainName: "PulseChain",
  rpcUrl: "https://rpc.pulsechain.com",
  blockExplorerUrl: "https://scan.pulsechain.com",
};

// Contract Addresses
export const CONTRACTS = {
  presale: "0xFd837c0B245048C986bA9F1D2edaD5a980a8decE",
  token: "0x2c9310144FAF95C59A7f5ff70c532c71d9f7Dc29",
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
  durationDays: 3,
  // Set this to your presale start timestamp (Unix timestamp in seconds)
  startTimestamp: Math.floor(Date.now() / 1000), // Current time for demo
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
  "function isLive() external view returns (bool)",
  "function priceTokensPerUSDC() external view returns (uint256)",
  "function soldTokens() external view returns (uint256)",
  "function hardcapTokens() external view returns (uint256)",
  "function buy(uint256 usdcAmount) external",
  "event Buy(address indexed buyer, uint256 usdcIn, uint256 tokensOut)",
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];
