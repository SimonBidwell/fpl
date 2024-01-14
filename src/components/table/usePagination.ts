import { useMemo, useState } from "react";

export const usePagination = <T,>({
    rows,
    rowsPerPage = 10,
}: {
    rows: T[];
    rowsPerPage?: number;
}) => {
    const [page, setPage] = useState(1);
    const pages = Math.ceil(rows.length / rowsPerPage);
    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return rows.slice(start, end);
    }, [page, rowsPerPage, rows]);
    return {
        page,
        setPage,
        pages,
        items,
    };
};