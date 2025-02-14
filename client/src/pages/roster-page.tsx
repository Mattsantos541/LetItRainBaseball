import { useQuery } from "@tanstack/react-query";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, User } from "lucide-react";
import { Team, Player } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function RosterPage() {
  const { user } = useAuth();
  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const team = teams?.[0]; // For MVP, just use first team
  
  const { data: players, isLoading: isLoadingPlayers } = useQuery<Player[]>({
    queryKey: team ? [`/api/teams/${team.id}/players`] : null,
  });

  if (isLoadingTeams || isLoadingPlayers) {
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
            <p>Create a team to get started!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSalary = players?.reduce((sum, p) => sum + Number(p.salary), 0) || 0;
  const rosterCount = players?.length || 0;

  const positions = ["C", "1B", "2B", "3B", "SS", "OF", "SP", "RP"];
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>Roster Size: {rosterCount}/{team.rosterSize}</span>
              </div>
              <div className="flex items-center gap-4">
                <Star className="h-5 w-5 text-muted-foreground" />
                <span>Salary Cap: ${totalSalary.toFixed(2)}/${team.salaryCap}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList>
          <TabsTrigger value="roster">Full Roster</TabsTrigger>
          {positions.map(pos => (
            <TabsTrigger key={pos} value={pos}>{pos}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="roster">
          <RosterTable players={players || []} />
        </TabsContent>

        {positions.map(pos => (
          <TabsContent key={pos} value={pos}>
            <RosterTable 
              players={(players || []).filter(p => p.position === pos)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function RosterTable({ players }: { players: Player[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Contract Year</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const stats = JSON.parse(player.stats);
            return (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.position}</TableCell>
                <TableCell>${player.salary}</TableCell>
                <TableCell>Year {player.contractYear}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {stats.avg} AVG, {stats.hr} HR, {stats.rbi} RBI
                  </span>
                </TableCell>
                <TableCell>
                  {player.isRookie && (
                    <Badge variant="secondary">Rookie</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
