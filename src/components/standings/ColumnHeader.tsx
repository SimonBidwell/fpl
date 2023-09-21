import { Card, SortDescriptor, Tooltip } from "@nextui-org/react";
import { Column } from "./columns";
import { SetStateAction, Dispatch } from "react";

export interface Props {
    name: Column["key"];
    abbr: Column["abbr"];
    description: Column["description"];
    setSortDescriptor?: Dispatch<SetStateAction<SortDescriptor>>;
    tooltipDelayMs?: number;
}

export const ColumnHeader = ({
    name,
    abbr,
    description,
    setSortDescriptor,
    tooltipDelayMs = 600,
}: Props) => {
    // The Tooltip component has a bug where it stops propogation of click events so we work around it by adding our own onClick to the tooltip child
    const onClick = setSortDescriptor ? () =>
        setSortDescriptor(({ direction, column }) => ({
            direction:
                column === name && direction === "ascending"
                    ? "descending"
                    : "ascending",
            column: name,
        })) : undefined;
    if (abbr !== undefined || description !== undefined) {
        return (
            <Tooltip
                aria-label={name}
                delay={tooltipDelayMs}
                placement="bottom"
                content={
                    description !== undefined ? (
                        <div
                            className="w-52 py-2 text-tiny"
                            onClick={() => console.log("???")}
                        >
                            <Card
                                className="bg-default-100 p-2 text-tiny text-foreground-500 font-semibold"
                                radius="sm"
                                shadow="sm"
                            >
                                {name} {abbr ? `(${abbr})` : ""}
                            </Card>
                            {description.split("\n").map((paragraph, i) => (
                                <p key={i} className="py-2">{paragraph}</p>
                            ))}
                        </div>
                    ) : (
                        <span className="text-tiny">{name}</span>
                    )
                }
            >
                <span onClick={onClick}>{abbr ?? name}</span>
            </Tooltip>
        );
    } else {
        return <span onClick={onClick}>{name}</span>;
    }
};
