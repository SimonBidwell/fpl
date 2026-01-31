import { SEASONS } from "@/src/domain";
import { SeasonPageClient } from "../SeasonPageClient";

const TABS = ["standings", "results", "fixtures", "players", "draft"] as const;
// Generate gameweeks 1-38 for each season/tab combination
const GAMEWEEKS = Array.from({ length: 38 }, (_, i) => String(i + 1));

export function generateStaticParams() {
  return SEASONS.flatMap((season) =>
    TABS.flatMap((tab) =>
      GAMEWEEKS.map((gameWeek) => ({ season, tab, gameWeek }))
    )
  );
}

export default async function SeasonGameWeekPage({
  params,
}: {
  params: Promise<{ season: string; tab: string; gameWeek: string }>;
}) {
  const { season, tab, gameWeek } = await params;
  return (
    <SeasonPageClient season={season} tab={tab} gameWeek={Number(gameWeek)} />
  );
}
