import { LeagueDataProvider } from "./LeagueDataProvider";

export default function LeagueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LeagueDataProvider>{children}</LeagueDataProvider>;
}
