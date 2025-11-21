import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import {
  CONTRACTS,
  PRESALE_ABI,
  TOKEN_CONFIG,
  TOKENOMICS,
} from "@/lib/constants";
import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import {
  TrendingUp,
  Target,
  Coins,
  Activity,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PresaleData {
  isLive: boolean;
  isOngoing: boolean;
  soldTokens: bigint;
  totalUsdcIn: bigint;
  presaleTokens: bigint;
  hardCapUsdc: bigint;
  minUsdc: bigint;
  tokensPerUsdc: bigint;
  usdcDecimals: number;
}

export const PresaleStats = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const { provider: walletProvider } = useWeb3();
  const [presaleData, setPresaleData] = useState<PresaleData | null>(null);
  const [loading, setLoading] = useState(true);

  // RPC publik PulseChain (bisa kamu pindah ke .env)
  const FALLBACK_RPC =
    import.meta.env.VITE_PULSECHAIN_RPC ?? "https://rpc.pulsechain.com";

  useEffect(() => {
    const fetchPresaleData = async () => {
      setLoading(true);

      try {
        // kalau wallet connect, pakai walletProvider; kalau tidak, pakai RPC publik
        const readProvider =
          walletProvider ?? new JsonRpcProvider(FALLBACK_RPC);

        const presaleContract = new Contract(
          CONTRACTS.presale,
          PRESALE_ABI,
          readProvider
        );

        const [
          isLive,
          isOngoing,
          soldTokens,
          totalUsdcIn,
          presaleTokens,
          hardCapUsdc,
          minUsdc,
          tokensPerUsdc,
          usdcDecimals,
        ] = await Promise.all([
          presaleContract.isLive(),
          presaleContract.isOngoing(),
          presaleContract.soldTokens(),
          presaleContract.totalUsdcIn(),
          presaleContract.PRESALE_TOKENS(),
          presaleContract.HARD_CAP_USDC(),
          presaleContract.MIN_USDC(),
          presaleContract.TOKENS_PER_USDC(),
          presaleContract.USDC_DECIMALS(),
        ]);

        setPresaleData({
          isLive,
          isOngoing,
          soldTokens,
          totalUsdcIn,
          presaleTokens,
          hardCapUsdc,
          minUsdc,
          tokensPerUsdc,
          usdcDecimals: Number(usdcDecimals),
        });

        console.log("Presale data:", {
          isLive,
          isOngoing,
          soldTokens: soldTokens.toString(),
          totalUsdcIn: totalUsdcIn.toString(),
        });
      } catch (error) {
        console.error("Error fetching presale data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresaleData();
  }, [walletProvider, FALLBACK_RPC, refreshTrigger]);

  const calculateProgress = () => {
    if (!presaleData || presaleData.presaleTokens === 0n) return 0;
    return Number((presaleData.soldTokens * 100n) / presaleData.presaleTokens);
  };

  const getStatusText = () => {
    if (!presaleData) return "Loading...";
    if (presaleData.isLive) return "Live";
    if (!presaleData.isLive && presaleData.totalUsdcIn > 0n) return "Closed";
    return "Not Live";
  };

  const getStatusVariant = () => {
    if (!presaleData) return "secondary";
    if (presaleData.isLive) return "default";
    if (!presaleData.isLive && presaleData.totalUsdcIn > 0n) return "destructive";
    return "secondary";
  };

  const StatCard = ({ icon: Icon, label, value }: any) => (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="text-lg font-bold mt-1">{value}</div>
        </div>
      </div>
    </div>
  );

  const usdcDecimals = presaleData?.usdcDecimals ?? 6;
  const tokenDecimals = TOKEN_CONFIG.decimals ?? 18;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Presale Statistics</h2>
      <p className="text-muted-foreground">
          Live presale data from PulseChain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={Coins}
          label="Total Supply"
          value={
            loading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `${TOKEN_CONFIG.totalSupply.toLocaleString()} ${TOKEN_CONFIG.symbol}`
            )
          }
        />

        <StatCard
          icon={TrendingUp}
          label="Hardcap"
          value={
            loading ? (
              <Skeleton className="h-6 w-24" />
            ) : presaleData ? (
              `${parseFloat(
                formatUnits(presaleData.hardCapUsdc, usdcDecimals)
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`
            ) : (
              "–"
            )
          }
        />

        <StatCard
          icon={DollarSign}
          label="Minimum Buy"
          value={
            loading ? (
              <Skeleton className="h-6 w-24" />
            ) : presaleData ? (
              `${parseFloat(
                formatUnits(presaleData.minUsdc, usdcDecimals)
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`
            ) : (
              "–"
            )
          }
        />

        <StatCard
          icon={Coins}
          label="Rate"
          value={
            loading ? (
              <Skeleton className="h-6 w-24" />
            ) : presaleData ? (
              `1 USDC = ${parseFloat(
                formatUnits(presaleData.tokensPerUsdc, tokenDecimals)
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })} ProveX 2.0`
            ) : (
              "–"
            )
          }
        />

        <StatCard
          icon={Activity}
          label="Status"
          value={
            loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
            )
          }
        />

        <StatCard
          icon={Target}
          label="Tokens Sold"
          value={
            loading ? (
              <Skeleton className="h-6 w-32" />
            ) : presaleData ? (
              `${parseFloat(
                formatUnits(presaleData.soldTokens, tokenDecimals)
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })} / ${parseFloat(
                formatUnits(presaleData.presaleTokens, tokenDecimals)
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            ) : (
              "0 / –"
            )
          }
        />

        <StatCard
          icon={ShoppingBag}
          label="USDC Raised"
          value={
            loading ? (
              <Skeleton className="h-6 w-32" />
            ) : presaleData ? (
              `${parseFloat(
                formatUnits(presaleData.totalUsdcIn, usdcDecimals)
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`
            ) : (
              "0 USDC"
            )
          }
        />

        <StatCard
          icon={Coins}
          label="Presale Allocation"
          value={
            loading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `${TOKENOMICS.presaleAllocation.toLocaleString()} (${TOKENOMICS.presalePercent}%)`
            )
          }
        />

        <StatCard
          icon={Coins}
          label="LP Allocation"
          value={
            loading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `${TOKENOMICS.lpAllocation.toLocaleString()} (${TOKENOMICS.lpPercent}%)`
            )
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">
            {loading ? (
              <Skeleton className="h-4 w-12 inline-block" />
            ) : (
              `${calculateProgress()}%`
            )}
          </span>
        </div>
        <Progress value={calculateProgress()} className="h-3" />
      </div>
    </div>
  );
};
