import {
  Button, Card, CardBody, Dropdown, DropdownItem, DropdownMenu,
  DropdownTrigger, Tab, Tabs,
} from "@nextui-org/react";
import type { Choice, Event } from "../api/domain";
import { Match, Season, SEASON_NOTES, SEASONS } from "../domain";
import { Chevron } from "./Chevron";
import { Warning } from "./Warning";

export const SEASON_TABS = ["standings", "results", "fixtures", "players", "draft"] as const;
export const DEFAULT_TAB = SEASON_TABS[0];
export const isSeasonTab = (value: unknown): value is (typeof SEASON_TABS)[number] =>
  SEASON_TABS.includes(value as (typeof SEASON_TABS)[number]);

interface Props {
  season: Season;
  tab: string;
  matches: Match[];
  draft: "Unknown" | Choice[];
  nextEvent?: Event;
  onSeasonChange: (season: Season) => void;
  onTabChange: (tab: string) => void;
}

const formatDeadline = (iso: string | undefined) => {
  if (!iso) return "TBD";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "TBD";
  return parsed.toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

export function SeasonHeader({ season, tab, matches, draft, nextEvent, onSeasonChange, onTabChange }: Props) {
  const notes = SEASON_NOTES[season]?.general;
  const tabs = SEASON_TABS.filter(tab =>
    !(tab === "fixtures" && !matches.some(match => !Match.isFinished(match))) &&
    !(tab === "results" && !matches.some(Match.isFinished)) &&
    !(tab === "draft" && draft === "Unknown")
  );
  return (
    <Card shadow="sm" className="shrink-0">
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold">A Real Sport ({Season.toDisplayFormat(season)})</h1>
            {notes !== undefined ? <Warning warnings={[notes]} /> : null}
          </div>
          <Dropdown>
            <DropdownTrigger className="flex">
              <Button endContent={<Chevron orientation="down" />} variant="flat">Season</Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Seasons"
              closeOnSelect
              selectedKeys={new Set([season])}
              selectionMode="single"
              onSelectionChange={selection => {
                const selectedSeason = Season.getSeason(Array.from(selection)[0]);
                if (selectedSeason) onSeasonChange(selectedSeason);
              }}
            >
              {SEASONS.map(season => <DropdownItem key={season}>{Season.toDisplayFormat(season)}</DropdownItem>)}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Tabs
            selectedKey={tab}
            classNames={{ tabList: "w-full sm:w-fit" }}
            onSelectionChange={selected => {
              if (typeof selected === "string") onTabChange(selected);
            }}
          >
            {tabs.map(tab => <Tab className="capitalize" key={tab} title={tab} />)}
          </Tabs>
          {nextEvent ? (
            <div className="hidden md:block text-default-500 text-right leading-tight">
              <div>Waivers: {formatDeadline(nextEvent.waivers_time)}</div>
              <div>Lineups: {formatDeadline(nextEvent.deadline_time)}</div>
            </div>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
