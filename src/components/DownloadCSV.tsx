import { Button } from "@nextui-org/react";
import { useMemo } from "react";
import { Match } from "../domain";
import { StandingsRow } from "./standingstable/StandingsTable";
import { Column } from "./standingstable/columns";
import { Download } from "lucide-react";

export interface Props<T> {
    serialiser: Serialiser<T>;
    data: T[];
    filename: string;
    delimiter?: "," | ";" | "|";
}

export type Serialiser<T> = {
    headers: string[];
    serialise: (row: T) => (string | number)[];
};

const getEncodedBlob = <T,>({
    serialiser,
    data,
    delimiter,
}: Omit<Required<Props<T>>, "filename">) => {
    const rows = [serialiser.headers, ...data.map(serialiser.serialise)];
    const csvContent = rows.map((e) => e.join(delimiter)).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    return URL.createObjectURL(blob);
};

export const MATCH_SERIALISER: Serialiser<Match> = {
    headers: [
        "Gameweek",
        "Team One Manager Id",
        "Team One Manager Name",
        "Team One Id",
        "Team One Name",
        "Team One Score",
        "Team Two Score",
        "Team Two Name",
        "Team Two Id",
        "Team Two Manager Name",
        "Team Two Manager Id",
    ],
    serialise: ({ gameWeek, teamOne, teamTwo }) => [
        gameWeek,
        teamOne.manager.id,
        teamOne.manager.name,
        teamOne.id,
        teamOne.name,
        teamOne.points,
        teamTwo.points,
        teamTwo.name,
        teamTwo.id,
        teamTwo.manager.name,
        teamTwo.manager.id,
    ],
};

//TODO move this out of DownloadCSV
export const buildStandingsSerialiser = (
    visibleColumns: Column[]
): Serialiser<StandingsRow> => ({
    headers: visibleColumns.flatMap((col) => col.serialise.header),
    serialise: (row) =>
        visibleColumns.flatMap((col) => col.serialise.data(row)),
});

export const DownloadCSV = <T,>({
    serialiser,
    data,
    filename,
    delimiter = ",",
}: Props<T>) => {
    const encodedBlob = useMemo(
        () => getEncodedBlob({ serialiser, data, delimiter }),
        [serialiser, data, delimiter]
    );

    return (
        <a download={`${filename}.csv`} href={encodedBlob} className="w-fit">
            <Button isIconOnly aria-label="Download CSV" variant="flat">
                <Download strokeWidth={1}/>
            </Button>
        </a>
    );
};
