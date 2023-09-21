import { Season, SEASONS } from "../../api/domain";
import { Selection } from "@nextui-org/react";

export const isAllSeasons = (selection: Selection) =>
        selection === "all" || selection.size === SEASONS.length;

export const getSeasons = (selection: Selection) =>
        isAllSeasons(selection) ? SEASONS : [...selection].filter(Season.isSeason);