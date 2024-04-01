import { ChevronDown } from "lucide-react";

//TODO why does this disappear on the season dropdown.
export type Props = {
    className?: string;
    orientation: "up" | "down" | "left" | "right";
};
export const Chevron = ({
    className,
    orientation,
}: Props) => (
    <ChevronDown
        strokeWidth={1.5}
        height="1em"
        width="1em"
        viewBox="0 0 24 24"
        className={`${
            orientation === "up"
                ? "rotate-180"
                : orientation === "left"
                ? "rotate-90"
                : orientation === "right"
                ? "-rotate-90"
                : ""
        } ${className ?? ""}`.trim()}
    />
);
