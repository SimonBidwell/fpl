import { NotablePlacement } from "./domain";
import { Tooltip } from "@nextui-org/react";

export interface Props {
    records: NotablePlacement[];
}
export const Records = ({ records }: Props) => (
    <>
        {records.map((record) => (
            <Record key={record.season} record={record} />
        ))}
    </>
);

const Record = ({ record }: { record: NotablePlacement }) => {
    const { season, position } = record;
    const { tooltip, content } =
        position === 1
            ? { tooltip: `League champion in ${season}`, content: "👑" }
            : position === 12
            ? { tooltip: `Last place in ${season}`, content: "🍔" }
            : { tooltip: undefined, content: undefined };
    if (content && tooltip) {
        return (
            <Tooltip content={tooltip} delay={1000}>
                <span>{content}</span>
            </Tooltip>
        );
    } else {
        return null;
    }
};
