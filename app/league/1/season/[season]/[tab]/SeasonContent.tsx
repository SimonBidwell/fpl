"use client";

import { notFound, useRouter } from "next/navigation";
import { Standings } from "@/src/components/standings/Standings";
import { Warning } from "@/src/components/Warning";
import { Match, SEASON_NOTES, SEASONS, Season } from "@/src/domain";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Card,
  CardBody,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Chevron } from "@/src/components/Chevron";
import { Fixtures } from "@/src/components/Fixtures";
import { Results } from "@/src/components/Results";
import { partition } from "@/src/helpers";
import { WithDefaultGameWeek } from "@/src/components/WithDefaultGameWeek";
import { useSeasonContext } from "@/src/SeasonContext";
import { PlayersTable } from "@/src/components/playerstable/PlayersTable";
import { DraftBoard } from "@/src/components/DraftBoard";
import { Choice } from "@/src/api/domain";

const TABS = ["standings", "results", "fixtures", "players", "draft"] as const;
type Tab = (typeof TABS)[number];
const isTab = (s: unknown): s is Tab => TABS.includes(s as Tab);
const isSeason = (s: unknown): s is Season => SEASONS.includes(s as Season);

const shouldDisplayTab = (
  tab: Tab,
  fixtures: Match[],
  results: Match[],
  draft: "Unknown" | Choice[]
) =>
  !(tab === "fixtures" && fixtures.length === 0) &&
  !(tab === "draft" && draft === "Unknown") &&
  !(tab === "results" && results.length === 0);

interface Props {
  season: string;
  tab: string;
  gameWeek?: number;
}

export function SeasonContent({ season, tab, gameWeek }: Props) {
  const router = useRouter();
  const { leagueDetails, draft, transactions } = useSeasonContext();

  if (!isTab(tab) || !isSeason(season) || leagueDetails == undefined) {
    notFound();
  }

  const seasonNotes = SEASON_NOTES[season]?.general;
  const { matches } = leagueDetails;

  const title = `A Real Sport (${Season.toDisplayFormat(season)})`;
  const [results, fixtures] = partition(matches, Match.isFinished);
  const defaultResultsGameweek =
    results.length == 0 ? 1 : results[results.length - 1].gameWeek;

  const navigateToSeason = (newSeason: string) => {
    router.push(`/league/1/season/${newSeason}/${tab}`);
  };

  const navigateToTab = (newTab: string) => {
    router.push(`/league/1/season/${season}/${newTab}`);
  };

  return (
    <>
      <Card shadow="sm" className="shrink-0">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold">{title}</h1>
              {seasonNotes !== undefined ? (
                <Warning warnings={[seasonNotes]} />
              ) : null}
            </div>
            <Dropdown>
              <DropdownTrigger className="flex">
                <Button endContent={<Chevron orientation="down" />} variant="flat">
                  Season
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Seasons"
                closeOnSelect={true}
                selectedKeys={new Set([season])}
                selectionMode="single"
                onSelectionChange={(selected) => {
                  const selectedSeason =
                    Season.getSeason(Array.from(selected)[0]) ?? "";
                  navigateToSeason(selectedSeason);
                }}
              >
                {SEASONS.map((s) => (
                  <DropdownItem key={s}>{Season.toDisplayFormat(s)}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <Tabs
            selectedKey={tab}
            classNames={{
              base: "pt-2",
              tabList: "w-full sm:w-fit",
            }}
            onSelectionChange={(selected) => {
              if (typeof selected === "string") {
                navigateToTab(selected);
              }
            }}
          >
            {TABS.map((t) =>
              shouldDisplayTab(t, fixtures, results, draft) ? (
                <Tab className="capitalize" key={t} title={t} />
              ) : null
            )}
          </Tabs>
        </CardBody>
      </Card>
      <SeasonTabContent
        season={season}
        tab={tab}
        gameWeek={gameWeek}
        results={results}
        fixtures={fixtures}
        defaultResultsGameweek={defaultResultsGameweek}
        draft={draft}
        transactions={transactions}
        leagueDetails={leagueDetails}
      />
    </>
  );
}

function SeasonTabContent({
  season,
  tab,
  gameWeek,
  results,
  fixtures,
  defaultResultsGameweek,
  draft,
  transactions,
  leagueDetails,
}: {
  season: Season;
  tab: Tab;
  gameWeek?: number;
  results: Match[];
  fixtures: Match[];
  defaultResultsGameweek: number;
  draft: Choice[] | "Unknown";
  transactions: ReturnType<typeof useSeasonContext>["transactions"];
  leagueDetails: ReturnType<typeof useSeasonContext>["leagueDetails"];
}) {
  const router = useRouter();

  const navigateToGameWeek = (gw: number) => {
    router.push(`/league/1/season/${season}/${tab}/${gw}`);
  };

  if (tab === "standings") {
    return (
      <WithDefaultGameWeek
        defaultGameWeek={defaultResultsGameweek}
        currentGameWeek={gameWeek}
        isValidGameWeek={(gw, defaultGw) => gw > 0 && gw <= defaultGw}
        onNavigate={navigateToGameWeek}
      >
        <Standings
          key={`standings-${season}`}
          leagueDetails={leagueDetails}
          transactions={transactions === "Unknown" ? undefined : transactions}
        />
      </WithDefaultGameWeek>
    );
  }

  if (tab === "results" && results.length > 0) {
    return (
      <WithDefaultGameWeek
        defaultGameWeek={defaultResultsGameweek}
        currentGameWeek={gameWeek}
        isValidGameWeek={(gw, defaultGw) => gw > 0 && gw <= defaultGw}
        onNavigate={navigateToGameWeek}
      >
        <Results key={`results-${season}`} matches={[...results].reverse()} />
      </WithDefaultGameWeek>
    );
  }

  if (tab === "fixtures" && fixtures.length > 0) {
    return (
      <WithDefaultGameWeek
        defaultGameWeek={fixtures[0].gameWeek}
        currentGameWeek={gameWeek}
        isValidGameWeek={(gw, defaultGw) =>
          gw >= defaultGw && gw <= fixtures[fixtures.length - 1].gameWeek
        }
        onNavigate={navigateToGameWeek}
      >
        <Fixtures key={`fixtures-${season}`} matches={fixtures} />
      </WithDefaultGameWeek>
    );
  }

  if (tab === "players") {
    return <PlayersTable />;
  }

  if (tab === "draft") {
    if (draft === "Unknown") {
      router.push(`/league/1/season/${season}/standings`);
      return null;
    }
    return <DraftBoard />;
  }

  return null;
}
