import { Season, SEASONS } from "../../domain";
import { Selection } from "@nextui-org/react";

export const isAllSeasons = (selection: Selection) =>
        selection === "all" || selection.size === SEASONS.length;

export const getSeasons = (selection: Selection) =>
        isAllSeasons(selection) ? SEASONS : [...selection].filter(Season.isSeason);

export const getMode = (selection: Selection) => getSeasons(selection).length === 1 ? "single" : "multi"