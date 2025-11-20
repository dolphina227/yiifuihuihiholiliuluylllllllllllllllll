import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { CONTRACTS, PRESALE_ABI, PULSECHAIN_CONFIG, USDC_DECIMALS } from "@/lib/constants";
import { formatUnits } from "ethers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Search, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Participant {
  buyer: string;
  usdcAmount: string;
  tokenAmount: string;
  blockNumber: number;
}

export const ParticipantsTable = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const { provider } = useWeb3();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
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

        const filter = presaleContract.filters.Buy();
        const events = await presaleContract.queryFilter(filter, 0, "latest");

        const participantsList: Participant[] = events.map((event: any) => ({
          buyer: event.args.buyer,
          usdcAmount: formatUnits(event.args.usdcIn, USDC_DECIMALS),
          tokenAmount: formatUnits(event.args.tokensOut, 18),
          blockNumber: event.blockNumber,
        }));

        // Sort by most recent first
        participantsList.sort((a, b) => b.blockNumber - a.blockNumber);

        setParticipants(participantsList);
        setFilteredParticipants(participantsList);
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [provider, refreshTrigger]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = participants.filter((p) =>
        p.buyer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredParticipants(filtered);
    } else {
      setFilteredParticipants(participants);
    }
  }, [searchQuery, participants]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = (address: string) => {
    window.open(`${PULSECHAIN_CONFIG.blockExplorerUrl}/address/${address}`, "_blank");
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-bg">
            <Users className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Presale Participants</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${participants.length} total participants`}
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Buyer</TableHead>
                <TableHead className="font-semibold text-right">USDC Amount</TableHead>
                <TableHead className="font-semibold text-right">ProveX 2.0 Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No participants found matching your search" : "No participants yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipants.map((participant, index) => (
                  <TableRow key={index} className="hover:bg-secondary/30 transition-colors">
                    <TableCell>
                      <button
                        onClick={() => openExplorer(participant.buyer)}
                        className="flex items-center gap-2 hover:text-primary transition-colors font-mono"
                      >
                        {formatAddress(participant.buyer)}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {parseFloat(participant.usdcAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      USDC
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {parseFloat(participant.tokenAmount).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      ProveX 2.0
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
