import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";
import { PULSECHAIN_CONFIG, CONTRACTS, PRESALE_ABI, ERC20_ABI } from "@/lib/constants";
import { toast } from "sonner";

declare global {
  interface Window {
    ethereum?: any;
  }
}


export const useWeb3 = () => {
  const [account, setAccount] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const checkNetwork = useCallback(async (ethereum: any) => {
    try {
      const chainId = await ethereum.request({ method: "eth_chainId" });
      const isCorrect = parseInt(chainId, 16) === PULSECHAIN_CONFIG.chainId;
      setIsCorrectNetwork(isCorrect);
      return isCorrect;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  }, []);

  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${PULSECHAIN_CONFIG.chainId.toString(16)}` }],
      });
      toast.success("Switched to PulseChain");
    } catch (error: any) {
      // Network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${PULSECHAIN_CONFIG.chainId.toString(16)}`,
                chainName: PULSECHAIN_CONFIG.chainName,
                rpcUrls: [PULSECHAIN_CONFIG.rpcUrl],
                blockExplorerUrls: [PULSECHAIN_CONFIG.blockExplorerUrl],
                nativeCurrency: {
                  name: "Pulse",
                  symbol: "PLS",
                  decimals: 18,
                },
              },
            ],
          });
          toast.success("PulseChain added successfully");
        } catch (addError) {
          console.error("Error adding network:", addError);
          toast.error("Failed to add PulseChain network");
        }
      } else {
        console.error("Error switching network:", error);
        toast.error("Failed to switch to PulseChain");
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        const browserProvider = new BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const isCorrect = await checkNetwork(window.ethereum);
        if (!isCorrect) {
          toast.warning("Please switch to PulseChain network");
        } else {
          toast.success("Wallet connected");
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setIsConnected(false);
    setIsCorrectNetwork(false);
    setProvider(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      // Check if already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            const browserProvider = new BrowserProvider(window.ethereum);
            setProvider(browserProvider);
            checkNetwork(window.ethereum);
          }
        });

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          disconnectWallet();
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, [checkNetwork]);

  const getContract = useCallback(
    (address: string, abi: any) => {
      if (!provider) return null;
      return new Contract(address, abi, provider);
    },
    [provider]
  );

  const getSigner = useCallback(async () => {
    if (!provider) return null;
    return await provider.getSigner();
  }, [provider]);

  return {
    account,
    isConnected,
    isCorrectNetwork,
    provider,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getContract,
    getSigner,
  };
};
