import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { CONTRACTS, PRESALE_ABI, PRESALE_CONFIG, TOKENOMICS, USDC_DECIMALS } from "@/lib/constants";
import { formatUnits } from "ethers";
import { TrendingUp, Target, Coins, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface PresaleData {
  isLive: boolean;
  priceTokensPerUSDC: bigint;
  soldTokens: bigint;
  hardcapTokens: bigint;
}

export const PresaleStats = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const { provider } = useWeb3();
  const [presaleData, setPresaleData] = useState<PresaleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresaleData = async () => {
      if (!provider) {
        setLoading(false);
        return;
      }

      try {
        const presaleContract = new (await import("ethers")).Contract(
          CONTRACTS.presale,
          PRESALE_ABI,
          provider
        );

        const [isLive, priceTokensPerUSDC, soldTokens, hardcapTokens] = await Promise.all([
          presaleContract.isLive(),
          presaleContract.priceTokensPerUSDC(),
          presaleContract.soldTokens(),
          presaleContract.hardcapTokens(),
        ]);

        setPresaleData({
          isLive,
          priceTokensPerUSDC,
          soldTokens,
          hardcapTokens,
        });
      } catch (error) {
        console.error("Error fetching presale data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresaleData();
  }, [provider, refreshTrigger]);

  const calculateProgress = () => {
    if (!presaleData) return 0;
    const progress = (Number(presaleData.soldTokens) / Number(presaleData.hardcapTokens)) * 100;
    return Math.min(progress, 100);
  };

  const calculateRaisedUSDC = () => {
    if (!presaleData) return "0";
    const raised = Number(presaleData.soldTokens) / Number(presaleData.priceTokensPerUSDC) * Math.pow(10, USDC_DECIMALS);
    return raised.toFixed(2);
  };

  const StatCard = ({ icon: Icon, label, value, gradient = false }: any) => (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${gradient ? "gradient-bg" : "bg-secondary"}`}>
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-6 w-24 mt-1" />
          ) : (
            <p className={`text-lg font-bold ${gradient ? "gradient-text" : ""}`}>{value}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Presale Statistics</h2>
        <p className="text-muted-foreground">Live presale data from PulseChain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={Coins}
          label="Total Supply"
          value={`${TOKENOMICS.presaleAllocation.toLocaleString()} ProveX 2.0`}
        />
        <StatCard
          icon={Target}
          label="Presale Hardcap"
          value={`${PRESALE_CONFIG.hardcapUSDC.toLocaleString()} USDC`}
        />
        <StatCard
          icon={TrendingUp}
          label="Minimum Buy"
          value={`${PRESALE_CONFIG.minBuyUSDC} USDC`}
        />
        <StatCard
          icon={ShieldCheck}
          label="Status"
          value={loading ? "..." : presaleData?.isLive ? "Live" : "Not Live"}
          gradient={presaleData?.isLive}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Presale Progress</span>
          <span className="font-semibold">
            {loading ? (
              <Skeleton className="h-4 w-16 inline-block" />
            ) : (
              `${calculateProgress().toFixed(2)}%`
            )}
          </span>
        </div>
        <Progress value={calculateProgress()} className="h-3" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-32 inline-block" />
            ) : (
              `${formatUnits(presaleData?.soldTokens || 0n, 18)} / ${formatUnits(
                presaleData?.hardcapTokens || 0n,
                18
              )} Tokens`
            )}
          </span>
          <span className="font-semibold text-primary">
            {loading ? <Skeleton className="h-4 w-24 inline-block" /> : `≈ ${calculateRaisedUSDC()} USDC raised`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Presale Allocation</p>
          <p className="text-xl font-bold gradient-text">{TOKENOMICS.presalePercent}%</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">LP Allocation</p>
          <p className="text-xl font-bold gradient-text">{TOKENOMICS.lpPercent}%</p>
        </div>
      </div>
    </div>
  );
};
