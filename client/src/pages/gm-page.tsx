import { useQuery } from "@tanstack/react-query";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign } from "lucide-react";
import { Team, Player } from "@shared/schema";

export default function GMPage() {
  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const team = teams?.[0];
  
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

  if (!team || !players) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>No Team Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create a team to access GM tools!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate future salary projections
  const projections = calculateProjections(players);

  return (
    <div className="container py-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Projections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Total Salary</TableHead>
                  <TableHead>Cap Space</TableHead>
                  <TableHead>Players</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projections.map((proj) => (
                  <TableRow key={proj.year}>
                    <TableCell>{proj.year}</TableCell>
                    <TableCell>${proj.totalSalary.toFixed(2)}</TableCell>
                    <TableCell>${(team.salaryCap - proj.totalSalary).toFixed(2)}</TableCell>
                    <TableCell>{proj.playerCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Current Salary</TableHead>
                  <TableHead>Contract Year</TableHead>
                  <TableHead>Next Year</TableHead>
                  <TableHead>Extension Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => {
                  const nextYearSalary = calculateNextYearSalary(player);
                  const extensionCost = calculateExtensionCost(player);
                  
                  return (
                    <TableRow key={player.id}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>${player.salary}</TableCell>
                      <TableCell>Year {player.contractYear}</TableCell>
                      <TableCell>${nextYearSalary}</TableCell>
                      <TableCell>+${extensionCost}/yr</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function calculateProjections(players: Player[]) {
  const years = [2024, 2025, 2026, 2027, 2028];
  
  return years.map(year => {
    const yearIndex = year - 2024;
    const playerSalaries = players.map(player => {
      let salary = Number(player.salary);
      const futureYear = player.contractYear + yearIndex;
      
      // Apply salary increases based on contract rules
      if (futureYear > 2) salary += 7;
      if (futureYear > 4) salary += 8;
      
      return salary;
    });
    
    return {
      year,
      totalSalary: playerSalaries.reduce((a, b) => a + b, 0),
      playerCount: players.length
    };
  });
}

function calculateNextYearSalary(player: Player) {
  let salary = Number(player.salary);
  if (player.contractYear >= 2) salary += 7;
  if (player.contractYear >= 4) salary += 8;
  return salary.toFixed(2);
}

function calculateExtensionCost(player: Player) {
  if (player.contractYear < 2) return "7.00";
  if (player.contractYear < 4) return "7.00";
  return "15.00";
}
