import { SeasonRecord } from "./domain";
import { Tooltip } from "@nextui-org/react";

export interface Props {
    records: SeasonRecord[];
}
export const Records = ({ records }: Props) => (
    <>
        {records.map((record) => (
            <Record record={record} />
        ))}
    </>
);

const Record = ({ record }: { record: SeasonRecord }) => {
    const { season, position } = record;
    const { tooltip, content } =
        position === 1
            ? { tooltip: `League champion in ${season}`, content: "👑" }
            : position === 12
            ? { tooltip: `Last place in ${season}`, content: "🍔" }
            : { tooltip: undefined, content: undefined };
    if (content && tooltip) {
        return (
            <Tooltip content={tooltip}>
                <span>{content}</span>
            </Tooltip>
        );
    } else {
        return null;
    }
};
