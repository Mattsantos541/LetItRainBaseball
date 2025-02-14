import { Link } from "wouter";
import { CircleDot, Users, LineChart, GitMerge, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function MainNav() {
  const { logoutMutation } = useAuth();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold">
            <CircleDot className="h-5 w-5" />
            Let It Rain
          </Button>
        </Link>
        <nav className="flex items-center gap-6 ml-6">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Roster
            </Button>
          </Link>
          <Link href="/gm">
            <Button variant="ghost" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              GM Tools
            </Button>
          </Link>
          <Link href="/trades">
            <Button variant="ghost" className="flex items-center gap-2">
              <GitMerge className="h-4 w-4" />
              Trades
            </Button>
          </Link>
        </nav>
        <div className="ml-auto">
          <Button
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}