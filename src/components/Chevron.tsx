import { SVGProps } from "react";

//TODO why does this disappear on the season dropdown.
export type IconSvgProps = SVGProps<SVGSVGElement> & {
    orientation: "up" | "down" | "left" | "right";
};
export const Chevron = ({
    strokeWidth = 1.5,
    className,
    orientation,
    ...otherProps
}: IconSvgProps) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        className={`${orientation === "up" ? "rotate-180" : orientation === "left" ? "rotate-90" : orientation === "right" ? "-rotate-90" : ""} ${className ?? ""}`.trim()}
        {...otherProps}
    >
        <path
            d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            strokeWidth={strokeWidth}
        />
    </svg>
);
