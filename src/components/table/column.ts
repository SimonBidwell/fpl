import { ReactNode } from "react";

export interface Column<T> {
    key: string;
    title: string;
    abbr?: string;
    description?: string;
    render: (row: T) => ReactNode;
    sort?: (a: T, b: T) => number;
    headerClassName?: string;
    cellClassName?: string;
}
