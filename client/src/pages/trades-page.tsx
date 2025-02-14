import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, GitMerge, ArrowLeftRight } from "lucide-react";
import { Team, Player, Trade, TradeItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TradesPage() {
  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const team = teams?.[0];
  
  const { data: trades, isLoading: isLoadingTrades } = useQuery<Trade[]>({
    queryKey: team ? [`/api/teams/${team.id}/trades`] : null,
  });

  if (isLoadingTeams || isLoadingTrades) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>No Team Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create a team to start trading!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trade Center</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <GitMerge className="h-4 w-4 mr-2" />
              Propose Trade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Trade Proposal</DialogTitle>
            </DialogHeader>
            <ProposeTrade team={team} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Trade Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <TradesList trades={trades || []} team={team} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TradesList({ trades, team }: { trades: Trade[], team: Team }) {
  const { toast } = useToast();
  
  const updateTradeMutation = useMutation({
    mutationFn: async ({ tradeId, status }: { tradeId: number, status: string }) => {
      await apiRequest("PATCH", `/api/trades/${tradeId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${team.id}/trades`] });
      toast({
        title: "Trade Updated",
        description: "The trade status has been updated successfully.",
      });
    }
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trading Partner</TableHead>
          <TableHead>Players Involved</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((trade) => (
          <TableRow key={trade.id}>
            <TableCell>
              {trade.proposingTeamId === team.id ? "To: " : "From: "}
              Team {trade.proposingTeamId === team.id ? 
                trade.receivingTeamId : 
                trade.proposingTeamId}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>Players</span>
                <ArrowLeftRight className="h-4 w-4" />
                <span>Players</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant={trade.status === "pending" ? "secondary" : 
                        trade.status === "accepted" ? "success" : "destructive"}
              >
                {trade.status}
              </Badge>
            </TableCell>
            <TableCell>
              {trade.status === "pending" && trade.receivingTeamId === team.id && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => updateTradeMutation.mutate({ 
                      tradeId: trade.id, 
                      status: "accepted" 
                    })}
                  >
                    Accept
                  </Button>
                  <Button 
                    size="sm"
                    variant="destructive"
                    onClick={() => updateTradeMutation.mutate({ 
                      tradeId: trade.id, 
                      status: "rejected" 
                    })}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ProposeTrade({ team }: { team: Team }) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const { toast } = useToast();

  const proposeTradeMutation = useMutation({
    mutationFn: async (data: { proposingTeamId: number, receivingTeamId: number }) => {
      await apiRequest("POST", "/api/trades", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${team.id}/trades`] });
      toast({
        title: "Trade Proposed",
        description: "Your trade proposal has been sent.",
      });
    }
  });

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Select a team to trade with and propose a trade offer.
      </p>
      <Button
        disabled={!selectedTeam || proposeTradeMutation.isPending}
        onClick={() => {
          if (selectedTeam) {
            proposeTradeMutation.mutate({
              proposingTeamId: team.id,
              receivingTeamId: selectedTeam
            });
          }
        }}
      >
        {proposeTradeMutation.isPending ? "Proposing..." : "Send Proposal"}
      </Button>
    </div>
  );
}
