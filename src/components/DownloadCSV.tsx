import { Button } from "@nextui-org/react";
import { useMemo } from "react";
import { Match } from "../domain";
import { StandingsRow } from "./standingstable/StandingsTable";
import { Column } from "./standingstable/columns";

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
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    className="text-gray-700"
                    opacity="0.5"
                >
                    <path
                        d="M3 14.25C3.41421 14.25 3.75 14.5858 3.75 15C3.75 16.4354 3.75159 17.4365 3.85315 18.1919C3.9518 18.9257 4.13225 19.3142 4.40901 19.591C4.68577 19.8678 5.07435 20.0482 5.80812 20.1469C6.56347 20.2484 7.56459 20.25 9 20.25H15C16.4354 20.25 17.4365 20.2484 18.1919 20.1469C18.9257 20.0482 19.3142 19.8678 19.591 19.591C19.8678 19.3142 20.0482 18.9257 20.1469 18.1919C20.2484 17.4365 20.25 16.4354 20.25 15C20.25 14.5858 20.5858 14.25 21 14.25C21.4142 14.25 21.75 14.5858 21.75 15V15.0549C21.75 16.4225 21.75 17.5248 21.6335 18.3918C21.5125 19.2919 21.2536 20.0497 20.6517 20.6516C20.0497 21.2536 19.2919 21.5125 18.3918 21.6335C17.5248 21.75 16.4225 21.75 15.0549 21.75H8.94513C7.57754 21.75 6.47522 21.75 5.60825 21.6335C4.70814 21.5125 3.95027 21.2536 3.34835 20.6517C2.74643 20.0497 2.48754 19.2919 2.36652 18.3918C2.24996 17.5248 2.24998 16.4225 2.25 15.0549C2.25 15.0366 2.25 15.0183 2.25 15C2.25 14.5858 2.58579 14.25 3 14.25Z"
                        fill="currentColor"
                    />
                    <path
                        d="M12 16.75C12.2106 16.75 12.4114 16.6615 12.5535 16.5061L16.5535 12.1311C16.833 11.8254 16.8118 11.351 16.5061 11.0715C16.2004 10.792 15.726 10.8132 15.4465 11.1189L12.75 14.0682V3C12.75 2.58579 12.4142 2.25 12 2.25C11.5858 2.25 11.25 2.58579 11.25 3V14.0682L8.55353 11.1189C8.27403 10.8132 7.79963 10.792 7.49393 11.0715C7.18823 11.351 7.16698 11.8254 7.44648 12.1311L11.4465 16.5061C11.5886 16.6615 11.7894 16.75 12 16.75Z"
                        fill="currentColor"
                    />
                </svg>
            </Button>
        </a>
    );
};
