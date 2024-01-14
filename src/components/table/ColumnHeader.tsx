import { Card, SortDescriptor, Tooltip } from "@nextui-org/react";
import { Column } from "./column";
import { SetStateAction, Dispatch } from "react";

export interface Props <T>{
    columnKey: Column<T>["key"];
    title: Column<T>["title"];
    abbr: Column<T>["abbr"];
    description: Column<T>["description"];
    setSortDescriptor?: Dispatch<SetStateAction<SortDescriptor>>;
    tooltipDelayMs?: number;
}

export const ColumnHeader = <T,>({
    columnKey,
    title,
    abbr,
    description,
    setSortDescriptor,
    tooltipDelayMs = 600,
}: Props<T>) => {
    // The Tooltip component has a bug where it stops propogation of click events so we work around it by adding our own onClick to the tooltip child
    const onClick = setSortDescriptor
        ? () =>
              setSortDescriptor(({ direction, column }) => ({
                  direction:
                      column === columnKey && direction === "ascending"
                          ? "descending"
                          : "ascending",
                  column: columnKey,
              }))
        : undefined;
    if (abbr !== undefined || description !== undefined) {
        return (
            <Tooltip
                aria-label={title}
                delay={tooltipDelayMs}
                placement="bottom"
                content={
                    description !== undefined ? (
                        <div className="w-52 py-2 text-tiny">
                            <Card
                                className="bg-default-100 p-2 text-tiny text-foreground-500 font-semibold"
                                radius="sm"
                                shadow="sm"
                            >
                                {title} {abbr ? `(${abbr})` : ""}
                            </Card>
                            {description.split("\n").map((paragraph, i) => (
                                <p key={i} className="py-2">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <span className="text-tiny">{title}</span>
                    )
                }
            >
                {/* TODO decoration colour here should be using a next-ui class but can't get it to work */}
                <span
                    onClick={onClick}
                    className={
                        description === undefined
                            ? undefined
                            : "underline decoration-dotted underline-offset-2 decoration-[#a1a1aa]"
                    }
                >
                    {abbr ?? title}
                </span>
            </Tooltip>
        );
    } else {
        return <span>{title}</span>;
    }
};
