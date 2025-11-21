import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/useWeb3";
import {
  CONTRACTS,
  PRESALE_ABI,
  USDC_DECIMALS,
  TOKEN_CONFIG,
} from "@/lib/constants";
import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import { toast } from "sonner";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserPositionProps {
  refreshTrigger: number;
  onSuccess: () => void;
}

export const UserPosition = ({
  refreshTrigger,
  onSuccess,
}: UserPositionProps) => {
  const { account, isConnected, provider: walletProvider } = useWeb3();

  const [userContribution, setUserContribution] = useState("0");
  const [userTokens, setUserTokens] = useState("0");
  const [isLive, setIsLive] = useState(false);
  const [isOngoing, setIsOngoing] = useState(false);
  const [loading, setLoading] = useState(false);

  // RPC publik PulseChain
  const FALLBACK_RPC =
    import.meta.env.VITE_PULSECHAIN_RPC ?? "https://rpc.pulsechain.com";

  useEffect(() => {
    if (!account) return;

    const fetchUserPosition = async () => {
      try {
        setLoading(true);

        const readProvider =
          walletProvider ?? new JsonRpcProvider(FALLBACK_RPC);

        const presaleContract = new Contract(
          CONTRACTS.presale,
          PRESALE_ABI,
          readProvider
        );

        // status global
        const [live, ongoing] = await Promise.all([
          presaleContract.isLive(),
          presaleContract.isOngoing(),
        ]);
        setIsLive(live);
        setIsOngoing(ongoing);

        // 🔍 ambil SEMUA event Buy, filter di frontend
        const filter = presaleContract.filters.Buy();
        const events = await presaleContract.queryFilter(filter, 0, "latest");

        const addr = account.toLowerCase();
        let totalUsdcIn = 0n;
        let totalTokensOut = 0n;

        for (const ev of events) {
          const buyer: string = ev.args.buyer;
          if (buyer.toLowerCase() !== addr) continue;

          totalUsdcIn += ev.args.usdcIn;
          totalTokensOut += ev.args.tokensOut;
        }

        setUserContribution(formatUnits(totalUsdcIn, USDC_DECIMALS));
        setUserTokens(
          formatUnits(totalTokensOut, TOKEN_CONFIG.decimals ?? 18)
        );

        console.log(
          "User Buy events:",
          events.filter((e: any) => e.args.buyer.toLowerCase() === addr).length
        );
      } catch (error) {
        console.error("Error fetching user position:", error);
        toast.error("Failed to load your presale position");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosition();
  }, [account, walletProvider, FALLBACK_RPC, refreshTrigger]);

  if (!isConnected) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg gradient-bg">
            <Wallet className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Your Position</h2>
            <p className="text-sm text-muted-foreground">
              Connect wallet to view
            </p>
          </div>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connect your wallet to see your presale position
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasContribution = parseFloat(userContribution) > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg gradient-bg">
          <TrendingUp className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Your Position</h2>
          <p className="text-sm text-muted-foreground">
            Track your ProveX 2.0 presale activity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">
            Your USDC Contribution
          </p>
          <p className="text-2xl font-bold gradient-text">
            {loading
              ? "Loading..."
              : `${parseFloat(userContribution).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })} USDC`}
          </p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">
            Your ProveX 2.0 Bought
          </p>
          <p className="text-2xl font-bold gradient-text">
            {loading
              ? "Loading..."
              : parseFloat(userTokens).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
          </p>
        </div>
      </div>

      {!hasContribution && !loading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You haven't participated in the presale yet.
          </AlertDescription>
        </Alert>
      )}

      {hasContribution && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your tokens are sent instantly when you buy. This panel only shows
            total USDC spent and ProveX 2.0 purchased from on-chain{" "}
            <code>Buy</code> events.{" "}
            {isLive && isOngoing && "Presale is currently live."}
            {!isLive && "Presale is currently not live."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
