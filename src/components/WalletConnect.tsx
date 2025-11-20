import { Wallet, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/useWeb3";
import { Badge } from "@/components/ui/badge";

export const WalletConnect = () => {
  const { account, isConnected, isCorrectNetwork, connectWallet, disconnectWallet, switchNetwork } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && !isCorrectNetwork) {
    return (
      <Button onClick={switchNetwork} variant="destructive" className="gap-2">
        <Power className="h-4 w-4" />
        Switch to PulseChain
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="border-success text-success px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-success mr-2 animate-pulse" />
          PulseChain
        </Badge>
        <Button onClick={disconnectWallet} variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          {formatAddress(account)}
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} className="gap-2 gradient-bg">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
};
