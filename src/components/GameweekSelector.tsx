import {
    Dropdown,
    DropdownItem,
    DropdownTrigger,
    Button,
    DropdownMenu,
    Selection,
} from "@nextui-org/react";
import { Dispatch, SetStateAction, useMemo, useCallback } from "react";
import { Chevron } from "./Chevron";
import { clamp } from "../helpers";

export interface Props {
    gameWeeks: number[];
    selectedGameWeek: number;
    setSelectedGameWeek: Dispatch<SetStateAction<number>>;
}

export const GameWeekSelector = ({
    gameWeeks,
    selectedGameWeek,
    setSelectedGameWeek,
}: Props) => {
    const min = useMemo(() => Math.min(...gameWeeks), [gameWeeks]);
    const max = useMemo(() => Math.max(...gameWeeks), [gameWeeks]);
    const selection = useMemo(
        () => new Set([selectedGameWeek.toString()]),
        [selectedGameWeek]
    );

    const goToPrevious = useCallback(
        () => setSelectedGameWeek((gameWeek) => clamp(gameWeek - 1, min, max)),
        [setSelectedGameWeek, min, max]
    );
    const goToNext = useCallback(
        () => setSelectedGameWeek((gameWeek) => clamp(gameWeek + 1, min, max)),
        [setSelectedGameWeek, min, max]
    );

    const onSelectionChange = useCallback(
        (selection: Selection) => {
            if (selection === "all") {
                setSelectedGameWeek(max);
            } else {
                const value = selection.values().next().value;
                setSelectedGameWeek(value === "all" ? max : Number(value));
            }
        },
        [setSelectedGameWeek, max]
    );

    return (
        <div className="flex gap-1">
            <Button isIconOnly onClick={goToPrevious} variant="flat">
                <Chevron orientation="left" />
            </Button>
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        endContent={<Chevron orientation="down" />}
                        variant="flat"
                    >
                        {selectedGameWeek === gameWeeks[0]
                            ? `Latest (Gameweek ${selectedGameWeek})`
                            : `Gameweek ${selectedGameWeek}`}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    disallowEmptySelection
                    aria-label="Selected Gameweek"
                    closeOnSelect={true}
                    selectedKeys={selection}
                    onSelectionChange={onSelectionChange}
                    selectionMode="single"
                    className="max-h-64 overflow-y-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded"
                >
                    {[...gameWeeks].map((gw) => (
                        <DropdownItem key={gw.toString()}>
                            {gw === gameWeeks[0]
                                ? `Latest (Gameweek ${gw})`
                                : `Gameweek ${gw}`}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
            <Button isIconOnly onClick={goToNext} variant="flat">
                <Chevron orientation="right" />
            </Button>
        </div>
    );
};
