import { SEASONS } from "@/src/domain";
import { SeasonPageClient } from "./SeasonPageClient";

const TABS = ["standings", "results", "fixtures", "players", "draft"] as const;

export function generateStaticParams() {
  return SEASONS.flatMap((season) => TABS.map((tab) => ({ season, tab })));
}

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ season: string; tab: string }>;
}) {
  const { season, tab } = await params;
  return <SeasonPageClient season={season} tab={tab} />;
}
